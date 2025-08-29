const db = require('../config/db');
const queries = require('../queries/dashboardQueries');

const getDashboardStats = async (req, res) => {
    try {
        const { secretaria_id } = req.query;

        const [
            totalCemigRes,
            totalCopasaRes,
            gastoMesCemigRes,
            gastoMesCopasaRes,
        ] = await Promise.all([
            db.query(queries.getStats.totalContratosCemig(secretaria_id)),
            db.query(queries.getStats.totalContratosCopasa(secretaria_id)),
            db.query(queries.getStats.gastoMesAtualCemig(secretaria_id)),
            db.query(queries.getStats.gastoMesAtualCopasa(secretaria_id)),
        ]);

        const stats = {
            totalContratosCemig: parseInt(totalCemigRes.rows[0].total, 10),
            totalContratosCopasa: parseInt(totalCopasaRes.rows[0].total, 10),
            gastoMesAtualCemig: parseFloat(gastoMesCemigRes.rows[0].total || 0),
            gastoMesAtualCopasa: parseFloat(gastoMesCopasaRes.rows[0].total || 0),
        };

        res.status(200).json(stats);
    } catch (err) {
        console.error("Erro ao buscar estatísticas do dashboard:", err.message);
        res.status(500).send("Erro no servidor");
    }
};

const getGastosMensais = async (req, res) => {
    try {
        const { secretaria_id } = req.query;
        const result = await db.query(queries.getGastosUltimos12Meses(secretaria_id));
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Erro ao buscar gastos mensais:", err.message);
        res.status(500).send("Erro no servidor");
    }
};

const getTopSpendingContracts = async (req, res) => {
    try {
        const { secretaria_id } = req.query;
        const result = await db.query(queries.getTopSpendingContracts(secretaria_id));
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Erro ao buscar contratos com maiores gastos:", err.message);
        res.status(500).send("Erro no servidor");
    }
};

module.exports = {
    getDashboardStats,
    getGastosMensais,
    getTopSpendingContracts,
};