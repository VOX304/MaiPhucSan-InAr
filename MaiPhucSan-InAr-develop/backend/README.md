# Backend API Documentation

> Complete backend development guide including setup, architecture, API reference, and testing.

---

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [API Reference](#api-reference)
6. [Data Models](#data-models)
7. [Services & Integrations](#services--integrations)
8. [Testing](#testing)
9. [Performance](#performance)
10. [Troubleshooting](#troubleshooting)

---

## 🚀 Quick Start

### Local Development Setup

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Backend setup
cd backend
npm install

# 3. Seed database
npm run seed

# 4. Start development server
npm run dev
# API: http://localhost:3000/api/v1
# Swagger: http://localhost:3000/api-docs

# 5. Demo credentials (from seed)
# CEO:      ceo / Ceo123!
# HR:       hr / Hr123!
# Salesman: salesman01 / password123
```

### Stop Services
```bash
docker-compose down
```

---

## 🏗️ Architecture

### System Diagram

```
┌──────────────────────────────────────────────────────┐
│               Frontend (Angular)                     │
│         http://localhost:4200                        │
└────────────────────┬─────────────────────────────────┘
                     │ HTTP + Bearer Token
                     │
┌────────────────────▼─────────────────────────────────┐
│          Backend (Express.js) - Node.js              │
│         http://localhost:3000/api/v1                 │
│                                                       │
│  ┌──────────────────────────────────────────────┐   │
│  │        Route Handlers / Controllers          │   │
│  │  - auth.controller.js                        │   │
│  │  - salesmen.controller.js                    │   │
│  │  - performance.controller.js                 │   │
│  │  - bonus.controller.js                       │   │
│  │  - orders.controller.js                      │   │
│  │  - workflow.controller.js                    │   │
│  │  - statistics.controller.js                  │   │
│  └──────────────────────────────────────────────┘   │
│                     ↓                                 │
│  ┌──────────────────────────────────────────────┐   │
│  │    Business Logic & Integration Services     │   │
│  │  - auth.service.js                           │   │
│  │  - bonus.service.js (with caching)          │   │
│  │  - cache.service.js (Redis-capable)         │   │
│  │  - orangehrm.service.js                      │   │
│  │  - opencrx.service.js                        │   │
│  │  - odoo.service.js                           │   │
│  │  - camunda.service.js                        │   │
│  │  - health-check.service.js                   │   │
│  └──────────────────────────────────────────────┘   │
│                     ↓                                 │
│  ┌──────────────────────────────────────────────┐   │
│  │           Data Layer (Models)                │   │
│  │  - User, Salesman, SocialPerformanceRecord   │   │
│  │  - Order, Qualification, BonusComputation    │   │
│  │  - OrderEvaluation, SocialPerformanceModel   │   │
│  └──────────────────────────────────────────────┘   │
└────────────────────┬─────────────────────────────────┘
                     │
        ┌────────────┼────────────┐
        │            │            │
     ┌──▼──┐    ┌────▼────┐   ┌──▼──────────┐
     │MongoDB   │  Camunda │   │External Sys │
     │ (Data)   │(Workflow)    │(OrangeHRM,  │
     └─────┘    └─────────┘    │ OpenCRX)    │
                                └─────────────┘
```

### Directory Structure

```
backend/
├── src/
│   ├── app.js                      # Express app setup
│   ├── server.js                   # Server entry point
│   ├── seed.js                     # Database seeding
│   │
│   ├── config/
│   │   ├── env.js                  # Environment configuration
│   │   └── logger.js               # Structured logging
│   │
│   ├── controllers/                # HTTP request handlers
│   │   ├── auth.controller.js      # Authentication
│   │   ├── bonus.controller.js     # Bonus computation & approval
│   │   ├── salesmen.controller.js  # Salesman management
│   │   ├── performance.controller.js
│   │   ├── orders.controller.js
│   │   ├── statistics.controller.js
│   │   ├── workflow.controller.js
│   │   ├── qualifications.controller.js
│   │   └── ...
│   │
│   ├── services/                   # Business logic
│   │   ├── auth.service.js         # JWT & authentication
│   │   ├── bonus.service.js        # Bonus calculations (with cache)
│   │   ├── cache.service.js        # Cache abstraction (Redis-capable)
│   │   ├── orangehrm.service.js    # OrangeHRM integration
│   │   ├── opencrx.service.js      # OpenCRX integration
│   │   ├── odoo.service.js         # Odoo integration
│   │   ├── camunda.service.js      # Workflow orchestration
│   │   ├── health-check.service.js # Integration health checks
│   │   └── ...
│   │
│   ├── models/                     # MongoDB schemas
│   │   ├── user.model.js
│   │   ├── salesman.model.js
│   │   ├── social-performance.model.js
│   │   ├── order-evaluation.model.js
│   │   ├── bonus-computation.model.js
│   │   ├── qualification.model.js
│   │   └── ...
│   │
│   ├── routes/                     # API route definitions
│   │   ├── auth.routes.js
│   │   ├── bonus.routes.js
│   │   ├── salesmen.routes.js
│   │   ├── performance.routes.js
│   │   ├── orders.routes.js
│   │   └── ...
│   │
│   ├── middleware/                 # HTTP middleware
│   │   ├── auth.middleware.js      # JWT validation
│   │   ├── roles.middleware.js     # Role-based access
│   │   └── logging.middleware.js   # HTTP request logging
│   │
│   ├── db/
│   │   └── mongoose.js             # MongoDB connection
│   │
│   └── data/
│       ├── salesmen.js             # Seed data
│       └── performance.js          # Seed data
│
├── test/                           # Test suite
│   ├── bonus.service.test.js
│   ├── dependencies.test.js
│   └── integration/
│       └── workflow.test.js
│
├── openapi/
│   └── openapi.yaml                # Swagger specification
│
├── scripts/
│   ├── seed-users.js               # User management
│   └── benchmark-bonus.js          # Performance benchmarking
│
├── logs/                           # Runtime logs
│   ├── app.log                     # Application logs
│   ├── error.log                   # Error logs
│   └── debug.log                   # Debug logs
│
├── package.json
└── .env.example
```

---

## 📦 Installation

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB (via Docker)

### Install Dependencies

```bash
cd backend
npm install
```

### Verify Installation

```bash
npm list | head -20  # Show top-level packages
npm audit            # Check for vulnerabilities
```

---

## ⚙️ Configuration

### Environment Variables

Create a `.env` file (copy from `.env.example`):

```bash
# Application
NODE_ENV=development
PORT=3000
JWT_SECRET=your_very_long_random_secret_key_here

# Database
MONGODB_URI=mongodb://localhost:27017/highperformance

# Cache
BONUS_CACHE_TTL_MS=3600000
CACHE_USE_REDIS=false
REDIS_URL=redis://localhost:6379

# OrangeHRM
ORANGEHRM_BASE_URL=https://orangehrm.example.com
ORANGEHRM_USERNAME=admin
ORANGEHRM_PASSWORD=password

# OpenCRX
OPENCRX_BASE_URL=https://opencrx.example.com
OPENCRX_USERNAME=admin
OPENCRX_PASSWORD=password

# Odoo (optional)
ODOO_BASE_URL=https://odoo.example.com
ODOO_DB=production
ODOO_USERNAME=admin
ODOO_PASSWORD=password

# Camunda
CAMUNDA_URL=http://localhost:8080/engine-rest

# Logging
LOG_LEVEL=info
```

### Database Setup

```bash
# Start MongoDB (if using Docker)
docker-compose up -d mongo

# Seed with demo data
npm run seed

# Inspect database
npm run inspect-db
```

---

## 📡 API Reference

### Authentication

#### Login
```http
POST /api/v1/auth/login
Content-Type: application/json

{
  "username": "ceo",
  "password": "Ceo123!"
}

Response: 200 OK
{
  "data": {
    "id": "user_123",
    "username": "ceo",
    "role": "ceo",
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Login successful"
}
```

#### Logout
```http
POST /api/v1/auth/logout
Authorization: Bearer <token>

Response: 200 OK
{ "message": "Logged out successfully" }
```

### Salesmen Management

#### List Salesmen
```http
GET /api/v1/salesmen
Authorization: Bearer <token>

Response: 200 OK
{
  "data": [
    {
      "id": "SALES001",
      "employeeId": "E1001",
      "firstName": "John",
      "lastName": "Doe",
      "department": "Sales"
    }
  ]
}
```

#### Get Consolidated View (Salesmen + Performance + Bonus)
```http
GET /api/v1/salesmen/consolidated?year=2024
Authorization: Bearer <token>

Response: 200 OK
{
  "data": [
    {
      "salesman": { ...salesman data... },
      "year": 2024,
      "socialRecords": [...],
      "orderRecords": [...],
      "socialTotalEur": 5000,
      "ordersTotalEur": 3000,
      "totalBonusEur": 8000
    }
  ]
}
```

### Bonus Management

#### Compute Bonus
```http
POST /api/v1/bonus/compute
Authorization: Bearer <token>
Content-Type: application/json

{
  "employeeId": "E1001",
  "year": 2024
}

Response: 200 OK
{
  "data": {
    "id": "bonus_123",
    "employeeId": "E1001",
    "year": 2024,
    "socialTotal": 5000,
    "ordersTotal": 3000,
    "totalBonus": 8000,
    "status": "computed"
  }
}
```

#### CEO Approval
```http
POST /api/v1/bonus/:bonusId/approve/ceo
Authorization: Bearer <token>
Content-Type: application/json

{
  "approvedAmount": 8000,
  "remarks": "Approved for payout"
}

Response: 200 OK
{
  "data": { ...bonus data with ceoApproval... },
  "message": "Approved by CEO"
}
```

#### HR Approval
```http
POST /api/v1/bonus/:bonusId/approve/hr
Authorization: Bearer <token>

Response: 200 OK
{
  "data": { ...bonus data with hrApproval... },
  "message": "Approved by HR, synced to OrangeHRM"
}
```

### Performance Records

#### Create Social Performance Record
```http
POST /api/v1/performance/social
Authorization: Bearer <token>
Content-Type: application/json

{
  "salesmanEmployeeId": "E1001",
  "year": 2024,
  "records": [
    { "goalId": "goal_1", "description": "Sales Target", "score": 4.5 },
    { "goalId": "goal_2", "description": "Customer Service", "score": 4.0 }
  ]
}

Response: 201 Created
{ "data": { ...record... }, "message": "Created" }
```

#### Get Bonus History
```http
GET /api/v1/bonus/:employeeId/history
Authorization: Bearer <token>

Response: 200 OK
{
  "data": [
    { "year": 2024, "total": 8000, "status": "completed" },
    { "year": 2023, "total": 7500, "status": "completed" }
  ]
}
```

### Health & Status

#### Health Check
```http
GET /api/v1/health
Authorization: Bearer <token>

Response: 200 OK
{
  "services": {
    "orangehrm": { "available": true, "status": "CONFIGURED" },
    "opencrx": { "available": true, "status": "CONFIGURED" },
    "mongodb": { "available": true, "status": "CONNECTED" },
    "camunda": { "available": true, "status": "CONFIGURED" }
  },
  "overall": "HEALTHY"
}
```

---

## 📊 Data Models

### User
```javascript
{
  _id: ObjectId,
  username: String (unique),
  email: String,
  password: String (hashed),
  role: 'ceo' | 'hr' | 'salesman' | 'admin',
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Salesman
```javascript
{
  _id: ObjectId,
  employeeId: String (unique),
  firstName: String,
  lastName: String,
  email: String,
  department: String,
  hireDate: Date,
  supervisor: String,
  orangeHrmId: String,
  createdAt: Date,
  updatedAt: Date
}
```

### SocialPerformanceRecord
```javascript
{
  _id: ObjectId,
  salesmanEmployeeId: String,
  year: Number,
  records: [{
    goalId: String,
    description: String,
    score: Number (1-5),
    weight: Number
  }],
  totalScore: Number,
  remarks: String,
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

### BonusComputation
```javascript
{
  _id: ObjectId,
  employeeId: String,
  year: Number,
  socialTotalEur: Number,
  ordersTotalEur: Number,
  totalBonusEur: Number,
  status: 'computed' | 'ceo_approved' | 'hr_approved' | 'released' | 'completed',
  remarks: String,
  ceoApproval: {
    approvedAt: Date,
    approvedAmount: Number,
    remarks: String
  },
  hrApproval: {
    approvedAt: Date,
    releasedAt: Date
  },
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔗 Services & Integrations

### Authentication Service
- JWT token generation and validation
- Password hashing with bcrypt
- Role-based access control
- User session management

### Bonus Service
- **In-Memory Caching**: Reduces recomputation of bonuses
- **Cache TTL**: Configurable via `BONUS_CACHE_TTL_MS` env var
- **Async Compute**: `computeTotalsAsync()` function for cached computation
- **Performance**: ~3.8ms cached vs ~9ms uncached

### Cache Service
- In-memory caching by default
- Redis support (toggle via `CACHE_USE_REDIS` env var)
- Configurable TTL and LRU eviction

### OrangeHRM Integration
- Fetch employee master data
- Store computed bonuses
- Store qualifications
- Validate employee records

### OpenCRX Integration
- Fetch sales orders
- Get product/client data
- Calculate order-based commissions
- Filter by salesman and date range

### Odoo Integration
- Fetch employee records
- Query HR module
- Alternative employee data source

### Camunda Integration
- Start workflow instances
- Query process tasks
- Complete workflow tasks
- Get workflow status

### Health Check Service
- Verify all external systems reachable
- Check database connectivity
- Report service status
- Endpoint: `GET /api/v1/health`

---

## 🧪 Testing

### Run Tests
```bash
npm test
# Expect: 16+ passing tests
```

### Integration Tests
```bash
SET RUN_INTEGRATION=true
npm test
# Full suite with real services (requires Docker containers running)
```

### Test Coverage
```bash
npm test -- --coverage
```

### Performance Benchmark
```bash
node scripts/benchmark-bonus.js
# Outputs compute time with/without caching
```

### Test Structure
- **Unit Tests**: Service logic (bonus calculations, auth)
- **Integration Tests**: API endpoints with mocked services
- **E2E Tests**: Full workflow scenarios (optional, skipped by default)

---

## ⚡ Performance

### Optimizations Implemented
- ✅ In-memory caching of bonus computations
- ✅ Redis-capable cache service
- ✅ Parallelized database queries (Promise.all)
- ✅ Async/await for non-blocking I/O
- ✅ Lean MongoDB queries (no unnecessary fields)
- ✅ Connection pooling with Mongoose
- ✅ Benchmark script for measurement

### Performance Metrics
- **Bonus Computation**: ~9ms (cold), ~3.8ms (cached)
- **Database Queries**: < 50ms average
- **API Response**: < 100ms p95

### Monitoring
- Logging middleware tracks request duration
- Health check endpoint verifies integrations
- Error logs for debugging issues

---

## 🐛 Troubleshooting

### Startup Issues

**Module not found**
```bash
npm install
```

**MongoDB connection error**
```bash
docker-compose up -d mongo
docker-compose logs mongo
```

**Port 3000 already in use**
```bash
lsof -i :3000
kill -9 <PID>
```

### Runtime Issues

**Bonus computation slow**
- Check cache settings: `BONUS_CACHE_TTL_MS`
- Consider enabling Redis: `CACHE_USE_REDIS=true`
- Review database indexes

**OrangeHRM integration failing**
- Verify credentials in `.env`
- Check network connectivity
- Review logs in `logs/error.log`

**Workflow not starting**
- Ensure Camunda is running: `docker-compose up -d camunda`
- Check Camunda URL: `http://localhost:8080`
- Verify BPMN deployed

### Debugging

**View logs**
```bash
tail -f logs/app.log
tail -f logs/error.log
```

**Inspect database**
```bash
npm run inspect-db
```

**Run with debug**
```bash
DEBUG=* npm run dev
```

---

## 📝 Development Tips

### Code Style
- Use async/await instead of callbacks
- Lean queries in MongoDB (use .lean() for read-only)
- Error handling in all services
- Consistent error response format

### Adding New Endpoints

1. Create controller method in `controllers/`
2. Add route in `routes/`
3. Add service logic in `services/`
4. Add model if needed in `models/`
5. Add tests in `test/`
6. Update OpenAPI spec in `openapi/openapi.yaml`

### Performance Tips
- Use caching for frequently computed data
- Parallelize independent DB queries
- Use lean() for read-only MongoDB queries
- Index frequently queried fields

---

**Last Updated**: February 10, 2026  
**Version**: 1.0  
**Status**: ✅ Production Ready  
**Vulnerabilities**: ✅ 0
