import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  const { query, professorData } = req.body;

  if (!query || !professorData) {
    return res.status(400).json({ error: "Both query and professorData are required." });
  }

  try {
    const { name, rating, reviews } = professorData;

    // Check if reviews are available
    if (!reviews || reviews.length === 0) {
      return res.status(404).json({
        error: `No reviews found for Professor ${name}. Unable to provide detailed insights.`,
      });
    }

    // Enhanced prompt for better follow-up responses
    const prompt = `
      The user is asking a follow-up question about Professor ${name}.
      Here is the information available about the professor:
      - Rating: ${rating}
      - Reviews: ${reviews.join("; ")}

      Please analyze the reviews and metadata to answer the user's follow-up question in detail:
      "${query}".
    `;

    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant providing detailed responses." },
        { role: "user", content: prompt },
      ],
      max_tokens: 200,
    });

    const result = response.data.choices[0].message.content.trim();
    res.status(200).json({ result });
  } catch (error) {
    console.error("Error processing follow-up:", error);
    res.status(500).json({ error: "Failed to process follow-up question." });
  }
}
