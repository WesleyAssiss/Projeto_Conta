const { Router } = require('express');
const controller = require('../controllers/dashboardController');
const router = Router();

router.get('/stats', controller.getDashboardStats);
router.get('/gastos-mensais', controller.getGastosMensais);
router.get('/top-spending', controller.getTopSpendingContracts);

module.exports = router;