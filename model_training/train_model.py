# train_model.py

import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os

# Load datasets
data1 = pd.read_csv('data/data1.csv')
data2 = pd.read_csv('data/data2.csv')

# Normalize engagement levels in data1
# Original: 1=High, 2=Medium, 3=Low
# Map to: 0=Low, 1=Medium, 2=High
data1['EngagementLevel'] = 3 - data1['EngagementLevel']

# Rename columns in data2 to unify naming conventions
data2 = data2.rename(columns={
    'HRV': 'HeartRate',
    'GSR': 'SkinConductance',
    'EEG_Alpha_Waves': 'EEG',
    'Engagement_Level': 'EngagementLevel'
})

# Select only the necessary columns and ensure consistent order
data1 = data1[['HeartRate', 'SkinConductance', 'EEG', 'EngagementLevel']]
data2 = data2[['HeartRate', 'SkinConductance', 'EEG', 'EngagementLevel']]

# Combine datasets
combined = pd.concat([data1, data2], ignore_index=True)

# Drop rows with missing or NaN values
combined.dropna(inplace=True)

# Features and target
X = combined[['HeartRate', 'SkinConductance', 'EEG']]
y = combined['EngagementLevel']

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train Random Forest classifier
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_scaled, y)

# Create backend directory if not exists
os.makedirs('backend', exist_ok=True)

# Save model and scaler
joblib.dump(model, 'backend/model.pkl')
joblib.dump(scaler, 'backend/scaler.pkl')

# Save column means for missing data imputation at inference time
column_means = X.mean().to_dict()
joblib.dump(column_means, 'backend/column_means.pkl')

print("✅ Model training completed and saved to 'backend/'")
