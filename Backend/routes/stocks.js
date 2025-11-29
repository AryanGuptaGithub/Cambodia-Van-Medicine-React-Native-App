const router = require('express').Router();
const auth = require('../middleware/Auth');
const ctrl = require('../controllers/stockController');

router.post('/add', auth.protect, ctrl.addStock);
router.post('/remove', auth.protect, ctrl.removeStock);
router.get('/', auth.protect, ctrl.listStocks);

module.exports = router;
