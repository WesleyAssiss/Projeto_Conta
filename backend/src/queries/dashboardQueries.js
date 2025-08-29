const getStats = {
    totalContratosCemig: (secretaria_id) => {
        let query = 'SELECT COUNT(cc.id) as total FROM contratos_cemig cc JOIN imoveis i ON cc.imovel_id = i.id WHERE cc.status = \'Ativo\'';
        if (secretaria_id) {
            query += ` AND i.secretaria_id = ${parseInt(secretaria_id, 10)}`;
        }
        return query;
    },
    totalContratosCopasa: (secretaria_id) => {
        let query = 'SELECT COUNT(co.id) as total FROM contratos_copasa co JOIN imoveis i ON co.imovel_id = i.id WHERE co.status = \'Ativo\'';
        if (secretaria_id) {
            query += ` AND i.secretaria_id = ${parseInt(secretaria_id, 10)}`;
        }
        return query;
    },
    gastoMesAtualCemig: (secretaria_id) => {
        let query = `
            SELECT SUM(hfc.valor_fatura) as total
            FROM historico_faturas_cemig hfc
            JOIN contratos_cemig cc ON hfc.contrato_cemig_id = cc.id
            JOIN imoveis i ON cc.imovel_id = i.id
            WHERE hfc.mes_referencia >= DATE_TRUNC('month', CURRENT_DATE) AND cc.status = 'Ativo'
        `;
        if (secretaria_id) {
            query += ` AND i.secretaria_id = ${parseInt(secretaria_id, 10)}`;
        }
        return query;
    },
    gastoMesAtualCopasa: (secretaria_id) => {
        let query = `
            SELECT SUM(hfc.valor_fatura + COALESCE(hfc.valor_irrf, 0)) as total
            FROM historico_faturas_copasa hfc
            JOIN contratos_copasa co ON hfc.contrato_copasa_id = co.id
            JOIN imoveis i ON co.imovel_id = i.id
            WHERE hfc.mes_referencia >= DATE_TRUNC('month', CURRENT_DATE) AND co.status = 'Ativo'
        `;
        if (secretaria_id) {
            query += ` AND i.secretaria_id = ${parseInt(secretaria_id, 10)}`;
        }
        return query;
    },
};

const getGastosUltimos12Meses = (secretaria_id) => {
    const whereClauseCemig = secretaria_id ? `AND i.secretaria_id = ${parseInt(secretaria_id, 10)}` : '';
    const whereClauseCopasa = secretaria_id ? `AND i.secretaria_id = ${parseInt(secretaria_id, 10)}` : '';

    return `
        WITH cemig_mensal AS (
            SELECT
                DATE_TRUNC('month', hfc.mes_referencia)::DATE as mes,
                SUM(hfc.valor_fatura) as total_cemig
            FROM historico_faturas_cemig hfc
            JOIN contratos_cemig cc ON hfc.contrato_cemig_id = cc.id
            JOIN imoveis i ON cc.imovel_id = i.id
            WHERE cc.status = 'Ativo' ${whereClauseCemig}
            GROUP BY 1
        ),
        copasa_mensal AS (
            SELECT
                DATE_TRUNC('month', hfc.mes_referencia)::DATE as mes,
                SUM(hfc.valor_fatura + COALESCE(hfc.valor_irrf, 0)) as total_copasa
            FROM historico_faturas_copasa hfc
            JOIN contratos_copasa co ON hfc.contrato_copasa_id = co.id
            JOIN imoveis i ON co.imovel_id = i.id
            WHERE co.status = 'Ativo' ${whereClauseCopasa}
            GROUP BY 1
        ),
        meses AS (
            SELECT generate_series(
                DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '11 months',
                DATE_TRUNC('month', CURRENT_DATE),
                '1 month'
            )::DATE as mes
        )
        SELECT
            TO_CHAR(m.mes, 'YYYY-MM') as mes,
            COALESCE(cm.total_cemig, 0) as cemig,
            COALESCE(co.total_copasa, 0) as copasa
        FROM meses m
        LEFT JOIN cemig_mensal cm ON m.mes = cm.mes
        LEFT JOIN copasa_mensal co ON m.mes = co.mes
        ORDER BY m.mes ASC;
    `;
};

const getTopSpendingContracts = (secretaria_id) => {
    const whereClause = secretaria_id ? `WHERE i.secretaria_id = ${parseInt(secretaria_id, 10)}` : '';

    return `
        (
            SELECT
                'CEMIG' as tipo,
                i.endereco,
                SUM(h.valor_fatura) as total_gasto
            FROM historico_faturas_cemig h
            JOIN contratos_cemig c ON h.contrato_cemig_id = c.id
            JOIN imoveis i ON c.imovel_id = i.id
            ${whereClause} AND c.status = 'Ativo'
            GROUP BY i.endereco
            ORDER BY total_gasto DESC
            LIMIT 5
        )
        UNION ALL
        (
            SELECT
                'COPASA' as tipo,
                i.endereco,
                SUM(h.valor_fatura + COALESCE(h.valor_irrf, 0)) as total_gasto
            FROM historico_faturas_copasa h
            JOIN contratos_copasa c ON h.contrato_copasa_id = c.id
            JOIN imoveis i ON c.imovel_id = i.id
            ${whereClause} AND c.status = 'Ativo'
            GROUP BY i.endereco
            ORDER BY total_gasto DESC
            LIMIT 5
        )
        ORDER BY total_gasto DESC;
    `;
};

module.exports = {
    getStats,
    getGastosUltimos12Meses,
    getTopSpendingContracts,
};