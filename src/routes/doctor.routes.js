const { Router } = require('express');
const controller = require('../controllers/doctor.controller');
const validate = require('../middlewares/validate');
const { createDoctorSchema, updateDoctorSchema, idParamSchema } = require('../validators/doctor.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', validate(idParamSchema, 'params'), controller.detail);
router.post('/', authorize('ADMIN'), validate(createDoctorSchema), controller.create);
router.put('/:id', authorize('ADMIN'), validate(idParamSchema, 'params'), validate(updateDoctorSchema), controller.update);
router.delete('/:id', authorize('ADMIN'), validate(idParamSchema, 'params'), controller.remove);

module.exports = router;
