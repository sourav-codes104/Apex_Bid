from flask import request
from flask_socketio import emit, join_room, leave_room
from database import db
from models.auction import Auction
from utils.auth_utils import get_current_user_id
from utils.auction_scheduler import refresh_auction_status, get_remaining_seconds
from datetime import datetime

# Track which SID belongs to which auction
user_rooms = {}  # { sid: (user_id, auction_id) }


def init_auction_socket(socketio):

    # ============================================================
    # JOIN AUCTION (NO NAMESPACE)
    # ============================================================
    @socketio.on("join_auction")
    def join_auction(data):
        auction_id = data.get("auction_id")
        user_id = get_current_user_id()

        if not user_id:
            emit("error", {"error": "Unauthorized"})
            return

        auction = Auction.query.get(auction_id)
        if not auction:
            emit("error", {"error": "Auction not found"})
            return

        auction = refresh_auction_status(auction)

        room = f"auction_{auction_id}"
        join_room(room)

        user_rooms[request.sid] = (user_id, auction_id)

        # Increase participant count
        auction.participants += 1
        db.session.commit()

        # Send initial info to user
        emit("participant_update", {"count": auction.participants}, room=room)

        emit(
            "auction_info",
            {
                "auction_id": auction_id,
                "status": auction.status,
                "current_bid": auction.current_bid,
                "current_bidder_id": auction.current_bidder_id,
                "current_bidder_name": (
                    auction.current_bidder.name if auction.current_bidder else None
                ),
                "remaining": get_remaining_seconds(auction),
                "participants": auction.participants,
            },
            room=request.sid,
        )

    # ============================================================
    # PLACE BID
    # ============================================================
    @socketio.on("place_bid")
    def handle_place_bid(data):
        user_id = get_current_user_id()
        if not user_id:
            emit("error", {"error": "Unauthorized"})
            return

        auction_id = data.get("auction_id")
        bid_amount = data.get("amount")

        auction = Auction.query.get(auction_id)
        if not auction:
            emit("error", {"error": "Auction not found"})
            return

        auction = refresh_auction_status(auction)

        now = datetime.utcnow()
        if auction.status != "live" or now < auction.start_time or now >= auction.end_time:
            emit("error", {"error": "Auction not live"})
            return

        if bid_amount <= auction.current_bid:
            emit("error", {"error": "Bid too low"})
            return

        auction.current_bid = bid_amount
        auction.current_bidder_id = user_id
        db.session.commit()

        room = f"auction_{auction_id}"

        # Broadcast new bid (frontend listens to "new_bid")
        socketio.emit(
            "new_bid",
            {
                "auction_id": auction_id,
                "amount": bid_amount,
                "bidder_id": user_id,
                "bidder_name": auction.current_bidder.name if auction.current_bidder else None,
            },
            room=room,
        )

    # ============================================================
    # TIMER SYNC
    # ============================================================
    @socketio.on("sync_timer")
    def sync_timer(data):
        auction_id = data.get("auction_id")
        auction = Auction.query.get(auction_id)
        if not auction:
            return

        auction = refresh_auction_status(auction)

        remaining = get_remaining_seconds(auction)

        # If auction ended, broadcast end event
        if auction.status == "ended":
            room = f"auction_{auction_id}"
            socketio.emit(
                "auction_ended",
                {
                    "auction_id": auction.id,
                    "final_price": auction.current_bid,
                    "winner_id": auction.current_bidder_id,
                    "winner_name": (
                        auction.current_bidder.name if auction.current_bidder else None
                    ),
                },
                room=room,
            )
            return

        # Otherwise sync timer
        emit("timer_update", {"remaining": remaining})

    # ============================================================
    # MANUAL LEAVE
    # ============================================================
    @socketio.on("leave_auction")
    def leave_auction(data):
        auction_id = data.get("auction_id")
        user_id = get_current_user_id()
        if not auction_id or not user_id:
            return

        auction = Auction.query.get(auction_id)
        if not auction:
            return

        room = f"auction_{auction_id}"
        leave_room(room)

        auction.participants = max(0, auction.participants - 1)
        db.session.commit()

        socketio.emit(
            "participant_update",
            {"count": auction.participants},
            room=room,
        )

    # ============================================================
    # AUTOREMOVE ON DISCONNECT
    # ============================================================
    @socketio.on("disconnect")
    def disconnect_user():
        info = user_rooms.pop(request.sid, None)
        if not info:
            return

        user_id, auction_id = info
        auction = Auction.query.get(auction_id)
        if not auction:
            return

        auction.participants = max(0, auction.participants - 1)
        db.session.commit()

        room = f"auction_{auction_id}"
        socketio.emit(
            "participant_update",
            {"count": auction.participants},
            room=room,
        )
