-- schema.sql
CREATE DATABASE IF NOT EXISTS crediease;
USE crediease;

-- 1. User Authority Table
CREATE TABLE authority (
    UserID INT AUTO_INCREMENT PRIMARY KEY,
    Username VARCHAR(50) NOT NULL UNIQUE,
    Password VARCHAR(255) NOT NULL,
    Role ENUM('ADMIN', 'USER') DEFAULT 'USER',
    CreatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Card Owner Info
CREATE TABLE card (
    CardNo BIGINT PRIMARY KEY,
    HolderName VARCHAR(100) NOT NULL,
    Phone VARCHAR(15) NOT NULL,
    AadharNo CHAR(12) NOT NULL UNIQUE,
    Address VARCHAR(255),
    IssueDate DATE NOT NULL
);

-- 3. Card Details (PIN, CVV, Expiry)
CREATE TABLE card_details (
    CardNo BIGINT PRIMARY KEY,
    PIN CHAR(4) NOT NULL,
    CVV CHAR(3) NOT NULL,
    ExpiryDate DATE NOT NULL,
    FOREIGN KEY (CardNo) REFERENCES card(CardNo) ON DELETE CASCADE
);

-- 4. Card Status (Active/Blocked + Credit Limit)
CREATE TABLE card_status (
    CardNo BIGINT PRIMARY KEY,
    Status ENUM('ACTIVE', 'BLOCKED', 'PENDING') DEFAULT 'PENDING',
    CreditLimit DECIMAL(10,2) NOT NULL,
    RemainingLimit DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (CardNo) REFERENCES card(CardNo) ON DELETE CASCADE
);

-- 5. Transactions
CREATE TABLE transactions (
    TransactionID INT AUTO_INCREMENT PRIMARY KEY,
    CardNo BIGINT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    Description VARCHAR(255),
    TransactionDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CardNo) REFERENCES card(CardNo) ON DELETE CASCADE
);

-- 6. Payments
CREATE TABLE payments (
    PaymentID INT AUTO_INCREMENT PRIMARY KEY,
    CardNo BIGINT NOT NULL,
    Amount DECIMAL(10,2) NOT NULL,
    PaymentDate DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CardNo) REFERENCES card(CardNo) ON DELETE CASCADE
);
