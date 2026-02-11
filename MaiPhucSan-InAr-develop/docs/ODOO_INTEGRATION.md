# Odoo Integration (TR5 / N_FR6)

## Architecture-level description (TR5)
We integrate Odoo via JSON-RPC (`/jsonrpc`). The backend contains:
- `backend/src/services/odoo.service.js`: authentication + `hr.employee` query
- `GET /api/v1/odoo/employees`: endpoint used by the cockpit

## Configuration
Set env vars:
- `ODOO_BASE_URL`
- `ODOO_DB`
- `ODOO_USERNAME`
- `ODOO_PASSWORD`

## Postman test case (TR5)
Create a Postman request:
- Method: `GET`
- URL: `http://localhost:3000/api/v1/odoo/employees`
- Auth: Bearer token (login as CEO/HR)

Expected:
- 200 OK with employee list
- or 412 if Odoo credentials are not configured

*.md
