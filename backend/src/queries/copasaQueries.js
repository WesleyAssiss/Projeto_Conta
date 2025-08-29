const getContratosCopasa = `
    SELECT
        co.id,
        co.matricula_copasa,
        co.identificador_usuario,
        co.centralizadora,
        co.status,
        i.id AS imovel_id,
        i.endereco,
        i.bairro,
        i.cep,
        i.setor,
        i.tipo_imovel,
        i.tipo_imovel_copasa,
        s.nome AS secretaria_nome,
        CASE WHEN co.status = 'Ativo' THEN COALESCE(h.total_valor, 0) + COALESCE(h.total_irrf, 0) ELSE 0 END AS valor_total,
        CASE WHEN co.status = 'Ativo' THEN COALESCE(h.total_consumo, 0) ELSE 0 END AS consumo_total
    FROM contratos_copasa co
    JOIN imoveis i ON co.imovel_id = i.id
    LEFT JOIN secretarias s ON i.secretaria_id = s.id
    LEFT JOIN (
        SELECT
            contrato_copasa_id,
            SUM(valor_fatura) AS total_valor,
            SUM(consumo_m3) AS total_consumo,
            SUM(valor_irrf) AS total_irrf
        FROM historico_faturas_copasa
        GROUP BY contrato_copasa_id
    ) h ON co.id = h.contrato_copasa_id
    ORDER BY i.endereco ASC
`;

const getContratoCopasaById = `
    SELECT
        co.id, co.matricula_copasa, co.identificador_usuario, co.centralizadora, co.status,
        i.*,
        s.nome as secretaria_nome
    FROM contratos_copasa co
    JOIN imoveis i ON co.imovel_id = i.id
    LEFT JOIN secretarias s ON i.secretaria_id = s.id
    WHERE co.id = $1
`;

const addContratoCopasa = "INSERT INTO contratos_copasa (imovel_id, matricula_copasa, identificador_usuario, centralizadora, status) VALUES ($1, $2, $3, $4, $5) RETURNING *";
const updateContratoCopasa = "UPDATE contratos_copasa SET matricula_copasa = $1, identificador_usuario = $2, centralizadora = $3, status = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *";
const deleteContratoCopasa = "DELETE FROM contratos_copasa WHERE id = $1";
const getHistoricoCopasa = "SELECT * FROM historico_faturas_copasa WHERE contrato_copasa_id = $1 ORDER BY mes_referencia DESC";
const addHistoricoCopasa = "INSERT INTO historico_faturas_copasa (contrato_copasa_id, mes_referencia, valor_fatura, consumo_m3, valor_irrf) VALUES ($1, $2, $3, $4, $5) RETURNING *";
const updateHistoricoCopasa = "UPDATE historico_faturas_copasa SET mes_referencia = $1, valor_fatura = $2, consumo_m3 = $3, valor_irrf = $4 WHERE id = $5 RETURNING *";
const deleteHistoricoCopasa = "DELETE FROM historico_faturas_copasa WHERE id = $1";

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