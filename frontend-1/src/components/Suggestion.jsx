import React, { useState } from "react";
import { fetchHistoryByStudentId } from "../api";
import { useNavigate, Link } from "react-router-dom";
import { Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler
);

const Suggestion = () => {
  const [studentId, setStudentId] = useState("");
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");

  const navigate = useNavigate();
  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleSearch = () => {
    if (studentId.trim()) {
      fetchHistoryByStudentId(studentId.trim())
        .then((res) => {
          setHistory(res.data);
          setError("");
        })
        .catch((err) =>
          setError(err.response?.data?.error || "Search failed")
        );
    }
  };

  const getLabel = (level) => {
    switch (level) {
      case 0:
        return "Low";
      case 1:
        return "Moderate";
      case 2:
        return "High";
      default:
        return "Unknown";
    }
  };

  const getAvgLabel = (avg) => {
    if (avg < 0.8) return "Low";
    else if (avg < 1.5) return "Moderate";
    else return "High";
  };

  const averageEngagement = () => {
    if (!history.length) return null;
    const avg =
      history.reduce((acc, h) => acc + h.predicted_engagement_level, 0) /
      history.length;
    return `${avg.toFixed(2)} (${getAvgLabel(avg)})`;
  };

  const generateDynamicSuggestions = () => {
  const n = history.length;
  if (n === 0) return [];

  const levels = history.map(h => h.predicted_engagement_level);
  const avg = levels.reduce((sum, val) => sum + val, 0) / n;

  const recent = levels.slice(-Math.min(5, n));
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;

  const variance = levels.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / n;

  const frequency = levels.reduce((acc, val) => {
    acc[val] = (acc[val] || 0) + 1;
    return acc;
  }, {});
  const mode = Object.keys(frequency).reduce((a, b) =>
    frequency[a] > frequency[b] ? a : b
  );

  const timestamps = history.map(h => new Date(h.timestamp).getHours());
  const afternoonLowCount = timestamps
    .map((t, i) => (t >= 13 && t <= 16 && levels[i] < 1 ? 1 : 0))
    .reduce((a, b) => a + b, 0);

  const lowFeedbackCount = history.filter(
    h => h.feedback && h.feedback.toLowerCase().includes("boring")
  ).length;

  const suggestions = [];

  // 1. Very low recent focus
  if (recentAvg < 0.5) {
    suggestions.push("🟥 Very low recent focus. Try interactive activities like quizzes or peer discussion.");
    suggestions.push("🧠 Use multimedia or personal storytelling to stimulate attention.");
  }

  // 2. Engagement dropping
  if (avg < 1 && recentAvg < avg) {
    suggestions.push("📉 Engagement is dropping. Try short learning bursts and gamified tasks.");
    suggestions.push("👥 Introduce collaborative exercises to improve involvement.");
  }

  // 3. High variance
  if (variance > 0.5) {
    suggestions.push("🔁 Engagement fluctuates. Recommend fixed daily schedules or structured breaks.");
    suggestions.push("⏱️ Use Pomodoro or 45-10 minute learning cycles.");
  }

  // 4. Consistently high engagement
  if (parseInt(mode) === 2 && avg > 1.5) {
    suggestions.push("✅ Consistently engaged! Offer enrichment tasks like small research projects.");
    suggestions.push("📚 Let them support peers or present topics.");
  }

  // 5. Afternoon dip
  if (afternoonLowCount > 2) {
    suggestions.push("⏰ Low afternoon engagement detected. Use lighter content post-lunch.");
    suggestions.push("🎧 Offer short audio/video learning aids during those hours.");
  }

  // 6. Negative feedback patterns
  if (lowFeedbackCount > 1) {
    suggestions.push("⚠️ Repeated negative feedback. Consider changing content delivery method.");
    suggestions.push("🎨 Add visuals, simulations, or hands-on exercises.");
  }

  // Default fallback if no suggestions added
  if (suggestions.length === 0) {
    suggestions.push("🙂 Engagement is stable. Continue using your current strategies, but stay flexible.");
  }

  return suggestions;
};



  return (
    <div style={{ maxWidth: 900, margin: "auto", padding: 20 }}>
      {/* Navigation */}
      <nav
        style={{
          marginBottom: 20,
          borderBottom: "1px solid #ccc",
          paddingBottom: 10,
        }}
      >
        <Link to="/dashboard" style={{ marginRight: 15 }}>
          Dashboard
        </Link>
        <Link to="/history" style={{ marginRight: 15 }}>
          History
        </Link>
        <Link to="/suggestion" style={{ marginRight: 15 }}>
          Suggestion
        </Link>
        <Link to="/profile" style={{ marginRight: 15 }}>
          Profile
        </Link>
        <button onClick={handleLogout} style={{ float: "right" }}>
          Logout
        </button>
      </nav>

      <h2>Engagement Suggestion Center</h2>

      <div style={{ marginBottom: 20 }}>
        <input
          type="text"
          placeholder="Enter Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          style={{ marginRight: 10 }}
        />
        <button onClick={handleSearch}>Search</button>
      </div>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {history.length > 0 && (
        <>
          <h3>Summary for: <em>{studentId}</em></h3>
          <p><strong>Average Engagement Level:</strong> {averageEngagement()}</p>

          {/* Dynamic Suggestions */}
          <div style={{ marginTop: 10 }}>
            <h4>Suggestions</h4>
            <ul>
              {generateDynamicSuggestions().map((s, i) => (
                <li key={i}>{s}</li>
              ))}
            </ul>
          </div>

          {/* Table */}
          <table border="1" cellPadding="5" style={{ width: "100%", marginTop: 20 }}>
            <thead>
              <tr>
                <th>Time</th>
                <th>HeartRate</th>
                <th>SkinConductance</th>
                <th>EEG</th>
                <th>Engagement</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {history.map((h) => (
                <tr key={h._id}>
                  <td>{new Date(h.timestamp).toLocaleString()}</td>
                  <td>{h.input_data.HeartRate}</td>
                  <td>{h.input_data.SkinConductance}</td>
                  <td>{h.input_data.EEG}</td>
                  <td>{getLabel(h.predicted_engagement_level)}</td>
                  <td>{h.feedback || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Graph */}
          <div style={{ marginTop: 40 }}>
            <h4>Physiological Trends</h4>
            <Line
              data={{
                labels: history.map((h) =>
                  new Date(h.timestamp).toLocaleTimeString()
                ),
                datasets: [
                  {
                    label: "Heart Rate",
                    data: history.map((h) => h.input_data.HeartRate),
                    borderColor: "red",
                    backgroundColor: "rgba(255,0,0,0.1)",
                    fill: true,
                    tension: 0.4,
                  },
                  {
                    label: "Skin Conductance",
                    data: history.map((h) => h.input_data.SkinConductance),
                    borderColor: "blue",
                    backgroundColor: "rgba(0,0,255,0.1)",
                    fill: true,
                    tension: 0.4,
                  },
                  {
                    label: "EEG",
                    data: history.map((h) => h.input_data.EEG),
                    borderColor: "green",
                    backgroundColor: "rgba(0,255,0,0.1)",
                    fill: true,
                    tension: 0.4,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: {
                    position: "top",
                  },
                },
              }}
            />
          </div>
        </>
      )}
    </div>
  );
};

export default Suggestion;
