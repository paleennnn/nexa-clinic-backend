const { Router } = require('express');
const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);

module.exports = router;
