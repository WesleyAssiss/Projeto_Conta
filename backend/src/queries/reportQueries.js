const getAnnualReportBySecretaria = (year, secretaria_id, company) => {
    let whereClause = 'WHERE i.secretaria_id IS NOT NULL';
    if (secretaria_id) {
        whereClause += ` AND i.secretaria_id = ${parseInt(secretarias_id, 10)}`;
    }

    const cemigCTE = company !== 'copasa' ? `
        cemig_gastos AS (
            SELECT
                i.secretaria_id,
                EXTRACT(MONTH FROM h.mes_referencia) as month,
                SUM(h.valor_fatura) as total_valor,
                SUM(h.consumo_kwh) as total_consumo_kwh
            FROM historico_faturas_cemig h
            JOIN contratos_cemig c ON h.contrato_cemig_id = c.id
            JOIN imoveis i ON c.imovel_id = i.id
            WHERE EXTRACT(YEAR FROM h.mes_referencia) = ${parseInt(year, 10)} AND c.status = 'Ativo'
            GROUP BY i.secretaria_id, EXTRACT(MONTH FROM h.mes_referencia)
        )` : 'cemig_gastos AS (SELECT NULL::integer AS secretaria_id, NULL::double precision AS month, 0::numeric AS total_valor, 0::bigint AS total_consumo_kwh WHERE 1=0)';
    
    const copasaCTE = company !== 'cemig' ? `
        copasa_gastos AS (
            SELECT
                i.secretaria_id,
                EXTRACT(MONTH FROM h.mes_referencia) as month,
                SUM(h.valor_fatura + COALESCE(h.valor_irrf, 0)) as total_valor,
                SUM(h.consumo_m3) as total_consumo_m3
            FROM historico_faturas_copasa h
            JOIN contratos_copasa c ON h.contrato_copasa_id = c.id
            JOIN imoveis i ON c.imovel_id = i.id
            WHERE EXTRACT(YEAR FROM h.mes_referencia) = ${parseInt(year, 10)} AND c.status = 'Ativo'
            GROUP BY i.secretaria_id, EXTRACT(MONTH FROM h.mes_referencia)
        )` : 'copasa_gastos AS (SELECT NULL::integer AS secretaria_id, NULL::double precision AS month, 0::numeric AS total_valor, 0::bigint AS total_consumo_m3 WHERE 1=0)';

    return `
        WITH months AS (
            SELECT generate_series(1, 12) AS month
        ),
        secretarias_com_meses AS (
            SELECT s.id as secretaria_id, s.nome as secretaria_nome, m.month
            FROM secretarias s
            CROSS JOIN months m
            JOIN imoveis i ON s.id = i.secretaria_id
            ${whereClause}
            GROUP BY s.id, s.nome, m.month
        ),
        ${cemigCTE},
        ${copasaCTE}
        SELECT 
            sm.secretaria_nome,
            sm.month,
            COALESCE(cg.total_valor, 0) as cemig_valor,
            COALESCE(cp.total_valor, 0) as copasa_valor,
            COALESCE(cg.total_consumo_kwh, 0) as consumo_kwh,
            COALESCE(cp.total_consumo_m3, 0) as consumo_m3
        FROM secretarias_com_meses sm
        LEFT JOIN cemig_gastos cg ON sm.secretaria_id = cg.secretaria_id AND sm.month = cg.month
        LEFT JOIN copasa_gastos cp ON sm.secretaria_id = cp.secretaria_id AND sm.month = cp.month
        ORDER BY sm.secretaria_nome, sm.month;
    `;
};

module.exports = {
    getAnnualReportBySecretaria,
};