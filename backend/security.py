from functools import wraps
from flask import request, jsonify, g
from auth_utils import decode_token
from datetime import date


def token_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', None)
        if not auth:
            return jsonify({"success": False, "message": "authorization required", "data": None}), 401
        parts = auth.split()
        if parts[0].lower() != 'bearer' or len(parts) != 2:
            return jsonify({"success": False, "message": "invalid authorization header", "data": None}), 401
        token = parts[1]
        payload = decode_token(token)
        if not payload:
            return jsonify({"success": False, "message": "invalid or expired token", "data": None}), 401
        g.user = payload
        return f(*args, **kwargs)
    return decorated


def requires_role(*roles):
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            user = getattr(g, 'user', None)
            if not user or user.get('role') not in roles:
                return jsonify({"success": False, "message": "forbidden", "data": None}), 403
            return f(*args, **kwargs)
        return wrapper
    return decorator


def is_valid_aadhaar(aadhaar: str) -> bool:
    return isinstance(aadhaar, str) and aadhaar.isdigit() and len(aadhaar) == 12


def is_valid_phone(phone: str) -> bool:
    return isinstance(phone, str) and phone.isdigit() and 7 <= len(phone) <= 15


def add_years_safe(d: date, years: int) -> date:
    try:
        return d.replace(year=d.year + years)
    except ValueError:
        month = d.month
        year = d.year + years
        for day in range(28, 32)[::-1]:
            try:
                return date(year, month, day)
            except ValueError:
                continue
        return date(year, month, 28)


