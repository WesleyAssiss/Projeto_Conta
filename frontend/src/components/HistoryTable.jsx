import React from 'react';
import '../styles/HistoryTable.css';
import '../styles/Table.css';

const HistoryTable = ({ history, type, onEdit, onDelete }) => {
    const isCemig = type === 'cemig';

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const userTimezoneOffset = date.getTimezoneOffset() * 60000;
        const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
        const options = { year: 'numeric', month: 'long' };
        return adjustedDate.toLocaleDateString('pt-BR', options);
    };

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    if (!history || history.length === 0) {
        return <p>Nenhum histórico de faturas encontrado.</p>;
    }

    return (
        <div className="history-table-container">
            <table className="styled-table history-table">
                <thead>
                    <tr>
                        <th>Mês de Referência</th>
                        <th>Valor da Fatura</th>
                        {!isCemig && <th>Valor IRRF</th>}
                        <th>Consumo ({isCemig ? 'kWh' : 'm³'})</th>
                        <th className="actions-cell">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    {history.map((item) => (
                        <tr key={item.id}>
                            <td>{formatDate(item.mes_referencia)}</td>
                            <td>{formatCurrency(item.valor_fatura)}</td>
                            {!isCemig && <td>{formatCurrency(item.valor_irrf)}</td>}
                            <td>{isCemig ? item.consumo_kwh : item.consumo_m3}</td>
                            <td className="actions-cell">
                                <button onClick={() => onEdit(item)} className="edit-btn">Editar</button>
                                <button onClick={() => onDelete(item)} className="delete-btn">Excluir</button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

export default HistoryTable;