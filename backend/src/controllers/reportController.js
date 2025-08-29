const PDFDocument = require('pdfkit');
const db = require('../config/db');
const cemigQueries = require('../queries/cemigQueries');
const copasaQueries = require('../queries/copasaQueries');
const reportQueries = require('../queries/reportQueries');

const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    const userTimezoneOffset = date.getTimezoneOffset() * 60000;
    const adjustedDate = new Date(date.getTime() + userTimezoneOffset);
    return adjustedDate.toLocaleDateString('pt-BR', { year: 'numeric', month: 'long' });
};

const formatCurrency = (value) => {
    if (value === null || value === undefined) return 'R$ 0,00';
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
};

const generateCemigReport = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const contractRes = await db.query(cemigQueries.getContratoCemigById, [id]);
        const historyRes = await db.query(cemigQueries.getHistoricoCemig, [id]);

        if (contractRes.rows.length === 0) {
            return res.status(404).send('Contrato não encontrado');
        }

        const contract = contractRes.rows[0];
        const history = historyRes.rows;
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=relatorio_cemig_${contract.numero_contrato}.pdf`);
        doc.pipe(res);

        doc.fontSize(20).font('Helvetica-Bold').text('Relatório de Contrato - CEMIG', { align: 'center' });
        doc.fontSize(12).font('Helvetica').text(`Número do Contrato (Instalação): ${contract.numero_contrato}`, { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(14).font('Helvetica-Bold').text('Dados do Imóvel');
        doc.fontSize(12).font('Helvetica').text(`Endereço: ${contract.endereco || ''}, ${contract.bairro || ''}`);
        doc.text(`Setor: ${contract.setor || 'N/A'}`);
        doc.text(`Secretaria: ${contract.secretaria_nome || 'N/A'}`);
        doc.text(`Nº do Relógio: ${contract.numero_relogio || 'N/A'}`);
        doc.text(`Status do Contrato: ${contract.status}`);
        doc.moveDown();

        doc.fontSize(14).font('Helvetica-Bold').text('Histórico de Faturas');
        doc.moveDown(0.5);

        const tableTop = doc.y;
        const itemX = 50;
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Mês de Referência', itemX, tableTop);
        doc.text('Valor (R$)', 250, tableTop, { width: 150, align: 'right' });
        doc.text('Consumo (kWh)', 450, tableTop, { width: 150, align: 'right' });
        const endOfHeader = doc.y;
        doc.moveTo(itemX, endOfHeader).lineTo(550, endOfHeader).stroke();

        doc.fontSize(10).font('Helvetica');
        let totalValor = 0;
        let totalConsumo = 0;
        history.forEach(item => {
            const y = doc.y + 10;
            totalValor += parseFloat(item.valor_fatura);
            totalConsumo += parseInt(item.consumo_kwh || 0, 10);
            doc.text(formatDate(item.mes_referencia), itemX, y);
            doc.text(formatCurrency(item.valor_fatura), 250, y, { width: 150, align: 'right' });
            doc.text(item.consumo_kwh || '0', 450, y, { width: 150, align: 'right' });
            const endOfRow = doc.y + 10;
            doc.moveTo(itemX, endOfRow).lineTo(550, endOfRow).strokeColor("#cccccc").stroke();
        });

        const totalsY = doc.y + 20;
        doc.font('Helvetica-Bold');
        doc.text('TOTAIS', itemX, totalsY);
        doc.text(formatCurrency(totalValor), 250, totalsY, { width: 150, align: 'right' });
        doc.text(totalConsumo, 450, totalsY, { width: 150, align: 'right' });

        doc.end();

    } catch (err) {
        console.error("Erro ao gerar relatório CEMIG:", err.message);
        res.status(500).send("Erro interno ao gerar o relatório");
    }
};

const generateCopasaReport = async (req, res) => {
    const id = parseInt(req.params.id);
    try {
        const contractRes = await db.query(copasaQueries.getContratoCopasaById, [id]);
        const historyRes = await db.query(copasaQueries.getHistoricoCopasa, [id]);

        if (contractRes.rows.length === 0) {
            return res.status(404).send('Contrato não encontrado');
        }

        const contract = contractRes.rows[0];
        const history = historyRes.rows;
        const doc = new PDFDocument({ margin: 50 });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=relatorio_copasa_${contract.matricula_copasa}.pdf`);
        doc.pipe(res);

        doc.fontSize(20).font('Helvetica-Bold').text('Relatório de Contrato - COPASA', { align: 'center' });
        doc.fontSize(12).font('Helvetica').text(`Matrícula: ${contract.matricula_copasa}`, { align: 'center' });
        doc.moveDown(2);

        doc.fontSize(14).font('Helvetica-Bold').text('Dados do Imóvel');
        doc.fontSize(12).font('Helvetica').text(`Endereço: ${contract.endereco || ''}, ${contract.bairro || ''}`);
        doc.text(`Setor: ${contract.setor || 'N/A'}`);
        doc.text(`Secretaria: ${contract.secretaria_nome || 'N/A'}`);
        doc.text(`Identificador do Usuário: ${contract.identificador_usuario || 'N/A'}`);
        doc.text(`Centralizadora: ${contract.centralizadora || 'N/A'}`);
        doc.text(`Status do Contrato: ${contract.status}`);
        doc.moveDown();

        doc.fontSize(14).font('Helvetica-Bold').text('Histórico de Faturas');
        doc.moveDown(0.5);

        const tableTop = doc.y;
        const itemX = 50;
        const itemWidths = [150, 150, 100, 150];
        doc.fontSize(10).font('Helvetica-Bold');
        doc.text('Mês de Referência', itemX, tableTop);
        doc.text('Valor (R$)', itemX + itemWidths[0], tableTop, { width: itemWidths[1], align: 'right' });
        doc.text('Valor IRRF', itemX + itemWidths[0] + itemWidths[1], tableTop, { width: itemWidths[2], align: 'right' });
        doc.text('Consumo (m³)', itemX + itemWidths[0] + itemWidths[1] + itemWidths[2], tableTop, { width: itemWidths[3], align: 'right' });
        const endOfHeader = doc.y;
        doc.moveTo(itemX, endOfHeader).lineTo(itemX + itemWidths.reduce((a, b) => a + b), endOfHeader).stroke();

        doc.fontSize(10).font('Helvetica');
        let totalValorFaturas = 0;
        let totalConsumo = 0;
        let totalIrrf = 0;
        history.forEach(item => {
            const y = doc.y + 10;
            totalValorFaturas += parseFloat(item.valor_fatura);
            totalConsumo += parseInt(item.consumo_m3 || 0, 10);
            totalIrrf += parseFloat(item.valor_irrf || 0);
            doc.text(formatDate(item.mes_referencia), itemX, y);
            doc.text(formatCurrency(item.valor_fatura), itemX + itemWidths[0], y, { width: itemWidths[1], align: 'right' });
            doc.text(formatCurrency(item.valor_irrf), itemX + itemWidths[0] + itemWidths[1], y, { width: itemWidths[2], align: 'right' });
            doc.text(item.consumo_m3 || '0', itemX + itemWidths[0] + itemWidths[1] + itemWidths[2], y, { width: itemWidths[3], align: 'right' });
            const endOfRow = doc.y + 10;
            doc.moveTo(itemX, endOfRow).lineTo(itemX + itemWidths.reduce((a, b) => a + b), endOfRow).strokeColor("#cccccc").stroke();
        });

        const totalsY = doc.y + 20;
        doc.font('Helvetica-Bold');
        doc.text('TOTAIS', itemX, totalsY);
        doc.text(formatCurrency(totalValorFaturas), itemX + itemWidths[0], totalsY, { width: itemWidths[1], align: 'right' });
        doc.text(formatCurrency(totalIrrf), itemX + itemWidths[0] + itemWidths[1], totalsY, { width: itemWidths[2], align: 'right' });
        doc.text(totalConsumo, itemX + itemWidths[0] + itemWidths[1] + itemWidths[2], totalsY, { width: itemWidths[3], align: 'right' });

        doc.end();
    } catch (err) {
        console.error("Erro ao gerar relatório COPASA:", err.message);
        res.status(500).send("Erro interno ao gerar o relatório");
    }
};

const generateSecretariaReport = async (req, res) => {
    res.status(501).send("Funcionalidade substituída pelo Relatório Anual.");
};

const getAnnualReportData = async (req, res) => {
    const { year, secretaria_id, company } = req.query;
    if (!year) {
        return res.status(400).json({ msg: 'O ano é um parâmetro obrigatório.' });
    }

    try {
        const result = await db.query(reportQueries.getAnnualReportBySecretaria(year, secretaria_id, company));

        const reportData = result.rows.reduce((acc, row) => {
            const { secretaria_nome, month, cemig_valor, copasa_valor, consumo_kwh, consumo_m3 } = row;
            if (!acc[secretaria_nome]) {
                acc[secretaria_nome] = {
                    cemig: { mensal: Array(12).fill({ valor: 0, consumo: 0 }), total_anual_valor: 0, total_anual_consumo: 0 },
                    copasa: { mensal: Array(12).fill({ valor: 0, consumo: 0 }), total_anual_valor: 0, total_anual_consumo: 0 },
                };
            }
            acc[secretaria_nome].cemig.mensal[month - 1] = { valor: parseFloat(cemig_valor), consumo: parseInt(consumo_kwh, 10) };
            acc[secretaria_nome].copasa.mensal[month - 1] = { valor: parseFloat(copasa_valor), consumo: parseInt(consumo_m3, 10) };
            return acc;
        }, {});

        for (const secretaria in reportData) {
            reportData[secretaria].cemig.total_anual_valor = reportData[secretaria].cemig.mensal.reduce((sum, m) => sum + m.valor, 0);
            reportData[secretaria].cemig.total_anual_consumo = reportData[secretaria].cemig.mensal.reduce((sum, m) => sum + m.consumo, 0);
            reportData[secretaria].copasa.total_anual_valor = reportData[secretaria].copasa.mensal.reduce((sum, m) => sum + m.valor, 0);
            reportData[secretaria].copasa.total_anual_consumo = reportData[secretaria].copasa.mensal.reduce((sum, m) => sum + m.consumo, 0);
        }

        res.status(200).json(reportData);
    } catch (err) {
        console.error("Erro ao gerar dados do relatório anual:", err.message);
        res.status(500).send("Erro interno no servidor");
    }
};

const generateAnnualReportPDF = async (req, res) => {
    const { year, secretaria_id, company } = req.query;
    if (!year) return res.status(400).send('O ano é obrigatório');

    try {
        const result = await db.query(reportQueries.getAnnualReportBySecretaria(year, secretaria_id, company));

        const reportData = result.rows.reduce((acc, row) => {
            const { secretaria_nome, month, cemig_valor, copasa_valor, consumo_kwh, consumo_m3 } = row;
            if (!acc[secretaria_nome]) {
                acc[secretaria_nome] = {
                    cemig: { mensal: Array(12).fill({ valor: 0, consumo: 0 }), total_anual_valor: 0, total_anual_consumo: 0 },
                    copasa: { mensal: Array(12).fill({ valor: 0, consumo: 0 }), total_anual_valor: 0, total_anual_consumo: 0 },
                };
            }
            acc[secretaria_nome].cemig.mensal[month - 1] = { valor: parseFloat(cemig_valor), consumo: parseInt(consumo_kwh, 10) };
            acc[secretaria_nome].copasa.mensal[month - 1] = { valor: parseFloat(copasa_valor), consumo: parseInt(consumo_m3, 10) };
            return acc;
        }, {});

        for (const secretaria in reportData) {
            reportData[secretaria].cemig.total_anual_valor = reportData[secretaria].cemig.mensal.reduce((sum, m) => sum + m.valor, 0);
            reportData[secretaria].cemig.total_anual_consumo = reportData[secretaria].cemig.mensal.reduce((sum, m) => sum + m.consumo, 0);
            reportData[secretaria].copasa.total_anual_valor = reportData[secretaria].copasa.mensal.reduce((sum, m) => sum + m.valor, 0);
            reportData[secretaria].copasa.total_anual_consumo = reportData[secretaria].copasa.mensal.reduce((sum, m) => sum + m.consumo, 0);
        }

        const doc = new PDFDocument({ layout: 'landscape', margin: 25, size: 'A4' });
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `inline; filename=relatorio_anual_${year}.pdf`);
        doc.pipe(res);

        doc.fontSize(16).font('Helvetica-Bold').text(`Relatório Anual de Despesas - ${year}`, { align: 'center' });
        doc.moveDown(1.5);

        const table = {
            headers: ['Secretaria / Empresa', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez', 'Total Anual'],
            rows: [],
            totals: {
                cemig: Array(13).fill(0),
                copasa: Array(13).fill(0)
            }
        };

        const companyFilter = company || 'ambos';

        for (const [secretaria, secData] of Object.entries(reportData)) {
            table.rows.push({ isHeader: true, name: secretaria });

            if (companyFilter !== 'copasa') {
                const cemigRow = ['CEMIG'];
                secData.cemig.mensal.forEach((mes, i) => {
                    cemigRow.push(formatCurrency(mes.valor));
                    table.totals.cemig[i] += mes.valor;
                });
                cemigRow.push(formatCurrency(secData.cemig.total_anual_valor));
                table.totals.cemig[12] += secData.cemig.total_anual_valor;
                table.rows.push(cemigRow);
            }
            if (companyFilter !== 'cemig') {
                const copasaRow = ['COPASA'];
                secData.copasa.mensal.forEach((mes, i) => {
                    copasaRow.push(formatCurrency(mes.valor));
                    table.totals.copasa[i] += mes.valor;
                });
                copasaRow.push(formatCurrency(secData.copasa.total_anual_valor));
                table.totals.copasa[12] += secData.copasa.total_anual_valor;
                table.rows.push(copasaRow);
            }
        }

        drawImprovedTable(doc, table, companyFilter);

        doc.end();

    } catch (err) {
        console.error("Erro ao gerar PDF do relatório anual:", err.message);
        res.status(500).send("Erro interno ao gerar o PDF");
    }
};

function drawImprovedTable(doc, table, companyFilter) {
    let y = doc.y;
    const startX = 25;
    const verticalPadding = 7;
    const firstColWidth = 110;
    const monthColWidth = 48;
    const totalColWidth = 64;
    const tableWidth = firstColWidth + (12 * monthColWidth) + totalColWidth;

    const getColumnConfig = (i) => {
        if (i === 0) return { width: firstColWidth, x: startX, align: 'left', padding: 15 };
        if (i === 13) return { width: totalColWidth, x: startX + firstColWidth + (12 * monthColWidth), align: 'right', padding: 5 };
        return { width: monthColWidth, x: startX + firstColWidth + ((i - 1) * monthColWidth), align: 'right', padding: 5 };
    };

    doc.font('Helvetica-Bold').fontSize(8);
    let headerHeight = 0;
    table.headers.forEach((header, i) => {
        const colConfig = getColumnConfig(i);
        const height = doc.heightOfString(header, { width: colConfig.width, align: 'center' });
        headerHeight = Math.max(headerHeight, height);
    });
    headerHeight += (verticalPadding * 2);

    table.headers.forEach((header, i) => {
        const colConfig = getColumnConfig(i);
        doc.rect(colConfig.x, y, colConfig.width, headerHeight).fillAndStroke('#D8D8D8', '#AAAAAA');
        doc.fillColor('#000').text(header, colConfig.x, y + verticalPadding, { width: colConfig.width, align: 'center' });
    });
    y += headerHeight;

    table.rows.forEach(row => {
        let currentRowHeight = 0;
        if (row.isHeader) {
            doc.font('Helvetica-Bold').fontSize(9);
            const height = doc.heightOfString(row.name, { width: tableWidth - 10 });
            currentRowHeight = height;
        } else {
            doc.font('Helvetica').fontSize(8);
            row.forEach((cell, i) => {
                const colConfig = getColumnConfig(i);
                const height = doc.heightOfString(String(cell), { width: colConfig.width - (colConfig.padding * 2) });
                currentRowHeight = Math.max(currentRowHeight, height);
            });
        }
        currentRowHeight += (verticalPadding * 2);

        if (y + currentRowHeight > doc.page.height - 80) {
            doc.addPage({ layout: 'landscape', margin: 25, size: 'A4' });
            y = 25;
        }

        if (row.isHeader) {
            doc.rect(startX, y, tableWidth, currentRowHeight).fillAndStroke('#EAEAEA', '#AAAAAA');
            doc.fillColor('#333').text(row.name, startX + 5, y + verticalPadding, { width: tableWidth - 10 });
        } else {
            row.forEach((cell, i) => {
                const colConfig = getColumnConfig(i);
                doc.rect(colConfig.x, y, colConfig.width, currentRowHeight).stroke('#CCCCCC');
                doc.fillColor('#000').text(String(cell), colConfig.x + colConfig.padding, y + verticalPadding, { width: colConfig.width - (colConfig.padding * 2), align: colConfig.align });
            });
        }
        y += currentRowHeight;
    });

    const totalRowHeight = 22;
    y += (totalRowHeight / 2);

    if (y + totalRowHeight > doc.page.height - 80) {
        doc.addPage({ layout: 'landscape', margin: 25, size: 'A4' });
        y = 25;
    }

    doc.font('Helvetica-Bold').fontSize(9);
    doc.rect(startX, y, tableWidth, totalRowHeight).fillAndStroke('#D8D8D8', '#AAAAAA');
    doc.fillColor('#000').text('Total Geral', startX + 5, y + verticalPadding);
    y += totalRowHeight;

    const drawTotalRow = (currentY, label, totals) => {
        let newY = currentY;
        if (newY + totalRowHeight > doc.page.height - 80) {
            doc.addPage({ layout: 'landscape', margin: 25, size: 'A4' });
            newY = 25;
        }
        doc.font('Helvetica-Bold').fontSize(8);
        doc.text(label, startX + 15, newY + verticalPadding);
        totals.forEach((total, i) => {
            const colConfig = getColumnConfig(i + 1);
            doc.text(formatCurrency(total), colConfig.x + colConfig.padding, newY + verticalPadding, { width: colConfig.width - (colConfig.padding * 2), align: 'right' });
        });
        return newY + totalRowHeight;
    };

    if (companyFilter !== 'copasa') {
        y = drawTotalRow(y, 'CEMIG', table.totals.cemig);
    }
    if (companyFilter !== 'cemig') {
        y = drawTotalRow(y, 'COPASA', table.totals.copasa);
    }
}

module.exports = {
    generateCemigReport,
    generateCopasaReport,
    generateSecretariaReport,
    getAnnualReportData,
    generateAnnualReportPDF,
};