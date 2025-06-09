import React, { useEffect, useState } from "react";
import { fetchHistory, deleteHistoryItem } from "../api"; // import delete API
import { useNavigate, Link } from "react-router-dom";

const History = () => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const loadHistory = () => {
    fetchHistory()
      .then((res) => setHistory(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to load history")
      );
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // Delete handler
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this history record?")) {
      deleteHistoryItem(id)
        .then(() => {
          // Remove deleted item from state
          setHistory((prev) => prev.filter((item) => item._id !== id));
        })
        .catch((err) => {
          setError(err.response?.data?.error || "Failed to delete history item");
        });
    }
  };

  // Mapping function for engagement levels
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
    <div style={{ maxWidth: 700, margin: "auto", padding: 20 }}>
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
        <Link to="/profile" style={{ marginRight: 15 }}>
          Profile
        </Link>
        <button onClick={handleLogout} style={{ float: "right" }}>
          Logout
        </button>
      </nav>

      <h2>Prediction History</h2>

      {error && <p style={{ color: "red" }}>{error}</p>}

      {history.length === 0 ? (
        <p>No history found.</p>
      ) : (
        <table
          border="1"
          cellPadding="5"
          style={{ width: "100%", borderCollapse: "collapse" }}
        >
          <thead>
            <tr>
              <th>Timestamp</th>
              <th>Student ID</th>
              <th>HeartRate</th>
              <th>SkinConductance</th>
              <th>EEG</th>
              <th>Predicted Engagement Level</th>
              <th>Feedback</th>
              <th>Actions</th> {/* New column */}
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item._id}>
                <td>{new Date(item.timestamp).toLocaleString()}</td>
                <td>{item.student_id || "N/A"}</td>
                <td>{item.input_data.HeartRate}</td>
                <td>{item.input_data.SkinConductance}</td>
                <td>{item.input_data.EEG}</td>
                <td>{getLabel(item.predicted_engagement_level)}</td>
                <td>{item.feedback || ""}</td>
                <td>
                  <button
                    onClick={() => handleDelete(item._id)}
                    style={{ color: "red", cursor: "pointer" }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default History;
