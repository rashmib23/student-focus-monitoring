from flask import Flask
from flask_cors import CORS
from auth import auth_bp
from prediction import prediction_bp

app = Flask(__name__)
CORS(app)

app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(prediction_bp, url_prefix='/api/predict')

if __name__ == '__main__':
    app.run(debug=True, use_reloader=False)  