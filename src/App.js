import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Componentes
import Navbar from './components/Navbar';
import MenuPrincipal from './pages/MenuPrincipal';
import CadastroJovem from './pages/CadastroJovem';
import ListaJovens from './pages/ListaJovens';
import BuscarUsuario from './pages/BuscarUsuario';
import TamanhosCamisa from './pages/TamanhosCamisa';
import ParametrosFinanceiros from './pages/ParametrosFinanceiros';
import PrestacaoContas from './pages/PrestacaoContas';
import EditarJovem from './pages/EditarJovem';

function App() {
  return (
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<MenuPrincipal />} />
              <Route path="/cadastro" element={<CadastroJovem />} />
              <Route path="/lista" element={<ListaJovens />} />
              <Route path="/buscar" element={<BuscarUsuario />} />
              <Route path="/tamanhos-camisa" element={<TamanhosCamisa />} />
              <Route path="/parametros" element={<ParametrosFinanceiros />} />
              <Route path="/prestacao-contas" element={<PrestacaoContas />} />
              <Route path="/editar/:id" element={<EditarJovem />} />
            </Routes>
          </main>
        </div>
      </Router>
  );
}

export default App;