const { Router } = require('express');
const controller = require('../controllers/medicalRecord.controller');
const validate = require('../middlewares/validate');
const { createMedicalRecordSchema, patientIdParamSchema } = require('../validators/medicalRecord.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authenticate);

router.post('/', authorize('DOKTER'), validate(createMedicalRecordSchema), controller.create);
router.get('/:patientId', validate(patientIdParamSchema, 'params'), controller.historyByPatient);

module.exports = router;
