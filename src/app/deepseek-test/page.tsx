"use client";
import React, { useState } from "react";

interface ErrorWithMessage {
  message: string;
}

function isErrorWithMessage(error: unknown): error is ErrorWithMessage {
  return (
    typeof error === 'object' &&
    error !== null &&
    'message' in error &&
    typeof (error as Record<string, unknown>).message === 'string'
  );
}

export default function DeepseekTestPage() {
  const [question, setQuestion] = useState("");
  const [response, setResponse] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAsk = async () => {
    setLoading(true);
    setError(null);
    setResponse(null);
    try {
      const res = await fetch("/api/deepseek-test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const data = await res.json();
      if (data.success) {
        // Try to extract the answer from DeepSeek's response
        const answer = data.data?.choices?.[0]?.message?.content || JSON.stringify(data.data);
        setResponse(answer);
        console.log("connection established");
      } else {
        setError(data.error ? JSON.stringify(data.error) : "Unknown error");
      }
    } catch (err: unknown) {
      setError(isErrorWithMessage(err) ? err.message : "Request failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: 600, margin: "2rem auto", padding: 24, border: "1px solid #eee", borderRadius: 8 }}>
      <h2>DeepSeek API Test</h2>
      <textarea
        value={question}
        onChange={e => setQuestion(e.target.value)}
        rows={4}
        style={{ width: "100%", marginBottom: 12 }}
        placeholder="Type your question for DeepSeek..."
      />
      <br />
      <button onClick={handleAsk} disabled={loading || !question.trim()}>
        {loading ? "Asking..." : "Ask DeepSeek"}
      </button>
      {response && (
        <div style={{ marginTop: 20, background: "#f6f8fa", padding: 12, borderRadius: 4 }}>
          <strong>Response:</strong>
          <div style={{ whiteSpace: "pre-wrap" }}>{response}</div>
        </div>
      )}
      {error && (
        <div style={{ marginTop: 20, color: "red" }}>
          <strong>Error:</strong> {error}
        </div>
      )}
    </div>
  );
} 