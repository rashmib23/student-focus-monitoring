from flask import Blueprint, request, jsonify
import pandas as pd
import joblib
import numpy as np
import random
from db import predictions_collection
from utils import verify_token
from bson.objectid import ObjectId


prediction_bp = Blueprint('prediction', __name__)

# Load model, scaler, and SHAP weights
model = joblib.load('backend/model.pkl')
scaler = joblib.load('backend/scaler.pkl')
shap_importance = joblib.load('backend/feature_importance_shap.pkl')
column_means = joblib.load('backend/column_means.pkl')

expected_columns = ['HeartRate', 'SkinConductance', 'EEG']

feedback_templates = {
    0: [
        "Your focus seems low. Consider improving {cause1} and monitoring your {cause2}.",
        "Low engagement was detected. Try managing your {cause1} and {cause2}.",
        "You can increase focus by enhancing your {cause1} and stabilizing {cause2}."
    ],
    1: [
        "Moderate focus detected. Improving your {cause1} may boost engagement.",
        "You're doing okay. For better focus, monitor {cause1} and {cause2}.",
        "To reach high engagement, fine-tune your {cause1} and control {cause2}."
    ],
    2: [
        "Excellent engagement! Keep maintaining your {cause1} and {cause2}.",
        "Great job! Your {cause1} levels indicate strong focus.",
        "You're highly engaged. Keep it up by balancing your {cause2}."
    ]
}

def grade_severity(value, mean):
    deviation = abs(value - mean)
    if deviation < 0.5:
        return 'normal'
    elif deviation < 1.5:
        return 'mild'
    else:
        return 'severe'

def generate_feedback(level, features):
    shap_weights = shap_importance.get(int(level), {})
    top_features = sorted(shap_weights.items(), key=lambda x: -x[1])[:2]
    cause1, cause2 = [f[0] for f in top_features]
    template = random.choice(feedback_templates[int(level)])
    feedback = template.format(cause1=cause1, cause2=cause2)

    severities = {
        feat: grade_severity(features[feat], column_means[feat]) for feat in expected_columns
    }

    return feedback, top_features, severities

def predict_df(df):
    df.fillna(0, inplace=True)
    df_scaled = scaler.transform(df)
    return model.predict(df_scaled)

# ---------------------- /manual route ----------------------
@prediction_bp.route('/manual', methods=['POST'])
def manual_predict():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    username = verify_token(token)
    if not username:
        return jsonify({"error": "Unauthorized"}), 401

    input_data = request.json

    # Check for student_id
    student_id = input_data.get("student_id")
    if not student_id:
        return jsonify({"error": "Missing student_id"}), 400

    for col in expected_columns:
        if col not in input_data:
            return jsonify({"error": f"Missing column: {col}"}), 400

    data_for_model = {col: input_data[col] for col in expected_columns}
    df = pd.DataFrame([data_for_model], columns=expected_columns)
    pred = int(predict_df(df)[0])

    feedback, top_feats, severities = generate_feedback(pred, data_for_model)

    doc = {
        "username": username,
        "student_id": student_id,
        "input_data": data_for_model,
        "predicted_engagement_level": pred,
        "feedback": feedback,
        "top_features": [f[0] for f in top_feats],
        "severities": severities,
        "timestamp": pd.Timestamp.now()
    }
    predictions_collection.insert_one(doc)

    return jsonify({
        "StudentID": student_id,
        "EngagementLevel": pred,
        "Feedback": feedback,
        "TopFeatures": [f[0] for f in top_feats],
        "Severities": severities
    })

# ---------------------- /csv route ----------------------
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

    # Expect 'student_id' as a column
    required_columns = expected_columns + ['student_id']
    if not all(col in df.columns for col in required_columns):
        return jsonify({"error": f"CSV must contain columns: {required_columns}"}), 400

    df_model = df[expected_columns]
    preds = predict_df(df_model)
    df['PredictedEngagementLevel'] = preds.astype(int)

    records = []
    for idx, row in df.iterrows():
        student_id = row['student_id']
        input_row = row[expected_columns].to_dict()
        level = int(row['PredictedEngagementLevel'])

        feedback, top_feats, severities = generate_feedback(level, input_row)

        doc = {
            "username": username,
            "student_id": student_id,
            "input_data": input_row,
            "predicted_engagement_level": level,
            "feedback": feedback,
            "top_features": [f[0] for f in top_feats],
            "severities": severities,
            "timestamp": pd.Timestamp.now()
        }
        predictions_collection.insert_one(doc)

        result = {
            "StudentID": student_id,
            **input_row,
            "PredictedEngagementLevel": level,
            "Feedback": feedback,
            "TopFeatures": [f[0] for f in top_feats],
            "Severities": severities
        }
        records.append(result)

    return jsonify(records)

# ---------------------- /history route ----------------------
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

@prediction_bp.route('/history/<string:history_id>', methods=['DELETE'])
def delete_history_item(history_id):
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    username = verify_token(token)
    if not username:
        return jsonify({"error": "Unauthorized"}), 401

    # Try to delete the history item if it belongs to the user
    result = predictions_collection.delete_one({
        "_id": ObjectId(history_id),
        "username": username
    })

    if result.deleted_count == 1:
        return jsonify({"message": "History item deleted successfully"})
    else:
        return jsonify({"error": "History item not found or not authorized"}), 404