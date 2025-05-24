const eventSource = new EventSource("http://127.0.0.1:5000/stream");
const tableBody = document.querySelector("#dataTable tbody");

eventSource.onmessage = function (event) {
  const data = JSON.parse(event.data);

  const row = document.createElement("tr");
  row.innerHTML = `
    <td>${new Date().toLocaleTimeString()}</td>
    <td>${data.HeartRate}</td>
    <td>${data.SkinConductance}</td>
    <td>${data.EEG}</td>
    <td>${data.Temperature}</td>
    <td>${data.PupilDiameter}</td>
    <td>${data.SmileIntensity}</td>
    <td>${data.FrownIntensity}</td>
    <td>${data.EngagementLevel}</td>
  `;
  tableBody.appendChild(row);
};
