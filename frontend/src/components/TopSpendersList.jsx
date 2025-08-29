import React from 'react';

const TopSpendersList = ({ contracts }) => {

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    return (
        <div className="dashboard-container top-spenders-container">
            <h2>Top 10 Contratos com Maiores Gastos (Geral)</h2>
            <ul className="top-spenders-list">
                {contracts.map((contract, index) => (
                    <li key={index} className="top-spenders-item">
                        <div className="info">
                            <span className={`tipo-badge ${contract.tipo.toLowerCase()}`}>{contract.tipo}</span>
                            <span className="endereco">{contract.endereco}</span>
                        </div>
                        <span className="total">{formatCurrency(contract.total_gasto)}</span>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default TopSpendersList;