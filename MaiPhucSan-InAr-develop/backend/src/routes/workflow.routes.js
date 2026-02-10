const router = require('express').Router();
const ctrl = require('../controllers/workflow.controller');
const { authRequired } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/roles.middleware');
const { validateEmployeeId, validateNonEmptyId } = require('../middleware/params.middleware');

router.use(authRequired);
router.param('employeeId', validateEmployeeId);
router.param('processInstanceId', validateNonEmptyId);
router.param('taskId', validateNonEmptyId);

router.post('/workflow/bonus/:employeeId/start', requireRole('CEO', 'HR'), ctrl.startBonusApproval);
router.get('/workflow/process/:processInstanceId/tasks', requireRole('CEO', 'HR'), ctrl.listTasks);
router.post('/workflow/tasks/:taskId/complete', requireRole('CEO', 'HR'), ctrl.completeTask);

module.exports = router;
