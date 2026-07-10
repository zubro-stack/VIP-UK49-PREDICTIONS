const { Router } = require('express');
const controller = require('../controllers/bonus-tracker.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/rbac.middleware');

const router = Router();
router.use(requireAuth);

router.get('/', controller.getPage);
router.post('/run', requireRole('manager'), controller.run);

module.exports = router;
