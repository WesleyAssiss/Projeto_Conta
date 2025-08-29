import axios from 'axios';

const API_URL = 'http://localhost:3001/api/dashboard';

export const getStats = async (secretariaId) => {
    try {
        const response = await axios.get(`${API_URL}/stats`, { params: { secretaria_id: secretariaId } });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar estatísticas do dashboard:', error);
        throw error;
    }
};

export const getGastosMensais = async (secretariaId) => {
    try {
        const response = await axios.get(`${API_URL}/gastos-mensais`, { params: { secretaria_id: secretariaId } });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar dados do gráfico de gastos:', error);
        throw error;
    }
};

export const getTopSpendingContracts = async (secretariaId) => {
    try {
        const response = await axios.get(`${API_URL}/top-spending`, { params: { secretaria_id: secretariaId } });
        return response.data;
    } catch (error) {
        console.error('Erro ao buscar top contratos:', error);
        throw error;
    }
};