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

  // Helper: Calculate average engagement level
  const averageEngagement = () => {
    if (!history.length) return null;
    const avg =
      history.reduce((acc, h) => acc + h.predicted_engagement_level, 0) /
      history.length;
    return avg.toFixed(2);
  };

  // Helper: Get most recent suggestion
  const dynamicSuggestion = () => {
    const recent = history.slice(-5);
    const avgRecent =
      recent.reduce((acc, h) => acc + h.predicted_engagement_level, 0) /
      recent.length;

    if (avgRecent < 0.5) {
      return "Recent attention is very low. Suggest 5-minute physical movement or engaging quiz.";
    } else if (avgRecent < 1.2) {
      return "Moderate engagement recently. Try varying content presentation style.";
    } else {
      return "Student is staying engaged well. Offer advanced tasks to challenge them.";
    }
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
          <p><strong>Latest Suggestion:</strong> {dynamicSuggestion()}</p>

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

          {/* Smart Suggestions */}
          <div style={{ marginTop: 40 }}>
            <h4>Behavioral Suggestions</h4>
            <ul>
              {history.some((h) => h.predicted_engagement_level === 0) && (
                <li>
                  Low engagement detected. Introduce gamified content or peer interaction.
                </li>
              )}
              {history.slice(-3).every((h) => h.predicted_engagement_level === 0) && (
                <li>
                  Recent trend shows consistent disengagement. Follow-up is recommended.
                </li>
              )}
              {history.filter((h) => h.predicted_engagement_level === 2).length >=
                history.length / 2 && (
                <li>
                  Student is doing great! Assign exploratory or creative tasks.
                </li>
              )}
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default Suggestion;
