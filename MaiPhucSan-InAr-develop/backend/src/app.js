/**
 * Express application (no listening here).
 *
 * This file is intentionally separated from `server.js` so it can be imported
 * from tests and other tooling without binding a TCP port.
 */
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const path = require('path');
const YAML = require('yamljs');
const swaggerUi = require('swagger-ui-express');

const env = require('./config/env');
const logger = require('./config/logger');
const loggingMiddleware = require('./middleware/logging.middleware');

const app = express();

// Middlewares
app.use(
  cors({
    origin: env.corsOrigin,
    credentials: true
  })
);
app.use(express.json());
app.use(morgan('dev'));
// Application logging middleware (records requests/responses)
app.use(loggingMiddleware);

// Health check (internal)
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// Full health check that verifies integration services
app.get('/api/v1/health-check', async (_req, res) => {
  try {
    const hc = require('./services/health-check.service');
    const status = await hc.healthCheck();
    res.json(status);
  } catch (err) {
    logger.error('Health-check failed', err);
    res.status(500).json({ error: 'Health-check failed', details: err.message });
  }
});

// Routes
const authRoutes = require('./routes/auth.routes');
const salesmenRoutes = require('./routes/salesmen.routes');
const performanceRoutes = require('./routes/performance.routes');
const ordersRoutes = require('./routes/orders.routes');
const bonusRoutes = require('./routes/bonus.routes');
const qualificationsRoutes = require('./routes/qualifications.routes');
const statisticsRoutes = require('./routes/statistics.routes');
const workflowRoutes = require('./routes/workflow.routes');
const odooRoutes = require('./routes/odoo.routes');
const integrationRoutes = require('./routes/integration.routes');

// Convenience discovery endpoints (BEFORE route mounting to take precedence)
app.get('/api/v1', (_req, res) => {
  res.json({ status: 'ok', docs: '/api-docs', openapi: '/openapi.json' });
});

app.get('/', (_req, res) => {
  res.redirect('/api/v1');
});

// Mount versioned API routes
app.use('/api/v1', authRoutes);
app.use('/api/v1', salesmenRoutes);
app.use('/api/v1', performanceRoutes);
app.use('/api/v1', ordersRoutes);
app.use('/api/v1', bonusRoutes);
app.use('/api/v1', qualificationsRoutes);
app.use('/api/v1', statisticsRoutes);
app.use('/api/v1', workflowRoutes);
app.use('/api/v1', odooRoutes);
app.use('/api/v1', integrationRoutes);

// Swagger UI (OpenAPI)
const openapiPath = path.join(__dirname, '..', 'openapi', 'openapi.yaml');
const swaggerDocument = YAML.load(openapiPath);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

// Convenience endpoints for tooling
app.get('/openapi.yaml', (req, res) => res.sendFile(openapiPath));
app.get('/openapi.json', (_req, res) => res.json(swaggerDocument));

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Not Found', path: req.originalUrl });
});

// Error handler
app.use((err, _req, res) => {
  logger.error('Unhandled error', err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal Server Error' });
});

module.exports = app;
