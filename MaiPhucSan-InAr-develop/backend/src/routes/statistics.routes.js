const router = require('express').Router();
const ctrl = require('../controllers/statistics.controller');
const { authRequired } = require('../middleware/auth.middleware');
const { requireRole } = require('../middleware/roles.middleware');

router.use(authRequired);

router.get('/statistics/bonus', requireRole('CEO', 'HR'), ctrl.bonusTotals);

module.exports = router;
