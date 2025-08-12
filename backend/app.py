# app.py
import os
from flask import Flask, request, jsonify, g
from db import db
from models import Authority, Card, CardDetails, CardStatus, Transaction, Payment
from auth_utils import hash_password, check_password, create_token, decode_token
from dotenv import load_dotenv
from datetime import date, datetime
from decimal import Decimal
import secrets
from config import Config
from flask_cors import CORS

# Load env
load_dotenv()

def create_app():
    app = Flask(__name__)
    cfg = Config()
    app.config['SQLALCHEMY_DATABASE_URI'] = cfg.SQLALCHEMY_DATABASE_URI
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = cfg.SQLALCHEMY_TRACK_MODIFICATIONS
    app.config['SQLALCHEMY_ENGINE_OPTIONS'] = cfg.SQLALCHEMY_ENGINE_OPTIONS
    app.config['SECRET_KEY'] = cfg.SECRET_KEY
    db.init_app(app)
    # CORS for frontend on localhost:5173/3000
    CORS(app, resources={r"/*": {"origins": ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"]}}, supports_credentials=True)
    # Register blueprints
    from routes import auth_bp, cards_bp, transactions_bp, payments_bp
    # Import route implementations to attach handlers
    import routes.auth  # noqa: F401
    import routes.cards  # noqa: F401
    import routes.transactions  # noqa: F401
    import routes.payments  # noqa: F401
    app.register_blueprint(auth_bp)
    app.register_blueprint(cards_bp)
    app.register_blueprint(transactions_bp)
    app.register_blueprint(payments_bp)
    return app

app = create_app()

# simple index
@app.route('/', methods=['GET'])
def index():
    return jsonify({"success": True, "message": "CrediEase API", "data": {"health": "/health"}})

# simple health
@app.route('/health', methods=['GET'])
def health():
    return jsonify({"success": True, "message": "ok", "data": {"status": "ok"}})

"""Routes moved to blueprints under routes/"""

# simple token-required decorator
"""Security helpers moved to security.py"""

"""Card routes moved to blueprint"""

"""Issue card moved to blueprint"""

# --- UPDATE CARD STATUS / CREDIT LIMIT ---
"""Status update moved to blueprint"""

# --- CREATE TRANSACTION (testing tool) ---
"""Transactions moved to blueprint"""

# --- CREATE PAYMENT ---
"""Payments moved to blueprint"""

"""Card transactions route is in cards blueprint"""

# Boot with app context ready
if __name__ == '__main__':
    with app.app_context():
        # Test DB connection: will throw if can't connect
        try:
            db.create_all()
        except Exception as e:
            print("Error creating/connecting to DB:", e)
        app.run(host='0.0.0.0', port=5000, debug=True)
