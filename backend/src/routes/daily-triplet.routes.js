const { Router } = require('express');
const controller = require('../controllers/daily-triplet.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = Router();
router.use(requireAuth);

router.get('/', controller.get);

module.exports = router;
