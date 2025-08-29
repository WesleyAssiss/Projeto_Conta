const db = require('../config/db');
const queries = require('../queries/cemigQueries');

const getContratosCemig = async (req, res) => {
    try {
        const result = await db.query(queries.getContratosCemig);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};

const getContratoCemigById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await db.query(queries.getContratoCemigById, [id]);
        if (result.rows.length === 0) return res.status(404).json({ msg: 'Contrato CEMIG não encontrado.' });
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};

const addContratoCemig = async (req, res) => {
    const { imovel_id, numero_contrato, numero_relogio, contrato, status } = req.body;
    if (!imovel_id || !numero_contrato) {
        return res.status(400).json({ msg: 'imovel_id e numero_contrato são obrigatórios.' });
    }
    try {
        const result = await db.query(queries.addContratoCemig, [imovel_id, numero_contrato, numero_relogio, contrato, status || 'Ativo']);
        res.status(201).json({ msg: 'Contrato CEMIG criado com sucesso!', contrato: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ msg: 'Erro: Número do contrato ou imóvel já cadastrado.' });
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};

const updateContratoCemig = async (req, res) => {
    const id = parseInt(req.params.id);
    const { numero_contrato, numero_relogio, contrato, status } = req.body;
    try {
        const result = await db.query(queries.updateContratoCemig, [numero_contrato, numero_relogio, contrato, status, id]);
        if (result.rowCount === 0) return res.status(404).json({ msg: 'Contrato CEMIG não encontrado.' });
        res.status(200).json({ msg: 'Contrato CEMIG atualizado!', contrato: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ msg: 'Erro: Número do contrato já existe em outro cadastro.' });
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};

const deleteContratoCemig = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await db.query(queries.deleteContratoCemig, [id]);
        if (result.rowCount === 0) return res.status(404).json({ msg: 'Contrato CEMIG não encontrado.' });
        res.status(200).json({ msg: 'Contrato CEMIG removido com sucesso.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};

const getHistoricoCemig = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await db.query(queries.getHistoricoCemig, [id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};

const addHistoricoCemig = async (req, res) => {
    const contrato_cemig_id = parseInt(req.params.id);
    const { mes_referencia, valor_fatura, consumo_kwh } = req.body;
    try {
        const result = await db.query(queries.addHistoricoCemig, [contrato_cemig_id, mes_referencia, valor_fatura, consumo_kwh]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};

const updateHistoricoCemig = async (req, res) => {
    const historico_id = parseInt(req.params.historicoId);
    const { mes_referencia, valor_fatura, consumo_kwh } = req.body;
    try {
        const result = await db.query(queries.updateHistoricoCemig, [mes_referencia, valor_fatura, consumo_kwh, historico_id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};

const deleteHistoricoCemig = async (req, res) => {
    const historico_id = parseInt(req.params.historicoId);
    try {
        await db.query(queries.deleteHistoricoCemig, [historico_id]);
        res.status(204).send();
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};

module.exports = {
    getContratosCemig,
    getContratoCemigById,
    addContratoCemig,
    updateContratoCemig,
    deleteContratoCemig,
    getHistoricoCemig,
    addHistoricoCemig,
    updateHistoricoCemig,
    deleteHistoricoCemig,
};