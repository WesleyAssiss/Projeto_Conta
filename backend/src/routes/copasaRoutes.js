const { Router } = require('express');
const controller = require('../controllers/copasaController');
const reportController = require('../controllers/reportController');
const router = Router();

router.get('/', controller.getContratosCopasa);
router.post('/', controller.addContratoCopasa);
router.get('/:id', controller.getContratoCopasaById);
router.put('/:id', controller.updateContratoCopasa);
router.delete('/:id', controller.deleteContratoCopasa);

router.get('/:id/historico', controller.getHistoricoCopasa);
router.post('/:id/historico', controller.addHistoricoCopasa);
router.put('/:id/historico/:historicoId', controller.updateHistoricoCopasa);
router.delete('/:id/historico/:historicoId', controller.deleteHistoricoCopasa);

router.get('/:id/report', reportController.generateCopasaReport);

module.exports = router;