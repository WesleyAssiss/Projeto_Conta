import React, { useState, useEffect } from 'react';
import { getSecretarias } from '../api/secretariasService';
import '../styles/Form.css';

const ImovelForm = ({ initialData, onSave }) => {
    const [formData, setFormData] = useState({
        imovelData: {},
        cemigData: {},
        copasaData: {},
        cadastro_para: 'ambos'
    });
    const [secretarias, setSecretarias] = useState([]);
    const [contratoFile, setContratoFile] = useState(null);

    useEffect(() => {
        const loadSecretarias = async () => {
            try {
                const data = await getSecretarias({ status: 'Ativa' });
                setSecretarias(data);
            } catch (error) {
                console.error("Falha ao carregar secretarias.", error);
            }
        };
        loadSecretarias();
    }, []);

    useEffect(() => {
        if (initialData) {
            const cemigExists = !!initialData.cemig_id;
            const copasaExists = !!initialData.copasa_id;

            let cadastro = 'ambos';
            if (cemigExists && !copasaExists) cadastro = 'cemig';
            if (!cemigExists && copasaExists) cadastro = 'copasa';

            setFormData({
                imovelData: {
                    id: initialData.id,
                    endereco: initialData.endereco || '',
                    setor: initialData.setor || '',
                    bairro: initialData.bairro || '',
                    cep: initialData.cep || '',
                    tipo_imovel: initialData.tipo_imovel || 'Próprio',
                    tipo_imovel_copasa: initialData.tipo_imovel_copasa || 'Próprio',
                    secretaria_id: initialData.secretaria_id || '',
                    status: initialData.status || 'Ativo',
                    contrato_locacao: initialData.contrato_locacao || '',
                    assinatura_locacao: initialData.assinatura_locacao ? new Date(initialData.assinatura_locacao).toISOString().split('T')[0] : '',
                    vencimento_locacao: initialData.vencimento_locacao ? new Date(initialData.vencimento_locacao).toISOString().split('T')[0] : '',
                    dados_locador: initialData.dados_locador || '',
                    contrato_path: initialData.contrato_path || ''
                },
                cemigData: {
                    id: initialData.cemig_id,
                    numero_contrato: initialData.numero_contrato || '',
                    numero_relogio: initialData.numero_relogio || '',
                    contrato: initialData.contrato || '',
                    status: initialData.cemig_status || 'Ativo'
                },
                copasaData: {
                    id: initialData.copasa_id,
                    matricula_copasa: initialData.matricula_copasa || '',
                    identificador_usuario: initialData.identificador_usuario || '',
                    centralizadora: initialData.centralizadora || '',
                    status: initialData.copasa_status || 'Ativo'
                },
                cadastro_para: initialData.id ? cadastro : 'ambos'
            });
        }
    }, [initialData]);

    const handleChange = (e, entity) => {
        const { name, value } = e.target;
        if (entity === 'cadastro_para') {
            setFormData(prev => ({ ...prev, cadastro_para: value }));
        } else {
            setFormData(prev => ({
                ...prev,
                [entity]: { ...prev[entity], [name]: value }
            }));
        }
    };

    const handleFileChange = (e) => {
        setContratoFile(e.target.files[0]);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave(formData, contratoFile);
    };

    const showCemig = formData.cadastro_para === 'cemig' || formData.cadastro_para === 'ambos';
    const showCopasa = formData.cadastro_para === 'copasa' || formData.cadastro_para === 'ambos';
    const isLocado = formData.imovelData?.tipo_imovel === 'Locado' || formData.imovelData?.tipo_imovel_copasa === 'Locado';
    const currentFilePath = formData.imovelData?.contrato_path;
    const currentFileName = currentFilePath ? currentFilePath.split('\\').pop().split('/').pop() : '';

    return (
        <form onSubmit={handleSubmit} className="form-container">
            <div className="form-group">
                <label>Este cadastro é para:</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                    <label><input type="radio" name="cadastro_para" value="cemig" checked={formData.cadastro_para === 'cemig'} onChange={(e) => handleChange(e, 'cadastro_para')} /> CEMIG</label>
                    <label><input type="radio" name="cadastro_para" value="copasa" checked={formData.cadastro_para === 'copasa'} onChange={(e) => handleChange(e, 'cadastro_para')} /> COPASA</label>
                    <label><input type="radio" name="cadastro_para" value="ambos" checked={formData.cadastro_para === 'ambos'} onChange={(e) => handleChange(e, 'cadastro_para')} /> Ambos</label>
                </div>
            </div>
            <div className="form-group"><label>Endereço</label><input type="text" name="endereco" value={formData.imovelData.endereco || ''} onChange={(e) => handleChange(e, 'imovelData')} required /></div>
            <div className="form-group"><label>Setor</label><input type="text" name="setor" value={formData.imovelData.setor || ''} onChange={(e) => handleChange(e, 'imovelData')} /></div>
            <div className="form-group"><label>Bairro</label><input type="text" name="bairro" value={formData.imovelData.bairro || ''} onChange={(e) => handleChange(e, 'imovelData')} /></div>
            <div className="form-group"><label>CEP</label><input type="text" name="cep" value={formData.imovelData.cep || ''} onChange={(e) => handleChange(e, 'imovelData')} /></div>
            <div className="form-group">
                <label>Secretaria</label>
                <select name="secretaria_id" value={formData.imovelData.secretaria_id || ''} onChange={(e) => handleChange(e, 'imovelData')}>
                    <option value="">Nenhuma</option>
                    {secretarias.map(sec => (<option key={sec.id} value={sec.id}>{sec.nome}</option>))}
                </select>
            </div>
            <div className="form-group"><label>Status do Imóvel</label><select name="status" value={formData.imovelData.status || 'Ativo'} onChange={(e) => handleChange(e, 'imovelData')}><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option></select></div>

            {showCemig && (<>
                <hr /><h4 style={{marginTop: '1rem', marginBottom: '1rem'}}>Dados CEMIG</h4>
                <div className="form-group"><label>Tipo de Imóvel (CEMIG)</label><select name="tipo_imovel" value={formData.imovelData.tipo_imovel || 'Próprio'} onChange={(e) => handleChange(e, 'imovelData')}><option value="Próprio">Próprio</option><option value="Locado">Locado</option><option value="Convenio">Convênio</option><option value="Público">Público</option></select></div>
                <div className="form-group"><label>Nº Instalação</label><input type="text" name="numero_contrato" value={formData.cemigData.numero_contrato || ''} onChange={(e) => handleChange(e, 'cemigData')} required={showCemig}/></div>
                <div className="form-group"><label>Nº do Relógio</label><input type="text" name="numero_relogio" value={formData.cemigData.numero_relogio || ''} onChange={(e) => handleChange(e, 'cemigData')} /></div>
                <div className="form-group"><label>Contrato</label><input type="text" name="contrato" value={formData.cemigData.contrato || ''} onChange={(e) => handleChange(e, 'cemigData')} /></div>
                <div className="form-group"><label>Status Contrato CEMIG</label><select name="status" value={formData.cemigData.status || 'Ativo'} onChange={(e) => handleChange(e, 'cemigData')}><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option><option value="Suspenso">Suspenso</option></select></div>
            </>)}

            {showCopasa && (<>
                <hr /><h4 style={{marginTop: '1rem', marginBottom: '1rem'}}>Dados COPASA</h4>
                 <div className="form-group"><label>Tipo de Imóvel (COPASA)</label><select name="tipo_imovel_copasa" value={formData.imovelData.tipo_imovel_copasa || 'Próprio'} onChange={(e) => handleChange(e, 'imovelData')}><option value="Próprio">Próprio</option><option value="Locado">Locado</option><option value="Convenio">Convênio</option><option value="Público">Público</option></select></div>
                <div className="form-group"><label>Matrícula COPASA</label><input type="text" name="matricula_copasa" value={formData.copasaData.matricula_copasa || ''} onChange={(e) => handleChange(e, 'copasaData')} required={showCopasa}/></div>
                <div className="form-group"><label>Identificador do Usuário</label><input type="text" name="identificador_usuario" value={formData.copasaData.identificador_usuario || ''} onChange={(e) => handleChange(e, 'copasaData')} /></div>
                <div className="form-group"><label>Centralizadora</label><input type="text" name="centralizadora" value={formData.copasaData.centralizadora || ''} onChange={(e) => handleChange(e, 'copasaData')} /></div>
                <div className="form-group"><label>Status Contrato COPASA</label><select name="status" value={formData.copasaData.status || 'Ativo'} onChange={(e) => handleChange(e, 'copasaData')}><option value="Ativo">Ativo</option><option value="Inativo">Inativo</option><option value="Suspenso">Suspenso</option></select></div>
            </>)}
            
            {isLocado && (<>
                <hr />
                <h5 style={{marginTop: '1rem', marginBottom: '1rem', color: '#555'}}>Dados de Locação</h5>
                <div className="form-group"><label>Nº Contrato de Locação</label><input type="text" name="contrato_locacao" value={formData.imovelData.contrato_locacao || ''} onChange={(e) => handleChange(e, 'imovelData')} /></div>
                <div className="form-group"><label>Data de Assinatura</label><input type="date" name="assinatura_locacao" value={formData.imovelData.assinatura_locacao || ''} onChange={(e) => handleChange(e, 'imovelData')} /></div>
                <div className="form-group"><label>Data de Vencimento</label><input type="date" name="vencimento_locacao" value={formData.imovelData.vencimento_locacao || ''} onChange={(e) => handleChange(e, 'imovelData')} /></div>
                <div className="form-group"><label>Dados do Locador</label><input type="text" name="dados_locador" value={formData.imovelData.dados_locador || ''} onChange={(e) => handleChange(e, 'imovelData')} /></div>
            </>)}
            
            <div className="form-group" style={{marginTop: '1rem'}}>
                <label>Anexar Contrato (PDF, Imagem ou XLSX)</label>
                <input type="file" name="contrato_pdf" onChange={handleFileChange} />
                {currentFilePath && (
                    <div style={{ marginTop: '10px', fontSize: '0.9rem' }}>
                        <span>Arquivo atual: </span>
                        <a href={`http://localhost:3001/${currentFilePath.replace(/\\/g, '/')}`} target="_blank" rel="noopener noreferrer">{currentFileName}</a>
                    </div>
                )}
            </div>

            <div className="modal-footer">
                <button type="submit" className="save-button">Salvar</button>
            </div>
        </form>
    );
};

export default ImovelForm;