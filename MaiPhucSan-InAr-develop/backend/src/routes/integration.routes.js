const router = require('express').Router();
const ctrl = require('../controllers/integration.controller');

/**
 * Dependency health endpoint.
 *
 * Example: GET /api/v1/integration/health
 */
router.get('/integration/health', ctrl.getDependenciesHealth);

module.exports = router;
