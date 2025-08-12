from flask import request, jsonify
from . import transactions_bp
from db import db
from models import CardStatus, Transaction
from decimal import Decimal
from security import token_required, requires_role


def response(success: bool, message: str = "", data=None, status=200):
    return jsonify({"success": success, "message": message, "data": data}), status


@transactions_bp.post('')
@token_required
@requires_role('ADMIN')
def create_transaction():
    data = request.get_json() or {}
    cardno = data.get('cardno')
    try:
        amount = Decimal(str(data.get('amount', '0')))
    except Exception:
        return response(False, "invalid amount", status=400)
    description = data.get('description', '')
    if not cardno:
        return response(False, "cardno and amount required", status=400)
    if amount <= 0:
        return response(False, "amount must be positive", status=400)
    cs = CardStatus.query.filter_by(CardNo=cardno).with_for_update().first()
    if not cs:
        return response(False, "card not found", status=404)
    if cs.Status != 'ACTIVE':
        return response(False, "card not active", status=400)
    if amount > Decimal(cs.RemainingLimit):
        return response(False, "insufficient credit", status=400)
    tx = Transaction(CardNo=cardno, Amount=amount, Description=description)
    cs.RemainingLimit = Decimal(cs.RemainingLimit) - amount
    db.session.add(tx)
    db.session.commit()
    return response(True, "transaction recorded", {"remaining": float(cs.RemainingLimit)}, status=201)


