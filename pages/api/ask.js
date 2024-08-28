import { Configuration, OpenAIApi } from "openai";
import axios from 'axios';
import * as cheerio from 'cheerio';
import { Pinecone } from '@pinecone-database/pinecone';

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pc.index('rmpindex');

export default async function handler(req, res) {
  const { query, url } = req.body;

  if (!query && !url) {
    return res.status(400).json({ error: "Query or URL is required" });
  }

  try {
    let queryVector = [];

    if (query) {
      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: query,
      });

      if (embeddingResponse?.data?.data?.length > 0) {
        queryVector = embeddingResponse.data.data[0].embedding;
      } else {
        return res.status(400).json({ error: 'Failed to generate embedding for query' });
      }
    }

    if (url) {
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      const firstName = $('div.NameTitle__Name-dowf0z-0.cfjPUG span').first().text().trim();
      const lastName = $('div.NameTitle__Name-dowf0z-0.cfjPUG span.NameTitle__LastNameWrapper-dowf0z-2.glXOHH').text().trim();
      const professorName = `${firstName} ${lastName}`;
      const rating = parseFloat($('.RatingValue__Numerator-qw8sqy-2').text().trim());

      const reviews = [];
      $('.Comments__StyledComments-dzzyvm-0').each((index, element) => {
        const reviewText = $(element).text().trim();
        if (reviewText) {
          reviews.push(reviewText);
        }
      });

      if (!professorName || isNaN(rating) || reviews.length === 0) {
        return res.status(400).json({ error: "Failed to extract valid data from the URL" });
      }

      const professorNameEmbedding = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: professorName,
      });

      if (professorNameEmbedding?.data?.data?.length > 0) {
        const professorVector = professorNameEmbedding.data.data[0].embedding;

        await index.upsert([
          {
            id: professorName.toLowerCase().replace(/\s+/g, '-'),
            values: professorVector,
            metadata: { name: professorName, url, rating, reviews },
          }
        ]);
      } else {
        return res.status(400).json({ error: 'Failed to generate embedding for professor name' });
      }
    }

    if (queryVector.length > 0) {
      const queryResponse = await index.query({
        vector: queryVector,
        topK: 5,
        includeMetadata: true,
      });

      const professorData = queryResponse.matches
        .map(match => match.metadata)
        .filter(professor => professor.name.toLowerCase() === query.toLowerCase());

      if (professorData.length === 0) {
        return res.status(404).json({ error: "Professor not found." });
      }

      const prompt = `The user is looking for information about the professor. Here is the data we found: ${JSON.stringify(professorData)}. Provide a summary.`;

      const response = await openai.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a helpful assistant." },
          { role: "user", content: prompt }
        ],
        max_tokens: 150,
      });

      const summary = response.data.choices[0].message.content.trim();
      res.status(200).json({ result: summary });
    }

  } catch (error) {
    console.error("Error in server-side logic:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
}

