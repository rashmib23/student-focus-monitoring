# model_training/train_model.py
import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, MinMaxScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import classification_report
import joblib
import os

# Load data
df = pd.read_csv('data/data.csv')

# Drop rows with missing values (or use df.fillna())
df = df.replace(0, np.nan)
df.fillna(df.mean(numeric_only=True), inplace=True)

# Define numeric columns for which zero/missing values are replaced with mean
numeric_cols = ['HeartRate', 'SkinConductance', 'EEG', 'Temperature', 'PupilDiameter',
                'SmileIntensity', 'FrownIntensity', 'CortisolLevel', 'ActivityLevel',
                'AmbientNoiseLevel', 'LightingLevel']

# Calculate mean values for these columns (used to replace zeros in inference)
column_means = df[numeric_cols].mean().to_dict()

# Save these means for use in Flask API zero-replacement step
joblib.dump(column_means, 'backend/column_means.pkl')

# Encode categorical columns
label_encoders = {}
for col in ['EmotionalState', 'CognitiveState']:
    le = LabelEncoder()
    df[col] = le.fit_transform(df[col])
    label_encoders[col] = le

# Features and target
X = df.drop('EngagementLevel', axis=1)
y = df['EngagementLevel']

# Normalize numerical features
scaler = MinMaxScaler()
X_scaled = pd.DataFrame(scaler.fit_transform(X), columns=X.columns)

# Split and train
X_train, X_test, y_train, y_test = train_test_split(X_scaled, y, test_size=0.2, random_state=42)
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)


# Save model and scaler
os.makedirs("backend", exist_ok=True)
joblib.dump(model, 'backend/model.pkl')
joblib.dump(scaler, 'backend/scaler.pkl')
joblib.dump(label_encoders, 'backend/label_encoders.pkl')

# Evaluate
y_pred = model.predict(X_test)
print("Classification Report:\n", classification_report(y_test, y_pred))
