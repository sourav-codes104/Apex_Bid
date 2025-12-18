from flask import Flask, jsonify
from flask_cors import CORS
from database import db, socketio
from dotenv import load_dotenv

import eventlet
eventlet.monkey_patch()   # 🔥 REQUIRED FOR WEBSOCKETS

load_dotenv()

# Routes
from routes.property_routes import property_bp
from routes.auction_routes import auction_bp
from routes.auth_routes import auth_bp
from routes.auction_join_routes import auction_join_bp
from routes.payments import payments
from routes.payment_check import payment_check_bp

# Socket events
from sockets.auction_socket import init_auction_socket


def create_app():
    app = Flask(__name__)
    app.config["SECRET_KEY"] = "your-secret-key"
    app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///database.db"
    app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False

    db.init_app(app)

    # ALLOW ALL ORIGINS DURING DEV FOR SOCKET.IO
    CORS(
        app,
        supports_credentials=True,
        resources={r"/*": {"origins": "*"}},
        allow_headers=["Content-Type", "Authorization"],
        expose_headers=["Authorization"],
    )

    # SOCKET.IO → ALLOW ALL ORIGINS FOR DEV
    socketio.init_app(
        app,
        cors_allowed_origins="*",
        async_mode="eventlet",     # 🔥 REQUIRED
        ping_timeout=60,
        ping_interval=25,
    )

    # ROUTES
    app.register_blueprint(property_bp, url_prefix="/api/properties")
    app.register_blueprint(auction_bp, url_prefix="/api/auctions")
    app.register_blueprint(auction_join_bp, url_prefix="/api/auctions")
    app.register_blueprint(auth_bp, url_prefix="/api/auth")
    app.register_blueprint(payments, url_prefix="/payments")
    app.register_blueprint(payment_check_bp, url_prefix="/payments")

    @app.route("/api/health")
    def health():
        return jsonify({"status": "OK"})

    init_auction_socket(socketio)
    return app


if __name__ == "__main__":
    app = create_app()

    with app.app_context():
        db.create_all()

    # USE EVENTLET SERVER, NOT WERKZEUG
    socketio.run(
        app,
        host="127.0.0.1",
        port=5000,
        debug=True
    )
