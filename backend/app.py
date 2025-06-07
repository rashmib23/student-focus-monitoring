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
        if request.content_type.startswith('application/json'):
            # Handle JSON input
            input_data = request.json
            print(f"Received JSON: {input_data}")

            # Validate columns
            for col in expected_columns:
                if col not in input_data:
                    return jsonify({"error": f"Missing column: {col}"}), 400

            df = pd.DataFrame([{col: input_data[col] for col in expected_columns}])

        elif request.content_type.startswith('multipart/form-data'):
            # Handle CSV upload
            if 'file' not in request.files:
                return jsonify({"error": "CSV file not found"}), 400

            file = request.files['file']
            print("Received CSV file:", file.filename)

            df = pd.read_csv(file)

            print("CSV Columns:", df.columns.tolist())

            # Ensure all expected columns are present
            if not all(col in df.columns for col in expected_columns):
                return jsonify({"error": f"CSV must contain columns: {expected_columns}"}), 400

            df = df[expected_columns]  # Reorder just in case

        else:
            return jsonify({"error": "Unsupported Content-Type"}), 400

        # Fill missing values
        df.fillna(0, inplace=True)

        # Scale and predict
        df_scaled = scaler.transform(df)
        predictions = model.predict(df_scaled)

        # Handle single vs batch prediction
        if len(predictions) > 1:
            results = df.copy()
            results['PredictedEngagementLevel'] = predictions.astype(int)
            return jsonify(results.to_dict(orient='records'))
        else:
            predicted_level = int(predictions[0])
            return jsonify({"EngagementLevel": predicted_level})

    except Exception as e:
        print(f"Prediction Error: {e}")
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
