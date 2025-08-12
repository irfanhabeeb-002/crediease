from flask import request, jsonify, g
from . import auth_bp
from db import db
from models import Authority
from auth_utils import hash_password, check_password, create_token


def response(success: bool, message: str = "", data=None, status=200):
    return jsonify({"success": success, "message": message, "data": data}), status


@auth_bp.post('/register')
def register():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return response(False, "username and password required", status=400)
    if Authority.query.filter_by(Username=username).first():
        return response(False, "username exists", status=400)
    user = Authority(Username=username, Password=hash_password(password), Role='USER')
    db.session.add(user)
    db.session.commit()
    return response(True, "user created", {"user_id": user.UserID}, status=201)


@auth_bp.post('/login')
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')
    if not username or not password:
        return response(False, "username and password required", status=400)
    user = Authority.query.filter_by(Username=username).first()
    if not user:
        return response(False, "invalid credentials", status=401)
    if check_password(user.Password, password):
        pass
    else:
        if user.Password and not user.Password.startswith('pbkdf2:') and user.Password == password:
            user.Password = hash_password(password)
            db.session.commit()
        else:
            return response(False, "invalid credentials", status=401)
    token = create_token(user.UserID, user.Username, user.Role)
    return response(True, "ok", {"token": token, "user": {"id": user.UserID, "username": user.Username, "role": user.Role}})


