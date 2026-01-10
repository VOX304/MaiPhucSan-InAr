const router = require('express').Router();
const ctrl = require('../controllers/odoo.controller');
const { authRequired } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/roles.middleware');

router.use(authRequired);

router.get('/odoo/employees', requireRole('CEO', 'HR'), ctrl.listEmployees);

module.exports = router;
