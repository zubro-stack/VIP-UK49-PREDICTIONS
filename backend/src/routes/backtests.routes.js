const { Router } = require('express');
const controller = require('../controllers/backtests.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createBacktestSchema, idParamSchema } = require('../validators/backtests.validators');

const router = Router();
router.use(requireAuth, requireRole('manager'));

router.get('/engines', controller.listBacktestableEngines);
router.get('/', controller.list);
router.post('/', validate(createBacktestSchema), controller.create);
router.get('/:id', validate(idParamSchema), controller.getById);

module.exports = router;
