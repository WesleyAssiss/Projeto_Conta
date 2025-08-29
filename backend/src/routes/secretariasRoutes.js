const { Router } = require('express');
const controller = require('../controllers/secretariasController');

const router = Router();

router.get('/', controller.getSecretarias);
router.post('/', controller.addSecretaria);
router.get('/:id', controller.getSecretariaById);
router.put('/:id', controller.updateSecretaria);
router.delete('/:id', controller.deleteSecretaria);

module.exports = router; 