
# Assignment 2 — Deliverables (Mapping to Tasks)

This repo contains everything needed for the submission & demo.

## Where is what?
```
assignment-2/
├─ task-1-express-api/                         # ← 2.1-b (Express REST API) and 2.1-c (Postman)
│  ├─ src/                                     # ← 2.1-b source code
│  ├─ openapi/openapi.yaml                     # ← 2.1-b OpenAPI (high-level spec)
│  ├─ postman/Assignment_2_Task_1.postman_collection.json   # ← 2.1-c round-trip tests
│  ├─ docs/2.1-a-interface-mapping.md          # ← 2.1-a table-based mapping from 1.2 → REST
│  └─ README.md
└─ task-2-rest-inspection/                     # ← Assignment 2.2
   ├─ postman/Assignment_2_Task_2.postman_collection.json   # ← 2.2-a Postman (GET-only)
   ├─ postman/SEPP.postman_environment.json    # ← 2.2-a environment + auth variables
   ├─ diagrams/orangehrm_opencrx_ooa.puml      # ← 2.2-b OOA class diagram (UML, PlantUML)
   ├─ diagrams/auth_orangehrm_seq.puml         # ← 2.2-c OAuth2 (Bearer) sequence (OrangeHRM)
   ├─ diagrams/auth_opencrx_seq.puml           # ← 2.2-c Basic auth sequence (OpenCRX)
   └─ README.md
```

## GitHub structure (recommended)
- `main` branch, repo root is `assignment-2/` (as above).
- Each subfolder has its own `README.md` with **Run/Import** instructions.
- Add a root `.gitignore` (Node + Postman artifacts) and a `LICENSE` if required by course policy.
- Tag a release for the submission, e.g. `v1.0-assignment-2`.

### Suggested .gitignore (Node)
```
# global
.DS_Store
Thumbs.db

# Node
node_modules/
npm-debug.log*
dist/
coverage/

# misc
.env
*.iml
.idea/
.vscode/
```

## How to run Task 2.1 locally
```bash
cd assignment-2/task-1-express-api
npm install
npm start
# Server: http://localhost:3000   Swagger: http://localhost:3000/api-docs
```

## How to demo Task 2.2 (SEPP systems)
- Import `task-2-rest-inspection/postman/SEPP.postman_environment.json`
- Import `task-2-rest-inspection/postman/Assignment_2_Task_2.postman_collection.json`
- OrangeHRM: run “OAuth – Issue Token”, then “Employees – Search (GET)”
- OpenCRX: run “Accounts – All (GET)” (Basic auth guest/guest), optional “Account – by UID (GET)”
```
