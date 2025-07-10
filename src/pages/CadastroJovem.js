import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usuarioService } from '../services/api';
import './CadastroJovem.css';

const CadastroJovem = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    const [formData, setFormData] = useState({
        nome: '',
        sexo: '',
        tamanhoCamisa: '',
        responsavelDireto: '',
        dataNascimento: '',
        cargoMinisterial: false,
        cargoUnijovem: ''
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.nome.trim()) {
            setMessage({ text: 'Nome é obrigatório!', type: 'error' });
            return;
        }

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            await usuarioService.criar(formData);
            setMessage({ text: 'Jovem cadastrado com sucesso!', type: 'success' });

            // Limpar formulário
            setFormData({
                nome: '',
                sexo: '',
                tamanhoCamisa: '',
                responsavelDireto: '',
                dataNascimento: '',
                cargoMinisterial: false,
                cargoUnijovem: ''
            });

            // Redirecionar após 2 segundos
            setTimeout(() => {
                navigate('/lista');
            }, 2000);

        } catch (error) {
            console.error('Erro ao cadastrar jovem:', error);
            setMessage({
                text: 'Erro ao cadastrar jovem. Tente novamente.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/');
    };

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">➕ Cadastrar Jovem</h2>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="cadastro-form">
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
                            />
                            Possui Cargo Ministerial
                        </label>
                    </div>

                    <div className="form-actions">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={loading}
                        >
                            {loading ? 'Salvando...' : '💾 Salvar'}
                        </button>
                        <button
                            type="button"
                            onClick={handleCancel}
                            className="btn btn-secondary"
                            disabled={loading}
                        >
                            ❌ Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CadastroJovem;