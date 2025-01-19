import { useState } from "react";
import axios from "axios";

export default function Home() {
  const [query, setQuery] = useState("");
  const [url, setUrl] = useState("");
  const [response, setResponse] = useState("");
  const [followUp, setFollowUp] = useState("");
  const [followUpResponse, setFollowUpResponse] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/ask", { query, url });
      setResponse(res.data.result);
    } catch (error) {
      console.error("Error fetching response:", error);
    }
  };

  const handleFollowUpSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await axios.post("/api/followup", { query: followUp });
      setFollowUpResponse(res.data.result);
    } catch (error) {
      console.error("Error fetching follow-up response:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col items-center justify-center font-sans">
      {/* Header */}
      <header className="text-center mb-8">
        <h1 className="text-4xl font-bold text-blue-600">
          Rate My Professor AI Assistant
        </h1>
        <p className="text-sm text-gray-600 mt-2">
          Use this tool to get professor insights from RateMyProfessor and ask follow-up questions.
        </p>
      </header>

      {/* Instructions */}
      <section className="bg-white p-4 rounded-lg shadow-md w-full max-w-2xl mb-6">
        <h2 className="text-lg font-bold text-gray-800 mb-2">How to Use:</h2>
        <ol className="list-decimal list-inside text-gray-700">
          <li>Enter a professor's name to ask specific questions.</li>
          <li>Optionally, provide a RateMyProfessor profile URL for enhanced insights.</li>
          <li>Submit your query and view the AI-generated response.</li>
          <li>Continue the conversation by asking follow-up questions.</li>
          (Note: Responses may take up to 10-15 seconds to generate.)
        </ol>
      </section>

      {/* Form Section */}
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl space-y-4"
      >
        <div>
          <label
            htmlFor="query"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Ask about a professor:
          </label>
          <input
            type="text"
            id="query"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Enter professor name..."
            className="w-full border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div>
          <label
            htmlFor="url"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Submit Rate My Professor URL:
          </label>
          <input
            type="text"
            id="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter RMP profile URL..."
            className="w-full border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <button
          type="submit"
          className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600"
        >
          Submit
        </button>
      </form>

      {/* Response Section */}
      {response && (
        <div className="bg-gray-100 p-4 mt-6 rounded-lg shadow-md w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-2">AI Response:</h2>
          <p className="text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
            {response}
          </p>

          {/* Follow-Up Form */}
          <form
            onSubmit={handleFollowUpSubmit}
            className="mt-4 bg-white p-4 rounded-lg shadow-md space-y-4"
          >
            <label
              htmlFor="follow-up"
              className="block text-sm font-medium text-gray-700"
            >
              Ask a follow-up question:
            </label>
            <input
              type="text"
              id="follow-up"
              value={followUp}
              onChange={(e) => setFollowUp(e.target.value)}
              placeholder="Enter your question..."
              className="w-full border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              className="w-full bg-green-500 text-white py-2 rounded-md hover:bg-green-600"
            >
              Submit Follow-Up
            </button>
          </form>
        </div>
      )}

      {/* Follow-Up Response Section */}
      {followUpResponse && (
        <div className="bg-gray-100 p-4 mt-6 rounded-lg shadow-md w-full max-w-2xl">
          <h2 className="text-xl font-bold mb-2">Follow-Up Response:</h2>
          <p className="text-gray-700 whitespace-pre-wrap overflow-auto max-h-96">
            {followUpResponse}
          </p>
        </div>
      )}
    </div>
  );
}
