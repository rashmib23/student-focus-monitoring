from flask import Flask, request, jsonify, Response
import joblib
import pandas as pd
import numpy as np
import json
from queue import Queue
from flask_cors import CORS
from flask import make_response

app = Flask(__name__)
CORS(app)
# Load model and preprocessing tools
model = joblib.load('backend/model.pkl')
scaler = joblib.load('backend/scaler.pkl')
encoders = joblib.load('backend/label_encoders.pkl')
column_means = joblib.load('backend/column_means.pkl')

# Queue for real-time streaming
prediction_queue = Queue()

# Define expected input format
expected_columns = [
    'HeartRate', 'SkinConductance', 'EEG', 'Temperature', 'PupilDiameter',
    'SmileIntensity', 'FrownIntensity', 'CortisolLevel', 'ActivityLevel',
    'AmbientNoiseLevel', 'LightingLevel', 'EmotionalState', 'CognitiveState'
]

numeric_cols = [
    'HeartRate', 'SkinConductance', 'EEG', 'Temperature', 'PupilDiameter',
    'SmileIntensity', 'FrownIntensity', 'CortisolLevel', 'ActivityLevel',
    'AmbientNoiseLevel', 'LightingLevel'
]

@app.route('/predict', methods=['POST'])
def predict():
    try:
        input_data = request.json
        df = pd.DataFrame([input_data])

        # Check all expected columns are present
        for col in expected_columns:
            if col not in df.columns:
                return jsonify({"error": f"Missing column: {col}"}), 400

        # Replace missing or zero values with column means
        for col in numeric_cols:
            val = df[col].iloc[0]
            if val == 0 or val is None or (isinstance(val, float) and np.isnan(val)):
                df[col] = column_means[col]

        # Encode categorical values
        for col in ['EmotionalState', 'CognitiveState']:
            if df[col].iloc[0] not in encoders[col].classes_:
                return jsonify({"error": f"Invalid category '{df[col].iloc[0]}' for {col}"}), 400
            df[col] = encoders[col].transform(df[col])

        # Reorder columns and scale numeric values
        df = df[expected_columns]
        df_scaled = pd.DataFrame(scaler.transform(df), columns=expected_columns)

        # Predict
        prediction = int(model.predict(df_scaled)[0])
        input_data['EngagementLevel'] = prediction

        # Stream this result
        prediction_queue.put(input_data)

        return jsonify({"EngagementLevel": prediction})

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/stream')
def stream():
    def event_stream():
        while True:
            data = prediction_queue.get()
            yield f'data: {json.dumps(data)}\n\n'

    response = Response(event_stream(), mimetype='text/event-stream')
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == '__main__':
    app.run(debug=True)
