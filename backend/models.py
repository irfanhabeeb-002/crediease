# models.py
from db import db
from datetime import datetime
from sqlalchemy.dialects.mysql import BIGINT, DECIMAL, CHAR

class Authority(db.Model):
    __tablename__ = 'authority'
    UserID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    Username = db.Column(db.String(50), unique=True, nullable=False)
    Password = db.Column(db.String(255), nullable=False)
    Role = db.Column(db.Enum('ADMIN', 'USER'), default='USER')
    CreatedAt = db.Column(db.DateTime, default=datetime.utcnow)

class Card(db.Model):
    __tablename__ = 'card'
    CardNo = db.Column(BIGINT, primary_key=True)  # NOTE: ideally store as string; kept BIGINT to match existing DB
    HolderName = db.Column(db.String(100), nullable=False)
    Phone = db.Column(db.String(15), nullable=False)
    AadharNo = db.Column(db.CHAR(12), nullable=False, unique=True)
    Address = db.Column(db.String(255))
    IssueDate = db.Column(db.Date, nullable=False)

class CardDetails(db.Model):
    __tablename__ = 'card_details'
    CardNo = db.Column(BIGINT, db.ForeignKey('card.CardNo', ondelete='CASCADE'), primary_key=True)
    PIN = db.Column(db.CHAR(4), nullable=False)
    CVV = db.Column(db.CHAR(3), nullable=False)
    ExpiryDate = db.Column(db.Date, nullable=False)

class CardStatus(db.Model):
    __tablename__ = 'card_status'
    CardNo = db.Column(BIGINT, db.ForeignKey('card.CardNo', ondelete='CASCADE'), primary_key=True)
    Status = db.Column(db.Enum('ACTIVE', 'BLOCKED', 'PENDING'), default='PENDING')
    CreditLimit = db.Column(DECIMAL(10,2), nullable=False)
    RemainingLimit = db.Column(DECIMAL(10,2), nullable=False)

class Transaction(db.Model):
    __tablename__ = 'transactions'
    TransactionID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    CardNo = db.Column(BIGINT, db.ForeignKey('card.CardNo', ondelete='CASCADE'), nullable=False)
    Amount = db.Column(DECIMAL(10,2), nullable=False)
    Description = db.Column(db.String(255))
    TransactionDate = db.Column(db.DateTime, default=datetime.utcnow)

class Payment(db.Model):
    __tablename__ = 'payments'
    PaymentID = db.Column(db.Integer, primary_key=True, autoincrement=True)
    CardNo = db.Column(BIGINT, db.ForeignKey('card.CardNo', ondelete='CASCADE'), nullable=False)
    Amount = db.Column(DECIMAL(10,2), nullable=False)
    PaymentDate = db.Column(db.DateTime, default=datetime.utcnow)
