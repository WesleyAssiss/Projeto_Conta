import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useData } from '../hooks/useData';
import { getContratos, deleteContrato, getHistorico, addHistorico, updateHistorico, deleteHistorico } from '../api/cemigService';
import ContractCard from '../components/ContractCard';
import Modal from '../components/Modal';
import HistoryTable from '../components/HistoryTable';
import HistoryForm from '../components/HistoryForm';
import '../styles/Page.css';
import { useNavigate } from 'react-router-dom';

const CemigPage = () => {
  const [contratos, setContratos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isHistoryFormModalOpen, setIsHistoryFormModalOpen] = useState(false);
  const [isHistoryDeleteModalOpen, setIsHistoryDeleteModalOpen] = useState(false);
  
  const [selectedContrato, setSelectedContrato] = useState(null);
  const [historyData, setHistoryData] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [selectedHistory, setSelectedHistory] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { dataVersion, refreshData } = useData();

  useEffect(() => {
    const fetchContratos = async () => {
        try {
          setLoading(true);
          const data = await getContratos();
          setContratos(data);
          setError(null);
        } catch (err) {
          setError('Falha ao carregar os dados.');
          console.error(err);
        } finally {
          setLoading(false);
        }
    };
    fetchContratos();
  }, [dataVersion]);

  const handleCloseModals = () => {
    setIsViewModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsHistoryFormModalOpen(false);
    setIsHistoryDeleteModalOpen(false);
    setSelectedContrato(null);
    setSelectedHistory(null);
    setHistoryData([]);
  };

  const handleViewClick = async (contrato) => {
    setSelectedContrato(contrato);
    setIsViewModalOpen(true);
    setLoadingHistory(true);
    try {
        const history = await getHistorico(contrato.id);
        setHistoryData(history);
    } catch (err) {
        toast.error("Falha ao buscar histórico do contrato.");
        console.error(err);
        setHistoryData([]);
    } finally {
        setLoadingHistory(false);
    }
  };
  
  const handleEditClick = (contrato) => {
    navigate(`/imoveis?edit=${contrato.imovel_id}`);
  };

  const handleDeleteClick = (contrato) => {
    setSelectedContrato(contrato);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!selectedContrato) return;
    toast.promise(deleteContrato(selectedContrato.id), {
        pending: 'Excluindo contrato...',
        success: 'Contrato excluído com sucesso!',
        error: 'Falha ao excluir o contrato.'
    }).then(() => {
        handleCloseModals();
        refreshData();
    });
  };
  
  const handleAddHistoryClick = () => {
      setSelectedHistory({});
      setIsHistoryFormModalOpen(true);
  }

  const handleEditHistoryClick = (historyItem) => {
      setSelectedHistory(historyItem);
      setIsHistoryFormModalOpen(true);
  }

  const handleDeleteHistoryClick = (historyItem) => {
      setSelectedHistory(historyItem);
      setIsHistoryDeleteModalOpen(true);
  }

  const handleSaveHistory = (formData) => {
    const promise = formData.id
        ? updateHistorico(selectedContrato.id, formData.id, formData)
        : addHistorico(selectedContrato.id, formData);
    
    toast.promise(promise, {
        pending: 'Salvando fatura...',
        success: 'Fatura salva com sucesso!',
        error: 'Falha ao salvar a fatura.'
    }).then(() => {
        handleViewClick(selectedContrato);
        setIsHistoryFormModalOpen(false);
        setSelectedHistory(null);
        refreshData();
    });
  };

  const handleConfirmDeleteHistory = () => {
      if(!selectedContrato || !selectedHistory) return;
      toast.promise(deleteHistorico(selectedContrato.id, selectedHistory.id), {
          pending: 'Excluindo fatura...',
          success: 'Fatura excluída com sucesso!',
          error: 'Falha ao excluir a fatura.'
      }).then(() => {
          handleViewClick(selectedContrato);
          setIsHistoryDeleteModalOpen(false);
          setSelectedHistory(null);
          refreshData();
      });
  };

  const handleGenerateReport = () => {
    if(!selectedContrato) return;
    const reportUrl = `http://localhost:3001/api/cemig/${selectedContrato.id}/report`;
    window.open(reportUrl, '_blank');
  };

  const filteredContratos = useMemo(() => {
    if (!searchTerm) {
        return contratos;
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return contratos.filter(contrato => 
        (contrato.endereco?.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (contrato.secretaria_nome?.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (contrato.numero_contrato?.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (contrato.numero_relogio?.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (contrato.contrato?.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (contrato.setor?.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (contrato.bairro?.toLowerCase().includes(lowerCaseSearchTerm)) ||
        (contrato.cep?.toLowerCase().includes(lowerCaseSearchTerm))
    );
  }, [contratos, searchTerm]);

  if (loading) return <div>Carregando...</div>;
  if (error) return <div style={{ color: 'red' }}>{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1>Contratos CEMIG</h1>
        <div className="page-controls">
            <input 
                type="text"
                placeholder="Buscar por qualquer campo..."
                className="search-bar"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="grid-container">
        {filteredContratos.map((contrato) => (
          <ContractCard
            key={contrato.id}
            data={contrato}
            type="cemig"
            onView={() => handleViewClick(contrato)}
            onEdit={() => handleEditClick(contrato)}
            onDelete={() => handleDeleteClick(contrato)}
          />
        ))}
      </div>

      <Modal isOpen={isViewModalOpen} onClose={handleCloseModals} title={`Detalhes: ${selectedContrato?.endereco}`}>
          <div className="page-header" style={{marginBottom: "10px", paddingBottom: "10px", borderBottom: "1px solid var(--color-border)"}}>
            <h4>Histórico de Faturas</h4>
            <div className='page-controls'>
                <button onClick={handleGenerateReport} className="add-button" style={{fontSize: "0.8rem", padding: "6px 10px", backgroundColor: "#52c41a"}}>Gerar Relatório</button>
                <button onClick={handleAddHistoryClick} className="add-button" style={{fontSize: "0.8rem", padding: "6px 10px"}}>Adicionar Fatura</button>
            </div>
          </div>
          {loadingHistory ? <p>Carregando histórico...</p> : <HistoryTable history={historyData} type="cemig" onEdit={handleEditHistoryClick} onDelete={handleDeleteHistoryClick} />}
      </Modal>
      
      <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModals} title="Confirmar Exclusão">
        <p>Você tem certeza que deseja excluir o contrato do endereço: <strong>{selectedContrato?.endereco}?</strong></p>
        <div className="modal-footer">
          <button onClick={handleCloseModals} className="cancel-button">Cancelar</button>
          <button onClick={handleConfirmDelete} className="confirm-button">Excluir</button>
        </div>
      </Modal>

      <Modal isOpen={isHistoryFormModalOpen} onClose={handleCloseModals} title={selectedHistory?.id ? 'Editar Fatura' : 'Adicionar Fatura'}>
        <HistoryForm initialData={selectedHistory} onSave={handleSaveHistory} type="cemig" />
      </Modal>
      
      <Modal isOpen={isHistoryDeleteModalOpen} onClose={handleCloseModals} title="Confirmar Exclusão de Fatura">
          <p>Você tem certeza que deseja excluir esta fatura?</p>
          <div className="modal-footer">
            <button onClick={handleCloseModals} className="cancel-button">Cancelar</button>
            <button onClick={handleConfirmDeleteHistory} className="confirm-button">Excluir</button>
          </div>
      </Modal>
    </div>
  );
};

export default CemigPage;