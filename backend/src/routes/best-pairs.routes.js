const { Router } = require('express');
const controller = require('../controllers/best-pairs.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { analyzeSchema } = require('../validators/best-pairs.validators');

const router = Router();
router.use(requireAuth);

router.post('/analyze', validate(analyzeSchema), controller.analyze);

module.exports = router;
