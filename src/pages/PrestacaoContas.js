import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { prestacaoContasService, usuarioService, parametrosService } from '../services/api';
import './PrestacaoContas.css';

const PrestacaoContas = () => {
    const [searchParams] = useSearchParams();
    const [usuarios, setUsuarios] = useState([]);
    const [parametros, setParametros] = useState(null);
    const [prestacaoAtual, setPrestacaoAtual] = useState(null);
    const [usuarioSelecionado, setUsuarioSelecionado] = useState(null);
    const [anoVigente, setAnoVigente] = useState(new Date().getFullYear());
    const [anosDisponiveis, setAnosDisponiveis] = useState([]);
    const [loading, setLoading] = useState(true);
    const [salvandoPagamento, setSalvandoPagamento] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [formPagamentos, setFormPagamentos] = useState({
        valorMensalidadePago: '',
        valorCamisaPago: '',
        formaPagamento: 'PIX'
    });

    useEffect(() => {
        carregarDadosIniciais();
    }, []);

    useEffect(() => {
        if (usuarioSelecionado) {
            buscarPrestacaoExistente();
        } else {
            setPrestacaoAtual(null);
            limparFormulario();
        }
    }, [usuarioSelecionado, anoVigente]);

    const carregarDadosIniciais = async () => {
        try {
            setLoading(true);
            setMessage({ text: 'Carregando dados...', type: 'info' });

            // Carregar usuários e parâmetros
            const [usuariosResponse, parametrosResponse] = await Promise.all([
                usuarioService.listarTodos(),
                parametrosService.buscarAtuais()
            ]);

            console.log('Usuários carregados:', usuariosResponse.data?.length || 0);
            console.log('Parâmetros carregados:', parametrosResponse.data);

            setUsuarios(usuariosResponse.data || []);
            setParametros(parametrosResponse.data);

            // Carregar anos disponíveis
            try {
                const anosResponse = await prestacaoContasService.listarAnosVigentes();
                const anos = anosResponse.data || [];
                const anoAtual = new Date().getFullYear();
                if (!anos.includes(anoAtual)) {
                    anos.unshift(anoAtual);
                }
                setAnosDisponiveis(anos.sort((a, b) => b - a));
            } catch (error) {
                console.log('Erro ao carregar anos, usando ano atual:', error);
                setAnosDisponiveis([new Date().getFullYear()]);
            }

            // Se veio um usuário específico da URL
            const usuarioUrl = searchParams.get('usuario');
            if (usuarioUrl && usuariosResponse.data) {
                const usuario = usuariosResponse.data.find(u => u.id.toString() === usuarioUrl);
                if (usuario) {
                    setUsuarioSelecionado(usuario);
                }
            }

            setMessage({ text: '', type: '' });

        } catch (error) {
            console.error('Erro ao carregar dados iniciais:', error);
            setMessage({ text: 'Erro ao carregar dados iniciais. Verifique se o backend está rodando.', type: 'error' });
            setAnosDisponiveis([new Date().getFullYear()]);
        } finally {
            setLoading(false);
        }
    };

    const buscarPrestacaoExistente = async () => {
        if (!usuarioSelecionado || !parametros) return;

        try {
            console.log(`Buscando prestação para usuário ${usuarioSelecionado.id}, ano ${anoVigente}`);

            // Buscar prestação existente
            const response = await prestacaoContasService.listarPorUsuario(usuarioSelecionado.id);
            const prestacaoExistente = response.data?.find(p => p.anoVigente === anoVigente);

            if (prestacaoExistente) {
                console.log('Prestação encontrada:', prestacaoExistente);
                setPrestacaoAtual(prestacaoExistente);

                // Preencher formulário com dados existentes
                setFormPagamentos({
                    valorMensalidadePago: prestacaoExistente.valorMensalidadePago || '0',
                    valorCamisaPago: prestacaoExistente.valorCamisaPago || '0',
                    formaPagamento: prestacaoExistente.formaPagamento || 'PIX'
                });

                setMessage({
                    text: `✅ Prestação de ${anoVigente} encontrada para ${usuarioSelecionado.nome}`,
                    type: 'success'
                });
            } else {
                console.log('Prestação não encontrada, preparando nova');
                // Criar estrutura para nova prestação
                const novaPrestacao = {
                    id: null, // Será criada ao salvar
                    usuario: usuarioSelecionado,
                    anoVigente: anoVigente,
                    valorMensalidadeTotal: parametros.valorMensalidade,
                    valorCamisaTotal: parametros.valorCamisa,
                    valorMensalidadePago: 0,
                    valorCamisaPago: 0,
                    percentualMensalidadePago: 0,
                    percentualCamisaPago: 0,
                    formaPagamento: null
                };

                setPrestacaoAtual(novaPrestacao);
                limparFormulario();

                setMessage({
                    text: `📝 Nova prestação de ${anoVigente} preparada para ${usuarioSelecionado.nome}. Preencha os valores abaixo.`,
                    type: 'info'
                });
            }

        } catch (error) {
            console.error('Erro ao buscar prestação:', error);

            // Mesmo com erro, preparar nova prestação para permitir cadastro
            const novaPrestacao = {
                id: null,
                usuario: usuarioSelecionado,
                anoVigente: anoVigente,
                valorMensalidadeTotal: parametros.valorMensalidade,
                valorCamisaTotal: parametros.valorCamisa,
                valorMensalidadePago: 0,
                valorCamisaPago: 0,
                percentualMensalidadePago: 0,
                percentualCamisaPago: 0,
                formaPagamento: null
            };

            setPrestacaoAtual(novaPrestacao);
            limparFormulario();

            setMessage({
                text: `📝 Prestação não encontrada. Você pode criar uma nova prestação para ${usuarioSelecionado.nome} - ${anoVigente}.`,
                type: 'info'
            });
        }
    };

    const limparFormulario = () => {
        setFormPagamentos({
            valorMensalidadePago: '0',
            valorCamisaPago: '0',
            formaPagamento: 'PIX'
        });
    };

    const handleSelecionarUsuario = (usuario) => {
        setUsuarioSelecionado(usuario);
        setMessage({ text: '', type: '' });
    };

    const handleSalvarPagamentos = async (e) => {
        e.preventDefault();

        if (!usuarioSelecionado) {
            setMessage({ text: 'Selecione um usuário primeiro.', type: 'error' });
            return;
        }

        if (!parametros) {
            setMessage({ text: 'Parâmetros financeiros não carregados.', type: 'error' });
            return;
        }

        // Validar valores - AGORA PERMITE ZERO
        const valorMensalidade = parseFloat(formPagamentos.valorMensalidadePago) || 0;
        const valorCamisa = parseFloat(formPagamentos.valorCamisaPago) || 0;

        if (valorMensalidade < 0 || valorCamisa < 0) {
            setMessage({ text: 'Os valores não podem ser negativos.', type: 'error' });
            return;
        }

        // Remover validação que impedia zero - agora permite salvar com valores zerados
        // if (valorMensalidade === 0 && valorCamisa === 0) {
        //     setMessage({ text: 'Informe pelo menos um valor de pagamento.', type: 'error' });
        //     return;
        // }

        try {
            setSalvandoPagamento(true);
            setMessage({ text: 'Salvando pagamentos...', type: 'info' });

            let prestacaoId = prestacaoAtual?.id;

            // Se não tem ID, criar a prestação primeiro
            if (!prestacaoId) {
                console.log('Criando nova prestação...');
                const response = await prestacaoContasService.criar(usuarioSelecionado.id, anoVigente);
                prestacaoId = response.data.id;
                console.log('Prestação criada com ID:', prestacaoId);
            }

            // Preparar dados para atualização
            const dadosAtualizacao = {
                valorMensalidadePago: valorMensalidade,
                valorCamisaPago: valorCamisa,
                formaPagamento: formPagamentos.formaPagamento
            };

            console.log('Salvando pagamentos:', dadosAtualizacao);
            await prestacaoContasService.atualizarPagamentos(prestacaoId, dadosAtualizacao);

            setMessage({
                text: '✅ Pagamentos salvos com sucesso!',
                type: 'success'
            });

            // Recarregar prestação atualizada
            setTimeout(() => {
                buscarPrestacaoExistente();
            }, 1000);

        } catch (error) {
            console.error('Erro ao salvar pagamentos:', error);
            const errorMsg = error.response?.data?.message || 'Erro ao salvar pagamentos.';
            setMessage({ text: errorMsg, type: 'error' });
        } finally {
            setSalvandoPagamento(false);
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

    const getStatusPagamento = (valorPago, valorTotal) => {
        const percentual = calcularPercentual(valorPago, valorTotal);

        if (percentual >= 100) {
            return { texto: '🟢 Quitado', classe: 'status-quitado', percentual };
        } else if (percentual > 0) {
            return { texto: '🟡 Parcial', classe: 'status-parcial', percentual };
        } else {
            return { texto: '🔴 Pendente', classe: 'status-pendente', percentual };
        }
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Carregando dados...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">💰 Registrar Pagamentos</h2>
                    <p className="card-subtitle">
                        Cadastre e gerencie os pagamentos de mensalidade e camisa dos jovens
                    </p>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Seleção de Usuário e Ano */}
                <div className="selecao-section">
                    <h3>👤 Selecionar Usuário</h3>
                    <div className="selecao-grid">
                        <div className="form-group">
                            <label className="form-label">Usuário</label>
                            <select
                                value={usuarioSelecionado?.id || ''}
                                onChange={(e) => {
                                    const usuario = usuarios.find(u => u.id.toString() === e.target.value);
                                    handleSelecionarUsuario(usuario);
                                }}
                                className="form-select"
                            >
                                <option value="">Selecione um usuário...</option>
                                {usuarios.map(usuario => (
                                    <option key={usuario.id} value={usuario.id}>
                                        {usuario.nome}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="form-label">Ano Vigente</label>
                            <select
                                value={anoVigente}
                                onChange={(e) => setAnoVigente(parseInt(e.target.value))}
                                className="form-select"
                            >
                                {anosDisponiveis.map(ano => (
                                    <option key={ano} value={ano}>{ano}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Formulário de Pagamentos */}
                {usuarioSelecionado && parametros && prestacaoAtual && (
                    <div className="pagamento-section">
                        <h3>💳 Pagamentos de {usuarioSelecionado.nome} - {anoVigente}</h3>

                        <form onSubmit={handleSalvarPagamentos} className="pagamento-form">
                            <div className="pagamentos-grid">
                                {/* Pagamento Mensalidade */}
                                <div className="pagamento-card mensalidade">
                                    <h4>💰 Mensalidade</h4>
                                    <div className="pagamento-info">
                                        <div className="valor-total">
                                            <label>Valor Total:</label>
                                            <span className="valor">{formatarValor(parametros.valorMensalidade)}</span>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Valor Pago (R$)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max={parametros.valorMensalidade}
                                                value={formPagamentos.valorMensalidadePago}
                                                onChange={(e) => setFormPagamentos(prev => ({
                                                    ...prev,
                                                    valorMensalidadePago: e.target.value
                                                }))}
                                                className="form-input"
                                                placeholder="0,00"
                                            />
                                            <small className="form-help">💡 Digite 0 (zero) se nada foi pago</small>
                                        </div>

                                        {formPagamentos.valorMensalidadePago !== '' && (
                                            <div className="status-preview">
                                                <div className="progress-bar">
                                                    <div
                                                        className="progress-fill"
                                                        style={{
                                                            width: `${calcularPercentual(formPagamentos.valorMensalidadePago, parametros.valorMensalidade)}%`,
                                                            backgroundColor: '#10b981'
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="percentual">
                                                    {calcularPercentual(formPagamentos.valorMensalidadePago, parametros.valorMensalidade).toFixed(1)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Pagamento Camisa */}
                                <div className="pagamento-card camisa">
                                    <h4>👕 Camisa</h4>
                                    <div className="pagamento-info">
                                        <div className="valor-total">
                                            <label>Valor Total:</label>
                                            <span className="valor">{formatarValor(parametros.valorCamisa)}</span>
                                        </div>

                                        <div className="form-group">
                                            <label className="form-label">Valor Pago (R$)</label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max={parametros.valorCamisa}
                                                value={formPagamentos.valorCamisaPago}
                                                onChange={(e) => setFormPagamentos(prev => ({
                                                    ...prev,
                                                    valorCamisaPago: e.target.value
                                                }))}
                                                className="form-input"
                                                placeholder="0,00"
                                            />
                                            <small className="form-help">💡 Digite 0 (zero) se nada foi pago</small>
                                        </div>

                                        {formPagamentos.valorCamisaPago !== '' && (
                                            <div className="status-preview">
                                                <div className="progress-bar">
                                                    <div
                                                        className="progress-fill"
                                                        style={{
                                                            width: `${calcularPercentual(formPagamentos.valorCamisaPago, parametros.valorCamisa)}%`,
                                                            backgroundColor: '#3b82f6'
                                                        }}
                                                    ></div>
                                                </div>
                                                <span className="percentual">
                                                    {calcularPercentual(formPagamentos.valorCamisaPago, parametros.valorCamisa).toFixed(1)}%
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Forma de Pagamento */}
                            <div className="forma-pagamento-section">
                                <div className="form-group">
                                    <label className="form-label">Forma de Pagamento</label>
                                    <select
                                        value={formPagamentos.formaPagamento}
                                        onChange={(e) => setFormPagamentos(prev => ({
                                            ...prev,
                                            formaPagamento: e.target.value
                                        }))}
                                        className="form-select"
                                        required
                                    >
                                        <option value="PIX">💳 PIX</option>
                                        <option value="Dinheiro">💵 Dinheiro</option>
                                        <option value="Cartão">💳 Cartão</option>
                                        <option value="Transferência">🏦 Transferência</option>
                                        <option value="Depósito">🏧 Depósito</option>
                                        <option value="Não pago">❌ Não pago</option>
                                    </select>
                                </div>
                            </div>

                            {/* Resumo - MOSTRA MESMO COM VALORES ZERO */}
                            <div className="resumo-pagamento">
                                <h4>📋 Resumo do Pagamento</h4>
                                <div className="resumo-items">
                                    <div className="resumo-item">
                                        <span>💰 Mensalidade:</span>
                                        <span>{formatarValor(formPagamentos.valorMensalidadePago || 0)}</span>
                                    </div>
                                    <div className="resumo-item">
                                        <span>👕 Camisa:</span>
                                        <span>{formatarValor(formPagamentos.valorCamisaPago || 0)}</span>
                                    </div>
                                    <div className="resumo-item total">
                                        <span><strong>Total:</strong></span>
                                        <span><strong>
                                            {formatarValor((parseFloat(formPagamentos.valorMensalidadePago) || 0) + (parseFloat(formPagamentos.valorCamisaPago) || 0))}
                                        </strong></span>
                                    </div>
                                    <div className="resumo-item">
                                        <span>💳 Forma:</span>
                                        <span>{formPagamentos.formaPagamento}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="form-actions">
                                <button
                                    type="submit"
                                    className="btn btn-primary btn-large"
                                    disabled={salvandoPagamento}
                                >
                                    {salvandoPagamento ? '💾 Salvando...' : '💾 Salvar Pagamentos'}
                                </button>
                                <button
                                    type="button"
                                    onClick={limparFormulario}
                                    className="btn btn-secondary"
                                    disabled={salvandoPagamento}
                                >
                                    🔄 Limpar
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Situação Atual (se existe prestação) */}
                {prestacaoAtual && prestacaoAtual.id && (
                    <div className="situacao-atual">
                        <h3>📊 Situação Atual</h3>
                        <div className="situacao-grid">
                            <div className="situacao-card mensalidade">
                                <h4>💰 Mensalidade</h4>
                                <div className="valor-info">
                                    <span className="valor-atual">
                                        {formatarValor(prestacaoAtual.valorMensalidadePago)} / {formatarValor(prestacaoAtual.valorMensalidadeTotal)}
                                    </span>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${calcularPercentual(prestacaoAtual.valorMensalidadePago, prestacaoAtual.valorMensalidadeTotal)}%`,
                                                backgroundColor: '#10b981'
                                            }}
                                        ></div>
                                    </div>
                                    <span className={`status ${getStatusPagamento(prestacaoAtual.valorMensalidadePago, prestacaoAtual.valorMensalidadeTotal).classe}`}>
                                        {getStatusPagamento(prestacaoAtual.valorMensalidadePago, prestacaoAtual.valorMensalidadeTotal).texto}
                                    </span>
                                </div>
                            </div>

                            <div className="situacao-card camisa">
                                <h4>👕 Camisa</h4>
                                <div className="valor-info">
                                    <span className="valor-atual">
                                        {formatarValor(prestacaoAtual.valorCamisaPago)} / {formatarValor(prestacaoAtual.valorCamisaTotal)}
                                    </span>
                                    <div className="progress-bar">
                                        <div
                                            className="progress-fill"
                                            style={{
                                                width: `${calcularPercentual(prestacaoAtual.valorCamisaPago, prestacaoAtual.valorCamisaTotal)}%`,
                                                backgroundColor: '#3b82f6'
                                            }}
                                        ></div>
                                    </div>
                                    <span className={`status ${getStatusPagamento(prestacaoAtual.valorCamisaPago, prestacaoAtual.valorCamisaTotal).classe}`}>
                                        {getStatusPagamento(prestacaoAtual.valorCamisaPago, prestacaoAtual.valorCamisaTotal).texto}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Informações dos Parâmetros */}
                {parametros && (
                    <div className="parametros-info">
                        <h3>ℹ️ Valores de Referência - {anoVigente}</h3>
                        <div className="parametros-cards">
                            <div className="parametro-card">
                                <span className="parametro-label">💰 Mensalidade:</span>
                                <span className="parametro-valor">{formatarValor(parametros.valorMensalidade)}</span>
                            </div>
                            <div className="parametro-card">
                                <span className="parametro-label">👕 Camisa:</span>
                                <span className="parametro-valor">{formatarValor(parametros.valorCamisa)}</span>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PrestacaoContas;