import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

const Navbar = () => {
    const location = useLocation();

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    📚 UNIJovem
                </Link>

                <div className="navbar-menu">
                    <Link
                        to="/"
                        className={`navbar-item ${location.pathname === '/' ? 'active' : ''}`}
                    >
                        🏠 Menu
                    </Link>

                    <Link
                        to="/cadastro"
                        className={`navbar-item ${location.pathname === '/cadastro' ? 'active' : ''}`}
                    >
                        ➕ Cadastrar
                    </Link>

                    <Link
                        to="/lista"
                        className={`navbar-item ${location.pathname === '/lista' ? 'active' : ''}`}
                    >
                        👥 Listar
                    </Link>

                    <Link
                        to="/buscar"
                        className={`navbar-item ${location.pathname === '/buscar' ? 'active' : ''}`}
                    >
                        🔍 Buscar
                    </Link>

                    <Link
                        to="/tamanhos-camisa"
                        className={`navbar-item ${location.pathname === '/tamanhos-camisa' ? 'active' : ''}`}
                    >
                        👕 Tamanhos
                    </Link>

                    <Link
                        to="/parametros"
                        className={`navbar-item ${location.pathname === '/parametros' ? 'active' : ''}`}
                    >
                        ⚙️ Parâmetros
                    </Link>

                    <Link
                        to="/prestacao-contas"
                        className={`navbar-item ${location.pathname === '/prestacao-contas' ? 'active' : ''}`}
                    >
                        📊 Prestação
                    </Link>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;