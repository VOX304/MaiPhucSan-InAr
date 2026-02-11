# Requirements Traceability Matrix (Assignment 6)

This file maps **functional requirements (FR)** and **technical requirements (TR)** from Assignment 6 to the implemented code artifacts.

> Note: External system integration (OrangeHRM/OpenCRX/Odoo) depends on correct tenant URLs/credentials. The code includes **configurable adapters** and **integration tests with stubs**.

---

## MVP Functional Requirements

### MVP_FR1 — Manage salesman master data (create + read)
- Backend:
  - `POST /api/v1/salesmen` (HR) → `backend/src/controllers/salesmen.controller.js`
  - `GET /api/v1/salesmen` (HR/CEO)
  - `GET /api/v1/salesmen/:employeeId` (HR/CEO/self)
  - Mongo model: `backend/src/models/salesman.model.js`
- Frontend (planned/expected):
  - HR view: salesman create form + list

### MVP_FR2 — Manage social performance records (create + read) + computed bonus per record
- Backend:
  - `POST /api/v1/performance/social` (HR) → `backend/src/controllers/social-performance.controller.js`
  - `GET /api/v1/performance/social/:employeeId` (HR/CEO/self)
  - Computation: `backend/src/services/bonus.service.js` (`computeSocialRecordBonus`)
  - Mongo model: `backend/src/models/social-performance.model.js`

---

## MUST Requirements (good grading)

### M_FR1 — Compute + display total bonus automatically
- Backend:
  - Total computation: `backend/src/services/bonus.service.js` (`computeTotals`)
  - `POST /api/v1/bonus/:employeeId/compute` (CEO)
  - `GET /api/v1/bonus/:employeeId` (HR/CEO/self)
  - Persisted computation: `backend/src/models/bonus-computation.model.js`
- Cockpit convenience:
  - Consolidated views: `/api/v1/salesmen/consolidated` and `/api/v1/salesmen/:employeeId/consolidated`

### M_FR2 — Remarks stored for a single salesman
- Backend:
  - `POST /api/v1/bonus/:employeeId/remarks`
  - Stored in `BonusComputation.remarks`

### M_FR3 — Store total bonus in OrangeHRM
- Backend:
  - Trigger: `POST /api/v1/bonus/:employeeId/approve/hr`
  - Integration adapter: `backend/src/services/orangehrm.service.js` (`storeTotalBonus`)
  - Config via `.env` (see `.env.example`)

### M_FR4 — CEO involved for fetching data + approving bonus
- Backend:
  - Role enforcement via JWT + RBAC (`backend/src/middleware/*`)
  - `POST /api/v1/bonus/:employeeId/compute` requires role **CEO**
  - `POST /api/v1/bonus/:employeeId/approve/ceo` requires role **CEO**

### M_FR5 — Master data should be read from OrangeHRM
- Backend:
  - `POST /api/v1/salesmen/:employeeId/sync` (HR/CEO)
  - Adapter: `backend/src/services/orangehrm.service.js` (`fetchSalesmanMasterData`)

---

## COULD Requirements (advanced)

### C_FR1/C_FR2 — Orders evaluation + total bonus based on orders
- Backend:
  - `GET /api/v1/orders/:employeeId?refresh=true` to fetch and cache from OpenCRX
  - `backend/src/services/opencrx.service.js` (fetchOrders)
  - `backend/src/services/bonus.service.js` (`computeOrderRecordBonus`, `computeOrdersTotal`)

### C_FR3 — Store combined total bonus in OrangeHRM
- Implemented the storage call on HR approval; since total bonus already includes social+orders totals, this is covered by:
  - `POST /api/v1/bonus/:employeeId/approve/hr`

### C_FR4 — Fetch order details from OpenCRX
- Backend adapter supports mapping:
  - productName, clientName, clientRanking, closingProbability, itemsCount, revenueEur
  - See `backend/src/services/opencrx.service.js`

### C_FR5 — CEO + HR involved in approval
- `POST /api/v1/bonus/:employeeId/approve/ceo`
- `POST /api/v1/bonus/:employeeId/approve/hr`

### C_FR6 — Salesman sees bonus computation at the end
- Backend:
  - `GET /api/v1/bonus/:employeeId` allowed for self
  - `POST /api/v1/bonus/:employeeId/release` (HR) to release
- Frontend:
  - Salesman dashboard should show computation once released

### C_FR7 — Persistently store computations and allow retrieval later
- Mongo model: `backend/src/models/bonus-computation.model.js`
- History endpoint: `GET /api/v1/bonus/:employeeId/history`

### C_FR8/C_FR9 — Qualifications created by CEO, stored (optionally OrangeHRM), visible to salesman
- Backend:
  - `POST /api/v1/qualifications/:employeeId` (CEO)
  - `GET /api/v1/qualifications/:employeeId` (HR/CEO/self)
  - Model: `backend/src/models/qualification.model.js`
  - Best-effort OrangeHRM: `OrangeHRMService.storeQualification`

---

## NICE-TO-HAVE Requirements

### N_FR1 — Secure login + authorization (role model)
- Backend:
  - JWT login: `POST /api/v1/auth/login`
  - Middleware: `backend/src/middleware/auth.middleware.js`, `roles.middleware.js`
  - Model: `backend/src/models/user.model.js`
  - Seeded demo users: `backend/src/seed.js`

### N_FR2 — Workflow prototype in Camunda
- BPMN model:
  - `workflow/bonusApproval.bpmn` (process key `bonusApproval`)
- Optional backend endpoints:
  - `POST /api/v1/workflow/bonus/:employeeId/start`
  - `GET /api/v1/workflow/process/:processInstanceId/tasks`
  - `POST /api/v1/workflow/tasks/:taskId/complete`

### N_FR3 — Bonus charts for all salesmen
- Backend:
  - `GET /api/v1/statistics/bonus` → `backend/src/controllers/statistics.controller.js`
- Frontend:
  - Should render Chart.js from endpoint data

### N_FR4 — Salesman confirms bonus in the end
- Backend:
  - `POST /api/v1/bonus/:employeeId/confirm`

### N_FR5 — HR can alter target/actual values of social performance criteria
- Backend:
  - `PATCH /api/v1/performance/social/records/:recordId`

### N_FR6 — Odoo employees from Vaculon LLP
- Backend:
  - `GET /api/v1/odoo/employees` (if Odoo configured)
  - Adapter: `backend/src/services/odoo.service.js`
- Architecture + Postman test: see `docs/ODOO_INTEGRATION.md`

---

## Technical Requirements

### TR1 — Node.js backend (JavaScript / TypeScript)
- Backend implemented in Node.js + Express:
  - `backend/src/app.js`, `backend/src/server.js`

### TR2 — MongoDB database
- Mongoose connection: `backend/src/db/mongoose.js`
- Models in `backend/src/models/*`
- Seed data: `backend/src/seed.js`

### TR3 — REST with Express + Swagger/OpenAPI + linting
- Express routes: `backend/src/routes/*`
- OpenAPI: `backend/openapi/openapi.yaml`
- Swagger UI: `/api-docs`

### TR4 — Integrate OrangeHRM + OpenCRX
- Adapters:
  - `backend/src/services/orangehrm.service.js`
  - `backend/src/services/opencrx.service.js`

### TR5 — Odoo architectural integration (+ Postman test)
- Adapter: `backend/src/services/odoo.service.js`
- Endpoint: `GET /api/v1/odoo/employees`
- Documentation: `docs/ODOO_INTEGRATION.md`

### TR6 — UI in Angular (or Postman minimal)
- Frontend is Angular in `frontend/`
- Postman can be used for minimal demo as fallback

### TR7 — GitLab
- Not possible to push from ChatGPT environment; see `docs/RUNBOOK.md` for steps.

### TR8 — Integration tests
- Mocha tests:
  - `backend/test/dependencies.test.js`
  - `backend/test/bonus.service.test.js`

### TR9 — Camunda workflow
- BPMN file: `workflow/bonusApproval.bpmn`
- Backend helper endpoints: `backend/src/services/camunda.service.js`
- Docker compose includes Camunda container.

### TR10 — Automatic bonus calculation
- Implemented in `backend/src/services/bonus.service.js`.
