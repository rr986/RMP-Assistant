const { Pinecone } = require('@pinecone-database/pinecone');
const { Configuration, OpenAIApi } = require('openai');

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY
});
const openai = new OpenAIApi(configuration);

const seedData = async () => {
  try {
    const pc = new Pinecone({
      apiKey: process.env.OPENAI_API_KEY
    });

    const index = pc.index('rmpindex');

    const professors = [
      { name: "John Doe", description: "Computer Science professor at Example University", rating: 4.5 },
      { name: "Jane Smith", description: "Mathematics professor at Another University", rating: 4.8 },
      { name: "Alice Jones", description: "Physics professor at Physics University", rating: 3.9 },
    ];

    for (const professor of professors) {
      const embeddingResponse = await openai.createEmbedding({
        model: "text-embedding-ada-002",
        input: professor.description,
      });

      const embeddingVector = embeddingResponse.data.data[0].embedding;

      await index.namespace('').upsert([
        {
          id: professor.name.toLowerCase().replace(/\s+/g, '-'),
          values: embeddingVector,
          metadata: {
            name: professor.name,
            description: professor.description,
            rating: professor.rating,
          },
        },
      ]);
    }

    console.log("Seed data inserted successfully");
  } catch (error) {
    console.error("Error initializing Pinecone client or inserting data:", error);
  }
};

seedData();
