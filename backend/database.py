from flask_sqlalchemy import SQLAlchemy
from flask_socketio import SocketIO

db = SQLAlchemy()

# Allow frontend to connect without CORS issue
socketio = SocketIO(cors_allowed_origins="*")
