const { Router } = require('express');
const controller = require('../controllers/medicalRecord.controller');
const validate = require('../middlewares/validate');
const {
  createMedicalRecordSchema,
  patientIdParamSchema,
  listMedicalRecordQuerySchema,
} = require('../validators/medicalRecord.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authenticate);

router.get('/', validate(listMedicalRecordQuerySchema, 'query'), controller.list);
router.post('/', authorize('DOKTER'), validate(createMedicalRecordSchema), controller.create);
router.get('/:patientId', validate(patientIdParamSchema, 'params'), controller.historyByPatient);

module.exports = router;
