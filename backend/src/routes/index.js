const { Router } = require('express');

const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./users.routes'));
router.use('/draws', require('./draws.routes'));
router.use('/engines', require('./engines.routes'));

module.exports = router;
