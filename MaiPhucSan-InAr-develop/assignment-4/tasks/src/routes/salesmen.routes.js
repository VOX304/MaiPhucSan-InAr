
const router = require('express').Router();
const ctrl = require('../controllers/salesmen.controller');

router.get('/salesmen', ctrl.list);
router.get('/salesmen/:id', ctrl.get);
router.post('/salesmen', ctrl.create);
router.put('/salesmen/:id', ctrl.update);
router.delete('/salesmen/:id', ctrl.remove);

module.exports = router;
