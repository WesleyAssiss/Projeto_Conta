const getContratosCemig = `
    SELECT
        cc.id,
        cc.numero_contrato,
        cc.numero_relogio,
        cc.contrato,
        cc.status,
        i.id AS imovel_id,
        i.endereco,
        i.bairro,
        i.cep,
        i.setor,
        i.tipo_imovel,
        s.nome AS secretaria_nome,
        CASE WHEN cc.status = 'Ativo' THEN COALESCE(h.total_valor, 0) ELSE 0 END AS valor_total,
        CASE WHEN cc.status = 'Ativo' THEN COALESCE(h.total_consumo, 0) ELSE 0 END AS consumo_total
    FROM contratos_cemig cc
    JOIN imoveis i ON cc.imovel_id = i.id
    LEFT JOIN secretarias s ON i.secretaria_id = s.id
    LEFT JOIN (
        SELECT
            contrato_cemig_id,
            SUM(valor_fatura) AS total_valor,
            SUM(consumo_kwh) AS total_consumo
        FROM historico_faturas_cemig
        GROUP BY contrato_cemig_id
    ) h ON cc.id = h.contrato_cemig_id
    ORDER BY i.endereco ASC
`;

const getContratoCemigById = `
    SELECT
        cc.id, cc.numero_contrato, cc.numero_relogio, cc.contrato, cc.status,
        i.*,
        s.nome as secretaria_nome
    FROM contratos_cemig cc
    JOIN imoveis i ON cc.imovel_id = i.id
    LEFT JOIN secretarias s ON i.secretaria_id = s.id
    WHERE cc.id = $1
`;

const addContratoCemig = "INSERT INTO contratos_cemig (imovel_id, numero_contrato, numero_relogio, contrato, status) VALUES ($1, $2, $3, $4, $5) RETURNING *";
const updateContratoCemig = "UPDATE contratos_cemig SET numero_contrato = $1, numero_relogio = $2, contrato = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *";
const deleteContratoCemig = "DELETE FROM contratos_cemig WHERE id = $1";
const getHistoricoCemig = "SELECT * FROM historico_faturas_cemig WHERE contrato_cemig_id = $1 ORDER BY mes_referencia DESC";
const addHistoricoCemig = "INSERT INTO historico_faturas_cemig (contrato_cemig_id, mes_referencia, valor_fatura, consumo_kwh) VALUES ($1, $2, $3, $4) RETURNING *";
const updateHistoricoCemig = "UPDATE historico_faturas_cemig SET mes_referencia = $1, valor_fatura = $2, consumo_kwh = $3 WHERE id = $4 RETURNING *";
const deleteHistoricoCemig = "DELETE FROM historico_faturas_cemig WHERE id = $1";


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