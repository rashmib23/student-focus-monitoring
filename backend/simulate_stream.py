# backend/simulate_stream.py
import pandas as pd
import time
import requests
import json
import numpy as np

# Load dataset
df = pd.read_csv('data/data.csv')

# URL of the Flask API
API_URL = 'http://127.0.0.1:5000/predict'

# Expected columns according to your app.py
expected_columns = [
    'HeartRate', 'SkinConductance', 'EEG', 'Temperature', 'PupilDiameter',
    'SmileIntensity', 'FrownIntensity', 'CortisolLevel', 'ActivityLevel',
    'AmbientNoiseLevel', 'LightingLevel', 'EmotionalState', 'CognitiveState'
]

# From your dataset example, these are valid categorical values:
valid_emotional_states = ['engaged', 'partially engaged', 'disengaged']
valid_cognitive_states = ['distracted', 'focused']

# Default values for missing numeric columns (use means or sensible defaults)
# Here, using 0 for simplicity; you can replace with actual column means if known
default_numeric = {
    'HeartRate': 60,
    'SkinConductance': 5,
    'EEG': 10,
    'Temperature': 36.5,
    'PupilDiameter': 3,
    'SmileIntensity': 0.5,
    'FrownIntensity': 0.5,
    'CortisolLevel': 0.5,
    'ActivityLevel': 50,
    'AmbientNoiseLevel': 400,
    'LightingLevel': 400
}

# Default categorical values
default_emotional = 'engaged'
default_cognitive = 'focused'

for index, row in df.iterrows():
    payload = {}

    # Prepare all expected columns
    for col in expected_columns:
        if col in df.columns:
            val = row[col]

            # For numeric columns: replace missing or NaN with default values
            if col in default_numeric:
                if pd.isna(val) or val == 0:
                    val = default_numeric[col]

            # For categorical columns: validate or set default
            if col == 'EmotionalState':
                if val not in valid_emotional_states:
                    val = default_emotional
            elif col == 'CognitiveState':
                if val not in valid_cognitive_states:
                    val = default_cognitive

            payload[col] = val
        else:
            # If missing column (rare), assign default
            if col in default_numeric:
                payload[col] = default_numeric[col]
            elif col == 'EmotionalState':
                payload[col] = default_emotional
            elif col == 'CognitiveState':
                payload[col] = default_cognitive

    # POST to Flask API
    response = requests.post(API_URL, json=payload)

    if response.status_code == 200:
        prediction = response.json()
        print(f"[Row {index}] Sent: {json.dumps(payload)}")
        print(f" → Prediction: {prediction['EngagementLevel']}\n")
    else:
        print(f"[Row {index}] Error: {response.status_code} - {response.text}")

    time.sleep(2)  # delay to simulate streaming
