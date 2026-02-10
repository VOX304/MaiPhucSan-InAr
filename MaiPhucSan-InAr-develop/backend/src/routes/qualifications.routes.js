const router = require('express').Router();
const ctrl = require('../controllers/qualifications.controller');
const { authRequired } = require('../middleware/auth.middleware');
const { requireRole, allowSelfOrRoles } = require('../middleware/roles.middleware');
const { validateEmployeeId } = require('../middleware/params.middleware');

router.use(authRequired);
router.param('employeeId', validateEmployeeId);

router.get('/qualifications/:employeeId', allowSelfOrRoles('employeeId', 'CEO', 'HR'), ctrl.list);
router.post('/qualifications/:employeeId', requireRole('CEO'), ctrl.create);

module.exports = router;
