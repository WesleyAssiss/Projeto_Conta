import React, { useState, useEffect } from 'react';
import { getStats, getGastosMensais, getTopSpendingContracts } from '../api/dashboardService';
import { getSecretarias } from '../api/secretariasService';
import StatCard from '../components/StatCard';
import BarChart from '../components/BarChart';
import TopSpendersList from '../components/TopSpendersList';
import '../styles/Page.css';
import '../styles/Dashboard.css';

const DashboardPage = () => {
    const [stats, setStats] = useState(null);
    const [gastos, setGastos] = useState([]);
    const [topSpenders, setTopSpenders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [secretarias, setSecretarias] = useState([]);
    const [selectedSecretaria, setSelectedSecretaria] = useState('');

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

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsData, gastosData, topSpendersData] = await Promise.all([
                    getStats(selectedSecretaria),
                    getGastosMensais(selectedSecretaria),
                    getTopSpendingContracts(selectedSecretaria)
                ]);
                setStats(statsData);
                setGastos(gastosData);
                setTopSpenders(topSpendersData);
            } catch (err) {
                setError("Falha ao carregar dados do dashboard.");
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [selectedSecretaria]);

    if (loading) return <div>Carregando dashboard...</div>;
    if (error) return <div style={{ color: 'red' }}>{error}</div>;

    return (
        <div>
            <div className="page-header">
                <h1>Dashboard de Análise</h1>
                <div className="page-controls">
                    <select className="search-bar" value={selectedSecretaria} onChange={(e) => setSelectedSecretaria(e.target.value)}>
                        <option value="">Geral (Todas as Secretarias)</option>
                        {secretarias.map(sec => (
                            <option key={sec.id} value={sec.id}>{sec.nome}</option>
                        ))}
                    </select>
                </div>
            </div>
            
            <div className="dashboard-grid">
                {stats && <>
                    <StatCard title="Contratos Ativos CEMIG" value={stats.totalContratosCemig} />
                    <StatCard title="Contratos Ativos COPASA" value={stats.totalContratosCopasa} />
                    <StatCard title="Gasto do Mês CEMIG" value={stats.gastoMesAtualCemig} isCurrency />
                    <StatCard title="Gasto do Mês COPASA" value={stats.gastoMesAtualCopasa} isCurrency />
                </>}

                <div className="dashboard-container chart-container">
                    <BarChart chartData={gastos} />
                </div>

                <TopSpendersList contracts={topSpenders} />
            </div>
        </div>
    );
};

export default DashboardPage;