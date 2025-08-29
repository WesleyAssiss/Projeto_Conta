import React, { useState, useEffect } from 'react';
import { getAnnualReport } from '../api/reportService';
import { getSecretarias } from '../api/secretariasService';
import AnnualReportTable from '../components/AnnualReportTable';
import '../styles/Page.css';

const RelatorioPage = () => {
    const [reportData, setReportData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [year, setYear] = useState(new Date().getFullYear());
    const [secretarias, setSecretarias] = useState([]);
    const [selectedSecretaria, setSelectedSecretaria] = useState('');
    const [selectedCompany, setSelectedCompany] = useState('ambos');
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchSecretarias = async () => {
            try {
                const data = await getSecretarias();
                setSecretarias(data);
            } catch (err) {
                console.error("Falha ao carregar secretarias.", err);
            }
        };
        fetchSecretarias();
    }, []);

    const handleGenerateReport = async () => {
        setLoading(true);
        setError('');
        setReportData(null);
        try {
            const data = await getAnnualReport(year, selectedSecretaria, selectedCompany);
            if (Object.keys(data).length === 0) {
                setError(`Nenhum dado encontrado para os filtros selecionados no ano de ${year}.`);
            } else {
                setReportData(data);
            }
        } catch (err) {
            setError('Falha ao gerar o relatório.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    
    const handleDownloadPDF = () => {
        const params = new URLSearchParams({
            year,
            secretaria_id: selectedSecretaria,
            company: selectedCompany,
        });
        const reportUrl = `http://localhost:3001/api/reports/annual/pdf?${params.toString()}`;
        window.open(reportUrl, '_blank');
    };

    const availableYears = () => {
        const currentYear = new Date().getFullYear();
        const years = [];
        for (let y = currentYear; y >= 2020; y--) { years.push(y); }
        return years;
    };

    return (
        <div>
            <div className="page-header">
                <h1>Relatório Anual por Secretaria</h1>
            </div>

            <div className="page-controls" style={{ gap: '1rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
                <select className="search-bar" value={year} onChange={e => setYear(parseInt(e.target.value, 10))}>
                    {availableYears().map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select className="search-bar" value={selectedSecretaria} onChange={e => setSelectedSecretaria(e.target.value)}>
                    <option value="">Todas as Secretarias</option>
                    {secretarias.map(s => <option key={s.id} value={s.id}>{s.nome}</option>)}
                </select>
                <select className="search-bar" value={selectedCompany} onChange={e => setSelectedCompany(e.target.value)}>
                    <option value="ambos">CEMIG e COPASA</option>
                    <option value="cemig">Apenas CEMIG</option>
                    <option value="copasa">Apenas COPASA</option>
                </select>
                <button onClick={handleGenerateReport} className="add-button" disabled={loading}>
                    {loading ? 'Gerando...' : 'Gerar Relatório'}
                </button>
                {reportData && (
                    <button onClick={handleDownloadPDF} className="add-button" style={{backgroundColor: '#52c41a'}}>
                        Salvar em PDF
                    </button>
                )}
            </div>

            {error && <p style={{ color: 'red' }}>{error}</p>}
            {reportData && <AnnualReportTable data={reportData} year={year} companyFilter={selectedCompany} />}
        </div>
    );
};

export default RelatorioPage;