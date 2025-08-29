const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const xlsx = require('xlsx');
const db = require('../config/db');

// Função principal que recebe a requisição
const processarImportacao = async (req, res) => {
    if (!req.file) return res.status(400).json({ message: 'Nenhum arquivo enviado.' });

    const filePath = req.file.path;
    let registros = [];

    try {
        console.log(`[INFO] Recebendo arquivo para importação: ${req.file.originalname}`);
        const fileExt = path.extname(req.file.originalname).toLowerCase();

        if (fileExt === '.csv') {
            registros = await new Promise((resolve, reject) => {
                const results = [];
                fs.createReadStream(filePath).pipe(csv()).on('data', (d) => results.push(d)).on('end', () => resolve(results)).on('error', reject);
            });
        } else if (fileExt === '.xlsx') {
            const workbook = xlsx.readFile(filePath);
            registros = xlsx.utils.sheet_to_json(workbook.Sheets[workbook.SheetNames[0]]);
        } else {
            throw new Error('Formato de arquivo não suportado. Use .xlsx ou .csv');
        }

        console.log(`[INFO] Arquivo lido. Total de ${registros.length} linhas de dados encontradas.`);
        const resultado = await salvarTudoEmUm(registros);
        
        console.log('[SUCCESS] Processo de importação finalizado.');
        res.status(200).json(resultado);

    } catch (error) {
        console.error(`[FATAL] Erro geral no processamento do arquivo:`, error);
        res.status(500).json({ success: false, message: `Erro fatal ao processar o arquivo: ${error.message}`, errors: [] });
    } finally {
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
        console.log(`[INFO] Arquivo temporário ${filePath} removido.`);
    }
};

// Função que normaliza os nomes das colunas da planilha
const sanitizeKeys = (registro) => Object.keys(registro).reduce((acc, key) => {
    const newKey = key.toLowerCase().replace(/\s+/g, '_').normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9_]/g, '');
    acc[newKey] = registro[key];
    return acc;
}, {});

// Função principal que processa cada linha da planilha
async function salvarTudoEmUm(registros) {
    const client = await db.getClient();
    let linhasProcessadas = 0;
    const falhas = [];
    const logs = [];

    for (let i = 0; i < registros.length; i++) {
        const linha = i + 2;
        const r = sanitizeKeys(registros[i]);
        logs.push(`--- Processando Linha ${linha}: Endereço "${r.endereco || 'N/A'}" ---`);

        await client.query('BEGIN');
        
        try {
            if (!r.endereco || !r.secretaria_nome) {
                throw new Error('As colunas "endereco" e "secretaria_nome" são obrigatórias.');
            }

            // 1. Secretaria: Cria ou encontra
            const secRes = await client.query(
                `INSERT INTO secretarias (nome, status) VALUES ($1, 'Ativa') ON CONFLICT (nome) DO UPDATE SET nome = EXCLUDED.nome RETURNING id;`,
                [r.secretaria_nome]
            );
            const secretaria_id = secRes.rows[0].id;
            logs.push(`[OK] Secretaria ID ${secretaria_id} ('${r.secretaria_nome}') garantida.`);

            // 2. Imóvel: SEMPRE cria um novo registro
            const imovelRes = await client.query(
                `INSERT INTO imoveis (secretaria_id, endereco, setor, bairro, cep, status, tipo_imovel, tipo_imovel_copasa, contrato_locacao, assinatura_locacao, vencimento_locacao, dados_locador)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING id;`,
                [secretaria_id, r.endereco, r.setor, r.bairro, r.cep, r.status_imovel || 'Ativo', r.tipo_imovel_cemig || 'Próprio', r.tipo_imovel_copasa || 'Próprio', r.locacao_contrato, r.locacao_assinatura || null, r.locacao_vencimento || null, r.locador_dados]
            );
            const imovel_id = imovelRes.rows[0].id;
            logs.push(`[OK] Imóvel ID ${imovel_id} ('${r.endereco}') criado com sucesso.`);
            
            // 3. Contrato e Fatura CEMIG (se existir)
            if (r.cemig_instalacao) {
                const cemigRes = await client.query(
                    `INSERT INTO contratos_cemig (imovel_id, numero_contrato, numero_relogio, contrato, status) VALUES ($1, $2, $3, $4, $5) RETURNING id;`,
                    [imovel_id, r.cemig_instalacao, r.cemig_relogio, r.cemig_contrato, r.cemig_status || 'Ativo']
                );
                const contrato_cemig_id = cemigRes.rows[0].id;
                logs.push(`[OK] Contrato CEMIG ID ${contrato_cemig_id} ('${r.cemig_instalacao}') criado e vinculado ao novo imóvel.`);

                if (r.cemig_fatura_valor && r.cemig_fatura_mes) {
                   await client.query(
                       `INSERT INTO historico_faturas_cemig (contrato_cemig_id, mes_referencia, valor_fatura, consumo_kwh) VALUES ($1, $2, $3, $4);`,
                       [contrato_cemig_id, `${r.cemig_fatura_mes}-01`, parseFloat(r.cemig_fatura_valor), r.cemig_fatura_kwh ? parseInt(r.cemig_fatura_kwh) : null]
                   );
                   logs.push(`[OK] Fatura CEMIG para ${r.cemig_fatura_mes} criada.`);
                }
            }

            // 4. Contrato e Fatura COPASA (se existir)
            if (r.copasa_matricula) {
                const copasaRes = await client.query(
                    `INSERT INTO contratos_copasa (imovel_id, matricula_copasa, identificador_usuario, centralizadora, status) VALUES ($1, $2, $3, $4, $5) RETURNING id;`,
                    [imovel_id, r.copasa_matricula, r.copasa_identificador, r.copasa_centralizadora, r.copasa_status || 'Ativo']
                );
                const contrato_copasa_id = copasaRes.rows[0].id;
                logs.push(`[OK] Contrato COPASA ID ${contrato_copasa_id} ('${r.copasa_matricula}') criado e vinculado.`);
                
                if (r.copasa_fatura_valor && r.copasa_fatura_mes) {
                    await client.query(
                        `INSERT INTO historico_faturas_copasa (contrato_copasa_id, mes_referencia, valor_fatura, consumo_m3, valor_irrf) VALUES ($1, $2, $3, $4, $5);`,
                        [contrato_copasa_id, `${r.copasa_fatura_mes}-01`, parseFloat(r.copasa_fatura_valor), r.copasa_fatura_m3 ? parseInt(r.copasa_fatura_m3) : null, r.copasa_fatura_irrf ? parseFloat(r.copasa_fatura_irrf) : null]
                    );
                    logs.push(`[OK] Fatura COPASA para ${r.copasa_fatura_mes} criada.`);
                }
            }

            await client.query('COMMIT');
            linhasProcessadas++;
            logs.push(`[SUCCESS] Linha ${linha} processada e salva com sucesso.`);

        } catch (err) {
            await client.query('ROLLBACK');
            const erroMsg = err.detail || err.message;
            logs.push(`[ERROR] Falha na linha ${linha}. Alterações desfeitas. Motivo: ${erroMsg}`);
            falhas.push({ linha, erro: erroMsg });
        }
    }

    client.release();
    
    if (falhas.length > 0) {
        return { 
            success: false, 
            message: `${linhasProcessadas} linhas processadas com sucesso, mas ${falhas.length} linhas falharam. As alterações das linhas com erro foram desfeitas.`, 
            errors: falhas,
            logs: logs,
        };
    }

    return { 
        success: true, 
        message: `Importação concluída! ${linhasProcessadas} linhas de imóveis/contratos processadas e criadas com sucesso.`, 
        errors: [],
        logs: logs,
    };
}

module.exports = { processarImportacao };