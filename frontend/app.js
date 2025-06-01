const eventSource = new EventSource("http://127.0.0.1:5000/stream");
const tableBody = document.querySelector("#dataTable tbody");

eventSource.onmessage = function (event) {
  const data = JSON.parse(event.data);

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${new Date().toLocaleTimeString()}</td>
    <td>${data.HeartRate !== undefined ? data.HeartRate : '-'}</td>
    <td>${data.SkinConductance !== undefined ? data.SkinConductance : '-'}</td>
    <td>${data.EEG !== undefined ? data.EEG : '-'}</td>
    <td>${data.PredictedEngagementLevel !== undefined ? data.PredictedEngagementLevel : '-'}</td>
  `;
  tableBody.appendChild(row);
};
