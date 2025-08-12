# auth_utils.py
import jwt
import os
from datetime import datetime, timedelta
from werkzeug.security import generate_password_hash, check_password_hash

JWT_SECRET = os.environ.get('JWT_SECRET')
JWT_ALG = os.environ.get('JWT_ALGORITHM') or 'HS256'
JWT_EXP_SECONDS = int(os.environ.get('JWT_EXP_SECONDS') or 3600)

def hash_password(plain):
    return generate_password_hash(plain)

def check_password(hash_pw, plain):
    return check_password_hash(hash_pw, plain)

def create_token(user_id, username, role):
    if not JWT_SECRET:
        # Fail fast if secret not configured to avoid issuing weak tokens
        raise RuntimeError('JWT_SECRET is not configured')
    payload = {
        "sub": user_id,
        "username": username,
        "role": role,
        "exp": datetime.utcnow() + timedelta(seconds=JWT_EXP_SECONDS)
    }
    token = jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALG)
    return token

def decode_token(token):
    try:
        if not JWT_SECRET:
            return None
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALG])
        return payload
    except Exception as e:
        return None
