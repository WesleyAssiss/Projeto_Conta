const getImoveis = `
    SELECT i.*, s.nome as secretaria_nome 
    FROM imoveis i
    LEFT JOIN secretarias s ON i.secretaria_id = s.id
    ORDER BY i.endereco ASC
`;

const getImovelWithContractsById = `
    SELECT 
        i.*, 
        s.nome as secretaria_nome,
        cc.id as cemig_id,
        cc.numero_contrato,
        cc.numero_relogio,
        cc.contrato,
        cc.status as cemig_status,
        co.id as copasa_id,
        co.matricula_copasa,
        co.identificador_usuario,
        co.centralizadora,
        co.status as copasa_status
    FROM imoveis i
    LEFT JOIN secretarias s ON i.secretaria_id = s.id
    LEFT JOIN contratos_cemig cc ON i.id = cc.imovel_id
    LEFT JOIN contratos_copasa co ON i.id = co.imovel_id
    WHERE i.id = $1
`;

const addImovel = `
    INSERT INTO imoveis (
        endereco, setor, bairro, cep, tipo_imovel, tipo_imovel_copasa, matricula_registro_imovel, secretaria_id, status,
        contrato_locacao, assinatura_locacao, vencimento_locacao, dados_locador, contrato_path
    ) 
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14) 
    RETURNING *
`;

const updateImovel = `
    UPDATE imoveis 
    SET 
        endereco = $1, setor = $2, bairro = $3, cep = $4, tipo_imovel = $5, tipo_imovel_copasa = $6,
        matricula_registro_imovel = $7, secretaria_id = $8, status = $9, 
        contrato_locacao = $10, assinatura_locacao = $11, vencimento_locacao = $12, 
        dados_locador = $13, contrato_path = $14, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $15
    RETURNING *
`;

const deleteImovel = "DELETE FROM imoveis WHERE id = $1";

module.exports = {
    getImoveis,
    getImovelWithContractsById,
    addImovel,
    updateImovel,
    deleteImovel,
};