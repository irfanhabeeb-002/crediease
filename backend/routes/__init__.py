from flask import Blueprint

auth_bp = Blueprint('auth', __name__, url_prefix='/auth')
cards_bp = Blueprint('cards', __name__, url_prefix='/cards')
payments_bp = Blueprint('payments', __name__, url_prefix='/payments')
transactions_bp = Blueprint('transactions', __name__, url_prefix='/transactions')

__all__ = [
    'auth_bp',
    'cards_bp',
    'payments_bp',
    'transactions_bp',
]


