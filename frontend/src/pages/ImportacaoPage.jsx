import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { utils, writeFile } from 'xlsx';
import '../styles/Page.css';
import '../styles/Importacao.css';

const ImportacaoPage = () => {
    const [arquivo, setArquivo] = useState(null);
    const [loading, setLoading] = useState(false);
    const [resultado, setResultado] = useState(null);

    const handleFileChange = (e) => {
        setArquivo(e.target.files[0]);
    };

    const handleDownloadModelo = () => {
        const headers = [
            'secretaria_nome', 'endereco', 'setor', 'bairro', 'cep', 'status_imovel',
            'tipo_imovel_cemig', 'cemig_instalacao', 'cemig_relogio', 'cemig_contrato', 'cemig_status',
            'cemig_fatura_mes', 'cemig_fatura_valor', 'cemig_fatura_kwh',
            'tipo_imovel_copasa', 'copasa_matricula', 'copasa_identificador', 'copasa_centralizadora', 'copasa_status',
            'copasa_fatura_mes', 'copasa_fatura_valor', 'copasa_fatura_m3', 'copasa_fatura_irrf',
            'locacao_contrato', 'locacao_assinatura', 'locacao_vencimento', 'locador_dados'
        ];
        const exemplo = [[
            'SECRETARIA DE EDUCACAO', 'RUA PRINCIPAL, 100', 'CENTRO', 'CENTRO', '36400000', 'Ativo',
            'Locado', '3009999999', 'RELOGIO123', 'CONTRATO789', 'Ativo',
            '2025-01', '250.45', '200',
            'Próprio', '100999999', 'ID123456', 'CENTRAL987', 'Ativo',
            '2025-01', '120.80', '15', '3.50',
            'CONTRATO-ALUGUEL-01', '2025-01-10', '2026-01-09', 'Proprietário Exemplo, CPF 123.456.789-00'
        ]];

        const worksheet = utils.aoa_to_sheet([headers, ...exemplo]);
        const workbook = utils.book_new();
        utils.book_append_sheet(workbook, worksheet, 'Dados');
        writeFile(workbook, 'modelo_importacao_geral.xlsx');
    };

    const handleUpload = async () => {
        if (!arquivo) { toast.error('Por favor, selecione um arquivo para enviar.'); return; }
        setLoading(true);
        setResultado(null);

        const formData = new FormData();
        formData.append('file', arquivo);

        try {
            const response = await axios.post('http://localhost:3001/api/import', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResultado(response.data);
            toast.success(response.data.message);
        } catch (error) {
            const errorMsg = error.response?.data?.message || 'Falha ao importar o arquivo.';
            setResultado({ success: false, message: errorMsg, errors: error.response?.data?.errors || [] });
            toast.error(errorMsg);
        } finally {
            setLoading(false);
        }
    };
    
    return (
        <div>
            <div className="page-header">
                <h1>Importação Geral de Dados</h1>
            </div>

            <div className="import-card">
                <div className="import-step">
                    <div className="step-number">1</div>
                    <div className="step-content">
                        <h3>Baixe o Modelo Geral</h3>
                        <p>Use esta planilha para cadastrar ou atualizar Secretarias, Imóveis, Contratos e a primeira Fatura de uma só vez.</p>
                        <button className="download-button" onClick={handleDownloadModelo}>Baixar Modelo (.xlsx)</button>
                    </div>
                </div>

                <div className="import-step">
                    <div className="step-number">2</div>
                    <div className="step-content">
                        <h3>Envie o Arquivo Preenchido</h3>
                        <p>Arraste o arquivo ou clique na área abaixo para selecionar a planilha que você preencheu.</p>
                        <div className="file-upload-area">
                            <label className="file-drop-zone">
                                <input type="file" accept=".xlsx, .csv" onChange={handleFileChange} />
                                <span>{arquivo ? 'Arquivo selecionado:' : 'Arraste o arquivo ou clique aqui'}</span>
                                {arquivo && <div className="file-name">{arquivo.name}</div>}
                            </label>
                            <button className="upload-button" onClick={handleUpload} disabled={loading || !arquivo}>
                                {loading ? 'Processando...' : 'Processar Arquivo Geral'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            
            {resultado && (
                <div className={`resultado-importacao ${resultado.success ? 'sucesso' : 'falha'}`}>
                    <h4>Resultado da Importação</h4>
                    <p>{resultado.message}</p>
                    {resultado.logs && resultado.logs.length > 0 && (
                        <div className="log-container">
                            <strong>Logs detalhados:</strong>
                            <ul>{resultado.logs.map((log, i) => <li key={i}>{log}</li>)}</ul>
                        </div>
                    )}
                    {resultado.errors && resultado.errors.length > 0 && (
                        <div className="error-container">
                            <strong>Erros encontrados:</strong>
                            <ul>{resultado.errors.map((err, i) => <li key={i}>Linha {err.linha}: {err.erro}</li>)}</ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ImportacaoPage;