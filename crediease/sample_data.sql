-- sample_data.sql
USE crediease;

-- Users
INSERT INTO authority (Username, Password, Role) VALUES
('admin', 'admin123', 'ADMIN'),
('rahul_sharma', 'pass123', 'USER');

-- Cards
INSERT INTO card (CardNo, HolderName, Phone, AadharNo, Address, IssueDate) VALUES
(5412987654321234, 'Rahul Sharma', '9876543210', '123456789012', 'Mumbai, Maharashtra', '2023-01-15'),
(5123987654325678, 'Priya Nair', '9823456789', '234567890123', 'Kochi, Kerala', '2024-02-20'),
(4567123456789876, 'Amit Verma', '9812345678', '345678901234', 'Delhi, India', '2022-11-05');

-- Card Details
INSERT INTO card_details (CardNo, PIN, CVV, ExpiryDate) VALUES
(5412987654321234, '1234', '321', '2027-01-15'),
(5123987654325678, '4321', '456', '2028-02-20'),
(4567123456789876, '5678', '789', '2026-11-05');

-- Card Status
INSERT INTO card_status (CardNo, Status, CreditLimit, RemainingLimit) VALUES
(5412987654321234, 'ACTIVE', 100000.00, 85000.00),
(5123987654325678, 'ACTIVE', 50000.00, 20000.00),
(4567123456789876, 'BLOCKED', 75000.00, 75000.00);

-- Transactions
INSERT INTO transactions (CardNo, Amount, Description) VALUES
(5412987654321234, 1500.00, 'Online Shopping - Amazon'),
(5412987654321234, 2500.00, 'Electronics Purchase'),
(5123987654325678, 5000.00, 'Flight Booking'),
(4567123456789876, 2000.00, 'Hotel Payment');

-- Payments
INSERT INTO payments (CardNo, Amount) VALUES
(5412987654321234, 2000.00),
(5123987654325678, 3000.00),
(4567123456789876, 1000.00);
