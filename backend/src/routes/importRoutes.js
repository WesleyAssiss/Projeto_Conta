const { Router } = require('express');
const controller = require('../controllers/importController');
const upload = require('../middleware/upload');

const router = Router();

router.post('/', upload.single('file'), controller.processarImportacao);

module.exports = router;