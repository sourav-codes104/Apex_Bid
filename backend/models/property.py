from database import db

class Property(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(200), nullable=False)
    price = db.Column(db.Integer, nullable=False)
    location = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text)
    image_url = db.Column(db.String(500))

    # ⭐ Add this new field
    owner_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=True)
