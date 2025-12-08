
/* Express app for Assignment 2.1 (Task 1-b,c)
 * REST API for Salesmen and Social Performance records (in-memory, hard-coded).
 * Start: npm install && npm start
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');
const { connect } = require('./db/mongo');
const externalRoutes = require('./routes/external.routes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
const salesmenRoutes = require('./routes/salesmen.routes');
const performanceRoutes = require('./routes/performance.routes');
app.use('/api/v1', salesmenRoutes);
app.use('/api/v1', performanceRoutes);
app.use('/api/v1/external', externalRoutes);

// Swagger UI (OpenAPI)
const openapiPath = path.join(__dirname, '..', 'openapi', 'openapi.yaml');
const swaggerDocument = YAML.load(openapiPath);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Health check
app.get('/health', (_req, res) => res.json({status: 'ok'}));

// 404 handler
app.use((req, res, next) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

connect()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server listening on http://localhost:${PORT}`);
      console.log(`Swagger UI on        http://localhost:${PORT}/api-docs`);
    });
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB', err);
    process.exit(1);
  });