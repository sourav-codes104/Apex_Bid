from flask import Blueprint, jsonify
from models.payment_model import Payment

payment_check_bp = Blueprint("payment_check", __name__)

@payment_check_bp.get("/check/<int:auction_id>/<int:user_id>")
def check_payment(auction_id, user_id):

    payment = Payment.query.filter_by(
        auction_id=auction_id,
        user_id=user_id,
        status="PAID"
    ).first()

    return jsonify({"paid": payment is not None})
