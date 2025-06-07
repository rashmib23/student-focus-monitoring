from flask import Blueprint, request, jsonify
from models.user import create_user, get_user, check_password
from utils import generate_token, verify_token

auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.json
    username = data.get('username')
    password = data.get('password')
    email = data.get('email')

    if not all([username, password, email]):
        return jsonify({"error": "Missing fields"}), 400

    success, message = create_user(username, password, email)
    if not success:
        return jsonify({"error": message}), 400

    return jsonify({"message": "User registered successfully"}), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.json
    username = data.get('username')
    password = data.get('password')

    user = get_user(username)
    if not user:
        return jsonify({"error": "Invalid username or password"}), 401

    if not check_password(password, user['password']):
        return jsonify({"error": "Invalid username or password"}), 401

    token = generate_token(username)
    return jsonify({"token": token})


@auth_bp.route('/profile', methods=['GET'])
def profile():
    token = request.headers.get('Authorization', '').replace('Bearer ', '')
    username = verify_token(token)
    if not username:
        return jsonify({"error": "Unauthorized"}), 401
    
    user = get_user(username)
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Remove sensitive info like password before sending
    user_info = {
        "username": user["username"],
        "email": user["email"],
        # add other public fields if any
    }
    return jsonify(user_info)