import jwt
import os
from flask import request

# 🔥 MUST match the SECRET_KEY in your app.py exactly
SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key")

def get_current_user_id():
    """Extract user_id from JWT token.
    Supports both HTTP (Authorization header) and SocketIO (query/auth params).
    """
    # First try Authorization header (for HTTP requests)
    auth_header = request.headers.get("Authorization")
    
    token = None
    if auth_header:
        parts = auth_header.split(" ")
        if len(parts) == 2:
            token = parts[1]
            print(f"✅ Token from Authorization header")
    else:
        # For SocketIO, token can be in query args or in environ auth data
        token = request.args.get('token')
        if token:
            print(f"✅ Token from query args")
        else:
            # Try to get from Socket.IO auth namespace
            # Flask-SocketIO stores auth data in request.environ
            try:
                if hasattr(request, 'sid'):  # This is a SocketIO request
                    # Try to get token from the Socket.IO handshake
                    if 'token' in request.args:
                        token = request.args['token']
                        print(f"✅ Token from args dict")
            except:
                pass
            
            if not token:
                print(f"❌ No token found in headers or query args")
                print(f"   Headers keys: {list(request.headers.keys())}")
                print(f"   Query args: {dict(request.args)}")
                print(f"   URL: {request.url}")
    
    if not token:
        return None

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
        print(f"✅ Token decoded, user_id: {user_id}")
        return user_id
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
        print(f"❌ Invalid token: {e}")
        return None
    except Exception as e:
        print(f"❌ Error decoding token: {e}")
        return None
