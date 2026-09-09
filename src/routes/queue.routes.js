const { Router } = require('express');
const controller = require('../controllers/queue.controller');
const validate = require('../middlewares/validate');
const {
  listQueueQuerySchema,
  createQueueSchema,
  updateStatusSchema,
  idParamSchema,
} = require('../validators/queue.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authenticate);

router.get('/', validate(listQueueQuerySchema, 'query'), controller.list);
router.post('/', authorize('ADMIN', 'PETUGAS_PENDAFTARAN'), validate(createQueueSchema), controller.create);
router.put(
  '/:id/call',
  authorize('ADMIN', 'PETUGAS_PENDAFTARAN', 'DOKTER'),
  validate(idParamSchema, 'params'),
  controller.call
);
router.put(
  '/:id/status',
  authorize('ADMIN', 'PETUGAS_PENDAFTARAN', 'DOKTER'),
  validate(idParamSchema, 'params'),
  validate(updateStatusSchema),
  controller.updateStatus
);

module.exports = router;
