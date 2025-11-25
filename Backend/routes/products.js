const router = require('express').Router();
const auth = require('../middleware/Auth');  // Re-import the auth middleware
const ctrl = require('../controllers/productController');

router.get('/', auth.protect, ctrl.list);  // Protect the route
router.post('/', auth.protect, ctrl.create);
router.get('/:id', auth.protect, ctrl.get);
router.put('/:id', auth.protect, ctrl.update);
router.delete('/:id', auth.protect, ctrl.remove);

module.exports = router;
