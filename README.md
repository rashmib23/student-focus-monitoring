# student-focus-monitoring


# 🧠 Student Focus Monitoring System

The **Student Focus Monitoring System** is a real-time physiological data analysis tool built to monitor and evaluate students' cognitive focus during study sessions. It uses machine learning on EEG, heart rate, and skin conductance data to provide accurate concentration level predictions and actionable feedback.

## 📌 Introduction

This project addresses the need for non-invasive, real-time monitoring of student focus to promote better academic outcomes. By analyzing biological signals, the system estimates attention levels and provides feedback based on signal influence, helping students adjust their behavior or environment.

## 🎯 Purpose

To assist students in improving their focus by:
- Monitoring real-time physiological signals.
- Detecting attention drops using trained models.
- Generating suggestions to improve cognitive engagement.

## ✅ Features (Implemented)

- Predicts focus level (High / Medium / Low) based on real sensor inputs (EEG, HR, Skin Conductance) signal values.
- Accepts CSV upload with automatic preprocessing.
- Visualizes time-stamped sensor data trends in the frontend.
- Generates feedback explaining which signals most influenced the focus result using SHAP.
- Stores all predictions with timestamps and student IDs in MongoDB.
- Displays focus prediction history and feedback in a clean dashboard.

## 🛠️ Technologies Used

- **Frontend:** React.js, Chart.js
- **Backend:** Flask, Python
- **Machine Learning:** scikit-learn, SHAP, joblib, NumPy, Pandas
- **Database:** MongoDB
- **Utilities:** CSV parsing, timestamp alignment, SHAP-based feedback engine

## 📊 Results

- **Data Handling:** Automatically fills missing sensor values using column-wise mean (instead of dropping rows).
- **Feedback Examples:**
  - "Low engagement was detected. Try managing your heart rate and eeg"
  - "Great job! Your heart rate levels indicate strong focus."
- **System Usage:** Successfully tested on multiple students using a pre-cleaned dataset; dashboard showed consistent and interpretable outputs.

## 🙌 Acknowledgments

- Kaggle for providing the Biosensing Health Education Dataset.
- Medical electronics department for Dataset to test the model.
- Open-source libraries: Flask, Scikit-learn, SHAP, React, and MongoDB.

---
## 🚀 How to Run the Project

### 1. Clone the Repository

```bash
git clone https://github.com/rashmib23/student-focus-monitoring.git
cd student-focus-monitoring


