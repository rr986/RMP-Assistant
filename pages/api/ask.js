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
      let reviews = [];

      const extractReviewsFromPage = async (pageUrl) => {
        try {
          const { data } = await axios.get(pageUrl);
          const $ = cheerio.load(data);

          console.log(`DEBUG: Parsing RMP page: ${pageUrl}`);

          const firstName = $('div.TeacherInfo__StyledTeacher-xf6b3k-1 span:first-child').text().trim();
          const lastName = $('div.TeacherInfo__StyledTeacher-xf6b3k-1 span:last-child').text().trim();
          const professorName = `${firstName} ${lastName}`;
          const ratingText = $('.RatingValue__Numerator-qw8sqy-2').text().trim();
          const rating = parseFloat(ratingText);

          console.log("DEBUG: Extracted Professor Name:", professorName || "(MISSING)");
          console.log("DEBUG: Rating extracted:", ratingText || "(MISSING)");

          $('.Comments__StyledComments-dzzyvm-0').each((index, element) => {
            const reviewText = $(element).text().trim();
            if (reviewText) {
              reviews.push(reviewText);
            }
          });

          console.log(`DEBUG: Extracted ${reviews.length} reviews so far.`);

          // Fix: Extracting pagination correctly
          let nextPageUrl = null;
          $('nav.Pagination__StyledPagination-rmp-nav a').each((_, link) => {
            const href = $(link).attr('href');
            if (href.includes('page=')) {
              nextPageUrl = `https://www.ratemyprofessors.com${href}`;
            }
          });

          console.log("DEBUG: Next Page URL detected:", nextPageUrl || "No more pages");

          return { professorName, rating, reviews, nextPageUrl };
        } catch (error) {
          console.error(`ERROR: Failed to parse page: ${pageUrl}`, error);
          return null;
        }
      };

      let currentPage = url;
      let professorName = "";
      let rating = 0;
      let firstPage = true;

      while (currentPage) {
        console.log(`DEBUG: Processing page: ${currentPage}`);
        const result = await extractReviewsFromPage(currentPage);

        if (!result) break;
        if (firstPage) {
          professorName = result.professorName;
          rating = result.rating;
          firstPage = false;
        }

        currentPage = result.nextPageUrl;
      }

      console.log(`DEBUG: Total reviews extracted: ${reviews.length}`);

      if (!professorName.trim() || isNaN(rating) || reviews.length === 0) {
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
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: 150,
    });

    const summary = response.data.choices[0].message.content.trim();
    console.log("DEBUG: OpenAI Response:", summary);

    res.status(200).json({ result: summary, professorData });
  } catch (error) {
    console.error("ERROR: Exception in handler:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
}
