import os
import uuid
import requests
from flask import Blueprint, request, jsonify

payments = Blueprint("payments", __name__)

CASHFREE_BASE_URL = "https://sandbox.cashfree.com/pg/orders"


@payments.route("/create-order", methods=["POST"])
def create_order():

    # 🔥 DEBUG: Check whether .env variables are being loaded
    print("DEBUG CLIENT ID =", os.getenv("CASHFREE_CLIENT_ID"))
    print("DEBUG SECRET    =", os.getenv("CASHFREE_CLIENT_SECRET"))

    data = request.json
    amount = data.get("amount")
    auction_id = data.get("auction_id")
    user_id = data.get("user_id")

    if not amount or not auction_id or not user_id:
        return jsonify({"error": "Missing required fields"}), 400

    order_id = str(uuid.uuid4())  # unique order ID

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

    print("DEBUG sending headers:", headers)  # show if None or empty

    response = requests.post(CASHFREE_BASE_URL, json=payload, headers=headers)

    try:
        result = response.json()
    except Exception:
        return jsonify({"error": "Invalid response from Cashfree"}), 500

    # 🔥 Better error reporting
    if response.status_code != 200:
        return jsonify({
            "error": "Failed to create order",
            "status_code": response.status_code,
            "cashfree_response": result
        }), 400

    # SUCCESS
    return jsonify({
        "order_id": order_id,
        "payment_session_id": result.get("payment_session_id")
    })
