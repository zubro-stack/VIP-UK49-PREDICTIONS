const { Router } = require('express');
const controller = require('../controllers/calc.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { getResultSchema } = require('../validators/calc.validators');

const router = Router();
router.use(requireAuth);

router.get('/', validate(getResultSchema), controller.getPage);

module.exports = router;
