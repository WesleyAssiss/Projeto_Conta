import React from 'react';
import '../styles/ContractCard.css';

const ContractCard = ({ data, type, onView, onEdit, onDelete }) => {
  const isCemig = type === 'cemig';

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
  };

  if (!data) {
    return <div className="card">Dados indisponíveis.</div>;
  }

  // Determina qual tipo de imóvel exibir com base no tipo de contrato
  const tipoImovelExibido = isCemig ? data.tipo_imovel : data.tipo_imovel_copasa;
  
  return (
    <div className="card">
      <div className="card-header">
        <h3>{data.endereco || 'Endereço não informado'}</h3>
        {data.status && (
          <span className={`status ${data.status.toLowerCase()}`}>
            {data.status}
          </span>
        )}
      </div>
      <div className="card-body">
        <p><strong>Endereço Completo:</strong> {`${data.endereco || ''}, ${data.bairro || ''} - CEP: ${data.cep || 'N/A'}`}</p>
        <p><strong>Secretaria:</strong> {data.secretaria_nome || 'N/A'}</p>
        <p><strong>Setor:</strong> {data.setor || 'N/A'}</p>
        <p><strong>Imóvel:</strong> {tipoImovelExibido || 'N/A'}</p>
        
        <hr className="card-divider" />

        {isCemig ? (
            <>
                <p><strong>Nº Instalação:</strong> {data.numero_contrato}</p>
                <p><strong>Nº Relógio:</strong> {data.numero_relogio || 'N/A'}</p>
                <p><strong>Contrato:</strong> {data.contrato || 'N/A'}</p>
            </>
        ) : (
            <>
                <p><strong>Matrícula:</strong> {data.matricula_copasa}</p>
                <p><strong>Identificador:</strong> {data.identificador_usuario || 'N/A'}</p>
                <p><strong>Centralizadora:</strong> {data.centralizadora || 'N/A'}</p>
            </>
        )}
      </div>
      <div className="card-totals">
        <div className="total-item">
            <span>Valor Total</span>
            <strong>{formatCurrency(data.valor_total)}</strong>
        </div>
        <div className="total-item">
            <span>Consumo Total</span>
            <strong>{data.consumo_total} {isCemig ? 'kWh' : 'm³'}</strong>
        </div>
      </div>
      <div className="card-footer">
        <button onClick={onView}>Visualizar</button>
        <button onClick={onEdit}>Editar</button>
        <button onClick={onDelete} className="delete-button">Excluir</button>
      </div>
    </div>
  );
};

export default ContractCard;