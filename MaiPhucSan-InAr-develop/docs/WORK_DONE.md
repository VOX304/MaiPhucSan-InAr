# Work Done (Assignment 5.2-3)

This document explains the concrete changes made to transform the original ZIP
into a single, clean project that matches the **UI Integration & Integration
Testing** tasks.

## 1. Repository Clean-up

The original ZIP contained multiple unrelated assignment folders, IDE metadata,
build artifacts and vendored dependencies (e.g., `node_modules/`, `target/`).

To align the codebase with the current assignment, the repository was reduced
to one coherent monorepo structure:

```
MaiPhucSan-InAr/
├── backend/
└── frontend/
```

### Removed / Excluded as redundant

- `node_modules/` folders (should never be committed / shipped)
- Java Maven artifacts: `target/`, `pom.xml`, and the incomplete Java skeleton
- Older assignment folders (assignment-2/4/5) that were not needed for 5.2-3

## 2. Backend (Node.js / Express)

### What was implemented

- A clean Express app split into:
  - `src/app.js` (express app, no port binding)
  - `src/server.js` (entrypoint that binds the port)
- REST endpoints needed by the UI:
  - `GET /api/v1/salesmen` (list)
  - `GET /api/v1/salesmen/consolidated` (salesmen + performance + computed bonus)
  - `GET /api/v1/bonus/:employeeId` (bonus computation, supports `?year=`)
  - `GET /api/v1/salesmen/:id/performance` (performance records)
  - `GET /api/v1/integration/health` (reachability of OrangeHRM/OpenCRX/MongoDB)
- Bonus computation in `src/services/bonus.service.js` with a documented, deterministic formula.
- Dependency wrappers:
  - `OrangeHRMService` (`src/services/orangehrm.service.js`)
  - `OpenCRXService` (`src/services/opencrx.service.js`)
  - `MongoService` (`src/services/mongo.service.js`)

These wrappers are intentionally small, because their main purpose in this assignment is:

1) define a **clean integration boundary**
2) enable **stubbing** in tests (Task 3)

### Documentation

- OpenAPI spec updated: `backend/openapi/openapi.yaml`
- Swagger UI enabled at `/api-docs`

## 3. Frontend (Angular)

### Implemented UI flow

- `/welcome`: start page with instructions
- `/login`: demo login page
- `/dashboard`: tabbed dashboard (protected by a route guard)
  - CEO tab: employee id input + bonus result (table)
  - Salesman tab: list of performance records (list + details)
  - HR tab: employee directory + integration health overview

### Backend integration

- The Angular UI uses `ApiService` to call backend endpoints.
- Dev proxy (`proxy.conf.json`) routes `/api/*` to the backend.

### Sample-data fallback

The CEO view displays deterministic sample data if the backend is offline to support the recommended top-down UI development approach.

## 4. Integration Tests (Sinon + Chai + Mocha)

Tests are located in:

- `backend/test/integration/dependencies.test.js`

They provide separate `describe(...)` sections for:

- OrangeHRM: online/offline
- OpenCRX: online/offline
- MongoDB: online/offline

All external calls are stubbed, so no real OrangeHRM/OpenCRX/MongoDB instances are required.

## 5. How to Run

See the root `README.md`.
