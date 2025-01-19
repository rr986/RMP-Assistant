import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function handler(req, res) {
  const { query } = req.body;

  if (!query) {
    return res.status(400).json({ error: "Query is required" });
  }

  try {
    const response = await openai.createChatCompletion({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant providing detailed responses." },
        { role: "user", content: query },
      ],
      max_tokens: 150,
    });

    const result = response.data.choices[0].message.content.trim();
    res.status(200).json({ result });
  } catch (error) {
    console.error("Error processing follow-up:", error);
    res.status(500).json({ error: "Failed to process follow-up question" });
  }
}
