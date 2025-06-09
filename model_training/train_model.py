import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os
import shap

# Load dataset
data2 = pd.read_csv('data/data2.csv')

# Rename columns to unify naming conventions
data2 = data2.rename(columns={
    'HRV': 'HeartRate',
    'GSR': 'SkinConductance',
    'EEG_Alpha_Waves': 'EEG',
    'Engagement_Level': 'EngagementLevel'
})

# Select relevant columns
data2 = data2[['HeartRate', 'SkinConductance', 'EEG', 'EngagementLevel']]

# Replace zeros with NaN to mark as missing
data2[['HeartRate', 'SkinConductance', 'EEG']] = data2[['HeartRate', 'SkinConductance', 'EEG']].replace(0, np.nan)

# Impute missing values with column means
column_means = data2[['HeartRate', 'SkinConductance', 'EEG']].mean()
data2.fillna(column_means, inplace=True)

# Features and target
X = data2[['HeartRate', 'SkinConductance', 'EEG']]
y = data2['EngagementLevel']

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train Random Forest classifier
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_scaled, y)

# SHAP explanation (CPU mode, no torch backend)
explainer = shap.Explainer(model, X_scaled)
shap_values = explainer(X_scaled)

# Compute mean absolute SHAP values for each class
shap_summary = {}
engagement_labels = ['Low', 'Moderate', 'High']
for i in range(3):  # Classes: 0=Low, 1=Moderate, 2=High
    class_shap = np.abs(shap_values.values[y == i])
    means = class_shap.mean(axis=0)  # Shape: (3,)

    shap_summary[int(i)] = {
        name: float(val[0] if isinstance(val, (np.ndarray, list)) else val)
        for name, val in zip(['HeartRate', 'SkinConductance', 'EEG'], means)
    }



# Save everything to backend folder
os.makedirs('backend', exist_ok=True)
joblib.dump(model, 'backend/model.pkl')
joblib.dump(scaler, 'backend/scaler.pkl')
joblib.dump(column_means.to_dict(), 'backend/column_means.pkl')
joblib.dump(shap_summary, 'backend/feature_importance_shap.pkl')

os.makedirs('backend-1', exist_ok=True)
joblib.dump(model, 'backend-1/model.pkl')
joblib.dump(scaler, 'backend-1/scaler.pkl')
joblib.dump(column_means.to_dict(), 'backend-1/column_means.pkl')
joblib.dump(shap_summary, 'backend-1/feature_importance_shap.pkl')

print("✅ Model training complete with SHAP-based feedback support saved to 'backend/'")
