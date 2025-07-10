import React, { useState, useEffect } from 'react';
import { parametrosService } from '../services/api';
import './ParametrosFinanceiros.css';

const ParametrosFinanceiros = () => {
    const [loading, setLoading] = useState(false);
    const [loadingData, setLoadingData] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [parametrosAtuais, setParametrosAtuais] = useState(null);

    const [formData, setFormData] = useState({
        valorMensalidade: '',
        valorCamisa: ''
    });

    useEffect(() => {
        carregarParametrosAtuais();
    }, []);

    const carregarParametrosAtuais = async () => {
        try {
            setLoadingData(true);
            const response = await parametrosService.buscarAtuais();
            setParametrosAtuais(response.data);

            // Preencher o formulário com os valores atuais
            setFormData({
                valorMensalidade: response.data.valorMensalidade || '',
                valorCamisa: response.data.valorCamisa || ''
            });
        } catch (error) {
            console.error('Erro ao carregar parâmetros:', error);
            setMessage({
                text: 'Erro ao carregar parâmetros atuais.',
                type: 'error'
            });
        } finally {
            setLoadingData(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Permitir apenas números e vírgula/ponto
        const valorLimpo = value.replace(/[^\d.,]/g, '');

        setFormData(prev => ({
            ...prev,
            [name]: valorLimpo
        }));
    };

    const formatarParaNumero = (valor) => {
        if (!valor) return 0;
        // Substituir vírgula por ponto e converter para número
        return parseFloat(valor.toString().replace(',', '.'));
    };

    const formatarParaExibicao = (valor) => {
        if (!valor) return '0,00';
        return valor.toLocaleString('pt-BR', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        const valorMensalidade = formatarParaNumero(formData.valorMensalidade);
        const valorCamisa = formatarParaNumero(formData.valorCamisa);

        if (valorMensalidade <= 0) {
            setMessage({ text: 'Valor da mensalidade deve ser maior que zero!', type: 'error' });
            return;
        }

        if (valorCamisa <= 0) {
            setMessage({ text: 'Valor da camisa deve ser maior que zero!', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const parametros = {
                valorMensalidade: valorMensalidade,
                valorCamisa: valorCamisa
            };

            let response;
            if (parametrosAtuais) {
                response = await parametrosService.atualizar(parametros);
                setMessage({ text: 'Parâmetros atualizados com sucesso!', type: 'success' });
            } else {
                response = await parametrosService.salvar(parametros);
                setMessage({ text: 'Parâmetros salvos com sucesso!', type: 'success' });
            }

            setParametrosAtuais(response.data);

            // Atualizar o formulário com os valores formatados
            setFormData({
                valorMensalidade: response.data.valorMensalidade,
                valorCamisa: response.data.valorCamisa
            });

        } catch (error) {
            console.error('Erro ao salvar parâmetros:', error);
            setMessage({
                text: 'Erro ao salvar parâmetros. Tente novamente.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleReset = () => {
        if (parametrosAtuais) {
            setFormData({
                valorMensalidade: parametrosAtuais.valorMensalidade,
                valorCamisa: parametrosAtuais.valorCamisa
            });
        } else {
            setFormData({
                valorMensalidade: '',
                valorCamisa: ''
            });
        }
        setMessage({ text: '', type: '' });
    };

    if (loadingData) {
        return (
            <div className="container">
                <div className="loading">Carregando parâmetros...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">⚙️ Parâmetros Financeiros</h2>
                    <p className="card-subtitle">
                        Configure os valores de mensalidade e camisa para o sistema
                    </p>
                </div>

                {/* Valores Atuais */}
                {parametrosAtuais && (
                    <div className="parametros-atuais">
                        <h3>📊 Valores Atuais</h3>
                        <div className="valores-grid">
                            <div className="valor-card mensalidade">
                                <div className="valor-icon">💰</div>
                                <div className="valor-info">
                                    <span className="valor-label">Mensalidade</span>
                                    <span className="valor-amount">R$ {formatarParaExibicao(parametrosAtuais.valorMensalidade)}</span>
                                </div>
                            </div>

                            <div className="valor-card camisa">
                                <div className="valor-icon">👕</div>
                                <div className="valor-info">
                                    <span className="valor-label">Camisa</span>
                                    <span className="valor-amount">R$ {formatarParaExibicao(parametrosAtuais.valorCamisa)}</span>
                                </div>
                            </div>
                        </div>

                        {parametrosAtuais.dataInclusao && (
                            <div className="ultima-atualizacao">
                                <small>
                                    Última atualização: {new Date(parametrosAtuais.dataInclusao).toLocaleString('pt-BR')}
                                </small>
                            </div>
                        )}
                    </div>
                )}

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Formulário */}
                <form onSubmit={handleSubmit} className="parametros-form">
                    <h3>✏️ {parametrosAtuais ? 'Atualizar Valores' : 'Definir Valores Iniciais'}</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="valorMensalidade" className="form-label">
                                💰 Valor da Mensalidade (R$) *
                            </label>
                            <div className="input-group">
                                <span className="input-prefix">R$</span>
                                <input
                                    type="text"
                                    id="valorMensalidade"
                                    name="valorMensalidade"
                                    value={formData.valorMensalidade}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="0,00"
                                    required
                                />
                            </div>
                            <small className="form-help">
                                Valor mensal que cada jovem deve pagar
                            </small>
                        </div>

                        <div className="form-group">
                            <label htmlFor="valorCamisa" className="form-label">
                                👕 Valor da Camisa (R$) *
                            </label>
                            <div className="input-group">
                                <span className="input-prefix">R$</span>
                                <input
                                    type="text"
                                    id="valorCamisa"
                                    name="valorCamisa"
                                    value={formData.valorCamisa}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="0,00"
                                    required
                                />
                            </div>
                            <small className="form-help">
                                Valor da camisa da UNIJovem
                            </small>
                        </div>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : '💾 Salvar Parâmetros'}
                        </button>
                        <button
                            type="button"
                            onClick={handleReset}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            🔄 Restaurar
                        </button>
                    </div>
                </form>

                {/* Informações Importantes */}
                <div className="info-section">
                    <h3>ℹ️ Informações Importantes</h3>
                    <div className="info-cards">
                        <div className="info-card warning">
                            <div className="info-icon">⚠️</div>
                            <div className="info-content">
                                <h4>Atenção!</h4>
                                <p>
                                    Alterar os valores irá recalcular automaticamente todos os percentuais
                                    de pagamento nas prestações de contas existentes.
                                </p>
                            </div>
                        </div>

                        <div className="info-card tip">
                            <div className="info-icon">💡</div>
                            <div className="info-content">
                                <h4>Dica</h4>
                                <p>
                                    Os valores podem usar vírgula (,) ou ponto (.) como separador decimal.
                                    Ex: 50,00 ou 50.00
                                </p>
                            </div>
                        </div>

                        <div className="info-card info">
                            <div className="info-icon">📋</div>
                            <div className="info-content">
                                <h4>Como funciona</h4>
                                <p>
                                    Estes valores serão usados para calcular as prestações de contas
                                    e determinar se os jovens estão em dia com os pagamentos.
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ParametrosFinanceiros;