const { Router } = require('express');
const controller = require('../controllers/users.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');
const { validate } = require('../middlewares/validate.middleware');
const { createUserSchema, updateUserSchema, updateRoleSchema, idParamSchema } = require('../validators/users.validators');

const router = Router();
router.use(requireAuth, requireRole('admin'));

router.get('/', controller.list);
router.post('/', validate(createUserSchema), controller.create);
router.patch('/:id', validate(updateUserSchema), controller.update);
router.patch('/:id/role', validate(updateRoleSchema), controller.updateRole);
router.delete('/:id', validate(idParamSchema), controller.remove);

module.exports = router;
