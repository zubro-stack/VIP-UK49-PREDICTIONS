const { Router } = require('express');
const controller = require('../controllers/posts.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createPostSchema, idParamSchema } = require('../validators/posts.validators');

const router = Router();
router.use(requireAuth);

router.get('/', controller.list);
router.post('/', requireRole('manager'), validate(createPostSchema), controller.create);
router.delete('/:id', validate(idParamSchema), controller.remove);

module.exports = router;
