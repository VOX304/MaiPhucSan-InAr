const router = require('express').Router();
const ctrl = require('../controllers/social-performance.controller');
const { authRequired } = require('../middleware/auth.middleware');
const { requireRole, allowSelfOrRoles } = require('../middleware/roles.middleware');

router.use(authRequired);

// List records for a salesman (CEO/HR or the salesman himself)
router.get(
  '/performance/social/:employeeId',
  allowSelfOrRoles('employeeId', 'CEO', 'HR'),
  ctrl.listForSalesman
);

// Create record (HR)
router.post('/performance/social', requireRole('HR'), ctrl.create);

// Update target/actual/etc (HR) => N_FR5
router.patch('/performance/social/records/:recordId', requireRole('HR'), ctrl.patch);

module.exports = router;
