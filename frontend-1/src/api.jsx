import axios from "axios";

const API_BASE = "http://localhost:5000/api";

const axiosInstance = axios.create({
  baseURL: API_BASE,
});

// Add JWT token to request headers if present
axiosInstance.interceptors.request.use(config => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API calls
export const registerUser = (data) => axiosInstance.post("/auth/register", data);
export const loginUser = (data) => axiosInstance.post("/auth/login", data);
export const fetchUserProfile = () => axiosInstance.get("/auth/profile");

// Prediction API calls
export const manualPredict = (data) => axiosInstance.post("/predict/manual", data);

export const csvPredict = (file) => {
  const formData = new FormData();
  formData.append("file", file);
  return axiosInstance.post("/predict/csv", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
};

export const fetchHistory = () => axiosInstance.get("/predict/history");
export const deleteHistoryItem = (id) => axiosInstance.delete(`/predict/history/${id}`);
export const fetchHistoryByStudentId = (studentId) =>
  axiosInstance.get(`/predict/history/student/${studentId}`);
