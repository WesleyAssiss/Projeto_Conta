const { Router } = require('express');
const reportController = require('../controllers/reportController');
const router = Router();

router.get('/secretaria', reportController.generateSecretariaReport);
router.get('/annual', reportController.getAnnualReportData);
router.get('/annual/pdf', reportController.generateAnnualReportPDF); // Novo endpoint para PDF

module.exports = router;