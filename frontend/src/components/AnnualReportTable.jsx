import React from 'react';
import '../styles/Table.css';

const AnnualReportTable = ({ data, year, companyFilter }) => {
    const months = ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"];

    const formatCurrency = (value) => {
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value || 0);
    };

    const renderMonthlyTotals = (type) => {
        return months.map((_, index) => {
            const monthlyTotal = Object.values(data).reduce((sum, secData) => sum + (secData[type].mensal[index]?.valor || 0), 0);
            return <td key={index}>{formatCurrency(monthlyTotal)}</td>;
        });
    };
    
    const renderGrandTotal = (type) => {
        const grandTotal = Object.values(data).reduce((sum, secData) => sum + secData[type].total_anual_valor, 0);
        return <td>{formatCurrency(grandTotal)}</td>
    };

    return (
        <div className="table-container" style={{ maxHeight: '70vh', overflowX: 'auto' }}>
            <table className="styled-table annual-report-table">
                <thead>
                    <tr>
                        <th>Secretarias - Ano {year}</th>
                        {months.map(month => <th key={month}>{month}</th>)}
                        <th>Total Anual</th>
                    </tr>
                </thead>
                <tbody>
                    {Object.entries(data).map(([secretaria, secData]) => (
                        <React.Fragment key={secretaria}>
                            <tr className="secretaria-header-row">
                                <td colSpan="14"><strong>{secretaria}</strong></td>
                            </tr>
                            {companyFilter !== 'copasa' && (
                                <tr className="company-row">
                                    <td><span style={{paddingLeft: '20px'}}>CEMIG</span></td>
                                    {secData.cemig.mensal.map((mes, index) => (
                                        <td key={index}>
                                            <div>{formatCurrency(mes.valor)}</div>
                                            <div className="consumo-text">{mes.consumo > 0 && `${mes.consumo} kWh`}</div>
                                        </td>
                                    ))}
                                    <td>
                                        <div><strong>{formatCurrency(secData.cemig.total_anual_valor)}</strong></div>
                                        <div className="consumo-text">{secData.cemig.total_anual_consumo > 0 && `${secData.cemig.total_anual_consumo} kWh`}</div>
                                    </td>
                                </tr>
                            )}
                            {companyFilter !== 'cemig' && (
                                <tr className="company-row">
                                    <td><span style={{paddingLeft: '20px'}}>COPASA</span></td>
                                    {secData.copasa.mensal.map((mes, index) => (
                                        <td key={index}>
                                            <div>{formatCurrency(mes.valor)}</div>
                                            <div className="consumo-text">{mes.consumo > 0 && `${mes.consumo} m³`}</div>
                                        </td>
                                    ))}
                                    <td>
                                        <div><strong>{formatCurrency(secData.copasa.total_anual_valor)}</strong></div>
                                        <div className="consumo-text">{secData.copasa.total_anual_consumo > 0 && `${secData.copasa.total_anual_consumo} m³`}</div>
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
                <tfoot>
                    <tr className="secretaria-header-row" style={{backgroundColor: '#e9ecef'}}>
                        <td colSpan="14"><strong>Total Geral</strong></td>
                    </tr>
                    {companyFilter !== 'copasa' && (
                        <tr style={{fontWeight: 'bold'}}>
                            <td><span style={{paddingLeft: '20px'}}>CEMIG</span></td>
                            {renderMonthlyTotals('cemig')}
                            {renderGrandTotal('cemig')}
                        </tr>
                    )}
                    {companyFilter !== 'cemig' && (
                         <tr style={{fontWeight: 'bold'}}>
                            <td><span style={{paddingLeft: '20px'}}>COPASA</span></td>
                            {renderMonthlyTotals('copasa')}
                            {renderGrandTotal('copasa')}
                        </tr>
                    )}
                </tfoot>
            </table>
        </div>
    );
};

export default AnnualReportTable;