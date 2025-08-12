from flask import request, jsonify
from . import cards_bp
from db import db
from models import Card, CardDetails, CardStatus, Transaction
from datetime import date, datetime
from decimal import Decimal
import secrets
from security import token_required, requires_role, is_valid_aadhaar, is_valid_phone, add_years_safe


def response(success: bool, message: str = "", data=None, status=200):
    return jsonify({"success": success, "message": message, "data": data}), status


@cards_bp.get('/aadhar/<aadhar_no>')
@token_required
@requires_role('ADMIN')
def get_card_by_aadhar(aadhar_no):
    if not is_valid_aadhaar(aadhar_no):
        return response(False, "invalid aadhar", status=400)
    card = Card.query.filter_by(AadharNo=aadhar_no).first()
    if not card:
        return response(False, "card not found", status=404)
    details = CardDetails.query.get(card.CardNo)
    status_row = CardStatus.query.get(card.CardNo)
    transactions = Transaction.query.filter_by(CardNo=card.CardNo).order_by(Transaction.TransactionDate.desc()).limit(20).all()
    payload = {
        "card": {
            "cardno": str(card.CardNo),
            "holder": card.HolderName,
            "phone": card.Phone,
            "aadhar": card.AadharNo,
            "address": card.Address,
            "issueDate": card.IssueDate.isoformat()
        },
        "details": {
            "pin_exists": bool(details),
            "cvv_exists": bool(details),
            "expiry": details.ExpiryDate.isoformat() if details else None
        },
        "status": {
            "status": status_row.Status if status_row else None,
            "creditLimit": float(status_row.CreditLimit) if status_row else None,
            "remainingLimit": float(status_row.RemainingLimit) if status_row else None
        },
        "transactions": [
            {"id": t.TransactionID, "amount": float(t.Amount), "desc": t.Description, "when": t.TransactionDate.isoformat()}
            for t in transactions
        ]
    }
    return response(True, "ok", payload)


@cards_bp.post('')
@token_required
@requires_role('ADMIN')
def issue_card():
    data = request.get_json() or {}
    holder = data.get('holder')
    phone = data.get('phone')
    aadhar = data.get('aadhar')
    address = data.get('address')
    if not holder or not phone or not aadhar:
        return response(False, "holder, phone, aadhar required", status=400)
    if not is_valid_phone(phone):
        return response(False, "invalid phone", status=400)
    if not is_valid_aadhaar(aadhar):
        return response(False, "invalid aadhar", status=400)
    if Card.query.filter_by(AadharNo=aadhar).first():
        return response(False, "aadhar already has a card", status=400)

    def gen16() -> int:
        first = str(secrets.randbelow(9) + 1)
        rest = ''.join(str(secrets.randbelow(10)) for _ in range(15))
        return int(first + rest)

    cardno = gen16()
    while Card.query.get(cardno):
        cardno = gen16()

    today = date.today()
    card = Card(CardNo=cardno, HolderName=holder, Phone=phone, AadharNo=aadhar, Address=address, IssueDate=today)

    pin = ''.join(str(secrets.randbelow(10)) for _ in range(4))
    cvv = ''.join(str(secrets.randbelow(10)) for _ in range(3))
    expiry = data.get('expiry')
    if expiry:
        try:
            expiry_date = datetime.fromisoformat(expiry).date()
        except Exception:
            return response(False, "invalid expiry", status=400)
    else:
        expiry_date = add_years_safe(today, 3)
    details = CardDetails(CardNo=cardno, PIN=pin, CVV=cvv, ExpiryDate=expiry_date)

    try:
        limit = Decimal(str(data.get('creditLimit', '50000.0')))
        if limit <= 0:
            return response(False, "creditLimit must be positive", status=400)
    except Exception:
        return response(False, "invalid creditLimit", status=400)
    status_row = CardStatus(CardNo=cardno, Status='PENDING', CreditLimit=limit, RemainingLimit=limit)
    db.session.add(card)
    db.session.add(details)
    db.session.add(status_row)
    db.session.commit()
    return response(True, "card issued", {"cardno": str(cardno)}, status=201)


@cards_bp.put('/<int:cardno>/status')
@token_required
@requires_role('ADMIN')
def update_card_status(cardno):
    data = request.get_json() or {}
    action = data.get('action')
    limit = data.get('limit')
    cs = CardStatus.query.get(cardno)
    if not cs:
        return response(False, "card not found", status=404)
    if action == 'activate':
        cs.Status = 'ACTIVE'
    elif action == 'block':
        cs.Status = 'BLOCKED'
    elif action == 'set_limit':
        if limit is None:
            return response(False, "limit required", status=400)
        try:
            new_limit = Decimal(str(limit))
        except Exception:
            return response(False, "invalid limit", status=400)
        if new_limit < 0:
            return response(False, "limit must be non-negative", status=400)
        prev = Decimal(cs.CreditLimit)
        cs.CreditLimit = new_limit
        cs.RemainingLimit = Decimal(cs.RemainingLimit) + (new_limit - prev)
        if cs.RemainingLimit < 0:
            cs.RemainingLimit = Decimal('0')
    else:
        return response(False, "unknown action", status=400)
    db.session.commit()
    return response(True, "status updated", {"status": cs.Status, "creditLimit": float(cs.CreditLimit), "remainingLimit": float(cs.RemainingLimit)})


@cards_bp.get('/<int:cardno>/transactions')
@token_required
def card_transactions(cardno):
    txs = Transaction.query.filter_by(CardNo=cardno).order_by(Transaction.TransactionDate.desc()).all()
    out = [{"id": t.TransactionID, "amount": float(t.Amount), "desc": t.Description, "when": t.TransactionDate.isoformat()} for t in txs]
    return response(True, "ok", {"transactions": out})


@cards_bp.get('/<int:cardno>/status')
@token_required
def get_card_status(cardno):
    cs = CardStatus.query.get(cardno)
    if not cs:
        return response(False, "card not found", status=404)
    return response(True, "ok", {
        "status": cs.Status,
        "creditLimit": float(cs.CreditLimit),
        "remainingLimit": float(cs.RemainingLimit)
    })


@cards_bp.put('/<int:cardno>')
@token_required
@requires_role('ADMIN')
def update_card_details(cardno):
    card = Card.query.get(cardno)
    if not card:
        return response(False, "card not found", status=404)
    data = request.get_json() or {}
    holder = data.get('holder')
    phone = data.get('phone')
    address = data.get('address')
    expiry = data.get('expiry')
    # Validate and update basic fields
    if holder is not None and isinstance(holder, str) and holder.strip():
        card.HolderName = holder.strip()
    if phone is not None:
        if not is_valid_phone(phone):
            return response(False, "invalid phone", status=400)
        card.Phone = phone
    if address is not None:
        card.Address = address
    # Optionally update expiry in card_details
    if expiry is not None:
        details = CardDetails.query.get(cardno)
        if details is None:
            return response(False, "card details not found", status=404)
        try:
            details.ExpiryDate = datetime.fromisoformat(expiry).date()
        except Exception:
            return response(False, "invalid expiry", status=400)
    db.session.commit()
    return response(True, "card updated", {
        "cardno": str(card.CardNo),
        "holder": card.HolderName,
        "phone": card.Phone,
        "address": card.Address
    })


