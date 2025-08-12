from flask import request, jsonify
from . import payments_bp
from db import db
from models import CardStatus, Payment
from decimal import Decimal
from security import token_required, requires_role


def response(success: bool, message: str = "", data=None, status=200):
    return jsonify({"success": success, "message": message, "data": data}), status


@payments_bp.post('')
@token_required
@requires_role('ADMIN')
def create_payment():
    data = request.get_json() or {}
    cardno = data.get('cardno')
    try:
        amount = Decimal(str(data.get('amount', '0')))
    except Exception:
        return response(False, "invalid amount", status=400)
    if not cardno or amount <= 0:
        return response(False, "cardno and positive amount required", status=400)
    cs = CardStatus.query.filter_by(CardNo=cardno).with_for_update().first()
    if not cs:
        return response(False, "card not found", status=404)
    p = Payment(CardNo=cardno, Amount=amount)
    cs.RemainingLimit = Decimal(cs.RemainingLimit) + amount
    if cs.RemainingLimit > Decimal(cs.CreditLimit):
        cs.RemainingLimit = Decimal(cs.CreditLimit)
    db.session.add(p)
    db.session.commit()
    return response(True, "payment recorded", {"remaining": float(cs.RemainingLimit)}, status=201)


