# HighPerformance - Performance Cockpit

**A comprehensive bonus calculation, approval, and performance management system for salesmen with real-time dashboards and enterprise integrations.**

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [System Architecture](#system-architecture)
3. [Project Structure](#project-structure)
4. [Key Features](#key-features)
5. [Vulnerabilities & Security](#vulnerabilities--security)
6. [Requirements & Implementation](#requirements--implementation)
7. [Development & Testing](#development--testing)
8. [Integrations](#integrations)
9. [Deployment](#deployment)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start (5 minutes)

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- npm 9+

### Setup & Run

```bash
# 1. Start infrastructure (MongoDB + Camunda)
docker-compose up -d

# 2. Backend (Terminal 1)
cd backend
npm install
npm run seed
npm run dev
# API: http://localhost:3000/api/v1
# Swagger: http://localhost:3000/api-docs

# 3. Frontend (Terminal 2)
cd frontend
npm install
npm start
# Frontend: http://localhost:4200

# 4. Demo Credentials
# CEO:      ceo / Ceo123!
# HR:       hr / Hr123!
# Salesman: salesman01 / password123
```

### Stop Services
```bash
docker-compose down
```

---

## 🏗️ System Architecture

```
Users (Browser)
    ↓ HTTP + JWT Token
Angular Frontend (20.3.16) :4200
    ↓ [Services + Interceptor]
Express Backend :3000/api/v1
    ↓ [Controllers → Services → Models]
MongoDB + Camunda BPM
    ↓
External Systems
    ├─ OrangeHRM (employee data, bonus storage)
    ├─ OpenCRX (sales orders)
    ├─ Odoo (employee data)
    └─ Camunda (workflow orchestration)
```

### Technology Stack

**Frontend:**
- Angular 20.3.16 with TypeScript
- Angular Material Design
- Chart.js for visualizations
- RxJS for reactive patterns

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose ODM
- JWT authentication & RBAC
- Camunda BPM for workflows
- REST + Swagger/OpenAPI

**Infrastructure:**
- Docker & Docker Compose
- MongoDB container
- Camunda BPM container

---

## 📁 Project Structure

```
root/
├── backend/                        # Node.js Express backend
│   ├── README.md                   # Backend documentation
│   ├── src/
│   │   ├── app.js                  # Express app setup
│   │   ├── server.js               # Server entry point
│   │   ├── config/                 # Configuration
│   │   ├── controllers/            # Request handlers
│   │   ├── services/               # Business logic & integrations
│   │   ├── models/                 # MongoDB schemas
│   │   ├── routes/                 # API routes
│   │   ├── middleware/             # Auth & logging
│   │   └── db/                     # Database connection
│   ├── test/                       # Mocha integration tests
│   ├── scripts/                    # Seeding & utilities
│   ├── openapi/                    # Swagger/OpenAPI spec
│   ├── package.json
│   └── package-lock.json
│
├── frontend/                       # Angular frontend
│   ├── README.md                   # Frontend documentation
│   ├── src/
│   │   ├── app/
│   │   │   ├── components/         # Reusable components
│   │   │   ├── services/           # Business logic
│   │   │   ├── models/             # TypeScript interfaces
│   │   │   ├── interceptors/       # HTTP interceptors
│   │   │   └── guards/             # Route guards
│   │   ├── index.html
│   │   ├── main.ts
│   │   └── styles.css
│   ├── package.json
│   └── package-lock.json
│
├── workflow/                       # Camunda BPMN workflows
│   └── bonusApproval.bpmn         # Bonus approval workflow
│
├── docs/                           # Additional documentation
│   ├── REQUIREMENTS_TRACEABILITY.md
│   ├── ODOO_INTEGRATION.md
│   └── RUNBOOK.md
│
├── docker-compose.yml              # Infrastructure setup
├── .env.example                    # Environment template
└── README.md                       # This file
```

---

## ✨ Key Features

### For Salesmen
- **Dashboard**: View personal performance metrics and bonus calculations
- **Performance Tracking**: See social performance scores and order evaluations
- **Bonus Visibility**: View computed bonus with breakdown by social/orders
- **Approval Status**: Track CEO/HR approvals in real-time

### For HR
- **Employee Management**: Create and manage salesman master data
- **Performance Records**: Create and edit social performance records
- **Qualification Management**: Define and store qualifications
- **Approval Workflow**: Review and approve CEO decisions
- **Statistics**: View dashboards and charts for all salesmen

### For CEO
- **Bonus Computation**: Compute bonuses based on performance records
- **Approval Process**: Review and approve bonuses with remarks
- **Data Oversight**: See consolidated view of all employees
- **Remarks Management**: Add notes to bonus computations
- **Workflow Control**: Drive approval workflow forward

### System Features
- **Automatic Calculation**: Bonus computed from social performance + orders
- **Real-time Dashboards**: Charts and statistics update live
- **Workflow Automation**: Camunda BPMN-based approval processes
- **Enterprise Integration**: OrangeHRM, OpenCRX, Odoo connectors
- **Secure Authentication**: JWT-based with role-based access control
- **Persistent Storage**: All computations archived for audit trail
- **Comprehensive Logging**: File-based audit logs for all operations
- **Performance Optimized**: In-memory caching, Redis-ready, parallelized queries

---

## 🔒 Vulnerabilities & Security

### Current Status
- **Backend**: ✅ **0 vulnerabilities** (all npm dependencies audited and secure)
- **Frontend**: ✅ **0 vulnerabilities** (Angular 20.3.16 with secure dependencies)

### Security Features
1. **JWT Authentication**: Secure token-based authentication
2. **Role-Based Access Control (RBAC)**: Three roles (CEO, HR, SALESMAN) with granular permissions
3. **HTTP-only Cookies**: Tokens stored securely
4. **Input Validation**: All endpoints validate request data
5. **Error Handling**: Sensitive errors not exposed to clients
6. **Logging**: Comprehensive audit trail of all operations
7. **HTTPS Ready**: Production deployment should use HTTPS + WAF

---

## 📋 Requirements & Implementation

### MVP Requirements ✅ (Satisfactory)
- [x] Salesman master data management (create/read)
- [x] Social performance evaluation records (CRUD)
- [x] Per-record bonus computation
- [x] Total bonus auto-computed and displayed
- [x] Remarks added to computations
- [x] CEO involved in approval
- [x] Data stored in MongoDB

### MUST Requirements ✅ (Good)
- [x] Total bonus stored in OrangeHRM
- [x] Master data read from OrangeHRM
- [x] CEO approval workflow
- [x] Persistent storage & history
- [x] Automatic calculations

### COULD Requirements ⚠️ (Advanced Features)
- [x] Orders evaluation with bonus
- [x] OpenCRX integration for orders
- [x] HR + CEO approval workflow
- [x] Salesman sees computation
- [x] Qualifications management
- [x] Charts & statistics

### NICE-TO-HAVE Requirements 🎯 (3/6 Implemented)
- [x] **N_FR1**: Secure login + authorization (JWT + RBAC)
- [x] **N_FR2**: Camunda workflow automation
- [x] **N_FR3**: Charts/statistics visualization
- [ ] N_FR4: Salesman confirm bonus
- [ ] N_FR5: HR alter target/actual values
- [ ] N_FR6: Odoo employee display

### Technical Requirements ✅
- [x] **TR1**: Node.js backend (JavaScript/TypeScript)
- [x] **TR2**: MongoDB database
- [x] **TR3**: REST + Express + Swagger/OpenAPI
- [x] **TR4**: OrangeHRM integration
- [x] **TR5**: OpenCRX integration  
- [x] **TR6**: Angular frontend UI
- [x] **TR7**: Git repository
- [x] **TR8**: Integration tests (Mocha/Chai/Supertest)
- [x] **TR9**: Camunda workflow
- [x] **TR10**: Automatic bonus calculation

**Overall Implementation: ~85-90% COMPLETE**

---

## 🧪 Development & Testing

### Backend Tests
```bash
cd backend
npm test
# Expect: 16+ passing tests
```

### Frontend Build
```bash
cd frontend
npm run build
# Output: production-ready bundle (~1.11 MB)
```

### Integration E2E Testing
```bash
cd backend
SET RUN_INTEGRATION=true
npm test
# Full integration suite with real services
```

### Performance Benchmarking
```bash
cd backend
node scripts/benchmark-bonus.js
# Measure compute time with/without caching
```

---

## 🔗 Integrations

### OrangeHRM Integration
- **Purpose**: Employee master data source, bonus storage
- **Endpoints**: 
  - Fetch employee: `GET /api/v1/integration/orangehrm/employees/:id`
  - Store bonus: `POST /api/v1/integration/orangehrm/bonus`
- **Config**: Set `ORANGEHRM_*` env vars

### OpenCRX Integration
- **Purpose**: Sales orders and commission data
- **Endpoints**: 
  - Fetch orders: `GET /api/v1/integration/opencrx/orders/:id`
  - Get products: `GET /api/v1/integration/opencrx/products`
- **Config**: Set `OPENCRX_*` env vars

### Odoo Integration
- **Purpose**: Employee data alternative source
- **Endpoints**: Fetch employees: `GET /api/v1/odoo/employees`
- **Config**: Set `ODOO_*` env vars
- **Details**: See docs/ODOO_INTEGRATION.md

### Camunda Workflow
- **Purpose**: Bonus approval workflow automation
- **BPMN**: `workflow/bonusApproval.bpmn`
- **Endpoints**:
  - Start workflow: `POST /api/v1/workflow/bonus/:employeeId/start`
  - Get tasks: `GET /api/v1/workflow/process/:processInstanceId/tasks`
  - Complete task: `POST /api/v1/workflow/tasks/:taskId/complete`

---

## 🚢 Deployment

### Environment Configuration
Create a `.env` file based on `.env.example`:

```bash
# Database
MONGODB_URI=mongodb://localhost:27017/highperformance

# JWT
JWT_SECRET=your_very_long_random_secret_here

# Cache
BONUS_CACHE_TTL_MS=3600000

# OrangeHRM
ORANGEHRM_BASE_URL=https://orangehrm.yourcompany.com
ORANGEHRM_USERNAME=admin
ORANGEHRM_PASSWORD=password

# OpenCRX
OPENCRX_BASE_URL=https://opencrx.yourcompany.com
OPENCRX_USERNAME=admin
OPENCRX_PASSWORD=password

# Odoo (optional)
ODOO_BASE_URL=https://odoo.yourcompany.com
ODOO_DB=your_db
ODOO_USERNAME=admin
ODOO_PASSWORD=password

# Camunda
CAMUNDA_URL=http://localhost:8080/engine-rest
```

### Production Deployment Checklist
- [ ] Environment variables configured
- [ ] HTTPS enabled
- [ ] WAF (Web Application Firewall) enabled
- [ ] CSP (Content Security Policy) headers set
- [ ] Tests passing
- [ ] Build successful
- [ ] Database backed up
- [ ] Log aggregation configured
- [ ] Error monitoring integrated

---

## 🐛 Troubleshooting

### Backend Issues

**Module not found**
```bash
cd backend && rm -rf node_modules package-lock.json && npm install
```

**MongoDB connection error**
```bash
docker-compose ps  # Check if containers running
docker-compose logs mongo  # View MongoDB logs
```

**Port 3000 already in use**
```bash
lsof -i :3000  # Find process on port 3000
kill -9 <PID>
```

### Frontend Issues

**Angular build error**
```bash
cd frontend && npm run build -- --configuration development
```

**Port 4200 already in use**
```bash
ng serve --port 4201
```

### General

**Can't login**
- Verify credentials: ceo / Ceo123!, hr / Hr123!, salesman01 / password123
- Check backend: http://localhost:3000/api-docs
- Check database has seed data: `npm run seed`

**No data appears**
- Reset database: `docker-compose down -v && docker-compose up -d && npm run seed`
- Check logs: `tail -f backend/logs/app.log`

---

## 📊 Performance Optimizations (Feb 2026)
- ✅ In-memory caching for bonus computations (configurable TTL)
- ✅ Redis-capable cache service (Redis support via env toggle)
- ✅ Parallelized database queries in salesmen controller
- ✅ Async/cached compute function for repeated calculations
- ✅ Benchmark script to measure optimization impact
- ✅ Error boundary component for frontend resilience
- ✅ Loading states on all data-fetching components
- ✅ Health check service for integration verification

### Performance Metrics
- Frontend production bundle: ~1.11 MB
- Bonus computation (cold): ~9ms
- Bonus computation (cached): ~3.8ms
- API response time: < 100ms (with cache)

---

## 📚 Documentation

- **[Backend README](backend/README.md)**: API reference, data models, integration services
- **[Frontend README](frontend/README.md)**: Components, services, development patterns
- **[Requirements Traceability](docs/REQUIREMENTS_TRACEABILITY.md)**: FR/TR mapping
- **[Runbook](docs/RUNBOOK.md)**: Local demo walkthrough
- **[Odoo Integration](docs/ODOO_INTEGRATION.md)**: OdooERP details

### Interactive API Documentation
Swagger/OpenAPI available at: `http://localhost:3000/api-docs`

---

## 🎯 Development Workflow

### Common Tasks

**Start Development**
```bash
# Terminal 1
cd backend && npm run dev

# Terminal 2
cd frontend && npm start

# Terminal 3
docker-compose up -d
```

**Build for Production**
```bash
cd frontend && npm run build
```

**Reset Database**
```bash
docker-compose down -v
docker-compose up -d
cd backend && npm run seed
```

---

## 📝 Version History

- **v1.0** (Feb 2026): Initial release with MVP + MUST + COULD features
- **v0.9**: Performance optimizations, caching, async compute
- **v0.8**: Integration tests, logging, health checks
- **v0.7**: Angular 20 upgrade, monorepo restructure, vulnerabilities fixed
- **v0.1**: Initial setup

---

## 📄 License

Internal Use Only - HighPerformance Project  
VNU - University of Engineering and Technology, 2026

---

**Last Updated**: February 10, 2026  
**Status**: 🟢 ACTIVE  
**Vulnerabilities**: ✅ 0  
**Tests**: ✅ 16+ Passing
