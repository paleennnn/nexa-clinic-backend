const { Router } = require('express');
const controller = require('../controllers/poli.controller');
const validate = require('../middlewares/validate');
const { createPoliSchema, updatePoliSchema, idParamSchema } = require('../validators/poli.validator');
const { authenticate, authorize } = require('../middlewares/auth.middleware');

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', validate(idParamSchema, 'params'), controller.detail);
router.post('/', authorize('ADMIN'), validate(createPoliSchema), controller.create);
router.put('/:id', authorize('ADMIN'), validate(idParamSchema, 'params'), validate(updatePoliSchema), controller.update);
router.delete('/:id', authorize('ADMIN'), validate(idParamSchema, 'params'), controller.remove);

module.exports = router;
