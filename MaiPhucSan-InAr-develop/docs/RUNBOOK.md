# Runbook (Local Demo)

## 1) Start MongoDB + Camunda
From repository root:

```bash
docker compose up -d
```

- MongoDB: `mongodb://localhost:27017`
- Camunda: `http://localhost:8080` (Cockpit / Tasklist / Admin)

## 2) Backend
```bash
cd backend
npm install
cp ../.env.example .env   # adjust if needed
npm run seed
npm run dev
```

Backend:
- API: `http://localhost:3000/api/v1`
- Swagger UI: `http://localhost:3000/api-docs`

### Demo users (seed)
- CEO: `ceo / ceo123`
- HR: `hr / hr123`
- Salesman: `sales1 / sales123` (employeeId: E1001)

## 3) Frontend
```bash
cd frontend
npm install
npm start
```

Frontend: `http://localhost:4200`

> If you cannot fix Angular build issues in time, you can still demo the REST API with Postman (allowed for good/satisfactory).

---

## 4) Camunda workflow deployment (TR9)
The BPMN file is at:

- `workflow/bonusApproval.bpmn` (process definition key: `bonusApproval`)

Deployment options:
1. Use **Camunda Modeler** to deploy the BPMN to the running engine.
2. Or use REST deployment (e.g., curl) to `/engine-rest/deployment/create` (multipart upload).

After deployment you can start a process either:
- from Camunda Cockpit, or
- via backend endpoint:
  - `POST /api/v1/workflow/bonus/:employeeId/start`

---

## 5) Typical demo flow (10–20 minutes)
1. Login as HR:
   - create salesman or sync from OrangeHRM
   - create social performance records / edit target+actual (N_FR5)
2. (Optional) refresh orders from OpenCRX:
   - `GET /orders/:employeeId?refresh=true`
3. Login as CEO:
   - compute bonus
   - approve CEO
4. Login as HR:
   - approve HR → stores bonus in OrangeHRM (best-effort)
   - release to salesman
5. Login as salesman:
   - view final computation
   - confirm (N_FR4)
6. Show chart view (N_FR3):
   - bonuses for all salesmen

---

## 6) What you still must do manually
- **Push to GitLab (TR7)** and provide the repository URL.
- Configure and validate **OrangeHRM/OpenCRX** endpoints and credentials for your tenant.
- Create the final **one PDF documentation** (AR1–AR12).
