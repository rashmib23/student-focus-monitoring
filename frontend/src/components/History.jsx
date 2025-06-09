import React, { useEffect, useState } from "react";
import { fetchHistory, deleteHistoryItem } from "../api"; 
import { useNavigate } from "react-router-dom";

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

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this history record?")) {
      deleteHistoryItem(id)
        .then(() => {
          setHistory((prev) => prev.filter((item) => item._id !== id));
        })
        .catch((err) => {
          setError(err.response?.data?.error || "Failed to delete history item");
        });
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
    <div className="max-w-4xl mx-auto p-6 mt-10">
      <h2 className="text-3xl font-bold mb-6 text-center">Prediction History</h2>

      {error && (
        <p className="mb-4 text-center text-red-600 font-medium">{error}</p>
      )}

      {history.length === 0 ? (
        <p className="text-center text-gray-600">No history found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border border-gray-300 rounded-md divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                {[
                  "Timestamp",
                  "Student ID",
                  "HeartRate",
                  "SkinConductance",
                  "EEG",
                  "Predicted Engagement Level",
                  "Feedback",
                  "Actions",
                ].map((header) => (
                  <th
                    key={header}
                    className="px-4 py-2 text-left text-sm font-semibold text-gray-700 border-b border-gray-300"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {history.map((item) => (
                <tr key={item._id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {new Date(item.timestamp).toLocaleString()}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {item.student_id || "N/A"}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {item.input_data.HeartRate}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {item.input_data.SkinConductance}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {item.input_data.EEG}
                  </td>
                  <td className="px-4 py-2 text-sm font-medium text-gray-900">
                    {getLabel(item.predicted_engagement_level)}
                  </td>
                  <td className="px-4 py-2 text-sm text-gray-700">
                    {item.feedback || ""}
                  </td>
                  <td className="px-4 py-2 text-sm">
                    <button
                      onClick={() => handleDelete(item._id)}
                      className="text-red-600 hover:text-red-800 font-semibold focus:outline-none"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default History;
