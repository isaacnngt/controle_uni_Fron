import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usuarioService, prestacaoContasService } from '../services/api';
import './BuscarUsuario.css';

const BuscarUsuario = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [usuarios, setUsuarios] = useState([]);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [anoVigente, setAnoVigente] = useState(new Date().getFullYear());
    const [anosDisponiveis, setAnosDisponiveis] = useState([]);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        carregarAnosDisponiveis();
    }, []);

    const carregarAnosDisponiveis = async () => {
        try {
            const response = await prestacaoContasService.listarAnosVigentes();
            const anos = response.data || [];

            // Adicionar ano atual se não estiver na lista
            const anoAtual = new Date().getFullYear();
            if (!anos.includes(anoAtual)) {
                anos.unshift(anoAtual);
            }

            setAnosDisponiveis(anos.sort((a, b) => b - a));
        } catch (error) {
            console.error('Erro ao carregar anos:', error);
            // Se der erro, usar apenas o ano atual
            setAnosDisponiveis([new Date().getFullYear()]);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();

        if (!searchTerm.trim()) {
            setMessage({ text: 'Digite um nome para buscar.', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });
        setUsuarios([]);
        setUsuarioSelecionado(null);

        try {
            const response = await usuarioService.buscarPorNome(searchTerm);
            setUsuarios(response.data);

            if (response.data.length === 0) {
                setMessage({ text: 'Nenhum usuário encontrado.', type: 'info' });
            }
        } catch (error) {
            console.error('Erro ao buscar usuários:', error);
            setMessage({ text: 'Erro ao buscar usuários.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSelectUsuario = (usuario) => {
        setUsuarioSelecionado(usuario);
    };

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const calcularIdade = (dataNascimento) => {
        if (!dataNascimento) return '-';
        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mesAtual = hoje.getMonth();
        const mesNascimento = nascimento.getMonth();

        if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }

        return `${idade} anos`;
    };

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">🔍 Buscar Usuário</h2>
                </div>

                {/* Formulário de Busca */}
                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-row">
                        <div className="form-group flex-grow">
                            <label htmlFor="searchTerm" className="form-label">Nome do Usuário</label>
                            <input
                                type="text"
                                id="searchTerm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-input"
                                placeholder="Digite o nome para buscar..."
                                disabled={loading}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="anoVigente" className="form-label">Ano Vigente</label>
                            <select
                                id="anoVigente"
                                value={anoVigente}
                                onChange={(e) => setAnoVigente(parseInt(e.target.value))}
                                className="form-select"
                            >
                                {anosDisponiveis.map(ano => (
                                    <option key={ano} value={ano}>{ano}</option>
                                ))}
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="form-label">&nbsp;</label>
                            <button
                                type="submit"
                                className="btn btn-primary search-btn"
                                disabled={loading}
                            >
                                {loading ? 'Buscando...' : '🔍 Buscar'}
                            </button>
                        </div>
                    </div>
                </form>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Resultados da Busca */}
                {usuarios.length > 0 && (
                    <div className="search-results">
                        <h3>📋 Resultados da Busca ({usuarios.length})</h3>
                        <div className="usuarios-grid">
                            {usuarios.map((usuario) => (
                                <div
                                    key={usuario.id}
                                    className={`usuario-card ${usuarioSelecionado?.id === usuario.id ? 'selected' : ''}`}
                                    onClick={() => handleSelectUsuario(usuario)}
                                >
                                    <div className="usuario-header">
                                        <h4>{usuario.nome}</h4>
                                        <span className={`status-badge ${usuario.dividas ? 'com-divida' : 'sem-divida'}`}>
                      {usuario.dividas ? '🔴 Com dívida' : '🟢 Em dia'}
                    </span>
                                    </div>
                                    <div className="usuario-info">
                                        <p><strong>Sexo:</strong> {usuario.sexo === 'M' ? 'Masculino' : usuario.sexo === 'F' ? 'Feminino' : '-'}</p>
                                        <p><strong>Idade:</strong> {calcularIdade(usuario.dataNascimento)}</p>
                                        <p><strong>Cargo Ministerial:</strong> {usuario.cargoMinisterial ? 'Sim' : 'Não'}</p>
                                        <p><strong>Cargo UNIJovem:</strong> {usuario.cargoUnijovem || 'Não informado'}</p>
                                    </div>
                                    <div className="usuario-actions">
                                        <Link
                                            to={`/editar/${usuario.id}`}
                                            className="btn btn-secondary btn-sm"
                                        >
                                            ✏️ Editar
                                        </Link>
                                        <Link
                                            to={`/prestacao-contas?usuario=${usuario.id}&ano=${anoVigente}`}
                                            className="btn btn-primary btn-sm"
                                        >
                                            📊 Prestação
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Detalhes do Usuário Selecionado */}
                {usuarioSelecionado && (
                    <div className="usuario-detalhes">
                        <h3>📄 Detalhes do Usuário</h3>
                        <div className="detalhes-card">
                            <div className="detalhes-header">
                                <h4>{usuarioSelecionado.nome}</h4>
                                <span className="usuario-id">ID: {usuarioSelecionado.id}</span>
                            </div>

                            <div className="detalhes-grid">
                                <div className="detalhe-item">
                                    <span className="label">Sexo:</span>
                                    <span className="value">
                    {usuarioSelecionado.sexo === 'M' ? '👨 Masculino' : usuarioSelecionado.sexo === 'F' ? '👩 Feminino' : '-'}
                  </span>
                                </div>

                                <div className="detalhe-item">
                                    <span className="label">Data de Nascimento:</span>
                                    <span className="value">{formatarData(usuarioSelecionado.dataNascimento)}</span>
                                </div>

                                <div className="detalhe-item">
                                    <span className="label">Idade:</span>
                                    <span className="value">{calcularIdade(usuarioSelecionado.dataNascimento)}</span>
                                </div>

                                <div className="detalhe-item">
                                    <span className="label">Tamanho da Camisa:</span>
                                    <span className="value">{usuarioSelecionado.tamanhoCamisa || 'Não informado'}</span>
                                </div>

                                <div className="detalhe-item">
                                    <span className="label">Responsável Direto:</span>
                                    <span className="value">{usuarioSelecionado.responsavelDireto || 'Não informado'}</span>
                                </div>

                                <div className="detalhe-item">
                                    <span className="label">Cargo Ministerial:</span>
                                    <span className="value">
                    {usuarioSelecionado.cargoMinisterial ? '✅ Sim' : '❌ Não'}
                  </span>
                                </div>

                                <div className="detalhe-item">
                                    <span className="label">Cargo UNIJovem:</span>
                                    <span className="value">{usuarioSelecionado.cargoUnijovem || 'Não informado'}</span>
                                </div>

                                <div className="detalhe-item">
                                    <span className="label">Situação Financeira:</span>
                                    <span className="value">
                    <span className={`status-badge ${usuarioSelecionado.dividas ? 'com-divida' : 'sem-divida'}`}>
                      {usuarioSelecionado.dividas ? '🔴 Com dívida' : '🟢 Em dia'}
                    </span>
                  </span>
                                </div>

                                <div className="detalhe-item">
                                    <span className="label">Data de Cadastro:</span>
                                    <span className="value">{formatarData(usuarioSelecionado.dataInclusao)}</span>
                                </div>
                            </div>

                            <div className="detalhes-actions">
                                <Link
                                    to={`/editar/${usuarioSelecionado.id}`}
                                    className="btn btn-secondary"
                                >
                                    ✏️ Editar Dados
                                </Link>
                                <Link
                                    to={`/prestacao-contas?usuario=${usuarioSelecionado.id}&ano=${anoVigente}`}
                                    className="btn btn-primary"
                                >
                                    📊 Ver Prestação de Contas
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BuscarUsuario;