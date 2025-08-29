import axios from 'axios';

const API_URL = 'http://localhost:3001/api/secretarias';

export const getSecretarias = async (params = {}) => {
    try {
        const response = await axios.get(API_URL, { params });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar secretarias:', error);
        throw error;
    }
};

export const createSecretaria = async (secretariaData) => {
    try {
        const response = await axios.post(API_URL, secretariaData);
        return response.data;
    } catch (error) {
        console.error('Erro ao criar secretaria:', error);
        throw error;
    }
};

export const updateSecretaria = async (id, secretariaData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, secretariaData);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar secretaria ${id}:`, error);
        throw error;
    }
};

export const deleteSecretaria = async (id) => {
    try {
        const response = await axios.delete(`${API_URL}/${id}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao deletar secretaria ${id}:`, error);
        throw error;
    }
};