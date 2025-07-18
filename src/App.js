import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';

// Componentes
import Navbar from './components/Navbar';
import {
  MenuPrincipal,
  CadastroJovem,
  ListaJovens,
  BuscarUsuario,
  TamanhosCamisa,
  ParametrosFinanceiros,
  PrestacaoContas,
  EditarJovem,
  Aniversariantes,
  PrestacaoGeralLista,
  CaixaGeral
} from './pages';

function App() {
  const routes = [
    { path: "/", element: <MenuPrincipal /> },
    { path: "/cadastro", element: <CadastroJovem /> },
    { path: "/lista", element: <ListaJovens /> },
    { path: "/buscar", element: <BuscarUsuario /> },
    { path: "/tamanhos-camisa", element: <TamanhosCamisa /> },
    { path: "/parametros", element: <ParametrosFinanceiros /> },
    { path: "/prestacao-contas", element: <PrestacaoContas /> },
    { path: "/editar/:id", element: <EditarJovem /> },
    { path: "/aniversariantes", element: <Aniversariantes /> },
    { path: "/prestacao-geral", element: <PrestacaoGeralLista /> },
    { path: "/caixa-geral", element: <CaixaGeral /> }
  ];

  return (
    <Router>
      <div className="App">
        <Navbar />
        <main className="main-content">
          <Routes>
            {routes.map((route, index) => (
              <Route key={index} path={route.path} element={route.element} />
            ))}
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;