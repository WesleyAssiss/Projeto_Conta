const db = require('../config/db');
const queries = require('../queries/secretariasQueries');

const getSecretarias = async (req, res) => {
    try {
        const { status } = req.query;
        const result = await db.query(queries.getSecretarias(status));
        res.status(200).json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};

const getSecretariaById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await db.query(queries.getSecretariaById, [id]);
        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'Secretaria não encontrada.' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};

const addSecretaria = async (req, res) => {
    const { nome, status } = req.body;
    if (!nome) {
        return res.status(400).json({ msg: 'O campo "nome" é obrigatório.' });
    }

    try {
        const existing = await db.query(queries.checkNomeExists, [nome]);
        if (existing.rows.length > 0) {
            return res.status(409).json({ msg: 'Já existe uma secretaria com este nome.' });
        }
        const result = await db.query(queries.addSecretaria, [nome, status || 'Ativa']);
        res.status(201).json({ msg: 'Secretaria criada com sucesso!', secretaria: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};

const updateSecretaria = async (req, res) => {
    const id = parseInt(req.params.id);
    const { nome, status } = req.body;
    try {
        const result = await db.query(queries.updateSecretaria, [nome, status, id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Secretaria não encontrada.' });
        }
        res.status(200).json({ msg: 'Secretaria atualizada com sucesso!', secretaria: result.rows[0] });
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};

const deleteSecretaria = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await db.query(queries.deleteSecretaria, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Secretaria não encontrada.' });
        }
        res.status(200).json({ msg: 'Secretaria removida com sucesso.' });
    } catch (err) {
        console.error(err.message);
        if(err.code === '23503'){
            return res.status(409).json({msg: 'Não é possível remover a secretaria, pois ela está vinculada a um ou mais imóveis.'})
        }
        res.status(500).send("Erro no servidor");
    }
};

module.exports = {
    getSecretarias,
    getSecretariaById,
    addSecretaria,
    updateSecretaria,
    deleteSecretaria,
};