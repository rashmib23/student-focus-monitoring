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
  const [studentId, setStudentId] = useState("");
  const [heartRate, setHeartRate] = useState("");
  const [skinConductance, setSkinConductance] = useState("");
  const [eeg, setEeg] = useState("");
  const [manualResult, setManualResult] = useState(null);
  const [manualFeedback, setManualFeedback] = useState("");

  const [csvFile, setCsvFile] = useState(null);
  const [csvResults, setCsvResults] = useState([]);
  const [csvError, setCsvError] = useState("");

  const [showManual, setShowManual] = useState(false);
  const [showCSV, setShowCSV] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  const handleManualSubmit = async (e) => {
    e.preventDefault();
    setManualResult(null);
    setManualFeedback("");
    try {
      const data = {
        student_id: studentId,
        HeartRate: parseFloat(heartRate),
        SkinConductance: parseFloat(skinConductance),
        EEG: parseFloat(eeg),
      };
      const res = await manualPredict(data);
      setManualResult(res.data.EngagementLevel);
      setManualFeedback(res.data.Feedback || "");
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
    <div style={{ maxWidth: 800, margin: "auto", padding: 20 }}>
      {/* Navigation */}
      <nav style={{ marginBottom: 20, borderBottom: "1px solid #ccc", paddingBottom: 10 }}>
        <Link to="/dashboard" style={{ marginRight: 15 }}>Dashboard</Link>
        <Link to="/history" style={{ marginRight: 15 }}>History</Link>
        <Link to="/suggestion" style={{ marginRight: 15 }}>Suggestion</Link>
        <Link to="/profile" style={{ marginRight: 15 }}>Profile</Link>
        <button onClick={handleLogout} style={{ float: "right" }}>Logout</button>
      </nav>

      <h2>Student Focus Monitoring System</h2>

      {/* System Description */}
      <section style={{ marginBottom: 30, padding: 20, backgroundColor: "#fdfdfd", borderRadius: 8 }}>
        <h3 style={{ marginBottom: 10 }}>About the System</h3>
        <p style={{ textAlign: "justify", lineHeight: 1.6 }}>
          This system is developed to assess and analyze student engagement levels using pre-recorded physiological data collected from academic or learning environments.
          By processing features such as <strong>Heart Rate</strong>, <strong>Skin Conductance</strong>, and <strong>EEG Alpha Wave activity</strong>,
          the system applies machine learning models to predict a learner’s cognitive focus and emotional engagement.
        </p>
      </section>

      {/* Signal Info */}
      <section style={{ padding: 15, background: "#f5f5f5", borderRadius: 6, marginBottom: 30 }}>
        <h4>Physiological Signal Descriptions</h4>
        <ul>
          <li><strong>Heart Rate Variability (HRV):</strong> Cardiac responsiveness, measured in ms.</li>
          <li><strong>Skin Conductance (GSR):</strong> Emotional arousal, measured in µS.</li>
          <li><strong>EEG Alpha Waves:</strong> Brain wave activity indicating focus, measured in amplitude/frequency.</li>
        </ul>
      </section>

      {/* Action Buttons */}
      <div style={{ marginBottom: 20 }}>
        <button onClick={() => setShowManual(!showManual)} style={{ marginRight: 15 }}>
          {showManual ? "Hide Manual Input" : "Enter Data Manually"}
        </button>
        <button onClick={() => setShowCSV(!showCSV)}>
          {showCSV ? "Hide CSV Upload" : "Upload CSV File"}
        </button>
      </div>

      {/* Manual Input Form */}
      {showManual && (
        <section style={{ marginBottom: 30 }}>
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
            <button type="submit" style={{ marginTop: 10 }}>Predict Now</button>
          </form>
          {manualResult !== null && (
            <>
              <p><strong>Predicted Engagement Level: </strong> {mapEngagementLabel(manualResult)}</p>
              <p><strong>Feedback: </strong> {manualFeedback}</p>
            </>
          )}
        </section>
      )}

      {/* CSV Upload Form */}
      {showCSV && (
        <section>
          <h3>Upload CSV File</h3>
          <p><small>CSV must include: student_id, HeartRate, SkinConductance, EEG</small></p>
          <input type="file" accept=".csv" onChange={(e) => setCsvFile(e.target.files[0])} />
          <button onClick={handleCsvSubmit} style={{ marginLeft: 10 }}>Predict CSV</button>
          {csvError && <p style={{ color: "red" }}>{csvError}</p>}
          {csvResults.length > 0 && (
            <table border="1" cellPadding="5" style={{ marginTop: 10, width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th>Student ID</th>
                  <th>HeartRate</th>
                  <th>SkinConductance</th>
                  <th>EEG</th>
                  <th>Predicted Engagement Level</th>
                  <th>Feedback</th>
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
                    <td>{row.Feedback || ""}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
