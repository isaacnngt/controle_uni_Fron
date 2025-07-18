import React, { useState, useEffect } from 'react';
import { caixaGeralService } from '../services/api';
import './CaixaGeral.css';

const CaixaGeral = () => {
    const [relatorio, setRelatorio] = useState(null);
    const [anoVigente, setAnoVigente] = useState(new Date().getFullYear());
    const [loading, setLoading] = useState(true);
    const [editandoSaldo, setEditandoSaldo] = useState(false);
    const [novoSaldo, setNovoSaldo] = useState('');
    const [salvandoSaldo, setSalvandoSaldo] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    useEffect(() => {
        carregarDados();
    }, [anoVigente]);

    const carregarDados = async () => {
        try {
            setLoading(true);
            const response = await caixaGeralService.buscarRelatorio(anoVigente);
            setRelatorio(response.data);
            setNovoSaldo(response.data.saldoAtual || 0);
            setMessage({ text: '', type: '' });
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
            setMessage({ text: 'Erro ao carregar dados do caixa.', type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleAtualizarSaldo = async () => {
        if (!novoSaldo || isNaN(novoSaldo) || parseFloat(novoSaldo) < 0) {
            setMessage({ text: 'Digite um valor válido (não pode ser negativo).', type: 'error' });
            return;
        }

        try {
            setSalvandoSaldo(true);
            await caixaGeralService.atualizarSaldo(parseFloat(novoSaldo));
            
            setMessage({ text: '✅ Saldo atualizado com sucesso!', type: 'success' });
            setEditandoSaldo(false);
            
            // Recarregar dados
            setTimeout(() => {
                carregarDados();
            }, 1000);

        } catch (error) {
            console.error('Erro ao atualizar saldo:', error);
            setMessage({ text: 'Erro ao atualizar saldo.', type: 'error' });
        } finally {
            setSalvandoSaldo(false);
        }
    };

    const formatarValor = (valor) => {
        if (!valor) return 'R$ 0,00';
        return `R$ ${parseFloat(valor).toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        })}`;
    };

    const calcularPercentual = (arrecadado, esperado) => {
        if (!esperado || esperado === 0) return 0;
        return ((arrecadado / esperado) * 100).toFixed(1);
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Carregando dados do caixa...</div>
            </div>
        );
    }

    if (!relatorio) {
        return (
            <div className="container">
                <div className="error">Erro ao carregar dados do caixa.</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="caixa-geral">
                <div className="header-caixa">
                    <div>
                        <h2>💰 Caixa Geral</h2>
                        <p>Controle financeiro completo - {anoVigente}</p>
                    </div>
                    
                    <div className="controles-ano">
                        <label>Ano:</label>
                        <select
                            value={anoVigente}
                            onChange={(e) => setAnoVigente(parseInt(e.target.value))}
                            className="select-ano"
                        >
                            {[2023, 2024, 2025, 2026].map(ano => (
                                <option key={ano} value={ano}>{ano}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Parâmetros Atuais */}
                <div className="section parametros-section">
                    <h3>📋 Valores Unitários</h3>
                    <div className="parametros-grid">
                        <div className="parametro-card">
                            <span className="parametro-label">💰 Mensalidade</span>
                            <span className="parametro-valor">{formatarValor(relatorio.valorMensalidade)}</span>
                        </div>
                        <div className="parametro-card">
                            <span className="parametro-label">👕 Camisa</span>
                            <span className="parametro-valor">{formatarValor(relatorio.valorCamisa)}</span>
                        </div>
                        <div className="parametro-card">
                            <span className="parametro-label">👥 Total de Jovens</span>
                            <span className="parametro-valor">{relatorio.totalUsuarios}</span>
                        </div>
                    </div>
                </div>

                {/* Resumo Financeiro */}
                <div className="section resumo-section">
                    <h3>📊 Resumo Financeiro - {anoVigente}</h3>
                    <div className="resumo-grid">
                        {/* Mensalidade */}
                        <div className="resumo-card mensalidade">
                            <h4>💰 Mensalidades</h4>
                            <div className="valores-resumo">
                                <div className="valor-item">
                                    <span className="valor-label">Esperado:</span>
                                    <span className="valor">{formatarValor(relatorio.totalEsperadoMensalidade)}</span>
                                </div>
                                <div className="valor-item">
                                    <span className="valor-label">Arrecadado:</span>
                                    <span className="valor destaque">{formatarValor(relatorio.totalArrecadadoMensalidade)}</span>
                                </div>
                                <div className="percentual-bar">
                                    <div 
                                        className="percentual-fill"
                                        style={{ 
                                            width: `${calcularPercentual(relatorio.totalArrecadadoMensalidade, relatorio.totalEsperadoMensalidade)}%`,
                                            backgroundColor: '#10b981'
                                        }}
                                    ></div>
                                </div>
                                <span className="percentual-texto">
                                    {calcularPercentual(relatorio.totalArrecadadoMensalidade, relatorio.totalEsperadoMensalidade)}%
                                </span>
                            </div>
                        </div>

                        {/* Camisa */}
                        <div className="resumo-card camisa">
                            <h4>👕 Camisas</h4>
                            <div className="valores-resumo">
                                <div className="valor-item">
                                    <span className="valor-label">Esperado:</span>
                                    <span className="valor">{formatarValor(relatorio.totalEsperadoCamisa)}</span>
                                </div>
                                <div className="valor-item">
                                    <span className="valor-label">Arrecadado:</span>
                                    <span className="valor destaque">{formatarValor(relatorio.totalArrecadadoCamisa)}</span>
                                </div>
                                <div className="percentual-bar">
                                    <div 
                                        className="percentual-fill"
                                        style={{ 
                                            width: `${calcularPercentual(relatorio.totalArrecadadoCamisa, relatorio.totalEsperadoCamisa)}%`,
                                            backgroundColor: '#3b82f6'
                                        }}
                                    ></div>
                                </div>
                                <span className="percentual-texto">
                                    {calcularPercentual(relatorio.totalArrecadadoCamisa, relatorio.totalEsperadoCamisa)}%
                                </span>
                            </div>
                        </div>

                        {/* Total Geral */}
                        <div className="resumo-card total-geral">
                            <h4>📈 Total Geral</h4>
                            <div className="valores-resumo">
                                <div className="valor-item">
                                    <span className="valor-label">Esperado:</span>
                                    <span className="valor">{formatarValor(relatorio.totalEsperadoGeral)}</span>
                                </div>
                                <div className="valor-item">
                                    <span className="valor-label">Arrecadado:</span>
                                    <span className="valor destaque">{formatarValor(relatorio.totalArrecadadoGeral)}</span>
                                </div>
                                <div className="percentual-bar">
                                    <div 
                                        className="percentual-fill"
                                        style={{ 
                                            width: `${calcularPercentual(relatorio.totalArrecadadoGeral, relatorio.totalEsperadoGeral)}%`,
                                            backgroundColor: '#8b5cf6'
                                        }}
                                    ></div>
                                </div>
                                <span className="percentual-texto">
                                    {calcularPercentual(relatorio.totalArrecadadoGeral, relatorio.totalEsperadoGeral)}%
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Saldo Atual */}
                <div className="section saldo-section">
                    <h3>🏦 Saldo em Banco</h3>
                    <div className="saldo-card">
                        <div className="saldo-info">
                            <span className="saldo-label">Saldo Atual:</span>
                            {editandoSaldo ? (
                                <div className="saldo-edicao">
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        value={novoSaldo}
                                        onChange={(e) => setNovoSaldo(e.target.value)}
                                        className="input-saldo"
                                        placeholder="0,00"
                                    />
                                    <div className="saldo-acoes">
                                        <button
                                            onClick={handleAtualizarSaldo}
                                            disabled={salvandoSaldo}
                                            className="btn btn-primary btn-small"
                                        >
                                            {salvandoSaldo ? '💾 Salvando...' : '💾 Salvar'}
                                        </button>
                                        <button
                                            onClick={() => {
                                                setEditandoSaldo(false);
                                                setNovoSaldo(relatorio.saldoAtual || 0);
                                            }}
                                            disabled={salvandoSaldo}
                                            className="btn btn-secondary btn-small"
                                        >
                                            ❌ Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="saldo-display">
                                    <span className="saldo-valor">{formatarValor(relatorio.saldoAtual)}</span>
                                    <button
                                        onClick={() => setEditandoSaldo(true)}
                                        className="btn btn-primary btn-small"
                                    >
                                        ✏️ Editar
                                    </button>
                                </div>
                            )}
                        </div>
                        <p className="saldo-help">
                            💡 Atualize o saldo sempre que houver movimentações bancárias
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CaixaGeral;