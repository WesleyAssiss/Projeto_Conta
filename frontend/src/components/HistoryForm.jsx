import React, { useState, useEffect } from 'react';
import '../styles/Form.css';

const HistoryForm = ({ initialData, onSave, type }) => {
  const [formData, setFormData] = useState({});
  const isCemig = type === 'cemig';

  useEffect(() => {
    const [year, month] = (initialData.mes_referencia || new Date().toISOString().slice(0, 7)).split('-');
    setFormData({
        ...initialData,
        mes_referencia: `${year}-${month.padStart(2, '0')}`
    });
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const dataToSave = {
        ...formData,
        mes_referencia: `${formData.mes_referencia}-01`
    }
    onSave(dataToSave);
  };

  return (
    <form onSubmit={handleSubmit} className="form-container">
        <div className="form-group">
            <label htmlFor="mes_referencia">Mês de Referência</label>
            <input 
                type="month"
                id="mes_referencia"
                name="mes_referencia"
                value={formData.mes_referencia || ''}
                onChange={handleChange}
                required
            />
        </div>
        <div className="form-group">
            <label htmlFor="valor_fatura">Valor da Fatura (R$)</label>
            <input 
                type="number"
                id="valor_fatura"
                name="valor_fatura"
                step="0.01"
                value={formData.valor_fatura || ''}
                onChange={handleChange}
                required
            />
        </div>
        {!isCemig && (
             <div className="form-group">
                <label htmlFor="valor_irrf">Retenção IRRF (R$)</label>
                <input 
                    type="number"
                    id="valor_irrf"
                    name="valor_irrf"
                    step="0.01"
                    value={formData.valor_irrf || ''}
                    onChange={handleChange}
                />
            </div>
        )}
        <div className="form-group">
            <label htmlFor="consumo">{`Consumo (${isCemig ? 'kWh' : 'm³'})`}</label>
            <input 
                type="number"
                id="consumo"
                name={isCemig ? 'consumo_kwh' : 'consumo_m3'}
                value={formData[isCemig ? 'consumo_kwh' : 'consumo_m3'] || ''}
                onChange={handleChange}
            />
        </div>
      <div className="modal-footer">
        <button type="submit" className="save-button">Salvar</button>
      </div>
    </form>
  );
};

export default HistoryForm;