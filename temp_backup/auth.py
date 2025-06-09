from flask import Blueprint, request, jsonify
from werkzeug.security import generate_password_hash, check_password_hash
import jwt
import datetime
from flask_cors import cross_origin
import secrets

users = {
    # Example user structure
    # 'username': {
    #    'password_hash': "...",
    #    'role': 'student' or 'admin',
    #    'reset_token': None
    # }
}

auth = Blueprint('auth', __name__)

# users = {}  # Temporary in-memory storage, replace with MongoDB or file-based DB

SECRET_KEY = "supersecret"

@auth.route('/register', methods=['POST'])
@cross_origin()
def register():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    role = data.get('role', 'student')  # default role is student

    if username in users:
        return jsonify({"error": "User already exists"}), 400

    users[username] = {
        'password_hash': generate_password_hash(password),
        'role': role,
        'reset_token': None
    }
    return jsonify({"message": "User registered successfully"}), 201


@auth.route('/login', methods=['POST'])
@cross_origin()
def login():
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')

    user = users.get(username)
    if not user or not check_password_hash(user['password_hash'], password):
        return jsonify({"error": "Invalid credentials"}), 401

    token = jwt.encode({
        'username': username,
        'role': user['role'],
        'exp': datetime.datetime.utcnow() + datetime.timedelta(hours=2)
    }, SECRET_KEY, algorithm="HS256")

    return jsonify({"token": token, "role": user['role']})


@auth.route('/request-password-reset', methods=['POST'])
@cross_origin()
def request_password_reset():
    data = request.get_json()
    username = data.get('username')

    user = users.get(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Generate a token (in real app, send via email)
    reset_token = secrets.token_urlsafe(16)
    user['reset_token'] = reset_token

    # For demo, return token directly
    return jsonify({"message": "Reset token generated", "reset_token": reset_token})


@auth.route('/reset-password', methods=['POST'])
@cross_origin()
def reset_password():
    data = request.get_json()
    username = data.get('username')
    reset_token = data.get('reset_token')
    new_password = data.get('new_password')

    user = users.get(username)
    if not user or user['reset_token'] != reset_token:
        return jsonify({"error": "Invalid token or username"}), 400

    user['password_hash'] = generate_password_hash(new_password)
    user['reset_token'] = None  # clear token after use
    return jsonify({"message": "Password reset successful"})
