from flask import Blueprint, request, jsonify
import pandas as pd
import joblib
import numpy as np
from db import predictions_collection
from utils import verify_token

prediction_bp = Blueprint('prediction', __name__)

# Load model & scaler only once
model = joblib.load('backend/model.pkl')
scaler = joblib.load('backend/scaler.pkl')

expected_columns = ['HeartRate', 'SkinConductance', 'EEG']

def predict_df(df):
    df.fillna(0, inplace=True)
    df_scaled = scaler.transform(df)
    preds = model.predict(df_scaled)
    return preds

@prediction_bp.route('/manual', methods=['POST'])
def manual_predict():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    username = verify_token(token)
    if not username:
        return jsonify({"error": "Unauthorized"}), 401

    input_data = request.json
    for col in expected_columns:
        if col not in input_data:
            return jsonify({"error": f"Missing column: {col}"}), 400

    df = pd.DataFrame([input_data], columns=expected_columns)
    preds = predict_df(df)
    predicted_level = int(preds[0])

    # Save to DB
    doc = {
        "username": username,
        "input_data": input_data,
        "predicted_engagement_level": predicted_level,
        "timestamp": pd.Timestamp.now()
    }
    predictions_collection.insert_one(doc)

    return jsonify({"EngagementLevel": predicted_level})

@prediction_bp.route('/csv', methods=['POST'])
def csv_predict():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    username = verify_token(token)
    if not username:
        return jsonify({"error": "Unauthorized"}), 401

    if 'file' not in request.files:
        return jsonify({"error": "CSV file is missing"}), 400

    file = request.files['file']
    df = pd.read_csv(file)

    if not all(col in df.columns for col in expected_columns):
        return jsonify({"error": f"CSV must contain columns: {expected_columns}"}), 400

    df = df[expected_columns]
    preds = predict_df(df)
    df['PredictedEngagementLevel'] = preds.astype(int)

    # Save each prediction in DB
    records = df.to_dict(orient='records')
    for row in records:
        doc = {
            "username": username,
            "input_data": {k: row[k] for k in expected_columns},
            "predicted_engagement_level": row['PredictedEngagementLevel'],
            "timestamp": pd.Timestamp.now()
        }
        predictions_collection.insert_one(doc)

    return jsonify(records)

@prediction_bp.route('/history', methods=['GET'])
def prediction_history():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    username = verify_token(token)
    if not username:
        return jsonify({"error": "Unauthorized"}), 401

    user_preds = list(predictions_collection.find({"username": username}).sort("timestamp", -1).limit(50))
    for pred in user_preds:
        pred['_id'] = str(pred['_id'])
        pred['timestamp'] = pred['timestamp'].isoformat()

    return jsonify(user_preds)
