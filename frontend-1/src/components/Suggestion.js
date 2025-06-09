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
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
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

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      {/* Navigation Bar */}
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

      <h2>Student Engagement Suggestion</h2>

      <input
        type="text"
        placeholder="Enter Student ID"
        value={studentId}
        onChange={(e) => setStudentId(e.target.value)}
        style={{ marginRight: 10 }}
      />
      <button onClick={handleSearch}>Search</button>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {history.length > 0 && (
        <>
          <h3>Prediction History for {studentId}</h3>
          <table border="1" cellPadding="5" style={{ width: "100%" }}>
            <thead>
              <tr>
                <th>Timestamp</th>
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
                  <td>{h.feedback || ""}</td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Charts */}
          <div style={{ marginTop: 40 }}>
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
                    fill: false,
                  },
                  {
                    label: "Skin Conductance",
                    data: history.map((h) => h.input_data.SkinConductance),
                    borderColor: "blue",
                    fill: false,
                  },
                  {
                    label: "EEG",
                    data: history.map((h) => h.input_data.EEG),
                    borderColor: "green",
                    fill: false,
                  },
                ],
              }}
            />
          </div>

          {/* Suggestions */}
          <div style={{ marginTop: 30 }}>
            <h4>Suggestions Based on Data</h4>
            <ul>
              {history.some((h) => h.predicted_engagement_level === 0) && (
                <li>Engagement was low. Consider interactive tasks or short breaks.</li>
              )}
              {history.filter((h) => h.predicted_engagement_level === 2).length > history.length / 2 && (
                <li>Student is highly engaged most of the time. Keep up the good work!</li>
              )}
              {history.length >= 5 &&
                history.slice(-3).every((h) => h.predicted_engagement_level === 0) && (
                  <li>
                    Recent data shows disengagement. Consider follow-up with the student.
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
