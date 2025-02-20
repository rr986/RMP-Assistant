import * as cheerio from "cheerio";
import axios from "axios";
import { Pinecone } from "@pinecone-database/pinecone";
import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

const pc = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY,
});
const index = pc.index("rmpindex");

export default async function handler(req, res) {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  const { query, url } = req.body;

  if (!query && !url) {
    return res.status(400).json({ error: "Query or URL is required" });
  }

  try {
    let queryVector = [];
    let professorData = null;

    if (query) {
      console.log("DEBUG: Generating embedding for query:", query);
      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: query,
      });

      if (embeddingResponse?.data?.data?.length > 0) {
        queryVector = embeddingResponse.data.data[0].embedding;
        console.log("DEBUG: Query embedding generated successfully.");
      } else {
        return res.status(400).json({ error: "Failed to generate embedding for query" });
      }
    }

    if (url) {
      console.log("DEBUG: Fetching professor data from:", url);
      const { data } = await axios.get(url);
      const $ = cheerio.load(data);

      // Extract professor's first and last name
      const firstName = $("h1.NameTitle__NameWrapper-dowf0z-2").contents().first().text().trim();
      const lastName = $("h1.NameTitle__NameWrapper-dowf0z-2").contents().last().text().trim();
      const professorName = `${firstName} ${lastName}`.trim();
      console.log("DEBUG: Extracted Professor Name:", professorName);

      // Extract professor's overall rating
      const rating = parseFloat($(".RatingValue__Numerator-qw8sqy-2").text().trim());
      console.log("DEBUG: Rating extracted:", rating);

      // Extract reviews
      const reviews = [];
      $("div.Comments__StyledComments-dzzyvm-0").each((index, element) => {
        const reviewText = $(element).text().trim();
        if (reviewText) {
          reviews.push(reviewText);
        }
      });
      console.log(`DEBUG: Extracted ${reviews.length} reviews.`);

      if (!professorName || isNaN(rating) || reviews.length === 0) {
        return res.status(400).json({ error: "Failed to extract valid data from the URL" });
      }

      professorData = {
        name: professorName,
        rating,
        reviews,
        url,
      };

      console.log("DEBUG: Professor Data Finalized:", professorData);

      console.log(`DEBUG: Generating embedding for professor: ${professorName}`);
      const professorNameEmbedding = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: professorName,
      });

      if (professorNameEmbedding?.data?.data?.length > 0) {
        const professorVector = professorNameEmbedding.data.data[0].embedding;

        await index.upsert([
          {
            id: professorName.toLowerCase().replace(/\s+/g, "-"),
            values: professorVector,
            metadata: professorData,
          },
        ]);
        console.log(`DEBUG: Successfully stored professor data in Pinecone.`);
      } else {
        return res.status(400).json({ error: "Failed to generate embedding for professor name" });
      }
    }

    if (queryVector.length > 0) {
      console.log("DEBUG: Searching Pinecone for query match...");
      const queryResponse = await index.query({
        vector: queryVector,
        topK: 5,
        includeMetadata: true,
      });

      const matchedProfessor = queryResponse.matches
        .map((match) => match.metadata)
        .filter((prof) => prof.name.toLowerCase() === query.toLowerCase());

      if (matchedProfessor.length === 0) {
        return res.status(404).json({ error: "Professor not found." });
      }

      professorData = matchedProfessor[0];
    }

    const prompt = `
      The user is looking for information about the professor. Here is the data we found: ${JSON.stringify(professorData)}.
      Provide a summary and include the professor's Rate My Professors page URL directly in the response instead of saying "this link."
    `;

    console.log("DEBUG: Sending prompt to OpenAI...");
    const responseChat = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
    });

    const summary = responseChat.data.choices[0].message.content.trim();
    console.log("DEBUG: OpenAI Response:", summary);

    res.status(200).json({ result: summary, professorData });
  } catch (error) {
    console.error("Error in server-side logic:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
}

