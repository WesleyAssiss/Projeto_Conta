import React, { useState, useEffect } from 'react';
import { getImoveis } from '../api/imoveisService';
import '../styles/Form.css';

const ContractForm = ({ initialData, onSave, type }) => {
  const [formData, setFormData] = useState({});
  const [imoveis, setImoveis] = useState([]);

  useEffect(() => {
    const loadImoveis = async () => {
      try {
        const data = await getImoveis();
        setImoveis(data);
      } catch (error) {
        console.error("Falha ao carregar imóveis.", error);
      }
    };
    loadImoveis();
  }, []);

  useEffect(() => {
    setFormData(initialData);
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
      {!formData.id && (
         <div className="form-group">
            <label htmlFor="imovel_id">Imóvel (Endereço)</label>
            <select id="imovel_id" name="imovel_id" value={formData.imovel_id || ''} onChange={handleChange} required>
              <option value="">Selecione um imóvel</option>
              {imoveis.map(imovel => (
                <option key={imovel.id} value={imovel.id}>{imovel.endereco}</option>
              ))}
            </select>
          </div>
      )}

      {type === 'cemig' && (
        <>
            <div className="form-group">
                <label htmlFor="numero_contrato">Nº Instalação</label>
                <input
                    type="text"
                    id="numero_contrato"
                    name="numero_contrato"
                    value={formData.numero_contrato || ''}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="numero_relogio">Nº do Relógio</label>
                <input
                    type="text"
                    id="numero_relogio"
                    name="numero_relogio"
                    value={formData.numero_relogio || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label htmlFor="contrato">Contrato</label>
                <input
                    type="text"
                    id="contrato"
                    name="contrato"
                    value={formData.contrato || ''}
                    onChange={handleChange}
                />
            </div>
        </>
      )}

      {type === 'copasa' && (
        <>
            <div className="form-group">
                <label htmlFor="matricula_copasa">Matrícula COPASA</label>
                <input
                    type="text"
                    id="matricula_copasa"
                    name="matricula_copasa"
                    value={formData.matricula_copasa || ''}
                    onChange={handleChange}
                    required
                />
            </div>
            <div className="form-group">
                <label htmlFor="identificador_usuario">Identificador do Usuário</label>
                <input
                    type="text"
                    id="identificador_usuario"
                    name="identificador_usuario"
                    value={formData.identificador_usuario || ''}
                    onChange={handleChange}
                />
            </div>
            <div className="form-group">
                <label htmlFor="centralizadora">Centralizadora</label>
                <input
                    type="text"
                    id="centralizadora"
                    name="centralizadora"
                    value={formData.centralizadora || ''}
                    onChange={handleChange}
                />
            </div>
        </>
      )}

      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select
          id="status"
          name="status"
          value={formData.status || 'Ativo'}
          onChange={handleChange}
        >
          <option value="Ativo">Ativo</option>
          <option value="Inativo">Inativo</option>
          <option value="Suspenso">Suspenso</option>
        </select>
      </div>
      
      <div className="modal-footer">
        <button type="submit" className="save-button">Salvar</button>
      </div>
    </form>
  );
};

export default ContractForm;