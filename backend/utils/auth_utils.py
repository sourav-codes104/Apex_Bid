import jwt
from flask import request

# 🔥 MUST match the SECRET_KEY in your app.py exactly
SECRET_KEY = "your-secret-key" 

def get_current_user_id():
    auth_header = request.headers.get("Authorization")
    
    # 1. Check if the header even arrives at the server
    print(f"DEBUG: Auth Header received: {auth_header}")

    if not auth_header:
        print("DEBUG: No Authorization header found in request")
        return None

    try:
        # 2. Extract the token from 'Bearer <token>'
        parts = auth_header.split(" ")
        if len(parts) != 2:
            print("DEBUG: Auth header format is wrong (expected 'Bearer <token>')")
            return None
            
        token = parts[1]
        
        # 3. Try to decode the token
        payload = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        user_id = payload.get("user_id")
        print(f"DEBUG: Token decoded successfully! User ID: {user_id}")
        return user_id

    except jwt.ExpiredSignatureError:
        print("DEBUG: ERROR - Token has expired")
        return None
    except jwt.InvalidTokenError:
        print("DEBUG: ERROR - Invalid Token (Key mismatch?)")
        return None
    except Exception as e:
        print(f"DEBUG: ERROR - Unexpected JWT error: {str(e)}")
        return None