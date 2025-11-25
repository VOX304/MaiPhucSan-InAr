
const router = require('express').Router();
const ctrl = require('../controllers/performance.controller');

router.get('/performance', ctrl.list);
router.get('/salesmen/:id/performance', ctrl.getBySalesman);
router.post('/performance', ctrl.create);
router.put('/performance/:id', ctrl.update);
router.delete('/performance/:id', ctrl.remove);

module.exports = router;
