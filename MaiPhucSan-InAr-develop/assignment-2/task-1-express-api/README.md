
# Assignment 2.1 – Task 1-b,c: First version of a REST API

Express.js REST API for administering **salesmen** and their **social performance records**. 
Data is hard-coded at this stage (no DB).

## Quick start
```bash
cd task-1-express-api
npm install
npm start
# Server -> http://localhost:3000
# Swagger -> http://localhost:3000/api-docs
```
If you use IntelliJ (Ultimate 2024), you can also create a new project with the *Express* generator and then copy the `src`, `openapi`, and `postman` folders here.

## Endpoints (see also OpenAPI)
- `GET /api/v1/salesmen` – list (filter with `?q=`)
- `GET /api/v1/salesmen/:id` – details
- `POST /api/v1/salesmen` – create
- `PUT /api/v1/salesmen/:id` – update
- `DELETE /api/v1/salesmen/:id` – delete
- `GET /api/v1/performance` – list; filter with `?salesmanId=&year=`
- `POST /api/v1/performance` – create (one record per `salesmanId+year`)
- `PUT /api/v1/performance/:id` – update
- `DELETE /api/v1/performance/:id` – delete
- `GET /api/v1/salesmen/:id/performance` – list by salesman

## Postman
Import `postman/Assignment_2_Task_1.postman_collection.json` and run the **Roundtrip** folder as a Runner.
