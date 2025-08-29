import axios from 'axios';

const API_URL = 'http://localhost:3001/api/reports';

export const getAnnualReport = async (year, secretariaId, company) => {
    try {
        const response = await axios.get(`${API_URL}/annual`, { params: { year, secretaria_id: secretariaId, company } });
        return response.data;
    } catch (error) {
        console.error(`Erro ao buscar relatório anual para o ano de ${year}:`, error);
        throw error;
    }
};