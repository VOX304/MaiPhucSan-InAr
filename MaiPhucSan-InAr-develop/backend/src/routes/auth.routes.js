const router = require('express').Router();
const ctrl = require('../controllers/auth.controller');
const { authRequired } = require('../middleware/auth.middleware');

router.post('/auth/login', ctrl.login);
router.get('/auth/me', authRequired, ctrl.me);

module.exports = router;
