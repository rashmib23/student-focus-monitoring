import pandas as pd 
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
import joblib
import os

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

# Impute missing (NaN) values with column means
data2.fillna(data2.mean(), inplace=True)

# Features and target
X = data2[['HeartRate', 'SkinConductance', 'EEG']]
y = data2['EngagementLevel']

# Scale features
scaler = StandardScaler()
X_scaled = scaler.fit_transform(X)

# Train Random Forest classifier
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X_scaled, y)

# Save artifacts folder if not exists
os.makedirs('backend', exist_ok=True)

# Save model, scaler, and column means (for inference)
joblib.dump(model, 'backend/model.pkl')
joblib.dump(scaler, 'backend/scaler.pkl')
joblib.dump(X.mean(), 'backend/column_means.pkl')

print("✅ Model training completed with zero handling and saved to 'backend/'")
