import axios from 'axios';

const API_URL = 'http://localhost:3001/api/copasa';

export const getContratos = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar contratos da COPASA:', error);
    throw error;
  }
};

export const getContratoById = async (id) => {
  try {
    const response = await axios.get(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao buscar contrato COPASA com id ${id}:`, error);
    throw error;
  }
};

export const createContrato = async (contratoData) => {
    try {
        const response = await axios.post(API_URL, contratoData);
        return response.data;
    } catch (error) {
        console.error('Erro ao criar contrato COPASA:', error);
        throw error;
    }
};

export const updateContrato = async (id, contratoData) => {
    try {
        const response = await axios.put(`${API_URL}/${id}`, contratoData);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar contrato COPASA com id ${id}:`, error);
        throw error;
    }
};

export const deleteContrato = async (id) => {
  try {
    const response = await axios.delete(`${API_URL}/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erro ao deletar contrato COPASA com id ${id}:`, error);
    throw error;
  }
};

export const getHistorico = async (contratoId) => {
    try {
        const response = await axios.get(`${API_URL}/${contratoId}/historico`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar histórico do contrato ${contratoId}:`, error);
        throw error;
    }
};

export const addHistorico = async (contratoId, historicoData) => {
    try {
        const response = await axios.post(`${API_URL}/${contratoId}/historico`, historicoData);
        return response.data;
    } catch (error) {
        console.error(`Erro ao adicionar histórico ao contrato ${contratoId}:`, error);
        throw error;
    }
};

export const updateHistorico = async (contratoId, historicoId, historicoData) => {
    try {
        const response = await axios.put(`${API_URL}/${contratoId}/historico/${historicoId}`, historicoData);
        return response.data;
    } catch (error) {
        console.error(`Erro ao atualizar histórico ${historicoId}:`, error);
        throw error;
    }
};

export const deleteHistorico = async (contratoId, historicoId) => {
    try {
        const response = await axios.delete(`${API_URL}/${contratoId}/historico/${historicoId}`);
        return response.data;
    } catch (error) {
        console.error(`Erro ao deletar histórico ${historicoId}:`, error);
        throw error;
    }
};