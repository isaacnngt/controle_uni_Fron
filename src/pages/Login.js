import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/api';
import './Login.css';

const Login = ({ onLogin }) => {
    const [formData, setFormData] = useState({
        email: '',
        senha: ''
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [mostrarSenha, setMostrarSenha] = useState(false);
    
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        
        // Limpar mensagem quando usuário digitar
        if (message.text) {
            setMessage({ text: '', type: '' });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.email || !formData.senha) {
            setMessage({ text: 'Preencha todos os campos', type: 'error' });
            return;
        }

        try {
            setLoading(true);
            setMessage({ text: 'Fazendo login...', type: 'info' });

            const response = await authService.login(formData.email, formData.senha);

            if (response.data.sucesso) {
                const userData = response.data.usuario;
                
                // Salvar dados do usuário no localStorage
                localStorage.setItem('usuario', JSON.stringify(userData));
                localStorage.setItem('isLoggedIn', 'true');
                
                setMessage({ text: 'Login realizado com sucesso!', type: 'success' });

                // Callback para o App.js
                if (onLogin) {
                    onLogin(userData);
                }

                // Redirecionar para o menu principal
                setTimeout(() => {
                    navigate('/');
                }, 1000);

            } else {
                setMessage({ text: response.data.mensagem || 'Erro ao fazer login', type: 'error' });
            }

        } catch (error) {
            console.error('Erro no login:', error);
            
            const errorMessage = error.response?.data?.mensagem || 
                               error.response?.data?.message || 
                               'Erro de conexão. Verifique se o servidor está funcionando.';
            
            setMessage({ text: errorMessage, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    const handleTestLogin = () => {
        setFormData({
            email: 'admin@unijovem.com',
            senha: 'admin123'
        });
        setMessage({ text: 'Dados de teste preenchidos', type: 'info' });
    };

    return (
        <div className="login-container">
            <div className="login-background">
                <div className="login-form-container">
                    <div className="login-header">
                        <div className="login-logo">
                            📚 UNIJovem
                        </div>
                        <h2>Bem-vindo de volta!</h2>
                        <p>Faça login para acessar o sistema</p>
                    </div>

                    <form onSubmit={handleSubmit} className="login-form">
                        {message.text && (
                            <div className={`login-alert login-alert-${message.type}`}>
                                {message.text}
                            </div>
                        )}

                        <div className="form-group">
                            <label htmlFor="email" className="form-label">
                                📧 Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                className="form-input"
                                placeholder="seu@email.com"
                                disabled={loading}
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="senha" className="form-label">
                                🔒 Senha
                            </label>
                            <div className="password-input-container">
                                <input
                                    type={mostrarSenha ? 'text' : 'password'}
                                    id="senha"
                                    name="senha"
                                    value={formData.senha}
                                    onChange={handleChange}
                                    className="form-input"
                                    placeholder="Sua senha"
                                    disabled={loading}
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarSenha(!mostrarSenha)}
                                    className="password-toggle"
                                    disabled={loading}
                                >
                                    {mostrarSenha ? '👁️' : '👁️‍🗨️'}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <span className="loading-spinner"></span>
                                    Entrando...
                                </>
                            ) : (
                                <>
                                    🚀 Entrar
                                </>
                            )}
                        </button>

                        <div className="login-actions">
                            <button
                                type="button"
                                onClick={handleTestLogin}
                                className="test-login-button"
                                disabled={loading}
                            >
                                🧪 Usar dados de teste
                            </button>
                        </div>
                    </form>

                    <div className="login-footer">
                        <p>Sistema de Gerenciamento de Jovens</p>
                        <small>UNIJovem © 2025</small>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;