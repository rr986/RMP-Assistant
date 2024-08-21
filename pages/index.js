import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/ask", { query });
      setResponse(res.data.result);
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };

  return (
    <div>
      <h1>Rate My Professor AI Assistant</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about a professor..."
          required
        />
        <button type="submit">Ask</button>
      </form>
      {response && <div><h2>AI Response:</h2><p>{response}</p></div>}
    </div>
  );
}
