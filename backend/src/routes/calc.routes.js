const { Router } = require('express');
const controller = require('../controllers/calc.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { getResultSchema } = require('../validators/calc.validators');

const router = Router();
router.use(requireAuth);

router.get('/result', validate(getResultSchema), controller.getResult);
router.get('/tracker', controller.getTracker);

module.exports = router;
