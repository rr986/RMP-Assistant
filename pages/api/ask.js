import axios from "axios";
import * as cheerio from "cheerio";
import { Pinecone } from "@pinecone-database/pinecone";
import { Configuration, OpenAIApi } from "openai";
import base64 from "base-64";

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

    let professorId = null;
    if (url) {
      const match = url.match(/professor\/(\d+)/);
      professorId = match ? match[1] : null;

      if (!professorId) {
        return res.status(400).json({ error: "Invalid RateMyProfessors URL format" });
      }

      const encodedProfessorId = base64.encode(`Teacher-${professorId}`);
      console.log(`DEBUG: Extracted & Encoded Professor ID: ${encodedProfessorId}`);

      try {
        const response = await axios.post(
          "https://www.ratemyprofessors.com/graphql",
          {
            query: `
              query GetProfessorRatings($id: ID!) {
                node(id: $id) {
                  ... on Teacher {
                    firstName
                    lastName
                    numRatings
                    avgRating
                    ratings(first: 20) {
                      edges {
                        node {
                          comment
                          date
                          difficultyRating
                          clarityRating
                          helpfulRating
                          class
                          attendanceMandatory
                          grade
                          wouldTakeAgain
                          ratingTags
                        }
                      }
                    }
                  }
                }
              }
            `,
            variables: { id: encodedProfessorId },
          },
          {
            headers: {
              "Content-Type": "application/json",
              "Referer": `https://www.ratemyprofessors.com/professor/${professorId}`,
              "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36",
              "Authorization": "Basic dGVzdDp0ZXN0", // ⬅️ Needed if authentication is required
            },
          }
        );

        const professorInfo = response.data?.data?.node;
        if (!professorInfo) {
          return res.status(404).json({ error: "Professor not found on RateMyProfessors" });
        }

        const professorName = `${professorInfo.firstName} ${professorInfo.lastName}`;
        const rating = professorInfo.avgRating || "N/A";
        const reviews = professorInfo.ratings.edges.map(edge => edge.node.comment) || [];

        console.log("DEBUG: Professor Data Extracted:", {
          name: professorName,
          rating,
          reviews,
          url,
        });

        professorData = {
          name: professorName,
          rating,
          reviews,
          url,
        };

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
      } catch (error) {
        console.error("ERROR: RateMyProfessors GraphQL API request failed", error.response?.data || error);
        return res.status(500).json({ error: "RateMyProfessors API request failed" });
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


