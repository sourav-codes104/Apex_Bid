from flask import Blueprint, jsonify, request
from models.property import Property
from database import db
from utils.auth_utils import get_current_user_id   # ⭐ ADD THIS

property_bp = Blueprint("properties", __name__)


# ============================
# GET all properties
# ============================
@property_bp.get("/")
def get_properties():
    props = Property.query.all()
    data = [
        {
            "id": p.id,
            "title": p.title,
            "price": p.price,
            "location": p.location,
            "description": p.description,
            "image_url": p.image_url,
            "owner_id": p.owner_id,     # ⭐ ADD THIS
        }
        for p in props
    ]
    return jsonify(data)


# ============================
# GET one property
# ============================
@property_bp.get("/<int:id>")
def get_property(id):
    p = Property.query.get(id)
    if not p:
        return {"error": "Property not found"}, 404

    return {
        "id": p.id,
        "title": p.title,
        "price": p.price,
        "location": p.location,
        "description": p.description,
        "image_url": p.image_url,
        "owner_id": p.owner_id,   # ⭐ ADD THIS
    }


# ============================
# CREATE property (protected)
# ============================
@property_bp.post("/")
def add_property():
    user_id = get_current_user_id()   # ⭐ GET USER FROM TOKEN

    if not user_id:
        return {"error": "Unauthorized"}, 401

    data = request.json

    new_p = Property(
        title=data["title"],
        price=data["price"],
        location=data["location"],
        description=data.get("description"),
        image_url=data.get("image_url"),
        owner_id=user_id                  # ⭐ SET OWNER
    )

    db.session.add(new_p)
    db.session.commit()

    return {"message": "Property Added", "id": new_p.id}, 201
