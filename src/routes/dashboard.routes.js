const { Router } = require('express');
const controller = require('../controllers/dashboard.controller');
const { authenticate } = require('../middlewares/auth.middleware');

const router = Router();

router.get('/summary', authenticate, controller.summary);

module.exports = router;
