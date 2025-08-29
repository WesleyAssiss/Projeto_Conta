const { Router } = require('express');
const controller = require('../controllers/cemigController');
const reportController = require('../controllers/reportController');
const router = Router();

router.get('/', controller.getContratosCemig);
router.post('/', controller.addContratoCemig);
router.get('/:id', controller.getContratoCemigById);
router.put('/:id', controller.updateContratoCemig);
router.delete('/:id', controller.deleteContratoCemig);

router.get('/:id/historico', controller.getHistoricoCemig);
router.post('/:id/historico', controller.addHistoricoCemig);
router.put('/:id/historico/:historicoId', controller.updateHistoricoCemig);
router.delete('/:id/historico/:historicoId', controller.deleteHistoricoCemig);

router.get('/:id/report', reportController.generateCemigReport);

module.exports = router;