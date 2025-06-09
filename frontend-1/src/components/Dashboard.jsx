import React, { useState } from "react";
import { manualPredict, csvPredict } from "../api";
import { useNavigate, Link } from "react-router-dom";

const mapEngagementLabel = (value) => {
  switch (value) {
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

const Dashboard = () => {
  const [studentId, setStudentId] = useState(""); // added studentId state
  const [heartRate, setHeartRate] = useState("");
  const [skinConductance, setSkinConductance] = useState("");
  const [eeg, setEeg] = useState("");
  const [manualResult, setManualResult] = useState(null);
  const [manualFeedback, setManualFeedback] = useState(""); // NEW

  const [csvFile, setCsvFile] = useState(null);
  const [csvResults, setCsvResults] = useState([]);
  const [csvError, setCsvError] = useState("");

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualResult(null);
    setManualFeedback(""); // clear previous feedback

    try {
      const data = {
        student_id: studentId, // send student_id here
        HeartRate: parseFloat(heartRate),
        SkinConductance: parseFloat(skinConductance),
        EEG: parseFloat(eeg),
      };
      const res = await manualPredict(data);
      setManualResult(res.data.EngagementLevel);
      setManualFeedback(res.data.Feedback || ""); // set feedback from response
    } catch (err) {
      alert(err.response?.data?.error || "Prediction failed");
    }
  };

  const handleCsvSubmit = async () => {
    setCsvResults([]);
    setCsvError("");

    if (!csvFile) {
      setCsvError("Please select a CSV file");
      return;
    }

    try {
      const res = await csvPredict(csvFile);
      setCsvResults(res.data);
    } catch (err) {
      setCsvError(err.response?.data?.error || "CSV Prediction failed");
    }
  };

  return (
    <div style={{ maxWidth: 700, margin: "auto", padding: 20 }}>
      {/* Navigation Bar */}
      <nav
        style={{ marginBottom: 20, borderBottom: "1px solid #ccc", paddingBottom: 10 }}
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

      <h2>Dashboard</h2>

      <section style={{ marginTop: 20 }}>
        <h3>Manual Input Prediction</h3>
        <form onSubmit={handleManualSubmit}>
          <div>
            <label>Student ID</label>
            <input
              type="text"
              value={studentId}
              required
              onChange={(e) => setStudentId(e.target.value)}
            />
          </div>
          <div>
            <label>Heart Rate</label>
            <input
              type="number"
              step="0.01"
              value={heartRate}
              required
              onChange={(e) => setHeartRate(e.target.value)}
            />
          </div>
          <div>
            <label>Skin Conductance</label>
            <input
              type="number"
              step="0.01"
              value={skinConductance}
              required
              onChange={(e) => setSkinConductance(e.target.value)}
            />
          </div>
          <div>
            <label>EEG</label>
            <input
              type="number"
              step="0.01"
              value={eeg}
              required
              onChange={(e) => setEeg(e.target.value)}
            />
          </div>
          <button type="submit" style={{ marginTop: 10 }}>
            Predict Now
          </button>
        </form>
        {manualResult !== null && (
          <>
            <p>
              <strong>Predicted Engagement Level: </strong> {mapEngagementLabel(manualResult)}
            </p>
            <p>
              <strong>Feedback: </strong> {manualFeedback}
            </p>
          </>
        )}
      </section>

      <section style={{ marginTop: 40 }}>
        <h3>Upload CSV File</h3>
        <p>
          <small>CSV must include columns: student_id, HeartRate, SkinConductance, EEG</small>
        </p>
        <input
          type="file"
          accept=".csv"
          onChange={(e) => setCsvFile(e.target.files[0])}
        />
        <button onClick={handleCsvSubmit} style={{ marginLeft: 10 }}>
          Predict CSV
        </button>
        {csvError && <p style={{ color: "red" }}>{csvError}</p>}

        {csvResults.length > 0 && (
          <table
            border="1"
            cellPadding="5"
            style={{ marginTop: 10, width: "100%", borderCollapse: "collapse" }}
          >
            <thead>
              <tr>
                <th>Student ID</th>
                <th>HeartRate</th>
                <th>SkinConductance</th>
                <th>EEG</th>
                <th>Predicted Engagement Level</th>
                <th>Feedback</th> {/* NEW */}
              </tr>
            </thead>
            <tbody>
              {csvResults.map((row, i) => (
                <tr key={i}>
                  <td>{row.student_id || row.studentId || "N/A"}</td>
                  <td>{row.HeartRate}</td>
                  <td>{row.SkinConductance}</td>
                  <td>{row.EEG}</td>
                  <td>{mapEngagementLabel(row.PredictedEngagementLevel)}</td>
                  <td>{row.Feedback || ""}</td> {/* NEW */}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default Dashboard;
