from pymongo import MongoClient
import os

MONGO_URI = os.getenv("MONGO_URI")  # Set this in your environment variables

client = MongoClient(MONGO_URI)
db = client['focus_monitor_db']

users_collection = db['users']
predictions_collection = db['predictions']
