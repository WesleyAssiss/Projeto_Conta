const db = require('../config/db');
const imoveisQueries = require('../queries/imoveisQueries');
const cemigQueries = require('../queries/cemigQueries');
const copasaQueries = require('../queries/copasaQueries');

const getImoveis = async (req, res) => {
    try {
        const result = await db.query(imoveisQueries.getImoveis);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("### ERRO NO BANCO AO BUSCAR IMÓVEIS ###:", err.message);
        res.status(500).send("Erro no servidor");
    }
};

const getImovelWithContractsById = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const result = await db.query(imoveisQueries.getImovelWithContractsById, [id]);
        if (result.rows.length === 0) return res.status(404).json({ msg: 'Imóvel não encontrado.' });
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error(err.message);
        res.status(500).send("Erro no servidor");
    }
};

const addImovelWithContracts = async (req, res) => {
    console.log('\n\n--- [LOG INÍCIO DA REQUISIÇÃO DE CRIAÇÃO] ---');
    const { imovelData, cemigData, copasaData, cadastro_para } = JSON.parse(req.body.jsonData);
    let contrato_path = req.file ? req.file.path.replace(/\\/g, '/') : null;
    
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const imovelParams = [
            imovelData.endereco, imovelData.setor, imovelData.bairro, imovelData.cep,
            imovelData.tipo_imovel || 'Próprio', imovelData.tipo_imovel_copasa || 'Próprio',
            imovelData.matricula_registro_imovel, 
            imovelData.secretaria_id || null, 
            imovelData.status || 'Ativo', imovelData.contrato_locacao,
            imovelData.assinatura_locacao || null, imovelData.vencimento_locacao || null,
            imovelData.dados_locador, contrato_path
        ];

        const imovelResult = await client.query(imoveisQueries.addImovel, imovelParams);
        const newImovelId = imovelResult.rows[0].id;
        console.log(`[LOG] Imóvel ID ${newImovelId} criado.`);

        if ((cadastro_para === 'cemig' || cadastro_para === 'ambos') && cemigData?.numero_contrato) {
            await client.query(cemigQueries.addContratoCemig, [newImovelId, cemigData.numero_contrato, cemigData.numero_relogio, cemigData.contrato, cemigData.status || 'Ativo']);
            console.log('[LOG] Contrato CEMIG criado.');
        }

        if ((cadastro_para === 'copasa' || cadastro_para === 'ambos') && copasaData?.matricula_copasa) {
            await client.query(copasaQueries.addContratoCopasa, [newImovelId, copasaData.matricula_copasa, copasaData.identificador_usuario, copasaData.centralizadora, copasaData.status || 'Ativo']);
            console.log('[LOG] Contrato COPASA criado.');
        }

        await client.query('COMMIT');
        res.status(201).json({ msg: 'Imóvel e contratos criados com sucesso!', imovel: imovelResult.rows[0] });

    } catch (err) {
        console.log('\n[LOG ERRO] Ocorreu um erro na transação. Executando ROLLBACK.');
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send("Erro no servidor ao criar imóvel.");
    } finally {
        client.release();
        console.log('--- [LOG FIM DA REQUISIÇÃO DE CRIAÇÃO] ---\n');
    }
};

const updateImovelWithContracts = async (req, res) => {
    const id = parseInt(req.params.id);

    console.log('\n\n--- [LOG INÍCIO DA REQUISIÇÃO DE UPDATE] ---');
    console.log('[LOG 1] Recebendo dados brutos do corpo da requisição:');
    console.log(req.body);

    const { imovelData, cemigData, copasaData, cadastro_para } = JSON.parse(req.body.jsonData);
    
    console.log('\n[LOG 2] Dados após o parse do JSON:');
    console.log('imovelData:', imovelData);
    console.log('copasaData:', copasaData);
    
    let contrato_path = imovelData.contrato_path || null;
    if (req.file) {
        contrato_path = req.file.path.replace(/\\/g, '/');
        console.log('\n[LOG 3] Um novo arquivo foi enviado:', contrato_path);
    } else {
        console.log('\n[LOG 3] Nenhum arquivo novo foi enviado.');
    }
    
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        
        const params = [
            imovelData.endereco,
            imovelData.setor,
            imovelData.bairro,
            imovelData.cep,
            imovelData.tipo_imovel,
            imovelData.tipo_imovel_copasa,
            imovelData.matricula_registro_imovel,
            imovelData.secretaria_id || null,
            imovelData.status || 'Ativo',
            imovelData.contrato_locacao,
            imovelData.assinatura_locacao || null,
            imovelData.vencimento_locacao || null,
            imovelData.dados_locador,
            contrato_path,
            id
        ];

        console.log('\n[LOG 4] PARÂMETROS SENDO ENVIADOS PARA A QUERY `updateImovel`:');
        console.log(params);

        const imovelResult = await client.query(imoveisQueries.updateImovel, params);

        if (imovelResult.rowCount === 0) {
            console.log('[LOG ERRO] Imóvel não encontrado. Executando ROLLBACK.');
            await client.query('ROLLBACK');
            return res.status(404).json({ msg: 'Imóvel não encontrado.' });
        }

        console.log('\n[LOG 5] Imóvel atualizado com sucesso. Verificando contratos...');

        if ((cadastro_para === 'cemig' || cadastro_para === 'ambos') && cemigData) {
            if (cemigData.id) {
                await client.query(cemigQueries.updateContratoCemig, [cemigData.numero_contrato, cemigData.numero_relogio, cemigData.contrato, cemigData.status, cemigData.id]);
            } else if (cemigData.numero_contrato) {
                await client.query(cemigQueries.addContratoCemig, [id, cemigData.numero_contrato, cemigData.numero_relogio, cemigData.contrato, cemigData.status || 'Ativo']);
            }
        }

        if ((cadastro_para === 'copasa' || cadastro_para === 'ambos') && copasaData) {
             if (copasaData.id) {
                await client.query(copasaQueries.updateContratoCopasa, [copasaData.matricula_copasa, copasaData.identificador_usuario, copasaData.centralizadora, copasaData.status, copasaData.id]);
            } else if (copasaData.matricula_copasa) {
                await client.query(copasaQueries.addContratoCopasa, [id, copasaData.matricula_copasa, copasaData.identificador_usuario, copasaData.centralizadora, copasaData.status || 'Ativo']);
            }
        }
        
        console.log('\n[LOG 6] Contratos verificados. Executando COMMIT.');
        await client.query('COMMIT');
        res.status(200).json({ msg: 'Imóvel e contratos atualizados com sucesso!', imovel: imovelResult.rows[0] });

    } catch (err) {
        console.log('\n[LOG ERRO] Ocorreu um erro na transação. Executando ROLLBACK.');
        await client.query('ROLLBACK');
        console.error(err.message);
        res.status(500).send("Erro no servidor ao atualizar imóvel e contratos.");
    } finally {
        client.release();
        console.log('--- [LOG FIM DA REQUISIÇÃO DE UPDATE] ---\n');
    }
};

const deleteImovel = async (req, res) => {
    const id = parseInt(req.params.id);
    const client = await db.getClient();
    try {
        await client.query('BEGIN');
        const result = await db.query(imoveisQueries.deleteImovel, [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ msg: 'Imóvel não encontrado.' });
        }
        await client.query('COMMIT');
        res.status(200).json({ msg: 'Imóvel e todos os seus dados foram removidos com sucesso.' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error("Erro ao deletar imóvel:", err.message);
        res.status(500).send("Erro no servidor");
    } finally {
        client.release();
    }
};

module.exports = {
    getImoveis,
    getImovelWithContractsById,
    addImovelWithContracts,
    updateImovelWithContracts,
    deleteImovel
};