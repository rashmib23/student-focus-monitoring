import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os

# Load data2 only
data2 = pd.read_csv('data/data2.csv')

# Rename columns to unified naming
data2 = data2.rename(columns={
    'HRV': 'HeartRate',
    'GSR': 'SkinConductance',
    'EEG_Alpha_Waves': 'EEG',
    'Engagement_Level': 'EngagementLevel'
})

# Select only the features and target columns needed
data2 = data2[['HeartRate', 'SkinConductance', 'EEG', 'EngagementLevel']]

# Drop rows with missing or NaN values
data2.dropna(inplace=True)

# Features and target
X = data2[['HeartRate', 'SkinConductance', 'EEG']]
y = data2['EngagementLevel']

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train Random Forest classifier
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_scaled, y)

# Ensure backend directory exists
os.makedirs('backend', exist_ok=True)

# Save model and scaler
joblib.dump(model, 'backend/model.pkl')
joblib.dump(scaler, 'backend/scaler.pkl')

# Save column means for inference missing data imputation if needed
column_means = X.mean().to_dict()
joblib.dump(column_means, 'backend/column_means.pkl')

print("✅ Model training completed and saved to 'backend/'")
