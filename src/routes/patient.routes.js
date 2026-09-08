const { Router } = require('express');
const controller = require('../controllers/patient.controller');
const validate = require('../middlewares/validate');
const {
  createPatientSchema,
  updatePatientSchema,
  listPatientQuerySchema,
  idParamSchema,
} = require('../validators/patient.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = Router();

// Patients CRUD -> Admin, Petugas Pendaftaran
router.use(authenticate, authorize('ADMIN', 'PETUGAS_PENDAFTARAN'));

router.get('/', validate(listPatientQuerySchema, 'query'), controller.list);
router.get('/:id', validate(idParamSchema, 'params'), controller.detail);
router.post('/', validate(createPatientSchema), controller.create);
router.put('/:id', validate(idParamSchema, 'params'), validate(updatePatientSchema), controller.update);
router.delete('/:id', validate(idParamSchema, 'params'), controller.remove);

module.exports = router;
