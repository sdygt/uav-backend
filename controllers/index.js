const express = require('express');
const router = express.Router();

router.all('/', (req, res, next) => {
    res.status(204).end();
});

router.use('/uav', require('./uav'));
router.use('/task', require('./task'));
router.use('/no-fly', require('./nofly'));
router.use('/scheme', require('./scheme'));

module.exports = router;
