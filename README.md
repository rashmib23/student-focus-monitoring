# student-focus-monitoring

# Install Python packages
pip install flask joblib pandas numpy requests flask-cors

# 1. Start the Flask backend server (in one terminal)
python backend/app.py

# 2. Start the simulated data streamer (in another terminal)
python backend/simulate_stream.py

# 3. Serve the frontend files (in a third terminal, from project root)
python -m http.server 5500
# Then open http://localhost:5500 in your browser
