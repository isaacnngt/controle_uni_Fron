import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Sidebar.css';

const Sidebar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const location = useLocation();

    const menuItems = [
        {
            path: '/',
            name: 'Menu Principal',
            icon: '🏠',
            description: 'Página inicial do sistema'
        },
        {
            path: '/cadastro',
            name: 'Cadastrar Jovem',
            icon: '➕',
            description: 'Adicionar novo jovem'
        },
        {
            path: '/lista',
            name: 'Visualizar Jovens',
            icon: '👥',
            description: 'Lista todos os jovens'
        },
        {
            path: '/buscar',
            name: 'Buscar Jovem',
            icon: '🔍',
            description: 'Pesquisar por nome'
        },
        {
            path: '/tamanhos-camisa',
            name: 'Tamanhos de Camisa',
            icon: '👕',
            description: 'Relatório de tamanhos'
        },
        {
            path: '/parametros',
            name: 'Parâmetros Financeiros',
            icon: '⚙️',
            description: 'Configurar valores'
        },
        {
            path: '/prestacao-contas',
            name: 'Prestação de Contas',
            icon: '📊',
            description: 'Relatórios financeiros'
        }
    ];

    const toggleSidebar = () => {
        setIsOpen(!isOpen);
    };

    return (
        <>
            {/* Overlay para mobile */}
            {isOpen && <div className="sidebar-overlay" onClick={toggleSidebar}></div>}

            {/* Sidebar */}
            <aside className={`sidebar ${isOpen ? 'sidebar-open' : ''}`}>
                {/* Header do Sidebar */}
                <div className="sidebar-header">
                    <div className="sidebar-logo">
                        <span className="logo-icon">📚</span>
                        <span className="logo-text">UNIJovem</span>
                    </div>
                    <button className="sidebar-close" onClick={toggleSidebar}>
                        ✕
                    </button>
                </div>

                {/* Menu Items */}
                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`sidebar-item ${location.pathname === item.path ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)} // Fechar sidebar ao clicar em mobile
                        >
                            <div className="sidebar-item-icon">
                                {item.icon}
                            </div>
                            <div className="sidebar-item-content">
                                <span className="sidebar-item-name">
                                    {item.name}
                                </span>
                                <span className="sidebar-item-description">
                                    {item.description}
                                </span>
                            </div>
                        </Link>
                    ))}
                </nav>

                {/* Footer do Sidebar */}
                <div className="sidebar-footer">
                    <div className="sidebar-footer-text">
                        Sistema de Gerenciamento
                    </div>
                    <div className="sidebar-version">
                        v1.0.0
                    </div>
                </div>
            </aside>

            {/* Botão para abrir sidebar (mobile) */}
            <button
                className={`sidebar-toggle ${isOpen ? 'hidden' : ''}`}
                onClick={toggleSidebar}
            >
                ☰
            </button>
        </>
    );
};

export default Sidebar;