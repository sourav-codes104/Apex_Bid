from flask import Blueprint, request, jsonify
from database import db
from models.auction import Auction
from models.property import Property
from models.payment_model import Payment
from utils.auth_utils import get_current_user_id
from utils.auction_scheduler import refresh_auction_status
from datetime import datetime

auction_bp = Blueprint("auctions", __name__)

# ======================================================
# CREATE AUCTION (OWNER ONLY)
# ======================================================
@auction_bp.post("/create")
def create_auction():
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    data = request.json

    property_id = data.get("property_id")
    starting_price = data.get("starting_price")
    entry_fee = data.get("entry_fee", 0)
    start_time = data.get("start_time")
    end_time = data.get("end_time")

    if not property_id or not starting_price or not start_time or not end_time:
        return jsonify({"error": "Missing required fields"}), 400

    try:
        start_time = datetime.fromisoformat(start_time)
        end_time = datetime.fromisoformat(end_time)
    except:
        return jsonify({"error": "Invalid datetime format"}), 400

    if start_time >= end_time:
        return jsonify({"error": "End time must be later than start time"}), 400

    prop = Property.query.get(property_id)
    if not prop:
        return jsonify({"error": "Property not found"}), 404

    if prop.owner_id != user_id:
        return jsonify({"error": "You are not the owner of this property"}), 403

    auction = Auction(
        property_id=property_id,
        owner_id=user_id,
        starting_price=starting_price,
        entry_fee=entry_fee,
        start_time=start_time,
        end_time=end_time,
        status="upcoming",
        current_bid=starting_price,
        participants=0
    )

    db.session.add(auction)
    db.session.commit()

    return jsonify({
        "success": True,
        "auction_id": auction.id,
        "message": "Auction created successfully"
    }), 201


# ======================================================
# GET ALL AUCTIONS (AUTO STATUS REFRESH + COMMIT)
# ======================================================
@auction_bp.get("/")
def get_all_auctions():
    auctions = Auction.query.order_by(Auction.start_time.desc()).all()

    result = []
    updated = False

    for a in auctions:
        old_status = a.status
        refreshed = refresh_auction_status(a)

        if refreshed.status != old_status:
            updated = True

        result.append({
            "id": refreshed.id,
            "property_id": refreshed.property_id,
            "owner_id": refreshed.owner_id,
            "starting_price": refreshed.starting_price,
            "entry_fee": refreshed.entry_fee,
            "status": refreshed.status,
            "start_time": refreshed.start_time.isoformat(),
            "end_time": refreshed.end_time.isoformat(),
            "current_bid": refreshed.current_bid,
            "current_bidder_id": refreshed.current_bidder_id,
            "current_bidder_name": refreshed.current_bidder.name if refreshed.current_bidder else None,
            "participants": refreshed.participants
        })

    if updated:
        db.session.commit()

    return jsonify(result)


# ======================================================
# GET AUCTION BY ID (AUTO STATUS REFRESH)
# ======================================================
@auction_bp.get("/<int:id>")
def get_auction(id):
    a = Auction.query.get(id)
    if not a:
        return jsonify({"error": "Auction not found"}), 404

    old_status = a.status
    a = refresh_auction_status(a)

    if a.status != old_status:
        db.session.commit()

    return jsonify({
        "id": a.id,
        "property_id": a.property_id,
        "owner_id": a.owner_id,
        "starting_price": a.starting_price,
        "entry_fee": a.entry_fee,
        "status": a.status,
        "start_time": a.start_time.isoformat(),
        "end_time": a.end_time.isoformat(),
        "current_bid": a.current_bid,
        "current_bidder_id": a.current_bidder_id,
        "current_bidder_name": a.current_bidder.name if a.current_bidder else None,
        "participants": a.participants
    })


# ======================================================
# JOIN AUCTION (REQUIRES ENTRY FEE PAID)
# ======================================================
@auction_bp.post("/<int:auction_id>/join")
def join_auction(auction_id):
    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    auction = Auction.query.get(auction_id)
    if not auction:
        return jsonify({"error": "Auction not found"}), 404

    # 🔥 PAYMENT CHECK - DO NOT ALLOW JOIN IF ENTRY FEE NOT PAID
    payment = Payment.query.filter_by(
        auction_id=auction_id,
        user_id=user_id,
        status="PAID"
    ).first()

    if not payment:
        return jsonify({"error": "Entry fee not paid"}), 403

    # Refresh status
    old_status = auction.status
    auction = refresh_auction_status(auction)

    if auction.status != old_status:
        db.session.commit()

    # Increase participants
    auction.participants += 1
    db.session.commit()

    return jsonify({
        "id": auction.id,
        "property_id": auction.property_id,
        "owner_id": auction.owner_id,
        "starting_price": auction.starting_price,
        "entry_fee": auction.entry_fee,
        "status": auction.status,
        "start_time": auction.start_time.isoformat(),
        "end_time": auction.end_time.isoformat(),
        "current_bid": auction.current_bid,
        "current_bidder_id": auction.current_bidder_id,
        "current_bidder_name": auction.current_bidder.name if auction.current_bidder else None,
        "participants": auction.participants
    }), 200
