# Backend API Documentation

> Express.js REST API for the HighPerformance bonus calculation system

[![Node](https://img.shields.io/badge/Node.js-18+-green.svg)]()
[![Express](https://img.shields.io/badge/Express-4.x-lightgrey.svg)]()
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-green.svg)]()
[![Tests](https://img.shields.io/badge/tests-16%2B%20passing-brightgreen.svg)]()

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Quick Start](#quick-start)
3. [Architecture](#architecture)
4. [Project Structure](#project-structure)
5. [Configuration](#configuration)
6. [API Reference](#api-reference)
7. [Data Models](#data-models)
8. [Services](#services)
9. [Testing](#testing)
10. [Performance](#performance)
11. [Troubleshooting](#troubleshooting)

---

## 🎯 Overview

The backend is a Node.js Express REST API that provides:

- **Authentication**: JWT-based with role-based access control
- **Bonus Calculation**: Automated computation from performance data
- **Workflow Orchestration**: Camunda BPM integration
- **Enterprise Integration**: OrangeHRM, OpenCRX, Odoo connectors
- **Performance**: Caching layer with Redis support
- **Audit Trail**: Comprehensive logging system

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- npm 9+
- Docker & Docker Compose (for MongoDB + Camunda)

### Installation & Startup

```bash
# 1. Start infrastructure
docker-compose up -d

# 2. Install dependencies
cd backend
npm install

# 3. Seed database with demo data
npm run seed

# 4. Start development server
npm run dev

# API available at:
# - REST API: http://localhost:3000/api/v1
# - API Docs: http://localhost:3000/api-docs
```

### Demo Credentials

After seeding, use these credentials to test:

| Role | Username | Password |
|------|----------|----------|
| CEO | `ceo` | `Ceo123!` |
| HR | `hr` | `Hr123!` |
| Salesman | `salesman01` | `password123` |

### Stop Services

```bash
docker-compose down
```

---

## 🏗️ Architecture

### System Diagram

```
┌─────────────────────────────────────────────────┐
│           Frontend (Angular :4200)              │
└──────────────────┬──────────────────────────────┘
                   │ HTTP + Bearer Token
                   ▼
┌─────────────────────────────────────────────────┐
│      Express.js REST API (:3000/api/v1)         │
│                                                  │
│  ┌────────────────────────────────────────┐    │
│  │         Middleware Stack               │    │
│  │  • CORS                                │    │
│  │  • Body Parser                         │    │
│  │  • JWT Validation                      │    │
│  │  • Request Logging                     │    │
│  │  • Error Handling                      │    │
│  └────────────────────────────────────────┘    │
│                   ↓                              │
│  ┌────────────────────────────────────────┐    │
│  │            Route Layer                 │    │
│  │  /auth, /salesmen, /bonus,             │    │
│  │  /performance, /statistics             │    │
│  └────────────────────────────────────────┘    │
│                   ↓                              │
│  ┌────────────────────────────────────────┐    │
│  │         Controller Layer               │    │
│  │  • Input validation                    │    │
│  │  • Request handling                    │    │
│  │  • Response formatting                 │    │
│  └────────────────────────────────────────┘    │
│                   ↓                              │
│  ┌────────────────────────────────────────┐    │
│  │          Service Layer                 │    │
│  │  • Business logic                      │    │
│  │  • Data processing                     │    │
│  │  • External integrations               │    │
│  │  • Caching                             │    │
│  └────────────────────────────────────────┘    │
│                   ↓                              │
│  ┌────────────────────────────────────────┐    │
│  │           Model Layer                  │    │
│  │  • Mongoose schemas                    │    │
│  │  • Data validation                     │    │
│  │  • Database operations                 │    │
│  └────────────────────────────────────────┘    │
└──────────────────┬──────────────────────────────┘
                   │
      ┌────────────┼────────────┐
      ▼            ▼            ▼
┌──────────┐ ┌─────────┐ ┌──────────────┐
│ MongoDB  │ │ Camunda │ │  External    │
│  :27017  │ │  :8080  │ │  Systems     │
│          │ │         │ │ • OrangeHRM  │
│ • Users  │ │ • BPMN  │ │ • OpenCRX    │
│ • Bonus  │ │ • Tasks │ │ • Odoo       │
└──────────┘ └─────────┘ └──────────────┘
```

### Request Flow

```
1. HTTP Request → Express
2. CORS Middleware → Validates origin
3. Body Parser → Parses JSON
4. Auth Middleware → Validates JWT token
5. Route Handler → Matches endpoint
6. Controller → Validates input
7. Service → Executes business logic
8. Model → Queries database
9. Service → Processes data
10. Controller → Formats response
11. HTTP Response → Client
```

---

## 📁 Project Structure

```
backend/
│
├── src/
│   ├── app.js                         # Express app setup
│   ├── server.js                      # Server entry point
│   ├── seed.js                        # Database seeding
│   │
│   ├── config/
│   │   ├── env.js                     # Environment variables
│   │   └── logger.js                  # Winston logger config
│   │
│   ├── controllers/                   # HTTP request handlers
│   │   ├── auth.controller.js         # Login/logout
│   │   ├── bonus.controller.js        # Bonus CRUD & approval
│   │   ├── salesmen.controller.js     # Employee management
│   │   ├── performance.controller.js  # Performance records
│   │   ├── orders.controller.js       # Order evaluations
│   │   ├── statistics.controller.js   # Analytics
│   │   ├── workflow.controller.js     # Camunda workflows
│   │   └── qualifications.controller.js
│   │
│   ├── services/                      # Business logic
│   │   ├── auth.service.js            # JWT & password hashing
│   │   ├── bonus.service.js           # Bonus calculations
│   │   ├── cache.service.js           # Cache abstraction
│   │   ├── orangehrm.service.js       # OrangeHRM integration
│   │   ├── opencrx.service.js         # OpenCRX integration
│   │   ├── odoo.service.js            # Odoo integration
│   │   ├── camunda.service.js         # Workflow engine
│   │   └── health-check.service.js    # Service health
│   │
│   ├── models/                        # MongoDB schemas
│   │   ├── user.model.js
│   │   ├── salesman.model.js
│   │   ├── social-performance.model.js
│   │   ├── order-evaluation.model.js
│   │   ├── bonus-computation.model.js
│   │   └── qualification.model.js
│   │
│   ├── routes/                        # API route definitions
│   │   ├── auth.routes.js
│   │   ├── bonus.routes.js
│   │   ├── salesmen.routes.js
│   │   ├── performance.routes.js
│   │   └── ...
│   │
│   ├── middleware/
│   │   ├── auth.middleware.js         # JWT validation
│   │   ├── roles.middleware.js        # RBAC enforcement
│   │   └── logging.middleware.js      # Request logging
│   │
│   ├── db/
│   │   └── mongoose.js                # MongoDB connection
│   │
│   └── data/                          # Seed data
│       ├── salesmen.js
│       └── performance.js
│
├── test/                              # Test suite
│   ├── bonus.service.test.js
│   ├── dependencies.test.js
│   └── integration/
│       └── workflow.test.js
│
├── openapi/
│   └── openapi.yaml                   # Swagger/OpenAPI spec
│
├── scripts/
│   ├── seed-users.js                  # User management
│   └── benchmark-bonus.js             # Performance testing
│
├── logs/                              # Application logs
│   ├── app.log
│   ├── error.log
│   └── debug.log
│
├── package.json
├── .env.example                       # Environment template
└── README.md                          # This file
```

---

## ⚙️ Configuration

### Environment Variables

Create `.env` file based on `.env.example`:

```bash
# ==========================================
# Application
# ==========================================
NODE_ENV=development
PORT=3000

# ==========================================
# Security
# ==========================================
JWT_SECRET=very_long_random_secret_key
JWT_EXPIRES_IN=24h

# ==========================================
# Database
# ==========================================
MONGODB_URI=mongodb://localhost:27017/highperformance
MONGODB_OPTIONS={"useNewUrlParser":true,"useUnifiedTopology":true}

# ==========================================
# Caching
# ==========================================
BONUS_CACHE_TTL_MS=3600000
CACHE_USE_REDIS=false
REDIS_URL=redis://localhost:6379

# ==========================================
# OrangeHRM Integration
# ==========================================
ORANGEHRM_BASE_URL=https://orangehrm.example.com
ORANGEHRM_USERNAME=admin
ORANGEHRM_PASSWORD=secure_password
ORANGEHRM_API_KEY=optional_api_key

# ==========================================
# OpenCRX Integration
# ==========================================
OPENCRX_BASE_URL=https://opencrx.example.com
OPENCRX_USERNAME=admin
OPENCRX_PASSWORD=secure_password
OPENCRX_SEGMENT=Standard

# ==========================================
# Odoo Integration (Optional)
# ==========================================
ODOO_BASE_URL=https://odoo.example.com
ODOO_DB=production
ODOO_USERNAME=admin
ODOO_PASSWORD=secure_password

# ==========================================
# Camunda BPM
# ==========================================
CAMUNDA_URL=http://localhost:8080/engine-rest
CAMUNDA_AUTH_USER=demo
CAMUNDA_AUTH_PASSWORD=demo

# ==========================================
# Logging
# ==========================================
LOG_LEVEL=info
LOG_FILE_PATH=logs/app.log
LOG_ERROR_PATH=logs/error.log
```

### Database Setup

```bash
# Start MongoDB container
docker-compose up -d mongo

# Verify connection
mongosh mongodb://localhost:27017/highperformance

# Seed database
npm run seed

# Inspect database
npm run inspect-db
```

---

## 📡 API Reference

### Base URL

```
http://localhost:3000/api/v1
```

### Authentication

All protected endpoints require JWT token in Authorization header:

```http
Authorization: Bearer <jwt_token>
```

---

### Auth Endpoints

#### Login

```http
POST /api/v1/auth/login
Content-Type: application/json

Request:
{
  "username": "ceo",
  "password": "Ceo123!"
}

Response: 200 OK
{
  "success": true,
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
{
  "success": true,
  "message": "Logged out successfully"
}
```

---

### Salesmen Endpoints

#### List All Salesmen

```http
GET /api/v1/salesmen
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": "SALES001",
      "employeeId": "E1001",
      "firstName": "John",
      "lastName": "Doe",
      "email": "john.doe@company.com",
      "department": "Sales",
      "hireDate": "2023-01-15T00:00:00.000Z"
    }
  ],
  "count": 1
}
```

#### Get Salesman by ID

```http
GET /api/v1/salesmen/:id
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "SALES001",
    "employeeId": "E1001",
    "firstName": "John",
    "lastName": "Doe",
    "email": "john.doe@company.com"
  }
}
```

#### Create Salesman

```http
POST /api/v1/salesmen
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "employeeId": "E1005",
  "firstName": "Jane",
  "lastName": "Smith",
  "email": "jane.smith@company.com",
  "department": "Sales",
  "hireDate": "2024-01-01"
}

Response: 201 Created
{
  "success": true,
  "data": { /* created salesman */ },
  "message": "Salesman created successfully"
}
```

#### Get Consolidated View

```http
GET /api/v1/salesmen/consolidated?year=2024
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "salesman": { /* salesman data */ },
      "year": 2024,
      "socialRecords": [ /* performance records */ ],
      "orderRecords": [ /* order evaluations */ ],
      "socialTotalEur": 5000,
      "ordersTotalEur": 3000,
      "totalBonusEur": 8000,
      "approvalStatus": "ceo_approved"
    }
  ]
}
```

---

### Bonus Endpoints

#### Compute Bonus

```http
POST /api/v1/bonus/compute
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "employeeId": "E1001",
  "year": 2024
}

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "bonus_123",
    "employeeId": "E1001",
    "year": 2024,
    "socialTotalEur": 5000,
    "ordersTotalEur": 3000,
    "totalBonusEur": 8000,
    "status": "computed",
    "breakdown": {
      "socialPerformance": { /* details */ },
      "orderCommissions": { /* details */ }
    }
  },
  "message": "Bonus computed successfully"
}
```

#### CEO Approval

```http
POST /api/v1/bonus/:bonusId/approve/ceo
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "approvedAmount": 8000,
  "remarks": "Approved for excellent performance"
}

Response: 200 OK
{
  "success": true,
  "data": {
    /* bonus with ceoApproval field populated */
    "status": "ceo_approved",
    "ceoApproval": {
      "approvedAt": "2024-02-11T10:00:00.000Z",
      "approvedAmount": 8000,
      "remarks": "Approved for excellent performance"
    }
  },
  "message": "Bonus approved by CEO"
}
```

#### HR Approval

```http
POST /api/v1/bonus/:bonusId/approve/hr
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    /* bonus with hrApproval field populated */
    "status": "hr_approved",
    "hrApproval": {
      "approvedAt": "2024-02-11T11:00:00.000Z",
      "releasedAt": "2024-02-11T11:00:00.000Z"
    }
  },
  "message": "Bonus approved by HR and synced to OrangeHRM"
}
```

#### Get Bonus History

```http
GET /api/v1/bonus/:employeeId/history
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "year": 2024,
      "totalBonusEur": 8000,
      "status": "hr_approved",
      "computedAt": "2024-02-10T09:00:00.000Z"
    },
    {
      "year": 2023,
      "totalBonusEur": 7500,
      "status": "completed"
    }
  ]
}
```

---

### Performance Endpoints

#### Create Social Performance Record

```http
POST /api/v1/performance/social
Authorization: Bearer <token>
Content-Type: application/json

Request:
{
  "salesmanEmployeeId": "E1001",
  "year": 2024,
  "records": [
    {
      "goalId": "goal_001",
      "description": "Sales Target Achievement",
      "score": 4.5,
      "weight": 30
    },
    {
      "goalId": "goal_002",
      "description": "Customer Satisfaction",
      "score": 4.0,
      "weight": 20
    }
  ],
  "remarks": "Strong performance overall"
}

Response: 201 Created
{
  "success": true,
  "data": { /* created record */ },
  "message": "Social performance record created"
}
```

#### Get Performance Records

```http
GET /api/v1/performance/social/:employeeId?year=2024
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": [ /* performance records */ ]
}
```

---

### Statistics Endpoints

#### Get System Statistics

```http
GET /api/v1/statistics
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "totalSalesmen": 10,
    "totalBonusComputed": 15,
    "totalBonusAmount": 120000,
    "averageBonusPerSalesman": 12000,
    "approvalRate": {
      "ceoApproved": 90,
      "hrApproved": 85
    },
    "byDepartment": [
      {
        "department": "Sales",
        "count": 8,
        "totalBonus": 96000
      }
    ]
  }
}
```

---

### Health Check

```http
GET /api/v1/health
Authorization: Bearer <token>

Response: 200 OK
{
  "success": true,
  "data": {
    "services": {
      "orangehrm": {
        "available": true,
        "status": "CONFIGURED",
        "latency": 45
      },
      "opencrx": {
        "available": true,
        "status": "CONFIGURED",
        "latency": 32
      },
      "mongodb": {
        "available": true,
        "status": "CONNECTED"
      },
      "camunda": {
        "available": true,
        "status": "CONFIGURED"
      }
    },
    "overall": "HEALTHY"
  }
}
```

---

## 📊 Data Models

### User

```javascript
{
  _id: ObjectId,
  username: String (unique, required),
  email: String (unique),
  password: String (hashed, required),
  role: String (enum: ['ceo', 'hr', 'salesman', 'admin']),
  active: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

---

### Salesman

```javascript
{
  _id: ObjectId,
  employeeId: String (unique, required),
  firstName: String (required),
  lastName: String (required),
  email: String,
  department: String,
  hireDate: Date,
  supervisor: String,
  orangeHrmId: String,
  active: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

---

### SocialPerformanceRecord

```javascript
{
  _id: ObjectId,
  salesmanEmployeeId: String (required),
  year: Number (required),
  records: [{
    goalId: String,
    description: String,
    score: Number (min: 1, max: 5),
    weight: Number (min: 0, max: 100)
  }],
  totalScore: Number,
  remarks: String,
  createdBy: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: `{ salesmanEmployeeId: 1, year: 1 }`

---

### OrderEvaluation

```javascript
{
  _id: ObjectId,
  salesmanEmployeeId: String (required),
  orderId: String (required),
  year: Number,
  orderValue: Number,
  commissionRate: Number (min: 0, max: 100),
  commissionAmount: Number,
  productCategory: String,
  clientRating: Number,
  bonusMultiplier: Number (default: 1),
  remarks: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: `{ salesmanEmployeeId: 1, year: 1 }`

---

### BonusComputation

```javascript
{
  _id: ObjectId,
  employeeId: String (required),
  year: Number (required),
  socialTotalEur: Number (default: 0),
  ordersTotalEur: Number (default: 0),
  totalBonusEur: Number (default: 0),
  status: String (enum: ['computed', 'ceo_approved', 'hr_approved', 'released', 'completed']),
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
  
  breakdown: {
    socialPerformance: Object,
    orderCommissions: Object
  },
  
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes**: `{ employeeId: 1, year: 1 }` (unique)

---

### Qualification

```javascript
{
  _id: ObjectId,
  salesmanEmployeeId: String (required),
  qualificationType: String,
  description: String,
  issuedDate: Date,
  expiryDate: Date,
  certifyingBody: String,
  active: Boolean (default: true),
  createdAt: Date,
  updatedAt: Date
}
```

---

## 🔧 Services

### Authentication Service

**File**: `src/services/auth.service.js`

**Responsibilities**:
- User authentication
- JWT token generation & validation
- Password hashing with bcrypt
- Session management

**Key Functions**:
```javascript
authenticateUser(username, password) → { user, token }
generateToken(user) → string
verifyToken(token) → decoded payload
hashPassword(password) → hashed string
comparePassword(password, hash) → boolean
```

---

### Bonus Service

**File**: `src/services/bonus.service.js`

**Responsibilities**:
- Bonus calculation logic
- Caching computed bonuses
- Breakdown generation
- Performance aggregation

**Key Functions**:
```javascript
computeBonus(employeeId, year) → BonusComputation
computeTotalsAsync(employeeId, year) → { social, orders, total }
calculateSocialBonus(records) → number
calculateOrdersBonus(orders) → number
invalidateCache(employeeId, year) → void
```

**Performance**:
- Cold compute: ~9ms
- Cached compute: ~3.8ms
- Cache TTL: Configurable via `BONUS_CACHE_TTL_MS`

---

### Cache Service

**File**: `src/services/cache.service.js`

**Responsibilities**:
- In-memory caching (default)
- Redis support (optional)
- Cache invalidation
- TTL management

**Key Functions**:
```javascript
get(key) → value | null
set(key, value, ttl) → void
delete(key) → void
clear() → void
```

**Configuration**:
```bash
# Use in-memory cache (default)
CACHE_USE_REDIS=false

# Use Redis
CACHE_USE_REDIS=true
REDIS_URL=redis://localhost:6379
```

---

### OrangeHRM Service

**File**: `src/services/orangehrm.service.js`

**Responsibilities**:
- Fetch employee master data
- Store computed bonuses
- Sync qualifications
- Validate employee records

**Key Functions**:
```javascript
getEmployee(employeeId) → Employee
storeBonus(bonusData) → boolean
syncQualification(qualData) → boolean
validateEmployee(employeeId) → boolean
```

**Configuration**:
```bash
ORANGEHRM_BASE_URL=https://orangehrm.company.com
ORANGEHRM_USERNAME=admin
ORANGEHRM_PASSWORD=password
```

---

### OpenCRX Service

**File**: `src/services/opencrx.service.js`

**Responsibilities**:
- Retrieve sales orders
- Get product/client data
- Calculate commissions
- Filter by date range

**Key Functions**:
```javascript
getOrders(salesmanId, year) → Order[]
getOrderDetails(orderId) → OrderDetails
calculateCommission(orderValue, rate) → number
getProducts() → Product[]
```

---

### Camunda Service

**File**: `src/services/camunda.service.js`

**Responsibilities**:
- Start workflow instances
- Query process tasks
- Complete tasks
- Get workflow status

**Key Functions**:
```javascript
startWorkflow(processKey, variables) → processInstanceId
getTasks(processInstanceId) → Task[]
completeTask(taskId, variables) → boolean
getProcessStatus(processInstanceId) → status
```

**BPMN**: See `workflow/bonusApproval.bpmn`

---

### Health Check Service

**File**: `src/services/health-check.service.js`

**Responsibilities**:
- Verify external service availability
- Check database connectivity
- Report service health
- Measure latency

**Key Functions**:
```javascript
checkAllServices() → HealthReport
checkOrangeHRM() → ServiceHealth
checkOpenCRX() → ServiceHealth
checkMongoDB() → ServiceHealth
checkCamunda() → ServiceHealth
```

---

## 🧪 Testing

### Run Tests

```bash
# Run all tests
npm test

# Expected: 16+ passing tests
```

### Test Structure

**Unit Tests**: Test individual functions and services
**Integration Tests**: Test API endpoints with real database
**E2E Tests**: Test complete workflows (optional)

### Integration Tests

```bash
# Set environment variable
$env:RUN_INTEGRATION = 'true'

# Run tests
npm test

# Requirements:
# - MongoDB running
# - External services accessible (or mocked)
```

### Test Prerequisites

Before running tests locally:

1. **Install dependencies**: `npm install`
2. **Start MongoDB**: `docker-compose up -d mongo`
3. **Run tests**: `npm test`

**Expected**: All unit tests pass (~16+)

**For integration tests**:
```bash
$env:RUN_INTEGRATION = 'true'
npm test
```

Requires MongoDB and optionally external service stubs.

---

### Coverage Report

```bash
npm test -- --coverage

# View HTML report
open coverage/lcov-report/index.html
```

### Performance Benchmarks

```bash
node scripts/benchmark-bonus.js

# Output:
# Bonus computation (cold): ~9ms
# Bonus computation (cached): ~3.8ms
# Cache hit rate: 95%
```

---

## ⚡ Performance

### Optimizations Implemented

✅ **Caching Layer**:
- In-memory bonus computation cache
- Configurable TTL (default: 1 hour)
- Redis support for distributed caching

✅ **Database Optimization**:
- Indexed frequently queried fields
- Lean queries for read-only operations
- Connection pooling with Mongoose
- Parallelized independent queries

✅ **Async Operations**:
- Non-blocking I/O with async/await
- Promise.all for parallel queries
- Streaming for large datasets

✅ **Code Optimization**:
- Memoized expensive computations
- Lazy loading of heavy modules
- Efficient data structures

### Performance Metrics

| Metric | Current | Target |
|--------|---------|--------|
| Bonus Computation (cold) | ~9ms | <50ms |
| Bonus Computation (cached) | ~3.8ms | <10ms |
| API Response Time (p95) | <100ms | <200ms |
| Database Query (avg) | <50ms | <100ms |
| Concurrent Requests | 100+ | 50+ |

### Monitoring

**Logging**: Winston logger with file rotation
**Metrics**: Request duration tracking
**Health**: Service availability checks

---

## 🐛 Troubleshooting

### Startup Issues

**MongoDB connection error**:
```bash
# Check if MongoDB is running
docker-compose ps

# View MongoDB logs
docker-compose logs mongo

# Restart MongoDB
docker-compose restart mongo
```

**Port 3000 already in use**:
```bash
# Find process
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
PORT=3001 npm run dev
```

**Module not found**:
```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

---

### Runtime Issues

**JWT token invalid**:
- Check `JWT_SECRET` is set correctly
- Verify token hasn't expired
- Check token format: `Bearer <token>`

**Bonus computation slow**:
- Enable caching: Check `BONUS_CACHE_TTL_MS`
- Consider Redis: Set `CACHE_USE_REDIS=true`
- Review database indexes

**OrangeHRM integration failing**:
- Verify credentials in `.env`
- Check network connectivity
- Review logs: `tail -f logs/error.log`
- Test endpoint manually

**Workflow not starting**:
- Ensure Camunda is running: `docker-compose ps`
- Check Camunda URL: `http://localhost:8080`
- Verify BPMN is deployed
- Check logs: `docker-compose logs camunda`

---

### Debugging

**Enable debug logs**:
```bash
DEBUG=* npm run dev
```

**View logs**:
```bash
# Application logs
tail -f logs/app.log

# Error logs only
tail -f logs/error.log

# All logs
tail -f logs/*.log
```

**Inspect database**:
```bash
# Using provided script
npm run inspect-db

# Or manually
mongosh mongodb://localhost:27017/highperformance
```

**Test API endpoints**:
```bash
# Using curl
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"ceo","password":"Ceo123!"}'

# Or use Swagger UI
open http://localhost:3000/api-docs
```

---

## 📚 Best Practices

### Code Style

✅ **DO**:
- Use async/await instead of callbacks
- Handle all errors with try-catch
- Use lean() for read-only MongoDB queries
- Log important operations
- Validate input data

❌ **DON'T**:
- Use synchronous operations in routes
- Expose sensitive errors to clients
- Skip input validation
- Hard-code configuration values
- Leave console.log statements

---

### Adding New Endpoints

1. **Create Model** (if needed): `src/models/my-model.js`
2. **Create Service**: `src/services/my-service.js`
3. **Create Controller**: `src/controllers/my-controller.js`
4. **Create Routes**: `src/routes/my-routes.js`
5. **Register Routes**: Add to `src/app.js`
6. **Add Tests**: `test/my-feature.test.js`
7. **Update OpenAPI**: `openapi/openapi.yaml`

---

### Security Guidelines

✅ **Always**:
- Validate and sanitize input
- Use parameterized queries
- Hash passwords with bcrypt
- Use HTTPS in production
- Implement rate limiting
- Log security events

❌ **Never**:
- Store passwords in plain text
- Trust client input
- Expose stack traces
- Use weak JWT secrets
- Skip authentication

---

## 🔗 Additional Resources

- [Express.js Documentation](https://expressjs.com/)
- [Mongoose Documentation](https://mongoosejs.com/)
- [JWT.io](https://jwt.io/)
- [Camunda BPM Docs](https://docs.camunda.org/)


---

**Last Updated**: February 11, 2026  
**Node Version**: 18+  
**Status**: ✅ Production Ready  
**Vulnerabilities**: ✅ 0  
**Test Coverage**: 85%+  
**API Version**: v1
