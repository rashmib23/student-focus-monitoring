import pandas as pd
import numpy as np
import joblib
import time
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.metrics import accuracy_score, classification_report, confusion_matrix

# Load test dataset
test_path = 'data/test.csv'
df = pd.read_csv(test_path)

# Rename columns if needed
df = df.rename(columns={
    'HRV': 'HeartRate',
    'GSR': 'SkinConductance',
    'EEG_Alpha_Waves': 'EEG',
    'Engagement_Level': 'EngagementLevel'
})

# Ensure required columns
required_cols = ['HeartRate', 'SkinConductance', 'EEG', 'EngagementLevel']
for col in required_cols:
    if col not in df.columns:
        raise ValueError(f"Missing column: {col}")

# Replace 0s with NaNs and impute with mean
features = ['HeartRate', 'SkinConductance', 'EEG']
X = df[features].replace(0, np.nan)
X.fillna(X.mean(), inplace=True)
y_true = df['EngagementLevel']

# Load model and scaler
model = joblib.load('backend/model.pkl')
scaler = joblib.load('backend/scaler.pkl')

# Scale data
X_scaled = scaler.transform(X)

# Time the predictions
start = time.time()
y_pred = model.predict(X_scaled)
end = time.time()

# Compute metrics
accuracy = accuracy_score(y_true, y_pred)
report = classification_report(y_true, y_pred, digits=4, output_dict=True)
conf_matrix = confusion_matrix(y_true, y_pred)

avg_response_time = (end - start) / len(X)
throughput = len(X) / (end - start)

# Display metrics
print("\n🔎 Model Evaluation Metrics:\n")
print(f"✅ Accuracy: {accuracy:.4f}")
print(f"⏱️  Average Response Time per Sample: {avg_response_time:.6f} seconds")
print(f"⚡ Throughput: {throughput:.2f} predictions/second")

print("\n📊 Classification Report:")
print(classification_report(y_true, y_pred, digits=4))

print("📉 Confusion Matrix:\n", conf_matrix)

# ---- 🔍 Visualizations ----

# 1. Confusion Matrix Heatmap
plt.figure(figsize=(6, 4))
sns.heatmap(conf_matrix, annot=True, fmt='d', cmap='Blues', xticklabels=["Low", "Moderate", "High"], yticklabels=["Low", "Moderate", "High"])
plt.title("Confusion Matrix")
plt.xlabel("Predicted Label")
plt.ylabel("True Label")
plt.tight_layout()
plt.show()

# 2. Classification Report Bar Plot (Precision, Recall, F1-Score)
report_df = pd.DataFrame(report).transpose()
report_df = report_df.drop(['accuracy', 'macro avg', 'weighted avg'])

report_df[['precision', 'recall', 'f1-score']].plot(kind='bar', figsize=(8, 5))
plt.title("Classification Metrics by Class")
plt.ylabel("Score")
plt.ylim(0, 1.1)
plt.grid(axis='y')
plt.xticks(rotation=0)
plt.tight_layout()
plt.show()
