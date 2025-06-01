import time
import requests
import json

# Replace with your Flask API URL
API_URL = 'http://127.0.0.1:5000/predict'

# Your test data for streaming
test_data = [
    {"HeartRate": 41.7437, "SkinConductance": 0.6927, "EEG": 7.9166},
    {"HeartRate": 62.3744, "SkinConductance": 0.2663, "EEG": 11.9498},
    {"HeartRate": 62.4045, "SkinConductance": 0.7079, "EEG": 13.6012},
    {"HeartRate": 41.7437, "SkinConductance": 0.6927, "EEG": 7.9166},
    {"HeartRate": 62.3744, "SkinConductance": 0.2663, "EEG": 11.9498},
    {"HeartRate": 62.4045, "SkinConductance": 0.7079, "EEG": 13.6012},
    {"HeartRate": 41.7437, "SkinConductance": 0.6927, "EEG": 7.9166},
    {"HeartRate": 62.3744, "SkinConductance": 0.2663, "EEG": 11.9498},
    {"HeartRate": 62.4045, "SkinConductance": 0.7079, "EEG": 13.6012},
]

def simulate_stream():
    print("Starting data stream simulation...")
    for i, data in enumerate(test_data, 1):
        try:
            response = requests.post(API_URL, json=data)
            if response.status_code == 200:
                result = response.json()
                print(f"[{i}] Sent: {data} → Predicted Engagement Level: {result.get('EngagementLevel')}")
            else:
                print(f"[{i}] Error: {response.status_code}, Response: {response.text}")
        except Exception as e:
            print(f"[{i}] Exception during request: {e}")
        
        time.sleep(3)  # Delay between requests (seconds)

if __name__ == "__main__":
    simulate_stream()
