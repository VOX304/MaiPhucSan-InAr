const router = require('express').Router();
const ctrl = require('../controllers/orders.controller');
const { authRequired } = require('../middleware/auth.middleware');
const { requireRole, allowSelfOrRoles } = require('../middleware/roles.middleware');

router.use(authRequired);

router.get('/orders/:employeeId', allowSelfOrRoles('employeeId', 'CEO', 'HR'), ctrl.listForSalesman);
router.post('/orders', requireRole('HR'), ctrl.create);

module.exports = router;
