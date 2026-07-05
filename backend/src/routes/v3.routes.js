const { Router } = require('express');
const controller = require('../controllers/v3.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = Router();
router.use(requireAuth);

router.get('/analysis', controller.getAnalysis);

module.exports = router;
