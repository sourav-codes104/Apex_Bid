import os
import uuid
import requests
from flask import Blueprint, request, jsonify
from models.payment_model import Payment
from utils.auth_utils import get_current_user_id
from models.auction import Auction
from database import db

CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg/orders"
VERIFY_URL = "https://sandbox.cashfree.com/pg/orders"

# ⭐ BLUEPRINT MUST BE DEFINED AT THE TOP
payments = Blueprint("payments", __name__)


# ======================================================
# CREATE ORDER
# ======================================================
@payments.route("/create-order", methods=["POST"])
def create_order():

    print("DEBUG CLIENT ID =", os.getenv("CASHFREE_CLIENT_ID"))
    print("DEBUG SECRET    =", os.getenv("CASHFREE_CLIENT_SECRET"))

    data = request.json
    amount = data.get("amount")
    auction_id = data.get("auction_id")
    user_id = data.get("user_id")

    if not amount or not auction_id or not user_id:
        return jsonify({"error": "Missing required fields"}), 400

    order_id = str(uuid.uuid4())

    payload = {
        "order_id": order_id,
        "order_amount": float(amount),
        "order_currency": "INR",
        "customer_details": {
            "customer_id": str(user_id),
            "customer_email": "test@example.com",
            "customer_phone": "9999999999"
        },
        "order_meta": {
            "return_url": f"http://localhost:5173/payment-success?order_id={order_id}"
        },
        "order_note": f"Auction Entry Fee for Auction {auction_id}"
    }

    headers = {
        "Content-Type": "application/json",
        "x-client-id": os.getenv("CASHFREE_CLIENT_ID"),
        "x-client-secret": os.getenv("CASHFREE_CLIENT_SECRET"),
        "x-api-version": "2022-09-01"
    }

    response = requests.post(CASHFREE_BASE_URL, json=payload, headers=headers)

    try:
        result = response.json()
    except Exception:
        return jsonify({"error": "Invalid response from Cashfree"}), 500

    if response.status_code != 200:
        return jsonify({
            "error": "Failed to create order",
            "status_code": response.status_code,
            "cashfree_response": result
        }), 400

    return jsonify({
        "order_id": order_id,
        "payment_session_id": result.get("payment_session_id")
    })


# ======================================================
# VERIFY PAYMENT (THE MISSING PART)
# ======================================================
@payments.route("/verify-payment", methods=["POST"])
def verify_payment():
    data = request.json
    order_id = data.get("order_id")

    if not order_id:
        return jsonify({"error": "Missing order_id"}), 400

    user_id = get_current_user_id()
    if not user_id:
        return jsonify({"error": "Unauthorized"}), 401

    headers = {
        "Content-Type": "application/json",
        "x-client-id": os.getenv("CASHFREE_CLIENT_ID"),
        "x-client-secret": os.getenv("CASHFREE_CLIENT_SECRET"),
        "x-api-version": "2022-09-01"
    }

    cashfree_res = requests.get(f"{VERIFY_URL}/{order_id}", headers=headers)
    cashfree_data = cashfree_res.json()

    order_status = cashfree_data.get("order_status")
    note = cashfree_data.get("order_note", "")

    try:
        auction_id = int(note.replace("Auction Entry Fee for Auction ", ""))
    except:
        return jsonify({"error": "Invalid auction note"}), 400

    if order_status != "PAID":
        return jsonify({"auction_id": auction_id, "order_status": order_status})

    # Check if already stored
    existing = Payment.query.filter_by(
        order_id=order_id,
        user_id=user_id,
        auction_id=auction_id
    ).first()

    if not existing:
        payment = Payment(
            order_id=order_id,
            user_id=user_id,
            auction_id=auction_id,
            status="PAID"
        )
        db.session.add(payment)

        auction = Auction.query.get(auction_id)
        if auction:
            auction.participants += 1

        db.session.commit()

    return jsonify({
        "auction_id": auction_id,
        "order_status": "PAID"
    }), 200
