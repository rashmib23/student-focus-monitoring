import bcrypt
from db import users_collection

def hash_password(password: str) -> bytes:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt())

def check_password(password: str, hashed: bytes) -> bool:
    return bcrypt.checkpw(password.encode('utf-8'), hashed)

def create_user(username: str, password: str, email: str):
    if users_collection.find_one({"username": username}):
        return False, "Username already exists"
    hashed = hash_password(password)
    user_doc = {"username": username, "password": hashed, "email": email}
    users_collection.insert_one(user_doc)
    return True, "User created"

def get_user(username: str):
    user = users_collection.find_one({"username": username})
    return user
