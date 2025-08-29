import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useData } from '../hooks/useData';
import { getImoveis, getImovelWithContractsById, addImovelWithContracts, updateImovelWithContracts, deleteImovel } from '../api/imoveisService';
import Modal from '../components/Modal';
import ImovelForm from '../components/ImovelForm';
import '../styles/Page.css';
import '../styles/Table.css';

const ImoveisPage = () => {
    const [imoveis, setImoveis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedImovel, setSelectedImovel] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { dataVersion, refreshData } = useData();

    useEffect(() => {
        const fetchImoveis = async () => {
            try {
                setLoading(true);
                const data = await getImoveis();
                setImoveis(data);
            } catch (err) {
                setError('Falha ao carregar os imóveis.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchImoveis();
    }, [dataVersion]);

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedImovel(null);
    };

    const handleAddClick = () => {
        setSelectedImovel({});
        setIsModalOpen(true);
    };

    const handleEditClick = async (imovel) => {
        try {
            const fullImovelData = await getImovelWithContractsById(imovel.id);
            setSelectedImovel(fullImovelData);
            setIsModalOpen(true);
        } catch (err) {
            toast.error("Falha ao carregar dados completos do imóvel.");
            console.error(err);
        }
    };
    
    const handleDeleteClick = (imovel) => {
        setSelectedImovel(imovel);
        setIsDeleteModalOpen(true);
    };

    const handleSave = (formData, file) => {
        const data = new FormData();
        data.append('jsonData', JSON.stringify(formData));
        if (file) {
            data.append('contrato_pdf', file);
        } else if (formData.imovelData.contrato_path) {
            data.append('contrato_path_existente', formData.imovelData.contrato_path);
        }
        
        const promise = formData.imovelData.id 
            ? updateImovelWithContracts(formData.imovelData.id, data) 
            : addImovelWithContracts(data);

        toast.promise(promise, {
            pending: 'Salvando imóvel e contratos...',
            success: 'Operação realizada com sucesso!',
            error: { render({data}){ return data.response?.data?.msg || 'Falha ao salvar.' }}
        }).then(() => {
            handleCloseModals();
            refreshData();
        }).catch(err => console.error(err));
    };
    
    const handleConfirmDelete = () => {
        if (!selectedImovel) return;
        toast.promise(deleteImovel(selectedImovel.id), {
            pending: 'Excluindo imóvel...',
            success: 'Imóvel excluído com sucesso!',
            error: { render({data}){ return data.response?.data?.msg || 'Falha ao excluir o imóvel.' }}
        }).then(() => {
            handleCloseModals();
            refreshData();
        }).catch(err => console.error(err));
    };

    const handleViewAttachment = (filePath) => {
        if (!filePath) return;
        window.open(`http://localhost:3001/${filePath}`, '_blank');
    };

    const filteredImoveis = useMemo(() => {
        if (!searchTerm) {
            return imoveis;
        }
        return imoveis.filter(imovel => 
            (imovel.endereco?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (imovel.setor?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (imovel.bairro?.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (imovel.secretaria_nome?.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    }, [imoveis, searchTerm]);

    if (loading) return <div>Carregando...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Gerenciar Imóveis</h1>
                <div className="page-controls">
                    <input 
                        type="text"
                        placeholder="Buscar por endereço, setor, bairro..."
                        className="search-bar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button onClick={handleAddClick} className="add-button">Adicionar Imóvel</button>
                </div>
            </div>

            <div className="table-container">
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>Endereço</th>
                            <th>Setor</th>
                            <th>Status</th>
                            <th className="actions-cell">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredImoveis.map(imovel => (
                            <tr key={imovel.id}>
                                <td>{imovel.endereco}</td>
                                <td>{imovel.setor}</td>
                                <td>{imovel.status}</td>
                                <td className="actions-cell">
                                    {imovel.contrato_path && (
                                        <button onClick={() => handleViewAttachment(imovel.contrato_path)} className="view-btn">Ver Anexo</button>
                                    )}
                                    <button onClick={() => handleEditClick(imovel)} className="edit-btn">Editar</button>
                                    <button onClick={() => handleDeleteClick(imovel)} className="delete-btn">Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={selectedImovel?.id ? 'Editar Imóvel' : 'Adicionar Imóvel'} closeOnClickOutside={false}>
                <ImovelForm
                    key={selectedImovel?.id || 'new'}
                    initialData={selectedImovel || {}}
                    onSave={handleSave}
                />
            </Modal>
            
            <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModals} title="Confirmar Exclusão">
                <p>Você tem certeza que deseja excluir o imóvel: <strong>{selectedImovel?.endereco}</strong>?</p>
                <div className="modal-footer">
                    <button onClick={handleCloseModals} className="cancel-button">Cancelar</button>
                    <button onClick={handleConfirmDelete} className="confirm-button">Excluir</button>
                </div>
            </Modal>
        </div>
    );
};

export default ImoveisPage;