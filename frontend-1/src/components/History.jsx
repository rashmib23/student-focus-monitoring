import React, { useEffect, useState } from "react";
import { fetchHistory } from "../api";
import { useNavigate, Link } from "react-router-dom";

const History = () => {
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  useEffect(() => {
    fetchHistory()
      .then((res) => setHistory(res.data))
      .catch((err) =>
        setError(err.response?.data?.error || "Failed to load history")
      );
  }, []);

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20 }}>
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
              <th>HeartRate</th>
              <th>SkinConductance</th>
              <th>EEG</th>
              <th>Predicted Engagement Level</th>
            </tr>
          </thead>
          <tbody>
            {history.map((item) => (
              <tr key={item._id}>
                <td>{new Date(item.timestamp).toLocaleString()}</td>
                <td>{item.input_data.HeartRate}</td>
                <td>{item.input_data.SkinConductance}</td>
                <td>{item.input_data.EEG}</td>
                <td>{item.predicted_engagement_level}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default History;
