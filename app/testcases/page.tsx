"use client";
import { useState } from "react";

const API_URL = "http://localhost:4000"; // Change to your deployed API URL if needed

const questions = [
  {
    category: "Positive",
    question: "Which are valid positive login test cases?",
    options: [
      { text: "Login with valid username and password", correct: true },
      { text: "Login with blank password", correct: false },
      { text: "Login with valid email and password", correct: true },
      { text: "Login with SQL injection", correct: false },
    ],
  },
  {
    category: "Negative",
    question: "Which are valid negative login test cases?",
    options: [
      { text: "Login with invalid password", correct: true },
      { text: "Login with blank username", correct: true },
      { text: "Login with valid credentials", correct: false },
      { text: "Login with expired account", correct: true },
    ],
  },
  {
    category: "Edge",
    question: "Which are valid edge login test cases?",
    options: [
      { text: "Login with max length username", correct: true },
      { text: "Login with special characters", correct: true },
      { text: "Login with empty password", correct: false },
      { text: "Login with whitespace only", correct: true },
    ],
  },
  {
    category: "Performance",
    question: "Which are valid performance login test cases?",
    options: [
      { text: "Login under heavy load", correct: true },
      { text: "Login with slow network", correct: true },
      { text: "Login with valid credentials", correct: false },
      { text: "Login after session timeout", correct: true },
    ],
  },
];

export default function TestcasesPage() {
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<{ [key: number]: number[] }>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showHost, setShowHost] = useState(false);
  const [allResults, setAllResults] = useState<any[]>([]);

  const handleOptionChange = (qIdx: number, oIdx: number) => {
    setAnswers((prev) => {
      const prevArr = prev[qIdx] || [];
      if (prevArr.includes(oIdx)) {
        return { ...prev, [qIdx]: prevArr.filter((i) => i !== oIdx) };
      } else {
        return { ...prev, [qIdx]: [...prevArr, oIdx] };
      }
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert("Please enter your name.");
      return;
    }
    // Calculate score
    let total = 0;
    let correct = 0;
    questions.forEach((q, qIdx) => {
      total += q.options.filter((o) => o.correct).length;
      correct += q.options.reduce(
        (sum: number, o, oIdx) =>
          sum + (o.correct && (answers[qIdx] || []).includes(oIdx) ? 1 : 0),
        0
      );
    });
    const percent = Math.round((correct / total) * 100);
    setScore(percent);

    // Submit to API
    await fetch(`${API_URL}/submit`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, answers, percent }),
    });

    setSubmitted(true);
  };

  const fetchResults = async () => {
    const res = await fetch(`${API_URL}/results`);
    const data = await res.json();
    setAllResults(data);
  };

  if (showHost) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <button
          className="mb-4 bg-gray-300 px-3 py-1 rounded"
          onClick={() => setShowHost(false)}
        >
          Back to Quiz
        </button>
        <button
          className="mb-4 ml-2 bg-blue-600 text-white px-3 py-1 rounded"
          onClick={fetchResults}
        >
          Refresh Results
        </button>
        <h2 className="text-xl font-bold mb-2">All Submissions</h2>
        <table className="w-full border mb-4">
          <thead>
            <tr>
              <th className="border px-2">Name</th>
              <th className="border px-2">Score (%)</th>
            </tr>
          </thead>
          <tbody>
            {allResults
              .sort((a, b) => b.percent - a.percent)
              .map((s, i) => (
                <tr key={i}>
                  <td className="border px-2">{s.name}</td>
                  <td className="border px-2 font-bold">{s.percent}</td>
                </tr>
              ))}
          </tbody>
        </table>
        <h3 className="text-lg font-semibold mb-1">🏆 Top 3 Winners</h3>
        <ol className="list-decimal ml-6">
          {allResults
            .sort((a, b) => b.percent - a.percent)
            .slice(0, 3)
            .map((s, i) => (
              <li key={i} className="font-bold">
                {s.name} ({s.percent}%)
              </li>
            ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Login Page Testcase Quiz</h1>
        <button
          className="bg-green-600 text-white px-3 py-1 rounded"
          onClick={() => {
            setShowHost(true);
            fetchResults();
          }}
        >
          Host View
        </button>
      </div>
      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full border rounded px-2 py-1 mb-4"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
          {questions.map((q, qIdx) => (
            <div key={qIdx} className="mb-4">
              <h3 className="font-semibold">{q.category}: {q.question}</h3>
              {q.options.map((opt, oIdx) => (
                <label key={oIdx} className="block">
                  <input
                    type="checkbox"
                    checked={(answers[qIdx] || []).includes(oIdx)}
                    onChange={() => handleOptionChange(qIdx, oIdx)}
                  />{" "}
                  {opt.text}
                </label>
              ))}
            </div>
          ))}
          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-2">
            Submit
          </button>
        </form>
      ) : (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Your Score</h2>
          <p className="text-lg font-bold">{score}%</p>
          <button
            className="mt-4 bg-gray-300 px-3 py-1 rounded"
            onClick={() => window.location.reload()}
          >
            Submit Another
          </button>
        </div>
      )}
    </div>
  );
}