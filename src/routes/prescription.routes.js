const { Router } = require('express');
const controller = require('../controllers/prescription.controller');
const validate = require('../middlewares/validate');
const { createPrescriptionSchema, idParamSchema } = require('../validators/prescription.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authenticate);

router.post('/', authorize('DOKTER'), validate(createPrescriptionSchema), controller.create);
router.get('/:id', validate(idParamSchema, 'params'), controller.detail);

module.exports = router;
