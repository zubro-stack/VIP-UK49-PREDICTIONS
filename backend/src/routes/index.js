const { Router } = require('express');

const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./users.routes'));
router.use('/draws', require('./draws.routes'));
router.use('/engines', require('./engines.routes'));
router.use('/repeats', require('./repeats.routes'));
router.use('/v3', require('./v3.routes'));

module.exports = router;
