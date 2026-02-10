const router = require('express').Router();
const ctrl = require('../controllers/bonus.controller');
const { authRequired } = require('../middleware/auth.middleware');
const { requireRole, allowSelfOrRoles } = require('../middleware/roles.middleware');
const { validateEmployeeId } = require('../middleware/params.middleware');

router.use(authRequired);
router.param('employeeId', validateEmployeeId);

router.post('/bonus/:employeeId/compute', requireRole('CEO'), ctrl.compute);
router.get('/bonus/:employeeId', allowSelfOrRoles('employeeId', 'CEO', 'HR'), ctrl.get);
router.get('/bonus/:employeeId/history', allowSelfOrRoles('employeeId', 'CEO', 'HR'), ctrl.history);

router.post('/bonus/:employeeId/remarks', allowSelfOrRoles('employeeId', 'CEO', 'HR'), ctrl.addRemark);

router.post('/bonus/:employeeId/approve/ceo', requireRole('CEO'), ctrl.approveCeo);
router.post('/bonus/:employeeId/approve/hr', requireRole('HR'), ctrl.approveHrAndStore);

router.post('/bonus/:employeeId/release', requireRole('HR'), ctrl.releaseToSalesman);

// salesman confirms his own bonus
router.post('/bonus/:employeeId/confirm', allowSelfOrRoles('employeeId'), requireRole('SALESMAN'), ctrl.confirmBySalesman);

module.exports = router;
