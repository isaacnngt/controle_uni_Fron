import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { usuarioService } from '../services/api';
import './ListaJovens.css';

const ListaJovens = () => {
    const [jovens, setJovens] = useState([]);
    const [jovensOrdenados, setJovensOrdenados] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [ordenacao, setOrdenacao] = useState({
        campo: '',
        direcao: 'asc' // 'asc' ou 'desc'
    });

    useEffect(() => {
        carregarJovens();
    }, []);

    useEffect(() => {
        // Atualizar lista ordenada sempre que jovens ou ordenação mudarem
        ordenarJovens();
    }, [jovens, ordenacao]);

    const carregarJovens = async () => {
        try {
            setLoading(true);
            const response = await usuarioService.listarTodos();
            setJovens(response.data);
        } catch (error) {
            console.error('Erro ao carregar jovens:', error);
            setMessage({
                text: 'Erro ao carregar lista de jovens.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id, nome) => {
        if (window.confirm(`Tem certeza que deseja deletar ${nome}?`)) {
            try {
                await usuarioService.deletar(id);
                setMessage({
                    text: 'Jovem deletado com sucesso!',
                    type: 'success'
                });
                carregarJovens(); // Recarregar lista
            } catch (error) {
                console.error('Erro ao deletar jovem:', error);
                setMessage({
                    text: 'Erro ao deletar jovem.',
                    type: 'error'
                });
            }
        }
    };

    const formatarData = (data) => {
        if (!data) return '-';
        return new Date(data).toLocaleDateString('pt-BR');
    };

    const handleOrdenacao = (campo) => {
        setOrdenacao(prev => ({
            campo,
            direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
        }));
    };

    const ordenarJovens = () => {
        if (!ordenacao.campo) {
            setJovensOrdenados([...jovens]);
            return;
        }

        const jovensOrdenados = [...jovens].sort((a, b) => {
            let valorA, valorB;

            switch (ordenacao.campo) {
                case 'nome':
                    valorA = a.nome?.toLowerCase() || '';
                    valorB = b.nome?.toLowerCase() || '';
                    break;
                case 'sexo':
                    valorA = a.sexo || '';
                    valorB = b.sexo || '';
                    break;
                case 'cargoMinisterial':
                    valorA = a.cargoMinisterial ? 1 : 0;
                    valorB = b.cargoMinisterial ? 1 : 0;
                    break;
                case 'cargoUnijovem':
                    valorA = a.cargoUnijovem?.toLowerCase() || '';
                    valorB = b.cargoUnijovem?.toLowerCase() || '';
                    break;
                case 'dividas':
                    valorA = a.dividas ? 1 : 0;
                    valorB = b.dividas ? 1 : 0;
                    break;
                case 'dataNascimento':
                    valorA = a.dataNascimento ? new Date(a.dataNascimento) : new Date(0);
                    valorB = b.dataNascimento ? new Date(b.dataNascimento) : new Date(0);
                    break;
                default:
                    return 0;
            }

            if (valorA < valorB) {
                return ordenacao.direcao === 'asc' ? -1 : 1;
            }
            if (valorA > valorB) {
                return ordenacao.direcao === 'asc' ? 1 : -1;
            }
            return 0;
        });

        setJovensOrdenados(jovensOrdenados);
    };

    const getIconeOrdenacao = (campo) => {
        if (ordenacao.campo !== campo) {
            return '↕️'; // Ícone neutro
        }
        return ordenacao.direcao === 'asc' ? '↑' : '↓';
    };

    if (loading) {
        return (
            <div className="lista-jovens-container">
                <div className="loading">Carregando jovens...</div>
            </div>
        );
    }

    return (
        <div className="lista-jovens-container">
            <div className="card">
                <div className="card-header">
                    <div className="header-content">
                        <h2 className="card-title">👥 Lista de Jovens</h2>
                        <Link to="/cadastro" className="btn btn-primary">
                            ➕ Novo Jovem
                        </Link>
                    </div>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {jovens.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">👥</div>
                        <h3>Nenhum jovem cadastrado</h3>
                        <p>Comece adicionando o primeiro jovem ao sistema.</p>
                        <Link to="/cadastro" className="btn btn-primary">
                            ➕ Cadastrar Primeiro Jovem
                        </Link>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="table">
                            <thead className="table-header-sticky">
                            <tr>
                                <th
                                    className="sortable-header"
                                    onClick={() => handleOrdenacao('nome')}
                                >
                                    Nome {getIconeOrdenacao('nome')}
                                </th>
                                <th
                                    className="sortable-header"
                                    onClick={() => handleOrdenacao('sexo')}
                                >
                                    Sexo {getIconeOrdenacao('sexo')}
                                </th>
                                <th
                                    className="sortable-header"
                                    onClick={() => handleOrdenacao('cargoMinisterial')}
                                >
                                    Cargo Ministerial {getIconeOrdenacao('cargoMinisterial')}
                                </th>
                                <th
                                    className="sortable-header"
                                    onClick={() => handleOrdenacao('cargoUnijovem')}
                                >
                                    Cargo UNIJovem {getIconeOrdenacao('cargoUnijovem')}
                                </th>
                                <th
                                    className="sortable-header"
                                    onClick={() => handleOrdenacao('dividas')}
                                >
                                    Situação de Dívida {getIconeOrdenacao('dividas')}
                                </th>
                                <th
                                    className="sortable-header"
                                    onClick={() => handleOrdenacao('dataNascimento')}
                                >
                                    Data Nascimento {getIconeOrdenacao('dataNascimento')}
                                </th>
                                <th>Ações</th>
                            </tr>
                            </thead>
                            <tbody>
                            {jovensOrdenados.map((jovem) => (
                                <tr key={jovem.id}>
                                    <td className="nome-cell">
                                        <strong>{jovem.nome}</strong>
                                    </td>
                                    <td>
                                            <span className={`sexo-badge ${jovem.sexo?.toLowerCase()}`}>
                                                {jovem.sexo === 'M' ? '👨 Masculino' : jovem.sexo === 'F' ? '👩 Feminino' : '-'}
                                            </span>
                                    </td>
                                    <td>
                                            <span className={`cargo-badge ${jovem.cargoMinisterial ? 'sim' : 'nao'}`}>
                                                {jovem.cargoMinisterial ? '✅ Sim' : '❌ Não'}
                                            </span>
                                    </td>
                                    <td>{jovem.cargoUnijovem || '-'}</td>
                                    <td>
                                            <span className={`divida-badge ${jovem.dividas ? 'com-divida' : 'sem-divida'}`}>
                                                {jovem.dividas ? '🔴 Com dívida' : '🟢 Em dia'}
                                            </span>
                                    </td>
                                    <td>{formatarData(jovem.dataNascimento)}</td>
                                    <td>
                                        <div className="actions">
                                            <Link
                                                to={`/editar/${jovem.id}`}
                                                className="btn-action btn-edit"
                                                title="Editar"
                                            >
                                                ✏️
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(jovem.id, jovem.nome)}
                                                className="btn-action btn-delete"
                                                title="Deletar"
                                            >
                                                🗑️
                                            </button>
                                            <Link
                                                to={`/prestacao-contas?usuario=${jovem.id}`}
                                                className="btn-action btn-prestacao"
                                                title="Ver Prestação de Contas"
                                            >
                                                📊
                                            </Link>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}

                <div className="summary">
                    <p><strong>Total de jovens:</strong> {jovens.length}</p>
                    {ordenacao.campo && (
                        <p><strong>Ordenado por:</strong> {ordenacao.campo} ({ordenacao.direcao === 'asc' ? 'Crescente' : 'Decrescente'})</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ListaJovens;