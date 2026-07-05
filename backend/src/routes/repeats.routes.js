const { Router } = require('express');
const controller = require('../controllers/repeats.controller');
const { requireAuth } = require('../middlewares/auth.middleware');

const router = Router();
router.use(requireAuth);

router.get('/live', controller.getLive);
router.get('/performance', controller.getPerformance);

module.exports = router;
