import React, { useState } from "react";
import { fetchHistoryByStudentId } from "../api";
import { useNavigate } from "react-router-dom";
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
      case 0: return "Low";
      case 1: return "Moderate";
      case 2: return "High";
      default: return "Unknown";
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
      history.reduce((acc, h) => acc + h.predicted_engagement_level, 0) / history.length;
    return `${avg.toFixed(2)} (${getAvgLabel(avg)})`;
  };

  const generateDynamicSuggestions = () => {
    const n = history.length;
    if (n === 0) return [];

    const levels = history.map((h) => h.predicted_engagement_level);
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

    const timestamps = history.map((h) => new Date(h.timestamp).getHours());
    const afternoonLowCount = timestamps
      .map((t, i) => (t >= 13 && t <= 16 && levels[i] < 1 ? 1 : 0))
      .reduce((a, b) => a + b, 0);

    const lowFeedbackCount = history.filter(
      (h) => h.feedback && h.feedback.toLowerCase().includes("boring")
    ).length;

    const suggestions = [];

    if (recentAvg < 0.5) {
      suggestions.push("🟥 Very low recent focus. Try interactive activities like quizzes or peer discussion.");
      suggestions.push("🧠 Use multimedia or personal storytelling to stimulate attention.");
    }

    if (avg < 1 && recentAvg < avg) {
      suggestions.push("📉 Engagement is dropping. Try short learning bursts and gamified tasks.");
      suggestions.push("👥 Introduce collaborative exercises to improve involvement.");
    }

    if (variance > 0.5) {
      suggestions.push("🔁 Engagement fluctuates. Recommend fixed daily schedules or structured breaks (e.g., 25 min study, 5 min break).");
      suggestions.push("⏱️ Use Pomodoro or 45-10 minute learning cycles.");
    }

    if (parseInt(mode) === 2 && avg > 1.5) {
      suggestions.push("✅ Consistently engaged! Offer enrichment tasks like small research projects.");
      suggestions.push("📚 Let them support peers or present topics or advanced challenges.");
    }

    if (afternoonLowCount > 2) {
      suggestions.push("⏰ Low afternoon engagement detected. Use lighter content post-lunch or encourage short naps.");
      suggestions.push("🎧 Offer short audio/video learning aids during those hours.");
    }

    if (lowFeedbackCount > 1) {
      suggestions.push("⚠️ Repeated negative feedback.");
      suggestions.push("🎨 Add visuals, simulations, or hands-on exercises.");
    }

    if (suggestions.length === 0) {
      suggestions.push("🙂 Engagement is stable. Continue using your current strategies, but stay flexible.");
    }

    return suggestions;
  };

  return (
    <div className="max-w-5xl mx-auto p-6 font-sans bg-white rounded shadow">
      <h2 className="text-3xl font-bold mb-6 text-center">Engagement Suggestion Center</h2>

      <div className="mb-6 flex gap-3">
        <input
          type="text"
          placeholder="Enter Student ID"
          value={studentId}
          onChange={(e) => setStudentId(e.target.value)}
          className="flex-grow border border-gray-300 rounded px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={!studentId.trim()}
          className={`px-5 py-2 rounded text-white ${
            studentId.trim() ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"
          }`}
        >
          Search
        </button>
      </div>

      {error && <p className="text-red-600 mb-6 font-semibold">{error}</p>}

      {history.length > 0 && (
        <>
          <div className="mb-6">
            <h3 className="text-xl font-semibold mb-2">Summary for: <em>{studentId}</em></h3>
            <p><strong>Average Engagement Level:</strong> {averageEngagement()}</p>
          </div>

          <div className="mb-6">
            <h4 className="text-lg font-semibold mb-3">Suggestions</h4>
            <ul className="list-disc list-inside space-y-2">
              {generateDynamicSuggestions().map((s, i) => (
                <li key={i} className="text-gray-800">{s}</li>
              ))}
            </ul>
          </div>

          <div className="overflow-x-auto mb-10">
            <table className="min-w-full border border-gray-300 text-left text-sm bg-white">
              <thead className="bg-gray-100">
                <tr>
                  <th className="border border-gray-300 px-3 py-2">Time</th>
                  <th className="border border-gray-300 px-3 py-2">Heart Rate</th>
                  <th className="border border-gray-300 px-3 py-2">Skin Conductance</th>
                  <th className="border border-gray-300 px-3 py-2">EEG</th>
                  <th className="border border-gray-300 px-3 py-2">Engagement</th>
                  <th className="border border-gray-300 px-3 py-2">Feedback</th>
                </tr>
              </thead>
              <tbody>
                {history.map((h) => (
                  <tr key={h._id} className="odd:bg-white even:bg-gray-50 hover:bg-blue-50 transition">
                    <td className="border border-gray-300 px-3 py-2">{new Date(h.timestamp).toLocaleString()}</td>
                    <td className="border border-gray-300 px-3 py-2">{h.input_data?.HeartRate ?? "—"}</td>
                    <td className="border border-gray-300 px-3 py-2">{h.input_data?.SkinConductance ?? "—"}</td>
                    <td className="border border-gray-300 px-3 py-2">{h.input_data?.EEG ?? "—"}</td>
                    <td className="border border-gray-300 px-3 py-2">{getLabel(h.predicted_engagement_level)}</td>
                    <td className="border border-gray-300 px-3 py-2">{h.feedback || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="bg-white p-4 rounded shadow">
            <h4 className="text-lg font-semibold mb-4">Physiological Trends</h4>
            <Line
              data={{
                labels: history.map((h) => new Date(h.timestamp).toLocaleTimeString()),
                datasets: [
                  {
                    label: "Heart Rate",
                    data: history.map((h) => h.input_data?.HeartRate ?? 0),
                    borderColor: "rgb(239 68 68)",
                    backgroundColor: "rgba(239,68,68,0.2)",
                    fill: true,
                    tension: 0.3,
                    pointRadius: 2,
                  },
                  {
                    label: "Skin Conductance",
                    data: history.map((h) => h.input_data?.SkinConductance ?? 0),
                    borderColor: "rgb(59 130 246)",
                    backgroundColor: "rgba(59,130,246,0.2)",
                    fill: true,
                    tension: 0.3,
                    pointRadius: 2,
                  },
                  {
                    label: "EEG",
                    data: history.map((h) => h.input_data?.EEG ?? 0),
                    borderColor: "rgb(34 197 94)",
                    backgroundColor: "rgba(34,197,94,0.2)",
                    fill: true,
                    tension: 0.3,
                    pointRadius: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { position: "top" },
                  tooltip: { mode: "index", intersect: false },
                },
                interaction: { mode: "nearest", axis: "x", intersect: false },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: { stepSize: 1 },
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
