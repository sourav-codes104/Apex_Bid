from flask import Blueprint, request, jsonify
from models.auction import Auction
from models.property import Property
from utils.auth_utils import get_current_user_id
from utils.auction_scheduler import refresh_auction_status, get_remaining_seconds
from datetime import datetime
from database import db


# ⭐ BLUEPRINT MUST BE DEFINED BEFORE ANY ROUTE
auction_join_bp = Blueprint("auction_join", __name__)


# ======================================================
# JOIN AUCTION
# ======================================================
@auction_join_bp.route("/api/auctions/<int:auction_id>/join", methods=["POST"])
def join_auction(auction_id):
    user_id = get_current_user_id()

    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    auction = Auction.query.get(auction_id)
    if not auction:
        return jsonify({"error": "Auction not found"}), 404

    # Auto status update
    auction = refresh_auction_status(auction)

    prop = Property.query.get(auction.property_id)
    now = datetime.utcnow()

    # ============================================================
    # ENDED AUCTION RESPONSE
    # ============================================================
    if auction.status == "ended":
        return jsonify({
            "success": True,
            "status": "ended",
            "final_price": auction.current_bid,
            "winner_id": auction.current_bidder_id,
            "winner_name": auction.current_bidder.name if auction.current_bidder else None,
            "remaining_seconds": 0,
            "property_title": prop.title if prop else None,
            "property_image": prop.image_url if prop else None,
            "property_location": prop.location if prop else None,
        }), 200

    # ============================================================
    # UPCOMING AUCTION
    # ============================================================
    if auction.status == "upcoming":
        remaining = get_remaining_seconds(auction)
        return jsonify({
            "success": True,
            "auction_id": auction.id,
            "status": "upcoming",
            "remaining_seconds": remaining,
            "start_time": auction.start_time.isoformat(),
            "end_time": auction.end_time.isoformat(),
            "entry_fee_required": auction.entry_fee > 0,
            "property_title": prop.title if prop else None,
            "property_image": prop.image_url if prop else None,
            "property_location": prop.location if prop else None,
            "current_bid": auction.current_bid,
            "current_bidder_id": auction.current_bidder_id,
            "current_bidder_name": auction.current_bidder.name if auction.current_bidder else None,
            "participants": auction.participants
        }), 200

    # ============================================================
    # LIVE AUCTION
    # ============================================================
    if auction.status == "live":
        remaining = get_remaining_seconds(auction)
        return jsonify({
            "success": True,
            "auction_id": auction.id,
            "status": "live",
            "current_bid": auction.current_bid,
            "current_bidder_id": auction.current_bidder_id,
            "current_bidder_name": auction.current_bidder.name if auction.current_bidder else None,
            "remaining_seconds": remaining,
            "start_time": auction.start_time.isoformat(),
            "end_time": auction.end_time.isoformat(),
            "entry_fee_required": auction.entry_fee > 0,
            "property_title": prop.title if prop else None,
            "property_image": prop.image_url if prop else None,
            "property_location": prop.location if prop else None,
            "participants": auction.participants
        }), 200
