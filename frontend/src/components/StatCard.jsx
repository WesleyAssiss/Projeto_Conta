import React from 'react';

const StatCard = ({ title, value, isCurrency = false }) => {
    const formatValue = () => {
        if (isCurrency) {
            return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
        }
        return value;
    };

    return (
        <div className="stat-card">
            <h3>{title}</h3>
            <div className="value">{formatValue()}</div>
        </div>
    );
};

export default StatCard;