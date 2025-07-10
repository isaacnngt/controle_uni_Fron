import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { usuarioService } from '../services/api';
import './EditarJovem.css';

const EditarJovem = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [salvando, setSalvando] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [usuarioOriginal, setUsuarioOriginal] = useState(null);

    const [formData, setFormData] = useState({
        nome: '',
        sexo: '',
        tamanhoCamisa: '',
        responsavelDireto: '',
        dataNascimento: '',
        cargoMinisterial: false,
        cargoUnijovem: ''
    });

    useEffect(() => {
        if (id) {
            carregarUsuario();
        } else {
            // Se não tem ID, redirecionar para lista
            navigate('/lista');
        }
    }, [id, navigate]);

    const carregarUsuario = async () => {
        try {
            setLoading(true);
            setMessage({ text: 'Carregando dados do usuário...', type: 'info' });

            const response = await usuarioService.buscarPorId(id);
            const usuario = response.data;

            setUsuarioOriginal(usuario);

            // Preencher formulário com dados existentes
            setFormData({
                nome: usuario.nome || '',
                sexo: usuario.sexo || '',
                tamanhoCamisa: usuario.tamanhoCamisa || '',
                responsavelDireto: usuario.responsavelDireto || '',
                dataNascimento: usuario.dataNascimento || '',
                cargoMinisterial: usuario.cargoMinisterial || false,
                cargoUnijovem: usuario.cargoUnijovem || ''
            });

            setMessage({ text: '', type: '' });

        } catch (error) {
            console.error('Erro ao carregar usuário:', error);
            if (error.response?.status === 404) {
                setMessage({
                    text: 'Usuário não encontrado. Redirecionando para a lista...',
                    type: 'error'
                });
                setTimeout(() => navigate('/lista'), 3000);
            } else {
                setMessage({
                    text: 'Erro ao carregar dados do usuário.',
                    type: 'error'
                });
            }
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const verificarAlteracoes = () => {
        if (!usuarioOriginal) return false;

        return (
            formData.nome !== (usuarioOriginal.nome || '') ||
            formData.sexo !== (usuarioOriginal.sexo || '') ||
            formData.tamanhoCamisa !== (usuarioOriginal.tamanhoCamisa || '') ||
            formData.responsavelDireto !== (usuarioOriginal.responsavelDireto || '') ||
            formData.dataNascimento !== (usuarioOriginal.dataNascimento || '') ||
            formData.cargoMinisterial !== (usuarioOriginal.cargoMinisterial || false) ||
            formData.cargoUnijovem !== (usuarioOriginal.cargoUnijovem || '')
        );
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nome.trim()) {
            setMessage({ text: 'Nome é obrigatório!', type: 'error' });
            return;
        }

        if (!verificarAlteracoes()) {
            setMessage({ text: 'Nenhuma alteração foi feita.', type: 'info' });
            return;
        }

        setSalvando(true);
        setMessage({ text: 'Salvando alterações...', type: 'info' });

        try {
            await usuarioService.atualizar(id, formData);

            setMessage({
                text: '✅ Dados atualizados com sucesso!',
                type: 'success'
            });

            // Atualizar dados originais para comparação
            setUsuarioOriginal({ ...usuarioOriginal, ...formData });

            // Redirecionar após 2 segundos
            setTimeout(() => {
                navigate('/lista');
            }, 2000);

        } catch (error) {
            console.error('Erro ao atualizar usuário:', error);

            if (error.response?.status === 404) {
                setMessage({
                    text: 'Usuário não encontrado. Pode ter sido deletado.',
                    type: 'error'
                });
            } else if (error.response?.status === 400) {
                setMessage({
                    text: 'Dados inválidos. Verifique as informações.',
                    type: 'error'
                });
            } else {
                setMessage({
                    text: 'Erro ao atualizar dados. Tente novamente.',
                    type: 'error'
                });
            }
        } finally {
            setSalvando(false);
        }
    };

    const handleCancelar = () => {
        if (verificarAlteracoes()) {
            if (window.confirm('Você tem alterações não salvas. Deseja realmente cancelar?')) {
                navigate('/lista');
            }
        } else {
            navigate('/lista');
        }
    };

    const handleResetForm = () => {
        if (usuarioOriginal) {
            setFormData({
                nome: usuarioOriginal.nome || '',
                sexo: usuarioOriginal.sexo || '',
                tamanhoCamisa: usuarioOriginal.tamanhoCamisa || '',
                responsavelDireto: usuarioOriginal.responsavelDireto || '',
                dataNascimento: usuarioOriginal.dataNascimento || '',
                cargoMinisterial: usuarioOriginal.cargoMinisterial || false,
                cargoUnijovem: usuarioOriginal.cargoUnijovem || ''
            });
            setMessage({ text: 'Formulário restaurado para os valores originais.', type: 'info' });
        }
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

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Carregando dados do usuário...</div>
            </div>
        );
    }

    if (!usuarioOriginal) {
        return (
            <div className="container">
                <div className="card">
                    <div className="alert alert-error">
                        Usuário não encontrado.
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <div className="header-content">
                        <div className="title-section">
                            <h2 className="card-title">✏️ Editar Jovem</h2>
                            <p className="card-subtitle">
                                Atualize as informações de {usuarioOriginal.nome}
                            </p>
                        </div>
                        <div className="user-info">
                            <span className="user-id">ID: {usuarioOriginal.id}</span>
                            <span className="user-created">
                Cadastrado em: {formatarData(usuarioOriginal.dataInclusao)}
              </span>
                        </div>
                    </div>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Informações Atuais */}
                <div className="info-atual">
                    <h3>📋 Informações Atuais</h3>
                    <div className="info-grid">
                        <div className="info-item">
                            <span className="info-label">Nome:</span>
                            <span className="info-value">{usuarioOriginal.nome}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Sexo:</span>
                            <span className="info-value">
                {usuarioOriginal.sexo === 'M' ? '👨 Masculino' : usuarioOriginal.sexo === 'F' ? '👩 Feminino' : 'Não informado'}
              </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Idade:</span>
                            <span className="info-value">{calcularIdade(usuarioOriginal.dataNascimento)}</span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Cargo Ministerial:</span>
                            <span className="info-value">
                {usuarioOriginal.cargoMinisterial ? '✅ Sim' : '❌ Não'}
              </span>
                        </div>
                        <div className="info-item">
                            <span className="info-label">Situação Financeira:</span>
                            <span className="info-value">
                <span className={`status-badge ${usuarioOriginal.dividas ? 'com-divida' : 'sem-divida'}`}>
                  {usuarioOriginal.dividas ? '🔴 Com dívida' : '🟢 Em dia'}
                </span>
              </span>
                        </div>
                    </div>
                </div>

                {/* Formulário de Edição */}
                <form onSubmit={handleSubmit} className="edicao-form">
                    <h3>✏️ Editar Informações</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="nome" className="form-label">Nome *</label>
                            <input
                                type="text"
                                id="nome"
                                name="nome"
                                value={formData.nome}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="Nome completo do jovem"
                                required
                                disabled={salvando}
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="sexo" className="form-label">Sexo</label>
                            <select
                                id="sexo"
                                name="sexo"
                                value={formData.sexo}
                                onChange={handleChange}
                                className="form-select"
                                disabled={salvando}
                            >
                                <option value="">Selecione...</option>
                                <option value="M">Masculino</option>
                                <option value="F">Feminino</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="tamanhoCamisa" className="form-label">Tamanho da Camisa</label>
                            <select
                                id="tamanhoCamisa"
                                name="tamanhoCamisa"
                                value={formData.tamanhoCamisa}
                                onChange={handleChange}
                                className="form-select"
                                disabled={salvando}
                            >
                                <option value="">Selecione...</option>
                                <option value="PP">PP</option>
                                <option value="P">P</option>
                                <option value="M">M</option>
                                <option value="G">G</option>
                                <option value="GG">GG</option>
                                <option value="XG">XG</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="dataNascimento" className="form-label">Data de Nascimento</label>
                            <input
                                type="date"
                                id="dataNascimento"
                                name="dataNascimento"
                                value={formData.dataNascimento}
                                onChange={handleChange}
                                className="form-input"
                                disabled={salvando}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="responsavelDireto" className="form-label">Responsável Direto</label>
                        <input
                            type="text"
                            id="responsavelDireto"
                            name="responsavelDireto"
                            value={formData.responsavelDireto}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Nome do responsável"
                            disabled={salvando}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="cargoUnijovem" className="form-label">Cargo na UNIJovem</label>
                        <input
                            type="text"
                            id="cargoUnijovem"
                            name="cargoUnijovem"
                            value={formData.cargoUnijovem}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Ex: Líder de Louvor, Secretário..."
                            disabled={salvando}
                        />
                    </div>

                    <div className="form-group">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                name="cargoMinisterial"
                                checked={formData.cargoMinisterial}
                                onChange={handleChange}
                                className="form-checkbox"
                                disabled={salvando}
                            />
                            Possui Cargo Ministerial
                        </label>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={salvando || !verificarAlteracoes()}
                        >
                            {salvando ? '💾 Salvando...' : '💾 Salvar Alterações'}
                        </button>

                        <button
                            type="button"
                            onClick={handleResetForm}
                            className="btn btn-secondary"
                            disabled={salvando}
                        >
                            🔄 Restaurar
                        </button>

                        <button
                            type="button"
                            onClick={handleCancelar}
                            className="btn btn-danger"
                            disabled={salvando}
                        >
                            ❌ Cancelar
                        </button>
                    </div>
                </form>

                {/* Indicador de Alterações */}
                {verificarAlteracoes() && (
                    <div className="alteracoes-indicator">
                        <div className="alert alert-info">
                            ⚠️ Você tem alterações não salvas. Clique em "Salvar Alterações" para confirmar.
                        </div>
                    </div>
                )}

                {/* Ações Rápidas */}
                <div className="acoes-rapidas">
                    <h3>🚀 Ações Rápidas</h3>
                    <div className="acoes-grid">
                        <button
                            onClick={() => navigate(`/prestacao-contas?usuario=${id}`)}
                            className="btn btn-info"
                        >
                            📊 Ver Prestação de Contas
                        </button>
                        <button
                            onClick={() => navigate('/lista')}
                            className="btn btn-secondary"
                        >
                            👥 Voltar para Lista
                        </button>
                        <button
                            onClick={() => navigate('/cadastro')}
                            className="btn btn-primary"
                        >
                            ➕ Cadastrar Novo Jovem
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default EditarJovem;