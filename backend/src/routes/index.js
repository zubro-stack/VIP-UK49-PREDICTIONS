const { Router } = require('express');

const router = Router();

router.use('/auth', require('./auth.routes'));
router.use('/users', require('./users.routes'));
router.use('/draws', require('./draws.routes'));
router.use('/engines', require('./engines.routes'));
router.use('/repeats', require('./repeats.routes'));
router.use('/bonus-tracker', require('./bonus-tracker.routes'));
router.use('/v3', require('./v3.routes'));
router.use('/backtests', require('./backtests.routes'));
router.use('/best-pairs', require('./best-pairs.routes'));
router.use('/posts', require('./posts.routes'));
router.use('/calc', require('./calc.routes'));
router.use('/daily-triplet', require('./daily-triplet.routes'));

module.exports = router;
