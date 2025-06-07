const manualForm = document.getElementById("manualForm");
const csvForm = document.getElementById("csvForm");
const tableBody = document.querySelector("#dataTable tbody");

manualForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const formData = new FormData(manualForm);
  const inputData = {
    HeartRate: parseFloat(formData.get("HeartRate")),
    SkinConductance: parseFloat(formData.get("SkinConductance")),
    EEG: parseFloat(formData.get("EEG")),
  };

  const response = await fetch("http://127.0.0.1:5000/predict", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inputData),
  });

  const result = await response.json();
  if (result.EngagementLevel !== undefined) {
    appendToTable({ ...inputData, PredictedEngagementLevel: result.EngagementLevel });
  } else {
    alert("Prediction failed: " + JSON.stringify(result.error));
  }
});

document.getElementById("csvUploadForm").addEventListener("submit", async function (e) {
  e.preventDefault();
  const fileInput = document.getElementById("csvFile");
  const file = fileInput.files[0];

  if (!file) {
    alert("Please select a CSV file.");
    return;
  }

  const formData = new FormData();
  formData.append("file", file);

  try {
    const response = await fetch("http://127.0.0.1:5000/predict", {
      method: "POST",
      body: formData // DO NOT set Content-Type manually
    });

    if (!response.ok) {
      throw new Error(`Server error: ${response.statusText}`);
    }

    const result = await response.json();
    console.log("CSV Prediction Result:", result);

    // Update the table with each row
    result.forEach((entry) => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${new Date().toLocaleTimeString()}</td>
        <td>${entry.HeartRate}</td>
        <td>${entry.SkinConductance}</td>
        <td>${entry.EEG}</td>
        <td>${entry.PredictedEngagementLevel}</td>
      `;
      tableBody.appendChild(row);
    });
  } catch (error) {
    console.error("Prediction failed:", error);
    alert("Prediction failed: " + error.message);
  }
});

function appendToTable(data) {
  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${new Date().toLocaleTimeString()}</td>
    <td>${data.HeartRate ?? '-'}</td>
    <td>${data.SkinConductance ?? '-'}</td>
    <td>${data.EEG ?? '-'}</td>
    <td>${data.PredictedEngagementLevel ?? '-'}</td>
  `;
  tableBody.appendChild(row);
}
