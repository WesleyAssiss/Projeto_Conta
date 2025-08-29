import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { useData } from '../hooks/useData';
import { getSecretarias, createSecretaria, updateSecretaria, deleteSecretaria } from '../api/secretariasService';
import Modal from '../components/Modal';
import '../styles/Page.css';
import '../styles/Table.css';
import '../styles/Form.css';

const SecretariasPage = () => {
    const [secretarias, setSecretarias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSecretaria, setSelectedSecretaria] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const { dataVersion, refreshData } = useData();

    useEffect(() => {
        const fetchSecretarias = async () => {
            try {
                setLoading(true);
                const data = await getSecretarias();
                setSecretarias(data);
            } catch (err) {
                setError('Falha ao carregar as secretarias.');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchSecretarias();
    }, [dataVersion]);

    const handleCloseModals = () => {
        setIsModalOpen(false);
        setIsDeleteModalOpen(false);
        setSelectedSecretaria(null);
    };

    const handleAddClick = () => {
        setSelectedSecretaria({ nome: '', status: 'Ativa' });
        setIsModalOpen(true);
    };

    const handleEditClick = (secretaria) => {
        setSelectedSecretaria(secretaria);
        setIsModalOpen(true);
    };

    const handleDeleteClick = (secretaria) => {
        setSelectedSecretaria(secretaria);
        setIsDeleteModalOpen(true);
    };

    const handleSave = (e) => {
        e.preventDefault();
        const promise = selectedSecretaria.id
            ? updateSecretaria(selectedSecretaria.id, selectedSecretaria)
            : createSecretaria(selectedSecretaria);
        
        toast.promise(promise, {
            pending: 'Salvando secretaria...',
            success: 'Secretaria salva com sucesso!',
            error: 'Falha ao salvar a secretaria.'
        }).then(() => {
            handleCloseModals();
            refreshData();
        });
    };
    
    const handleConfirmDelete = () => {
        if (!selectedSecretaria) return;
        toast.promise(deleteSecretaria(selectedSecretaria.id), {
            pending: 'Excluindo secretaria...',
            success: 'Secretaria excluída com sucesso!',
            error: {
                render({data}){
                    return data.response?.data?.msg || 'Falha ao excluir a secretaria.'
                }
            }
        }).then(() => {
            handleCloseModals();
            refreshData();
        }).catch(err => console.error(err));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSelectedSecretaria(prev => ({ ...prev, [name]: value }));
    };

    const filteredSecretarias = useMemo(() => {
        if (!searchTerm) {
            return secretarias;
        }
        return secretarias.filter(secretaria =>
            secretaria.nome.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [secretarias, searchTerm]);

    if (loading) return <div>Carregando...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Gerenciar Secretarias</h1>
                <div className="page-controls">
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        className="search-bar"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <button onClick={handleAddClick} className="add-button">Adicionar Secretaria</button>
                </div>
            </div>

            <div className="table-container">
                <table className="styled-table">
                    <thead>
                        <tr>
                            <th>Nome da Secretaria</th>
                            <th>Status</th>
                            <th className="actions-cell">Ações</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filteredSecretarias.map(sec => (
                            <tr key={sec.id}>
                                <td>{sec.nome}</td>
                                <td>{sec.status}</td>
                                <td className="actions-cell">
                                    <button onClick={() => handleEditClick(sec)} className="edit-btn">Editar</button>
                                    <button onClick={() => handleDeleteClick(sec)} className="delete-btn">Excluir</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <Modal isOpen={isModalOpen} onClose={handleCloseModals} title={selectedSecretaria?.id ? 'Editar Secretaria' : 'Adicionar Secretaria'}>
                <form onSubmit={handleSave} className="form-container">
                    <div className="form-group">
                        <label htmlFor="nome">Nome</label>
                        <input type="text" id="nome" name="nome" value={selectedSecretaria?.nome || ''} onChange={handleInputChange} required />
                    </div>
                    <div className="form-group">
                        <label htmlFor="status">Status</label>
                        <select id="status" name="status" value={selectedSecretaria?.status || 'Ativa'} onChange={handleInputChange}>
                            <option value="Ativa">Ativa</option>
                            <option value="Inativa">Inativa</option>
                        </select>
                    </div>
                    <div className="modal-footer">
                        <button type="button" onClick={handleCloseModals} className="cancel-button">Cancelar</button>
                        <button type="submit" className="save-button">Salvar</button>
                    </div>
                </form>
            </Modal>
            
            <Modal isOpen={isDeleteModalOpen} onClose={handleCloseModals} title="Confirmar Exclusão">
                <p>Você tem certeza que deseja excluir a secretaria: <strong>{selectedSecretaria?.nome}</strong>?</p>
                <div className="modal-footer">
                    <button onClick={handleCloseModals} className="cancel-button">Cancelar</button>
                    <button onClick={handleConfirmDelete} className="confirm-button">Excluir</button>
                </div>
            </Modal>
        </div>
    );
};

export default SecretariasPage;