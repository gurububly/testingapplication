"use client";
import { useState, useEffect } from "react";

const API_URL = "https://qa-testcase-api.onrender.com";
const HOST_PASSWORD = "testing123"; // Change this to your secret

// MCQ questions and answers (true = correct)
const questions = [
  {
    question: "Which of the following are positive test cases for login functionality?",
    options: [
      { text: "Enter valid username and valid password", correct: true },
      { text: "Login with remember me checkbox checked", correct: true },
      { text: "Enter invalid username and valid password", correct: false },
      { text: "Leave both username and password empty", correct: false },
    ],
  },
  {
    question: "What are valid negative test cases for login?",
    options: [
      { text: "Invalid username and invalid password", correct: true },
      { text: "Valid username and empty password", correct: true },
      { text: "SQL injection input", correct: true },
      { text: "Valid credentials with correct captcha", correct: false },
    ],
  },
  {
    question: "Which of the following would be considered edge test cases?",
    options: [
      { text: "Username with exactly 255 characters", correct: true },
      { text: "Password with special characters", correct: true },
      { text: "Login with username as \"admin\" and password \"admin\"", correct: false },
      { text: "Typo in username", correct: false },
    ],
  },
  {
    question: "Which performance-related scenarios should be tested for login?",
    options: [
      { text: "Login under slow internet conditions", correct: true },
      { text: "Multiple concurrent login requests", correct: true },
      { text: "Login API response time < 1 sec", correct: true },
      { text: "Login with outdated browser", correct: false },
    ],
  },
  {
    question: "What should be the expected behavior when both fields are blank and user clicks on login?",
    options: [
      { text: "Show error messages for both fields", correct: true },
      { text: "Redirect to dashboard", correct: false },
      { text: "Show browser crash", correct: false },
      { text: "Show loading spinner", correct: false },
    ],
  },
  {
    question: "Which of the following inputs should be rejected during login?",
    options: [
      { text: "Username: ' OR 1=1 --", correct: true },
      { text: "Password: <script>alert(1)</script>", correct: true },
      { text: "Username: john.doe@example.com", correct: false },
      { text: "Password: Welcome@123", correct: false },
    ],
  },
  {
    question: "What validations are usually applied on the password field?",
    options: [
      { text: "Minimum length (e.g., 8 characters)", correct: true },
      { text: "Includes at least one uppercase, number, and special character", correct: true },
      { text: "No common words like 'password'", correct: false },
      { text: "Accepts only numeric passwords", correct: false },
    ],
  },
  {
    question: "Which test cases cover security aspects of login page?",
    options: [
      { text: "Prevent brute-force login attempts", correct: true },
      { text: "Password should not be visible on screen", correct: true },
      { text: "Use HTTPS for login API", correct: true },
      { text: "Allow login from any origin", correct: false },
    ],
  },
  {
    question: "Which test cases are useful for UI validation on login page?",
    options: [
      { text: "Password field should have masked input", correct: true },
      { text: "Login button should be disabled if fields are empty", correct: true },
      { text: "Login should succeed even if UI is broken", correct: false },
      { text: "Proper spacing and alignment of fields", correct: true },
    ],
  },
  {
    question: "What test cases are useful for session management post-login?",
    options: [
      { text: "Session timeout after inactivity", correct: true },
      { text: "Logout should clear session cookies", correct: true },
      { text: "Login should keep session active forever", correct: false },
      { text: "Concurrent logins from multiple devices", correct: true },
    ],
  },
  {
    question: "Which of these are important accessibility tests for login page?",
    options: [
      { text: "Tab key should navigate to each input field", correct: true },
      { text: "Screen reader should announce input labels", correct: true },
      { text: "Password should be shown in plain text for accessibility", correct: false },
      { text: "Color contrast should meet accessibility standards", correct: true },
    ],
  },
  {
    question: "Which of the following are boundary value test cases for username field?",
    options: [
      { text: "0 characters", correct: true },
      { text: "1 character", correct: true },
      { text: "Maximum allowed characters (e.g., 255)", correct: true },
      { text: "Random special characters", correct: false },
    ],
  },
  {
    question: "What scenarios test auto-lock or account blocking functionality?",
    options: [
      { text: "5 consecutive failed login attempts", correct: true },
      { text: "Brute force using multiple password combinations", correct: true },
      { text: "Successful login with valid credentials", correct: false },
      { text: "CAPTCHA appearing after 3 invalid attempts", correct: false },
    ],
  },
  {
    question: "Which of these are compatibility test cases?",
    options: [
      { text: "Login using Chrome, Firefox, Edge", correct: true },
      { text: "Login via mobile and tablet browsers", correct: true },
      { text: "Login on dark mode UI", correct: true },
      { text: "Login with expired session", correct: false },
    ],
  },
  {
    question: "What are some real-time test scenarios for “Remember Me” functionality?",
    options: [
      { text: "Check if user stays logged in after browser restart", correct: true },
      { text: "Ensure checkbox is unchecked by default", correct: true },
      { text: "Ensure token is cleared after manual logout", correct: true },
      { text: "Login with wrong credentials and checkbox checked", correct: false },
    ],
  },
];

// Define type for answers mapping
type AnswerMap = { [key: number]: number[] };

export default function TestcasesPage() {
  const [name, setName] = useState("");
  const [answers, setAnswers] = useState<AnswerMap>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [showHost, setShowHost] = useState(false);
  const [hostAuth, setHostAuth] = useState(false);
  const [allResults, setAllResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const nameExists = allResults.some(
    (entry) => entry.name.trim().toLowerCase() === name.trim().toLowerCase()
  );

  const handleOptionChange = (qIdx: number, oIdx: number) => {
    setAnswers((prev) => {
      const prevArr = prev[qIdx] || [];
      return {
        ...prev,
        [qIdx]: prevArr.includes(oIdx)
          ? prevArr.filter((i) => i !== oIdx)
          : [...prevArr, oIdx],
      };
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return alert("Please enter your name.");
    if (nameExists) return alert("This name has already submitted responses.");

    let total = 0, correct = 0;
    questions.forEach((q, qIdx) => {
      q.options.forEach((opt, oIdx) => {
        total++;
        if (opt.correct && (answers[qIdx] || []).includes(oIdx)) correct++;
        if (!opt.correct && (answers[qIdx] || []).includes(oIdx)) correct -= 0.5;
      });
    });
    correct = Math.max(0, correct); // Ensure no negative score
    const percent = Math.round((correct / total) * 100);
    setScore(percent);

    try {
      await fetch(`${API_URL}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, answers, percent }),
      });
      setSubmitted(true);
      fetchResults();
    } catch (err) {
      alert("Failed to submit. Please check your network/API connection.");
    }
  };

  const fetchResults = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/results`);
      setAllResults(await res.json());
    } catch {
      alert("Failed to fetch results.");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (showHost && hostAuth) fetchResults();
    fetchResults();
  }, [showHost, hostAuth]);

  const handleHostView = () => {
    const pwd = prompt("Enter host password to view results:");
    if (pwd === HOST_PASSWORD) {
      setHostAuth(true);
      setShowHost(true);
    } else {
      alert("Incorrect password!");
    }
  };

  const handleClearResults = async () => {
    if (window.confirm("Are you sure you want to clear all results?")) {
      try {
        await fetch(`${API_URL}/clear`, { method: "POST" });
        fetchResults();
      } catch {
        alert("Failed to clear results.");
      }
    }
  };

  const renderOptionFeedback = (qIdx: number, oIdx: number, option: { text: string; correct: boolean }) => {
    const selected = (answers[qIdx] || []).includes(oIdx);
    if (submitted) {
      if (option.correct && selected) return "text-green-700 font-bold";
      if (option.correct && !selected) return "text-green-600";
      if (!option.correct && selected) return "text-red-500 line-through";
    }
    return "";
  };

  if (showHost && hostAuth) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <button className="mb-4 bg-gray-300 px-3 py-1 rounded" onClick={() => { setShowHost(false); setHostAuth(false); }}>Back to Quiz</button>
        <button className="mb-4 ml-2 bg-blue-600 text-white px-3 py-1 rounded" onClick={fetchResults} disabled={loading}>{loading ? "Refreshing..." : "Refresh Results"}</button>
        <button className="mb-4 ml-2 bg-red-600 text-white px-3 py-1 rounded" onClick={handleClearResults}>Clear Results</button>
        <h2 className="text-xl font-bold mb-2">All Submissions</h2>
        <table className="w-full border mb-4">
          <thead><tr><th className="border px-2">Name</th><th className="border px-2">Score (%)</th></tr></thead>
          <tbody>
            {allResults.sort((a, b) => b.percent - a.percent).map((s, i) => (
              <tr key={i}><td className="border px-2">{s.name}</td><td className="border px-2 font-bold">{s.percent}</td></tr>
            ))}
          </tbody>
        </table>
        <h3 className="text-lg font-semibold mb-1">🏆 Top 3 Winners</h3>
        <ol className="list-decimal ml-6">
          {allResults.sort((a, b) => b.percent - a.percent).slice(0, 3).map((s, i) => (
            <li key={i} className="font-bold">{s.name} ({s.percent}%)</li>
          ))}
        </ol>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">Login Page Test Case MCQs</h1>
        <button className="bg-green-600 text-white px-3 py-1 rounded" onClick={handleHostView}>Host View</button>
      </div>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Enter your name"
            className="w-full border rounded px-2 py-1 mb-4"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={submitted}
          />
          {nameExists && <div className="text-red-600 mb-2">This name has already submitted responses.</div>}

          {questions.map((q, qIdx) => (
            <div key={qIdx} className="mb-4">
              <h3 className="font-semibold">{qIdx + 1}. {q.question}</h3>
              {q.options.map((opt, oIdx) => (
                <label key={oIdx} className={`block ${renderOptionFeedback(qIdx, oIdx, opt)}`}>
                  <input
                    type="checkbox"
                    checked={(answers[qIdx] || []).includes(oIdx)}
                    onChange={() => handleOptionChange(qIdx, oIdx)}
                    disabled={submitted}
                  /> {opt.text}
                </label>
              ))}
            </div>
          ))}

          <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded mt-2" disabled={nameExists}>Submit</button>
        </form>
      ) : (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Your Score</h2>
          <p className="text-lg font-bold">{score}%</p>
          <button className="mt-4 bg-gray-300 px-3 py-1 rounded" onClick={() => window.location.reload()}>Submit Another</button>
        </div>
      )}

      {/* Legend Section */}
      {submitted && (
        <div className="mt-6 text-sm border-t pt-4">
          <h4 className="font-semibold mb-2">Legend:</h4>
          <ul className="list-disc ml-6">
            <li><span className="text-green-700 font-bold">Green Bold</span>: Correct and selected ✅</li>
            <li><span className="text-green-600">Green</span>: Correct but not selected ⚠️</li>
            <li><span className="text-red-500 line-through">Red Strikethrough</span>: Selected but incorrect ❌</li>
            <li><span>White</span>: Not selected and not correct ⬜</li>
          </ul>
        </div>
      )}
    </div>
  );
}
