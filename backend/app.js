const express = require('express');
const cors = require('cors');
const path = require('path');

const secretariasRoutes = require('./src/routes/secretariasRoutes');
const imoveisRoutes = require('./src/routes/imoveisRoutes');
const cemigRoutes = require('./src/routes/cemigRoutes');
const copasaRoutes = require('./src/routes/copasaRoutes');
const dashboardRoutes = require('./src/routes/dashboardRoutes');
const reportRoutes = require('./src/routes/reportRoutes');
const importRoutes = require('./src/routes/importRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get("/", (req, res) => {
    res.send("API do Projeto Contas - CEMIG/COPASA");
});

app.use('/api/secretarias', secretariasRoutes);
app.use('/api/imoveis', imoveisRoutes);
app.use('/api/cemig', cemigRoutes);
app.use('/api/copasa', copasaRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/import', importRoutes);

module.exports = app;