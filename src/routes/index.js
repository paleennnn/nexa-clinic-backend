const { Router } = require('express');
const authRoutes = require('./auth.routes');
const patientRoutes = require('./patient.routes');
const poliRoutes = require('./poli.routes');
const doctorRoutes = require('./doctor.routes');
const registrationRoutes = require('./registration.routes');
const queueRoutes = require('./queue.routes');

const router = Router();

router.use('/auth', authRoutes);
router.use('/patients', patientRoutes);
router.use('/poli', poliRoutes);
router.use('/doctors', doctorRoutes);
router.use('/registrations', registrationRoutes);
router.use('/queues', queueRoutes);

module.exports = router;
