import axios from "axios";
import * as cheerio from "cheerio";
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

function getRandomUserAgent() {
  const userAgents = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64)",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
    "Mozilla/5.0 (Linux; Android 11; SM-G991B)",
  ];
  return userAgents[Math.floor(Math.random() * userAgents.length)];
}

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

      const encodedProfessorId = Buffer.from(`Teacher-${professorId}`).toString("base64");
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
              "User-Agent": getRandomUserAgent(),
            },
          }
        );

        const professorInfo = response.data?.data?.node;
        if (!professorInfo) {
          console.log("DEBUG: GraphQL API failed, switching to scraping...");
          professorData = await scrapeProfessorPage(url);
        } else {
          professorData = {
            name: `${professorInfo.firstName} ${professorInfo.lastName}`,
            rating: professorInfo.avgRating || "N/A",
            reviews: professorInfo.ratings.edges.map(edge => edge.node.comment) || [],
            url,
          };
        }
      } catch (error) {
        console.error("ERROR: GraphQL API failed, switching to scraping...");
        professorData = await scrapeProfessorPage(url);
      }
    }

    if (professorData) {
      console.log(`DEBUG: Generating embedding for professor: ${professorData.name}`);
      const professorNameEmbedding = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: professorData.name,
      });

      if (professorNameEmbedding?.data?.data?.length > 0) {
        const professorVector = professorNameEmbedding.data.data[0].embedding;

        await index.upsert([
          {
            id: professorData.name.toLowerCase().replace(/\s+/g, "-"),
            values: professorVector,
            metadata: professorData,
          },
        ]);
        console.log(`DEBUG: Successfully stored professor data in Pinecone.`);
      } else {
        return res.status(400).json({ error: "Failed to generate embedding for professor name" });
      }
    }

    console.log("DEBUG: Searching Pinecone for query match...");
    const queryResponse = await index.query({
      vector: queryVector,
      topK: 5,
      includeMetadata: true,
    });

    const matchedProfessor = queryResponse.matches
      .map(match => match.metadata)
      .filter(prof => prof.name.toLowerCase() === query.toLowerCase());

    if (matchedProfessor.length === 0) {
      return res.status(200).json({ message: "Professor data stored but not queried yet.", professorData });
    }

    professorData = matchedProfessor[0];

    const prompt = `
      The user is looking for information about the professor. Here is the data we found: ${JSON.stringify(professorData)}.
      Provide a summary and include the professor's Rate My Professors page URL directly in the response.
    `;

    console.log("DEBUG: Sending prompt to OpenAI...");
    const responseChat = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant." },
        { role: "user", content: prompt },
      ],
      max_tokens: 250,
    });

    const summary = responseChat.data.choices[0].message.content.trim();
    console.log("DEBUG: OpenAI Response:", summary);

    res.status(200).json({ result: summary, professorData });
  } catch (error) {
    console.error("Error in server-side logic:", error);
    res.status(500).json({ error: "Failed to process request" });
  }
}

async function scrapeProfessorPage(url) {
  try {
    console.log("DEBUG: Scraping professor page:", url);
    const { data } = await axios.get(url, { headers: { "User-Agent": getRandomUserAgent() } });
    const $ = cheerio.load(data);

    const professorName = $("h1.NameTitle__NameWrapper-dowf0z-2").text().trim();
    const rating = parseFloat($(".RatingValue__Numerator-qw8sqy-2").text().trim()) || "N/A";

    const reviews = [];
    $("div.Comments__StyledComments-dzzyvm-0").each((index, element) => {
      const reviewText = $(element).text().trim();
      if (reviewText) {
        reviews.push(reviewText);
      }
    });

    return { name: professorName, rating, reviews, url };
  } catch (error) {
    console.error("ERROR: Failed to scrape professor page:", error);
    return null;
  }
}
