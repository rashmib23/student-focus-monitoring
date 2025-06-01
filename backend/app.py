from flask import Flask, request, jsonify, Response
import joblib
import pandas as pd
import numpy as np
import json
from queue import Queue
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load model and scaler
model = joblib.load('backend/model.pkl')
scaler = joblib.load('backend/scaler.pkl')

# Queue for streaming predictions
prediction_queue = Queue()

# Features expected by the model (order matters!)
expected_columns = ['HeartRate', 'SkinConductance', 'EEG']

@app.route('/predict', methods=['POST'])
def predict():
    try:
        input_data = request.json
        print(f"Received input JSON: {input_data}")

        # Validate that all expected columns are present
        for col in expected_columns:
            if col not in input_data:
                error_msg = f"Missing column in input data: {col}"
                print(error_msg)
                return jsonify({"error": error_msg}), 400

        # Create DataFrame with correct column order
        df = pd.DataFrame([{col: input_data[col] for col in expected_columns}])
        print(f"Input DataFrame before filling missing values:\n{df}")

        # Replace None or NaN values with 0 (or you can use column means if saved)
        for col in expected_columns:
            if df.at[0, col] is None or pd.isna(df.at[0, col]):
                print(f"Value for {col} is missing; replacing with 0")
                df.at[0, col] = 0

        print(f"DataFrame after filling missing values:\n{df}")

        # Scale the input features using the loaded scaler
        df_scaled = scaler.transform(df)
        print(f"Scaled features:\n{df_scaled}")

        # Predict engagement level
        prediction = model.predict(df_scaled)[0]
        print(f"Model raw prediction: {prediction}")

        # Convert prediction to int for JSON serialization if needed
        predicted_level = int(prediction)

        # Add prediction to input data (optional for streaming)
        input_data['PredictedEngagementLevel'] = predicted_level

        # Add to streaming queue
        prediction_queue.put(input_data)

        return jsonify({"EngagementLevel": predicted_level})

    except Exception as e:
        print(f"Error during prediction: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/stream')
def stream():
    def event_stream():
        while True:
            data = prediction_queue.get()
            yield f'data: {json.dumps(data)}\n\n'

    return Response(event_stream(), mimetype='text/event-stream')

if __name__ == '__main__':
    app.run(debug=True)
