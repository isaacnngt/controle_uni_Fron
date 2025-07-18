import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import Aniversariantes from './pages/Aniversariantes';
import PrestacaoGeralLista from './pages/PrestacaoGeralLista';
import CaixaGeral from './pages/CaixaGeral';
import Login from './pages/Login';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [usuario, setUsuario] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Verificar se usuário já está logado
    const savedUser = localStorage.getItem('usuario');
    const savedLogin = localStorage.getItem('isLoggedIn');
    
    if (savedUser && savedLogin === 'true') {
      setUsuario(JSON.parse(savedUser));
      setIsLoggedIn(true);
    }
    
    setLoading(false);
  }, []);

  const handleLogin = (userData) => {
    setUsuario(userData);
    setIsLoggedIn(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('usuario');
    localStorage.removeItem('isLoggedIn');
    setUsuario(null);
    setIsLoggedIn(false);
  };

  if (loading) {
    return <div>Carregando...</div>;
  }

  return (
    <Router>
      <div className="App">
        {!isLoggedIn ? (
          <Login onLogin={handleLogin} />
        ) : (
          <>
            <Navbar onLogout={handleLogout} usuario={usuario} />
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
                <Route path="/aniversariantes" element={<Aniversariantes />} />
                <Route path="/prestacao-geral" element={<PrestacaoGeralLista />} />
                <Route path="/caixa-geral" element={<CaixaGeral />} />
              </Routes>
            </main>
          </>
        )}
      </div>
    </Router>
  );
}

export default App;