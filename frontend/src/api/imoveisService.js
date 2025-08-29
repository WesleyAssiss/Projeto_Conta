import axios from 'axios';

const API_URL = 'http://localhost:3001/api/imoveis';

export const getImoveis = async () => {
    try {
        const response = await axios.get(API_URL);
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar imóveis:', error);
        throw error;
    }
};

export const getImovelWithContractsById = async (id) => {
    try {
        const response = await axios.get(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar imóvel com id ${id}:`, error);
        throw error;
    }
};

export const addImovelWithContracts = async (formData) => {
    try {
        const response = await axios.post(API_URL, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error('Erro ao criar imóvel:', error);
        throw error;
    }
};

export const updateImovelWithContracts = async (id, formData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar imóvel ${id}:`, error);
        throw error;
    }
};

export const deleteImovel = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao deletar imóvel ${id}:`, error);
        throw error;
    }
};