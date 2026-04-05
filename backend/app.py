import eventlet
eventlet.monkey_patch()  # 🔥 REQUIRED: Must be the absolute first thing

import os
from flask import Flask, jsonify
from flask_cors import CORS
from database import db, socketio
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Routes
from routes.property_routes import property_bp
from routes.auction_routes import auction_bp
from routes.auth_routes import auth_bp
from routes.payments import payments
from routes.payment_check import payment_check_bp

# Socket events
from sockets.auction_socket import init_auction_socket

def create_app():
    app = Flask(__name__)
    # Ensure this matches exactly what is in your auth_utils.py
    app.config["SECRET_KEY"] = os.getenv("SECRET_KEY", "your-secret-key")
    app.config["SQLALCHEMY_DATABASE_URI"] = os.getenv("DATABASE_URL", "sqlite:///database.db")
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    # List of allowed frontend origins
    allowed_origins = [
        "http://localhost:8080", 
        "http://127.0.0.1:8080",
        "http://localhost:5173", 
        "http://127.0.0.1:5173",
        "http://localhost:8081", 
        "http://127.0.0.1:8081"
    ]

    # 1. Update CORS to handle Credentials
    CORS(
        app,
        supports_credentials=True,
        origins=allowed_origins,  # Changed from resources
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Authorization"],
        methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        max_age=3600
    )

    # 2. Update Socket.IO to match the allowed origins
    socketio.init_app(
        app,
        cors_allowed_origins=allowed_origins,
        async_mode="eventlet",
        ping_timeout=60,
        ping_interval=25,
    )

    # ROUTES
    app.register_blueprint(property_bp, url_prefix="/api/properties")
    app.register_blueprint(auction_bp, url_prefix="/api/auctions")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(payments, url_prefix="/payments")
    app.register_blueprint(payment_check_bp, url_prefix="/payments")

    @app.route("/api/health")
    def health():
        return jsonify({"status": "OK"})

    init_auction_socket(socketio)
    print("✅ Auction Socket initialized successfully")
    return app


if __name__ == "__main__":
    app = create_app()

    with app.app_context():
        db.create_all()

    port = int(os.getenv("PORT", "5000"))
    host = os.getenv("HOST", "127.0.0.1")

    # 🔥 use_reloader=False is critical on Windows with Eventlet
    # to prevent "working outside of application context" errors.
    socketio.run(
        app,
        host=host,
        port=port,
        debug=True,
        use_reloader=False
    )