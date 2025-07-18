import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { prestacaoContasService, parametrosService } from '../services/api';
import './PrestacaoGeralLista.css';

const PrestacaoGeralLista = () => {
    const [searchParams] = useSearchParams();
    const [dadosGerais, setDadosGerais] = useState([]);
    const [parametros, setParametros] = useState(null);
    const [anoVigente, setAnoVigente] = useState(parseInt(searchParams.get('ano')) || new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState({});
    const [message, setMessage] = useState({ text: '', type: '' });
    const [filtro, setFiltro] = useState('todos');
    const [ordenacao, setOrdenacao] = useState({ campo: 'nome', direcao: 'asc' });

    useEffect(() => {
        carregarDados();
    }, [anoVigente]);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const [resumoResponse, parametrosResponse] = await Promise.all([
                prestacaoContasService.buscarResumoGeral(anoVigente),
                parametrosService.buscarAtuais()
            ]);

            setDadosGerais(resumoResponse.data);
            setParametros(parametrosResponse.data);
            setMessage({ text: '', type: '' });
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            setMessage({ text: 'Erro ao carregar dados.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleSalvarUsuario = async (usuarioId, dados) => {
        try {
            setSalvando(prev => ({ ...prev, [usuarioId]: true }));

            const usuario = dadosGerais.find(u => u.usuarioId === usuarioId);
            
            if (usuario.prestacaoId) {
                await prestacaoContasService.atualizarPagamentos(usuario.prestacaoId, dados);
            } else {
                const novaPrestacao = await prestacaoContasService.criar(usuarioId, anoVigente);
                await prestacaoContasService.atualizarPagamentos(novaPrestacao.data.id, dados);
            }

            setMessage({ text: `✅ ${usuario.usuarioNome} - Pagamentos salvos!`, type: 'success' });
            
            setTimeout(() => {
                carregarDados();
                setMessage({ text: '', type: '' });
            }, 2000);

        } catch (error) {
            console.error('Erro ao salvar:', error);
            setMessage({ text: 'Erro ao salvar pagamentos.', type: 'error' });
        } finally {
            setSalvando(prev => ({ ...prev, [usuarioId]: false }));
        }
    };

    const formatarValor = (valor) => {
        if (!valor) return 'R$ 0,00';
        return `R$ ${parseFloat(valor).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const calcularPercentual = (valorPago, valorTotal) => {
        if (!valorTotal || valorTotal <= 0) return 0;
        return Math.min(100, (valorPago / valorTotal) * 100);
    };

    const getStatusPagamento = (usuario) => {
        const percMens = calcularPercentual(usuario.valorMensalidadePago, usuario.valorMensalidadeTotal);
        const percCamisa = calcularPercentual(usuario.valorCamisaPago, usuario.valorCamisaTotal);

        if (percMens >= 100 && percCamisa >= 100) {
            return { texto: 'Quitado', classe: 'status-quitado', cor: '#10b981' };
        } else if (percMens > 0 || percCamisa > 0) {
            return { texto: 'Parcial', classe: 'status-parcial', cor: '#f59e0b' };
        } else {
            return { texto: 'Com dívida', classe: 'status-pendente', cor: '#ef4444' };
        }
    };

    const handleOrdenar = (campo) => {
        setOrdenacao(prev => ({
            campo,
            direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
        }));
    };

    const dadosFiltrados = dadosGerais
        .filter(usuario => {
            const status = getStatusPagamento(usuario);
            
            switch (filtro) {
                case 'quitados':
                    return status.classe === 'status-quitado';
                case 'pendentes':
                    return status.classe === 'status-pendente';
                case 'parciais':
                    return status.classe === 'status-parcial';
                default:
                    return true;
            }
        })
        .sort((a, b) => {
            let valorA, valorB;
            
            switch (ordenacao.campo) {
                case 'nome':
                    valorA = a.usuarioNome.toLowerCase();
                    valorB = b.usuarioNome.toLowerCase();
                    break;
                case 'mensalidade':
                    valorA = calcularPercentual(a.valorMensalidadePago, a.valorMensalidadeTotal);
                    valorB = calcularPercentual(b.valorMensalidadePago, b.valorMensalidadeTotal);
                    break;
                case 'camisa':
                    valorA = calcularPercentual(a.valorCamisaPago, a.valorCamisaTotal);
                    valorB = calcularPercentual(b.valorCamisaPago, b.valorCamisaTotal);
                    break;
                case 'situacao':
                    const statusA = getStatusPagamento(a);
                    const statusB = getStatusPagamento(b);
                    // Ordenar por prioridade: Pendente > Parcial > Quitado
                    const prioridadeA = statusA.classe === 'status-pendente' ? 0 : statusA.classe === 'status-parcial' ? 1 : 2;
                    const prioridadeB = statusB.classe === 'status-pendente' ? 0 : statusB.classe === 'status-parcial' ? 1 : 2;
                    valorA = prioridadeA;
                    valorB = prioridadeB;
                    break;
                default:
                    return 0;
            }
            
            if (valorA < valorB) return ordenacao.direcao === 'asc' ? -1 : 1;
            if (valorA > valorB) return ordenacao.direcao === 'asc' ? 1 : -1;
            return 0;
        });

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Carregando dados...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="prestacao-geral">
                <div className="header-section">
                    <div>
                        <h2>📊 Prestação de Contas - Geral</h2>
                        <p>Gerencie todos os pagamentos de {anoVigente}</p>
                    </div>
                    <Link to="/prestacao-contas" className="btn-voltar">
                        ← Voltar
                    </Link>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <div className="controles">
                    <div className="filtros-controles">
                        <select
                            value={anoVigente}
                            onChange={(e) => setAnoVigente(parseInt(e.target.value))}
                            className="select-ano"
                        >
                            {[2023, 2024, 2025, 2026].map(ano => (
                                <option key={ano} value={ano}>{ano}</option>
                            ))}
                        </select>

                        <select
                            value={filtro}
                            onChange={(e) => setFiltro(e.target.value)}
                            className="select-filtro"
                        >
                            <option value="todos">📋 Todos</option>
                            <option value="quitados">✅ Quitados</option>
                            <option value="parciais">⚠️ Parciais</option>
                            <option value="pendentes">❌ Com dívida</option>
                        </select>
                    </div>

                    <div className="total-count">
                        Total: {dadosFiltrados.length}
                    </div>
                </div>

                {/* Tabela estilo Lista de Jovens */}
                <div className="tabela-container">
                    <table className="tabela-prestacao">
                        <thead>
                            <tr>
                                <th onClick={() => handleOrdenar('nome')} className="th-ordenavel">
                                    Nome 
                                    {ordenacao.campo === 'nome' && (
                                        <span className="icone-ordenacao">
                                            {ordenacao.direcao === 'asc' ? ' ↑' : ' ↓'}
                                        </span>
                                    )}
                                </th>
                                <th onClick={() => handleOrdenar('mensalidade')} className="th-ordenavel">
                                    Mensalidade
                                    {ordenacao.campo === 'mensalidade' && (
                                        <span className="icone-ordenacao">
                                            {ordenacao.direcao === 'asc' ? ' ↑' : ' ↓'}
                                        </span>
                                    )}
                                </th>
                                <th onClick={() => handleOrdenar('camisa')} className="th-ordenavel">
                                    Camisa
                                    {ordenacao.campo === 'camisa' && (
                                        <span className="icone-ordenacao">
                                            {ordenacao.direcao === 'asc' ? ' ↑' : ' ↓'}
                                        </span>
                                    )}
                                </th>
                                <th onClick={() => handleOrdenar('situacao')} className="th-ordenavel">
                                    Situação
                                    {ordenacao.campo === 'situacao' && (
                                        <span className="icone-ordenacao">
                                            {ordenacao.direcao === 'asc' ? ' ↑' : ' ↓'}
                                        </span>
                                    )}
                                </th>
                                <th>Ações</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dadosFiltrados.map(usuario => (
                                <LinhaUsuario
                                    key={usuario.usuarioId}
                                    usuario={usuario}
                                    onSalvar={handleSalvarUsuario}
                                    salvando={salvando[usuario.usuarioId] || false}
                                    formatarValor={formatarValor}
                                    calcularPercentual={calcularPercentual}
                                    getStatusPagamento={getStatusPagamento}
                                />
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const LinhaUsuario = ({ usuario, onSalvar, salvando, formatarValor, calcularPercentual, getStatusPagamento }) => {
    const [editando, setEditando] = useState(false);
    const [valores, setValores] = useState({
        valorMensalidadePago: usuario.valorMensalidadePago || 0,
        valorCamisaPago: usuario.valorCamisaPago || 0,
        formaPagamento: usuario.formaPagamento || 'PIX'
    });

    const handleSalvar = () => {
        onSalvar(usuario.usuarioId, valores);
        setEditando(false);
    };

    const handleCancelar = () => {
        setValores({
            valorMensalidadePago: usuario.valorMensalidadePago || 0,
            valorCamisaPago: usuario.valorCamisaPago || 0,
            formaPagamento: usuario.formaPagamento || 'PIX'
        });
        setEditando(false);
    };

    const status = getStatusPagamento(usuario);
    const percMens = calcularPercentual(editando ? valores.valorMensalidadePago : usuario.valorMensalidadePago, usuario.valorMensalidadeTotal);
    const percCamisa = calcularPercentual(editando ? valores.valorCamisaPago : usuario.valorCamisaPago, usuario.valorCamisaTotal);

    return (
        <tr className={`linha-usuario ${status.classe}`}>
            <td>
                <div className="nome-usuario">
                    {usuario.usuarioNome}
                </div>
            </td>
            
            <td>
                <div className="valor-cell">
                    <div className="valor-info-simple">
                        <span className="valor-total-small">{formatarValor(usuario.valorMensalidadeTotal)}</span>
                        {editando ? (
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max={usuario.valorMensalidadeTotal}
                                value={valores.valorMensalidadePago}
                                onChange={(e) => setValores(prev => ({
                                    ...prev,
                                    valorMensalidadePago: e.target.value
                                }))}
                                className="input-valor"
                            />
                        ) : (
                            <span className="valor-pago-display">{formatarValor(usuario.valorMensalidadePago)}</span>
                        )}
                    </div>
                    <div className="progress-simple">
                        <div 
                            className="progress-fill-simple"
                            style={{ 
                                width: `${percMens}%`, 
                                backgroundColor: percMens >= 100 ? '#10b981' : percMens > 0 ? '#f59e0b' : '#ef4444'
                            }}
                        ></div>
                    </div>
                    <span className="percentual-small">{percMens.toFixed(0)}%</span>
                </div>
            </td>

            <td>
                <div className="valor-cell">
                    <div className="valor-info-simple">
                        <span className="valor-total-small">{formatarValor(usuario.valorCamisaTotal)}</span>
                        {editando ? (
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                max={usuario.valorCamisaTotal}
                                value={valores.valorCamisaPago}
                                onChange={(e) => setValores(prev => ({
                                    ...prev,
                                    valorCamisaPago: e.target.value
                                }))}
                                className="input-valor"
                            />
                        ) : (
                            <span className="valor-pago-display">{formatarValor(usuario.valorCamisaPago)}</span>
                        )}
                    </div>
                    <div className="progress-simple">
                        <div 
                            className="progress-fill-simple"
                            style={{ 
                                width: `${percCamisa}%`, 
                                backgroundColor: percCamisa >= 100 ? '#10b981' : percCamisa > 0 ? '#f59e0b' : '#ef4444'
                            }}
                        ></div>
                    </div>
                    <span className="percentual-small">{percCamisa.toFixed(0)}%</span>
                </div>
            </td>

            <td>
                <span 
                    className="status-badge-simple"
                    style={{ 
                        backgroundColor: `${status.cor}20`, 
                        color: status.cor,
                        border: `1px solid ${status.cor}40`
                    }}
                >
                    {status.texto}
                </span>
                {editando && (
                    <select
                        value={valores.formaPagamento}
                        onChange={(e) => setValores(prev => ({
                            ...prev,
                            formaPagamento: e.target.value
                        }))}
                        className="select-pagamento"
                    >
                        <option value="PIX">PIX</option>
                        <option value="Dinheiro">Dinheiro</option>
                        <option value="Cartão">Cartão</option>
                        <option value="Transferência">Transferência</option>
                        <option value="Não pago">Não pago</option>
                    </select>
                )}
            </td>

            <td>
                <div className="acoes-cell">
                    {editando ? (
                        <>
                            <button
                                onClick={handleSalvar}
                                disabled={salvando}
                                className="btn-acao salvar"
                                title="Salvar"
                            >
                                {salvando ? '⏳' : '💾'}
                            </button>
                            <button
                                onClick={handleCancelar}
                                disabled={salvando}
                                className="btn-acao cancelar"
                                title="Cancelar"
                            >
                                ❌
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => setEditando(true)}
                            className="btn-acao editar"
                            title="Editar"
                        >
                            ✏️
                        </button>
                    )}
                </div>
            </td>
        </tr>
    );
};

export default PrestacaoGeralLista;