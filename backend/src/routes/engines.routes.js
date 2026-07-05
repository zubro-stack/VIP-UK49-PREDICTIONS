const { Router } = require('express');
const controller = require('../controllers/engines.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { engineCodeParamSchema, patternIdParamSchema } = require('../validators/engines.validators');

const router = Router();
router.use(requireAuth);

router.get('/', controller.listCatalog);
router.get('/:code/patterns', validate(engineCodeParamSchema), controller.listPatterns);
router.get('/:code/patterns/:id', validate(patternIdParamSchema), controller.getPattern);
router.post('/:code/run', requireRole('manager'), validate(engineCodeParamSchema), controller.run);
router.patch('/:code/patterns/:id/miss', requireRole('manager'), validate(patternIdParamSchema), controller.recordMiss);
router.delete('/:code/patterns/:id', requireRole('manager'), validate(patternIdParamSchema), controller.deletePattern);

module.exports = router;
