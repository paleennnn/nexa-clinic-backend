const { Router } = require('express');
const controller = require('../controllers/registration.controller');
const validate = require('../middlewares/validate');
const {
  createRegistrationSchema,
  updateRegistrationSchema,
  listRegistrationQuerySchema,
  idParamSchema,
} = require('../validators/registration.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authenticate);

router.get('/', validate(listRegistrationQuerySchema, 'query'), controller.list);
router.get('/:id', validate(idParamSchema, 'params'), controller.detail);
router.post('/', authorize('ADMIN', 'PETUGAS_PENDAFTARAN'), validate(createRegistrationSchema), controller.create);
router.put(
  '/:id',
  authorize('ADMIN', 'PETUGAS_PENDAFTARAN'),
  validate(idParamSchema, 'params'),
  validate(updateRegistrationSchema),
  controller.update
);

module.exports = router;
