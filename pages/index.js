import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("");
  const [response, setResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("Query:", query);
    console.log("URL:", url);

    try {
      const res = await axios.post("/api/ask", { query, url });
      setResponse(res.data.result);
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };

  return (
    <div style={{ fontFamily: "Arial, sans-serif", padding: "20px" }}>
      <h1>Rate My Professor AI Assistant</h1>
      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask about a professor..."
          style={{ padding: "10px", width: "300px", marginRight: "10px" }}
        />
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Submit Rate My Professor URL..."
          style={{ padding: "10px", width: "300px", marginRight: "10px" }}
        />
        <button type="submit" style={{ padding: "10px 20px" }}>
          Submit
        </button>
      </form>
      {response && (
        <div>
          <h2>AI Response:</h2>
          <p style={{ backgroundColor: "#f0f0f0", padding: "15px", borderRadius: "5px" }}>
            {response}
          </p>
        </div>
      )}
    </div>
  );
}
