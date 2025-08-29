import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import { DataProvider } from './context/DataProvider';
import SideMenu from './components/SideMenu';
import './styles/AppLayout.css';

import DashboardPage from './pages/DashboardPage';
import CemigPage from './pages/CemigPage';
import CopasaPage from './pages/CopasaPage';
import SecretariasPage from './pages/SecretariasPage';
import ImoveisPage from './pages/ImoveisPage';
import RelatorioPage from './pages/RelatorioPage';
import ImportacaoPage from './pages/ImportacaoPage';

function App() {
  return (
    <DataProvider>
      <div className="app-layout">
        <SideMenu />
        <main className="content-area">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/cemig" element={<CemigPage />} />
            <Route path="/copasa" element={<CopasaPage />} />
            <Route path="/secretarias" element={<SecretariasPage />} />
            <Route path="/imoveis" element={<ImoveisPage />} />
            <Route path="/relatorios" element={<RelatorioPage />} />
            <Route path="/importacao" element={<ImportacaoPage />} />
            <Route path="*" element={<div>Página não encontrada</div>} />
          </Routes>
        </main>
      </div>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </DataProvider>
  );
}

export default App;