import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usuarioService } from '../services/api';
import './MenuPrincipal.css';

const MenuPrincipal = () => {
    const [stats, setStats] = useState({
        totalUsuarios: 0,
        loading: true
    });

    useEffect(() => {
        carregarEstatisticas();
    }, []);

    const carregarEstatisticas = async () => {
        try {
            const response = await usuarioService.contar();
            setStats({
                totalUsuarios: response.data,
                loading: false
            });
        } catch (error) {
            console.error('Erro ao carregar estatísticas:', error);
            setStats({ totalUsuarios: 0, loading: false });
        }
    };

    return (
        <div className="menu-principal">
            <header className="hero">
                <h1>📚 Sistema UNIJovem</h1>
                <p>Gerenciamento de jovens da igreja</p>
            </header>

            <div className="stats-card">
                <h3>📊 Estatísticas</h3>
                {stats.loading ? (
                    <p>Carregando...</p>
                ) : (
                    <div className="stats-grid">
                        <div className="stat-item">
                            <span className="stat-number">{stats.totalUsuarios}</span>
                            <span className="stat-label">Jovens Cadastrados</span>
                        </div>
                    </div>
                )}
            </div>

            <div className="menu-grid">
                <Link to="/cadastro" className="menu-card">
                    <div className="menu-icon">➕</div>
                    <h3>Cadastrar Jovem</h3>
                    <p>Adicionar novo jovem ao sistema</p>
                </Link>

                <Link to="/lista" className="menu-card">
                    <div className="menu-icon">👥</div>
                    <h3>Visualizar Jovens</h3>
                    <p>Lista todos os jovens cadastrados</p>
                </Link>

                <Link to="/buscar" className="menu-card">
                    <div className="menu-icon">🔍</div>
                    <h3>Buscar Jovem</h3>
                    <p>Pesquisar jovem por nome</p>
                </Link>

                <Link to="/tamanhos-camisa" className="menu-card">
                    <div className="menu-icon">👕</div>
                    <h3>Tamanhos de Camisa</h3>
                    <p>Visualizar e exportar relatório de tamanhos</p>
                </Link>

                <Link to="/parametros" className="menu-card">
                    <div className="menu-icon">⚙️</div>
                    <h3>Parâmetros Financeiros</h3>
                    <p>Configurar valores de mensalidade e camisa</p>
                </Link>

                <Link to="/prestacao-contas" className="menu-card">
                    <div className="menu-icon">📊</div>
                    <h3>Prestação de Contas</h3>
                    <p>Visualizar relatórios financeiros</p>
                </Link>
            </div>
        </div>
    );
};

export default MenuPrincipal;