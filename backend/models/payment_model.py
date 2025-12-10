from database import db
from datetime import datetime

class Payment(db.Model):
    __tablename__ = "payments"

    id = db.Column(db.Integer, primary_key=True)
    order_id = db.Column(db.String(200), unique=True, nullable=False)
    user_id = db.Column(db.Integer, nullable=False)
    auction_id = db.Column(db.Integer, nullable=False)
    amount = db.Column(db.Float, nullable=False)
    status = db.Column(db.String(50), default="PENDING")  # PENDING / PAID / FAILED
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
