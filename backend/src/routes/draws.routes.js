const { Router } = require('express');
const controller = require('../controllers/draws.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { validate } = require('../middlewares/validate.middleware');
const {
  listDrawsSchema,
  createDrawSchema,
  updateDrawSchema,
  importDrawsSchema,
  idParamSchema,
} = require('../validators/draws.validators');

const router = Router();
router.use(requireAuth);

router.get('/', validate(listDrawsSchema), controller.list);
router.post('/', requireRole('manager'), validate(createDrawSchema), controller.create);
router.post('/import', requireRole('manager'), validate(importDrawsSchema), controller.importBulk);
router.patch('/:id', requireRole('manager'), validate(updateDrawSchema), controller.update);
router.delete('/:id', requireRole('manager'), validate(idParamSchema), controller.remove);

module.exports = router;
