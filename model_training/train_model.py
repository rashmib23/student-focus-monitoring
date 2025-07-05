import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
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

# Split dataset (stratified)
train_df, test_df = train_test_split(
    data2,
    test_size=0.2,
    stratify=data2['EngagementLevel'],
    random_state=42
)

# Save test set for later evaluation
os.makedirs('data', exist_ok=True)
test_df.to_csv('data/test.csv', index=False)

# Features and target for training
X_train = train_df[['HeartRate', 'SkinConductance', 'EEG']]
y_train = train_df['EngagementLevel']

# Scale training data
scaler = StandardScaler()
X_train_scaled = scaler.fit_transform(X_train)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_train_scaled, y_train)

# SHAP explanation (CPU mode)
explainer = shap.Explainer(model, X_train_scaled)
shap_values = explainer(X_train_scaled)

# Compute SHAP summary
shap_summary = {}
for i in range(3):  # 0=Low, 1=Moderate, 2=High
    class_shap = np.abs(shap_values.values[y_train == i])
    means = class_shap.mean(axis=0)
    shap_summary[int(i)] = {
        name: float(val[0] if isinstance(val, (np.ndarray, list)) else val)
        for name, val in zip(['HeartRate', 'SkinConductance', 'EEG'], means)
    }

# Save everything to backend/
os.makedirs('backend', exist_ok=True)
joblib.dump(model, 'backend/model.pkl')
joblib.dump(scaler, 'backend/scaler.pkl')
joblib.dump(column_means.to_dict(), 'backend/column_means.pkl')
joblib.dump(shap_summary, 'backend/feature_importance_shap.pkl')

print("✅ Training done with stratified split.")
print("📁 Saved: model, scaler, SHAP summary to backend/")
print("📁 Test data saved to: data/test.csv")
