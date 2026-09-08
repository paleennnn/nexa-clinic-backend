const { Router } = require('express');
const authRoutes = require('./auth.routes');

const router = Router();

router.use('/auth', authRoutes);

// Modul lain (patients, poli, doctors, registrations, queues, medical-records,
// prescriptions, dashboard) akan didaftarkan di sini pada fase berikutnya.

module.exports = router;
