import React, { useState } from "react";
import { manualPredict, csvPredict } from "../api";

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
    <div className="max-w-4xl mx-auto p-6">
      {/* Title Banner - keep original gradient */}
      <div className="text-3xl font-bold text-white text-center p-6 mb-6 rounded-lg bg-gradient-to-r from-pink-500 via-yellow-400 to-pink-500 shadow-md">
        Student Focus Monitoring System
      </div>

      {/* Cream background: System Description */}
      <section className="mb-10 p-6 rounded-lg shadow-md" style={{ backgroundColor: "#FFFDD0" }}>
        <h3 className="text-xl font-semibold mb-3">About the System</h3>
        <p className="text-gray-800 leading-relaxed text-justify">
          This system is developed to assess and analyze student engagement levels using pre-recorded physiological data collected from academic or learning environments.
          By processing features such as <strong>Heart Rate</strong>, <strong>Skin Conductance</strong>, and <strong>EEG Alpha Wave activity</strong>,
          the system applies machine learning models to predict a learner’s cognitive focus and emotional engagement.
        </p>
      </section>

      {/* Cream background: Signal Info */}
      <section className="mb-10 p-5 rounded-md shadow-md" style={{ backgroundColor: "#FFFDD0" }}>
        <h4 className="text-lg font-semibold mb-3">Physiological Signal Descriptions</h4>
        <ul className="list-disc list-inside text-gray-800 space-y-1">
          <li><strong>Heart Rate Variability (HRV):</strong> Cardiac responsiveness, measured in ms.</li>
          <li><strong>Skin Conductance (GSR):</strong> Emotional arousal, measured in µS.</li>
          <li><strong>EEG Alpha Waves:</strong> Brain wave activity indicating focus, measured in frequency.</li>
        </ul>
      </section>

      {/* Action Buttons */}
      <div className="mb-8 flex gap-4 flex-wrap transition-transform hover:scale-105">
        <button
          onClick={() => setShowManual(!showManual)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition"
        >
          {showManual ? "Hide Manual Input" : "Enter Data Manually"}
        </button>
        <button
          onClick={() => setShowCSV(!showCSV)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition"
        >
          {showCSV ? "Hide CSV Upload" : "Upload CSV File"}
        </button>
      </div>

      {/* Cream background: Manual Input Form */}
      {showManual && (
        <section className="mb-10 p-6 rounded-lg shadow-md transition-transform hover:scale-105" style={{ backgroundColor: "#FFFDD0" }}>
          <h3 className="text-2xl font-semibold mb-5">Manual Input Prediction</h3>
          <form onSubmit={handleManualSubmit} className="space-y-5 max-w-md">
            <div>
              <label className="block mb-1 font-medium text-gray-700">Student ID</label>
              <input
                type="text"
                value={studentId}
                required
                onChange={(e) => setStudentId(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Heart Rate</label>
              <input
                type="number"
                step="0.01"
                value={heartRate}
                required
                onChange={(e) => setHeartRate(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">Skin Conductance</label>
              <input
                type="number"
                step="0.01"
                value={skinConductance}
                required
                onChange={(e) => setSkinConductance(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block mb-1 font-medium text-gray-700">EEG</label>
              <input
                type="number"
                step="0.01"
                value={eeg}
                required
                onChange={(e) => setEeg(e.target.value)}
                className="w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              type="submit"
              className="mt-3 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-md transition"
            >
              Predict Now
            </button>
          </form>

          {manualResult !== null && (
            <div className="mt-6">
              <p className="text-lg font-semibold">
                Predicted Engagement Level:{" "}
                <span className="text-blue-700">{mapEngagementLabel(manualResult)}</span>
              </p>
              <p className="mt-2 text-gray-700">{manualFeedback}</p>
            </div>
          )}
        </section>
      )}

      {/* Cream background: CSV Upload */}
      {showCSV && (
        <section className="p-6 rounded-lg shadow-md transition-transform hover:scale-105" style={{ backgroundColor: "#FFFDD0" }}>
          <h3 className="text-2xl font-semibold mb-4">Upload CSV File</h3>
          <p className="text-sm text-gray-500 mb-3">
            CSV must include: <code>student_id, HeartRate, SkinConductance, EEG</code>
          </p>
          <div className="flex items-center gap-3 mb-4">
            <input
              type="file"
              accept=".csv"
              onChange={(e) => setCsvFile(e.target.files[0])}
              className="border border-gray-300 rounded-md px-3 py-2"
            />
            <button
              onClick={handleCsvSubmit}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md transition"
            >
              Predict CSV
            </button>
          </div>
          {csvError && <p className="text-red-600 mb-4">{csvError}</p>}

          {csvResults.length > 0 && (
            <div className="overflow-x-auto">
              <table className="min-w-full border border-gray-300 rounded-md border-collapse">
                <thead className="bg-gray-200">
                  <tr>
                    <th className="border border-gray-300 px-3 py-2 text-left">Student ID</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">HeartRate</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">SkinConductance</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">EEG</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Predicted Engagement Level</th>
                    <th className="border border-gray-300 px-3 py-2 text-left">Feedback</th>
                  </tr>
                </thead>
                <tbody>
                  {csvResults.map((row, i) => (
                    <tr key={i} className={i % 2 === 0 ? "bg-white" : "bg-gray-50"}>
                      <td className="border border-gray-300 px-3 py-2">{row.student_id || row.studentId || "N/A"}</td>
                      <td className="border border-gray-300 px-3 py-2">{row.HeartRate}</td>
                      <td className="border border-gray-300 px-3 py-2">{row.SkinConductance}</td>
                      <td className="border border-gray-300 px-3 py-2">{row.EEG}</td>
                      <td className="border border-gray-300 px-3 py-2">{mapEngagementLabel(row.PredictedEngagementLevel)}</td>
                      <td className="border border-gray-300 px-3 py-2">{row.Feedback || ""}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
};

export default Dashboard;
