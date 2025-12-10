from database import db
import datetime

class Auction(db.Model):
    id = db.Column(db.Integer, primary_key=True)

    # Foreign keys
    property_id = db.Column(db.Integer, db.ForeignKey('property.id'), nullable=False)
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

    # Auction basics
    starting_price = db.Column(db.Integer, nullable=False)
    entry_fee = db.Column(db.Integer, nullable=False, default=0)

    # Status tracking
    status = db.Column(db.String(20), default="upcoming")  # upcoming, live, ended
    start_time = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    end_time = db.Column(db.DateTime, nullable=False)

    # Current bid state
    current_bid = db.Column(db.Integer, nullable=True)  # will be set when bids start
    current_bidder_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)

    # ⭐ REAL-TIME PARTICIPANT COUNT (MUST HAVE)
    participants = db.Column(db.Integer, default=0)

    # Optional timestamps (good practice)
    created_at = db.Column(db.DateTime, default=datetime.datetime.utcnow)
    updated_at = db.Column(
        db.DateTime,
        default=datetime.datetime.utcnow,
        onupdate=datetime.datetime.utcnow
    )

    # Relationships (optional, improves readability)
    property = db.relationship("Property", backref="auctions")
    owner = db.relationship("User", foreign_keys=[owner_id])
    current_bidder = db.relationship("User", foreign_keys=[current_bidder_id])
