const router = require('express').Router();
const ctrl = require('../controllers/salesmen.controller');
const { authRequired } = require('../middleware/auth.middleware');
const { requireRole, allowSelfOrRoles } = require('../middleware/roles.middleware');
const { validateEmployeeId } = require('../middleware/params.middleware');

router.use(authRequired);
router.param('employeeId', validateEmployeeId);

// List / create
router.get('/salesmen', requireRole('CEO', 'HR'), ctrl.list);
router.post('/salesmen', requireRole('HR'), ctrl.create);

// Consolidated view for all
router.get('/salesmen/consolidated', requireRole('CEO', 'HR'), ctrl.listConsolidated);

// Read/update single
router.get('/salesmen/:employeeId', allowSelfOrRoles('employeeId', 'CEO', 'HR'), ctrl.getByEmployeeId);
router.patch('/salesmen/:employeeId', requireRole('HR'), ctrl.patch);

// Sync from OrangeHRM
router.post('/salesmen/:employeeId/sync', requireRole('CEO', 'HR'), ctrl.syncFromOrangeHrm);

// Consolidated for one
router.get(
  '/salesmen/:employeeId/consolidated',
  allowSelfOrRoles('employeeId', 'CEO', 'HR'),
  ctrl.getConsolidated
);

module.exports = router;
