const db = require('../config/db');
const queries = require('../queries/copasaQueries');

const getContratosCopasa = async (req, res) => {
    try {
        const result = await db.query(queries.getContratosCopasa);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};
const getContratoCopasaById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await db.query(queries.getContratoCopasaById, [id]);
        if (result.rows.length === 0) return res.status(404).json({ msg: 'Contrato COPASA não encontrado.' });
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};
const addContratoCopasa = async (req, res) => {
    const { imovel_id, matricula_copasa, identificador_usuario, centralizadora, status } = req.body;
    if (!imovel_id || !matricula_copasa) {
        return res.status(400).json({ msg: 'imovel_id e matricula_copasa são obrigatórios.' });
    }
    try {
        const result = await db.query(queries.addContratoCopasa, [imovel_id, matricula_copasa, identificador_usuario, centralizadora, status || 'Ativo']);
        res.status(201).json({ msg: 'Contrato COPASA criado!', contrato: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ msg: 'Erro: Matrícula ou imóvel já cadastrado.' });
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};
const updateContratoCopasa = async (req, res) => {
    const id = parseInt(req.params.id);
    const { matricula_copasa, identificador_usuario, centralizadora, status } = req.body;
    try {
        const result = await db.query(queries.updateContratoCopasa, [matricula_copasa, identificador_usuario, centralizadora, status, id]);
        if (result.rowCount === 0) return res.status(404).json({ msg: 'Contrato COPASA não encontrado.' });
        res.status(200).json({ msg: 'Contrato COPASA atualizado!', contrato: result.rows[0] });
    } catch (err) {
        if (err.code === '23505') return res.status(409).json({ msg: 'Erro: Matrícula já existe em outro cadastro.' });
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};
const deleteContratoCopasa = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await db.query(queries.deleteContratoCopasa, [id]);
        if (result.rowCount === 0) return res.status(404).json({ msg: 'Contrato COPASA não encontrado.' });
        res.status(200).json({ msg: 'Contrato COPASA removido com sucesso.' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};


const getHistoricoCopasa = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await db.query(queries.getHistoricoCopasa, [id]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};


const addHistoricoCopasa = async (req, res) => {
    const contrato_copasa_id = parseInt(req.params.id);
    const { mes_referencia, valor_fatura, consumo_m3, valor_irrf } = req.body;
    try {
        const result = await db.query(queries.addHistoricoCopasa, [contrato_copasa_id, mes_referencia, valor_fatura, consumo_m3, valor_irrf || null]);
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};


const updateHistoricoCopasa = async (req, res) => {
    const historico_id = parseInt(req.params.historicoId);
    const { mes_referencia, valor_fatura, consumo_m3, valor_irrf } = req.body;
    try {
        const result = await db.query(queries.updateHistoricoCopasa, [mes_referencia, valor_fatura, consumo_m3, valor_irrf || null, historico_id]);
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};

const deleteHistoricoCopasa = async (req, res) => {
    const historico_id = parseInt(req.params.historicoId);
    try {
        await db.query(queries.deleteHistoricoCopasa, [historico_id]);
        res.status(204).send();
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};

module.exports = {
    getContratosCopasa,
    getContratoCopasaById,
    addContratoCopasa,
    updateContratoCopasa,
    deleteContratoCopasa,
    getHistoricoCopasa,
    addHistoricoCopasa,
    updateHistoricoCopasa,
    deleteHistoricoCopasa,
};