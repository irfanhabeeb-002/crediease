# CrediEase Backend (Flask)

A secure, production-ready Flask backend for managing credit cards, built with SQLAlchemy and MySQL.

## Features
- JWT authentication with password hashing
- Role-based access control (admin-only for sensitive actions)
- Card issuance, status updates, and lookups
- Transactions and payments with Decimal-safe arithmetic and row-level locking
- Modular blueprints and standardized JSON responses

## Prereqs
- Python 3.10+ (3.11 recommended)
- MySQL running with `crediease` DB loaded (use provided `schema.sql` + `sample_data.sql`)
- .env file with DB credentials and JWT secret

## Environment Variables
Set these in a `.env` file or your shell:

```
# Flask/Secrets
SECRET_KEY=change_me
JWT_SECRET=change_me_strong

# DB (works locally)
DB_USER=root
DB_PASS=your_password
DB_HOST=localhost
DB_PORT=3306
DB_NAME=crediease
```

Alternatively, you can provide a full `DATABASE_URL` like:
```
DATABASE_URL=mysql+pymysql://root:your_password@localhost:3306/crediease
```

## Setup (local)
1. Create venv and install deps:
   ```bash
   python -m venv .venv
   .\.venv\Scripts\activate    # windows
   # source .venv/bin/activate  # mac/linux
   pip install -r requirements.txt
   ```
2. Run the app:
   ```bash
   python app.py
   ```
   The app will start on http://localhost:5000

## Database Initialization
Load schema and sample data into MySQL:
```bash
mysql -u root -p < ../schema.sql
mysql -u root -p < ../sample_data.sql
```

## API Endpoints
- GET `/health`
- POST `/auth/register`
- POST `/auth/login`

Admin-only:
- POST `/cards`
- PUT `/cards/<cardno>/status`
- GET `/cards/aadhar/<aadhar_no>`
- POST `/transactions`
- POST `/payments`

General:
- GET `/cards/<cardno>/transactions`

## JSON Response Shape
All endpoints return:
```
{ "success": true|false, "message": string, "data": object|null }
```

## Docker
```
docker build -t crediease-backend .
docker run -p 5000:5000 \
  -e DB_USER=root -e DB_PASS=your_password -e DB_HOST=host.docker.internal \
  -e DB_PORT=3306 -e DB_NAME=crediease -e JWT_SECRET=change_me_strong \
  crediease-backend
```

## Notes
- Monetary values are handled with `Decimal`. JSON responses expose them as floats for convenience.
- Concurrency is protected using row-level locks on balance updates.
- For production, use managed secrets and a robust MySQL instance.