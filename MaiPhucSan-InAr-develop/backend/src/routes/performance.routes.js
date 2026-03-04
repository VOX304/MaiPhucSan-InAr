const router = require('express').Router();
const ctrl = require('../controllers/social-performance.controller');
const { authRequired } = require('../middleware/auth.middleware');
const { requireRole, allowSelfOrRoles } = require('../middleware/roles.middleware');
const { validateObjectId, validateEmployeeId } = require('../middleware/params.middleware');

router.use(authRequired);

// IMPORTANT: /records/:recordId must be declared BEFORE /:employeeId param
// is registered, otherwise Express matches the literal 'records' as employeeId.
router.param('recordId', validateObjectId);

// Patch record (N_FR5) — registered before employeeId param to avoid collision
router.patch('/performance/social/records/:recordId', requireRole('HR'), ctrl.patch);

// Register employeeId param validator only after the records route is defined
router.param('employeeId', validateEmployeeId);

// List records for a salesman
router.get(
  '/performance/social/:employeeId',
  allowSelfOrRoles('employeeId', 'CEO', 'HR'),
  ctrl.listForSalesman
);

// Create record
router.post('/performance/social', requireRole('CEO', 'HR'), ctrl.create);

module.exports = router;
