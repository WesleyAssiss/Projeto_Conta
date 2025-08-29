const { Router } = require('express');
const controller = require('../controllers/imoveisController');
const upload = require('../middleware/upload');

const router = Router();

router.get('/', controller.getImoveis);
router.post('/', upload.single('contrato_pdf'), controller.addImovelWithContracts);
router.get('/:id', controller.getImovelWithContractsById);
router.put('/:id', upload.single('contrato_pdf'), controller.updateImovelWithContracts);
router.delete('/:id', controller.deleteImovel);

module.exports = router;