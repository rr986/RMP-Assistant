const { Pinecone } = require('@pinecone-database/pinecone');

(async () => {
  try {
    const pc = new Pinecone({
      apiKey: process.env.PINECONE_API_KEY
    });

    const index = pc.index('rmpindex');

    console.log("Pinecone client initialized successfully and connected to the index:", index.name);
  } catch (error) {
    console.error("Error initializing Pinecone client:", error);
    console.error("Full error details:", error.stack);
  }
})();
