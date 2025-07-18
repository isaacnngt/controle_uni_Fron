import React, { useState, useEffect } from 'react';
import { usuarioService } from '../services/api';
import './TamanhosCamisa.css';

const TamanhosCamisa = () => {
    const [usuarios, setUsuarios] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [estatisticas, setEstatisticas] = useState({});
    const [filtroTamanho, setFiltroTamanho] = useState('');
    const [tooltipVisivel, setTooltipVisivel] = useState(null);
    const [usuariosPorTamanho, setUsuariosPorTamanho] = useState({});
    const [editando, setEditando] = useState({});
    const [salvando, setSalvando] = useState({});
    const [ordenacao, setOrdenacao] = useState({
        campo: 'nome',
        direcao: 'asc'
    });

    const tamanhos = ['PP', 'P', 'M', 'G', 'GG', 'XG', 'XXG'];

    useEffect(() => {
        carregarUsuarios();
    }, []);

    useEffect(() => {
        calcularEstatisticas();
        organizarUsuariosPorTamanho();
    }, [usuarios]);

    const carregarUsuarios = async () => {
        try {
            setLoading(true);
            const response = await usuarioService.listarTodos();
            setUsuarios(response.data || []);
            setMessage({ text: '', type: '' });
        } catch (error) {
            console.error('Erro ao carregar usuários:', error);
            setMessage({
                text: 'Erro ao carregar dados dos usuários.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const organizarUsuariosPorTamanho = () => {
        const grupos = {};

        // Inicializar grupos para todos os tamanhos
        tamanhos.forEach(tamanho => {
            grupos[tamanho] = [];
        });
        grupos['Não informado'] = [];

        // Agrupar usuários por tamanho
        usuarios.forEach(usuario => {
            const tamanho = usuario.tamanhoCamisa;
            if (tamanho && tamanho.toString().trim() !== '' && tamanhos.includes(tamanho.toString().toUpperCase().trim())) {
                grupos[tamanho.toString().toUpperCase().trim()].push(usuario.nome);
            } else {
                grupos['Não informado'].push(usuario.nome);
            }
        });

        setUsuariosPorTamanho(grupos);
    };

    const calcularEstatisticas = () => {
        const stats = {};

        // Inicializar contadores
        tamanhos.forEach(tamanho => {
            stats[tamanho] = 0;
        });
        stats['Não informado'] = 0;
        stats['Total'] = usuarios.length;

        // Contar tamanhos
        usuarios.forEach(usuario => {
            const tamanho = usuario.tamanhoCamisa;
            if (tamanho && tamanho.toString().trim() !== '' && tamanhos.includes(tamanho.toString().toUpperCase().trim())) {
                stats[tamanho.toString().toUpperCase().trim()]++;
            } else {
                stats['Não informado']++;
            }
        });

        setEstatisticas(stats);
    };

    const handleOrdenacao = (campo) => {
        setOrdenacao(prev => ({
            campo,
            direcao: prev.campo === campo && prev.direcao === 'asc' ? 'desc' : 'asc'
        }));
    };

    const getIconeOrdenacao = (campo) => {
        if (ordenacao.campo !== campo) {
            return '↕️';
        }
        return ordenacao.direcao === 'asc' ? '↑' : '↓';
    };

    const handleEditarTamanho = (usuarioId) => {
        const usuario = usuarios.find(u => u.id === usuarioId);
        setEditando({
            ...editando,
            [usuarioId]: usuario.tamanhoCamisa || ''
        });
    };

    const handleCancelarEdicao = (usuarioId) => {
        const novoEditando = { ...editando };
        delete novoEditando[usuarioId];
        setEditando(novoEditando);
    };

    const handleSalvarTamanho = async (usuarioId) => {
        try {
            setSalvando({ ...salvando, [usuarioId]: true });

            const usuario = usuarios.find(u => u.id === usuarioId);
            const novoTamanho = editando[usuarioId];

            // Preparar dados atualizados
            const usuarioAtualizado = {
                ...usuario,
                tamanhoCamisa: novoTamanho.trim() || null
            };

            // Atualizar no backend
            await usuarioService.atualizar(usuarioId, usuarioAtualizado);

            // Atualizar estado local
            setUsuarios(prevUsuarios => 
                prevUsuarios.map(u => 
                    u.id === usuarioId 
                        ? { ...u, tamanhoCamisa: novoTamanho.trim() || null }
                        : u
                )
            );

            // Limpar edição
            const novoEditando = { ...editando };
            delete novoEditando[usuarioId];
            setEditando(novoEditando);

            setMessage({
                text: `✅ Tamanho de ${usuario.nome} atualizado com sucesso!`,
                type: 'success'
            });

            // Limpar mensagem após 3 segundos
            setTimeout(() => {
                setMessage({ text: '', type: '' });
            }, 3000);

        } catch (error) {
            console.error('Erro ao atualizar tamanho:', error);
            setMessage({
                text: 'Erro ao atualizar tamanho. Tente novamente.',
                type: 'error'
            });
        } finally {
            setSalvando({ ...salvando, [usuarioId]: false });
        }
    };

    const usuariosFiltrados = usuarios
        .filter(usuario => {
            if (!filtroTamanho) return true;
            if (filtroTamanho === 'NAO_INFORMADO') {
                return !usuario.tamanhoCamisa || usuario.tamanhoCamisa.toString().trim() === '';
            }
            return usuario.tamanhoCamisa?.toString().toUpperCase().trim() === filtroTamanho;
        })
        .sort((a, b) => {
            let valorA, valorB;

            switch (ordenacao.campo) {
                case 'nome':
                    valorA = a.nome?.toLowerCase() || '';
                    valorB = b.nome?.toLowerCase() || '';
                    break;
                case 'tamanhoCamisa':
                    valorA = a.tamanhoCamisa?.toString().toUpperCase().trim() || 'ZZZ';
                    valorB = b.tamanhoCamisa?.toString().toUpperCase().trim() || 'ZZZ';
                    break;
                case 'sexo':
                    valorA = a.sexo || '';
                    valorB = b.sexo || '';
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

    const exportarCSV = () => {
        try {
            const csvData = [];
            csvData.push('Nome,Tamanho da Camisa,Sexo');

            usuarios.forEach(usuario => {
                const linha = [
                    `"${usuario.nome || ''}"`,
                    `"${usuario.tamanhoCamisa?.toString().trim() || 'Não informado'}"`,
                    `"${usuario.sexo === 'M' ? 'Masculino' : usuario.sexo === 'F' ? 'Feminino' : ''}"`
                ].join(',');
                csvData.push(linha);
            });

            csvData.push('');
            csvData.push('ESTATÍSTICAS POR TAMANHO');
            csvData.push('Tamanho,Quantidade,Percentual');

            tamanhos.forEach(tamanho => {
                const quantidade = estatisticas[tamanho] || 0;
                const percentual = estatisticas.Total > 0 ?
                    ((quantidade / estatisticas.Total) * 100).toFixed(1) + '%' : '0%';
                csvData.push(`"${tamanho}","${quantidade}","${percentual}"`);
            });

            const naoInformado = estatisticas['Não informado'] || 0;
            const percentualNaoInformado = estatisticas.Total > 0 ?
                ((naoInformado / estatisticas.Total) * 100).toFixed(1) + '%' : '0%';
            csvData.push(`"Não informado","${naoInformado}","${percentualNaoInformado}"`);
            csvData.push(`"TOTAL","${estatisticas.Total || 0}","100%"`);

            const csvContent = csvData.join('\n');
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');

            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `tamanhos_camisa_unijovem_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            setMessage({
                text: '✅ Relatório CSV exportado com sucesso!',
                type: 'success'
            });

        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            setMessage({
                text: 'Erro ao exportar relatório. Tente novamente.',
                type: 'error'
            });
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
                    <h2 className="card-title">👕 Tamanhos de Camisa</h2>
                    <p className="card-subtitle">
                        Visualize e gerencie os tamanhos de camisa dos jovens
                    </p>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Estatísticas */}
                <div className="estatisticas-section">
    <h3>📊 Resumo por Tamanhos</h3>
    <div className="estatisticas-grid">
        {tamanhos.map(tamanho => {
            const quantidade = estatisticas[tamanho] || 0;
            const percentual = estatisticas.Total > 0 ? 
                ((quantidade / estatisticas.Total) * 100).toFixed(1) : 0;
            
            return (
                <div
                    key={tamanho}
                    className="stat-card tooltip-container"
                    onMouseEnter={() => setTooltipVisivel(tamanho)}
                    onMouseLeave={() => setTooltipVisivel(null)}
                >
                    <div className="stat-tamanho">{tamanho}</div>
                    <div className="stat-quantidade">{quantidade}</div>
                    <div className="stat-percentual">{percentual}%</div>
                    
                    {/* Badge para indicar se tem dados */}
                    {quantidade > 0 && (
                        <div className="stat-badge">
                            {quantidade === 1 ? '1 pessoa' : `${quantidade} pessoas`}
                        </div>
                    )}

                    {/* Tooltip com nomes */}
                    {tooltipVisivel === tamanho && usuariosPorTamanho[tamanho]?.length > 0 && (
                        <div className="tooltip">
                            <div className="tooltip-header">
                                <strong>Tamanho {tamanho} ({quantidade})</strong>
                            </div>
                            <div className="tooltip-content">
                                {usuariosPorTamanho[tamanho].map((nome, index) => (
                                    <div key={index} className="tooltip-nome">
                                        • {nome}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            );
        })}
        
        {/* Card especial para "Não informado" */}
        <div
            className="stat-card nao-informado tooltip-container"
            onMouseEnter={() => setTooltipVisivel('Não informado')}
            onMouseLeave={() => setTooltipVisivel(null)}
        >
            <div className="stat-tamanho">❓</div>
            <div className="stat-quantidade">{estatisticas['Não informado'] || 0}</div>
            <div className="stat-percentual">
                {estatisticas.Total > 0 ?
                    ((estatisticas['Não informado'] || 0) / estatisticas.Total * 100).toFixed(1) : 0}%
            </div>
            <div className="stat-label">Não informado</div>

            {/* Tooltip com nomes */}
            {tooltipVisivel === 'Não informado' && usuariosPorTamanho['Não informado']?.length > 0 && (
                <div className="tooltip">
                    <div className="tooltip-header">
                        <strong>Sem tamanho ({estatisticas['Não informado'] || 0})</strong>
                    </div>
                    <div className="tooltip-content">
                        {usuariosPorTamanho['Não informado'].map((nome, index) => (
                            <div key={index} className="tooltip-nome">
                                • {nome}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    </div>
</div>

                {/* Controles */}
                <div className="controles-section">
                    <div className="filtros">
                        <div className="form-group">
                            <label className="form-label">Filtrar por tamanho:</label>
                            <select
                                value={filtroTamanho}
                                onChange={(e) => setFiltroTamanho(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Todos os tamanhos</option>
                                {tamanhos.map(tamanho => (
                                    <option key={tamanho} value={tamanho}>
                                        {tamanho} ({estatisticas[tamanho] || 0})
                                    </option>
                                ))}
                                <option value="NAO_INFORMADO">
                                    Não informado ({estatisticas['Não informado'] || 0})
                                </option>
                            </select>
                        </div>
                    </div>

                    <div className="acoes">
                        <button
                            onClick={exportarCSV}
                            className="btn btn-success"
                            title="Exportar relatório em CSV"
                        >
                            📊 Exportar CSV
                        </button>
                        <button
                            onClick={carregarUsuarios}
                            className="btn btn-secondary"
                            title="Atualizar dados"
                        >
                            🔄 Atualizar
                        </button>
                    </div>
                </div>

                {/* Tabela */}
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
                                onClick={() => handleOrdenacao('tamanhoCamisa')}
                            >
                                Tamanho {getIconeOrdenacao('tamanhoCamisa')}
                            </th>
                            <th
                                className="sortable-header"
                                onClick={() => handleOrdenacao('sexo')}
                            >
                                Sexo {getIconeOrdenacao('sexo')}
                            </th>
                            <th>Ações</th>
                        </tr>
                        </thead>
                        <tbody>
                        {usuariosFiltrados.map((usuario) => (
                            <tr key={usuario.id}>
                                <td className="nome-cell" title={usuario.nome}>
                                    <strong>{usuario.nome}</strong>
                                </td>
                                <td>
                                    {editando[usuario.id] !== undefined ? (
                                        <div className="edicao-tamanho">
                                            <select
                                                value={editando[usuario.id]}
                                                onChange={(e) => setEditando({
                                                    ...editando,
                                                    [usuario.id]: e.target.value
                                                })}
                                                className="select-tamanho-edicao"
                                            >
                                                <option value="">Selecione...</option>
                                                {tamanhos.map(tamanho => (
                                                    <option key={tamanho} value={tamanho}>
                                                        {tamanho}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>
                                    ) : (
                                        <span className={`tamanho-badge ${usuario.tamanhoCamisa?.toString().trim() ? 'informado' : 'nao-informado'}`}>
                                            {usuario.tamanhoCamisa?.toString().trim() || '❓ Não informado'}
                                        </span>
                                    )}
                                </td>
                                <td>
                                    <span className={`sexo-badge ${usuario.sexo?.toLowerCase()}`}>
                                        {usuario.sexo === 'M' ? '👨 Masculino' : usuario.sexo === 'F' ? '👩 Feminino' : '-'}
                                    </span>
                                </td>
                                <td>
                                    <div className="acoes-cell">
                                        {editando[usuario.id] !== undefined ? (
                                            <>
                                                <button
                                                    onClick={() => handleSalvarTamanho(usuario.id)}
                                                    disabled={salvando[usuario.id]}
                                                    className="btn-acao salvar"
                                                    title="Salvar"
                                                >
                                                    {salvando[usuario.id] ? '⏳' : '💾'}
                                                </button>
                                                <button
                                                    onClick={() => handleCancelarEdicao(usuario.id)}
                                                    disabled={salvando[usuario.id]}
                                                    className="btn-acao cancelar"
                                                    title="Cancelar"
                                                >
                                                    ❌
                                                </button>
                                            </>
                                        ) : (
                                            <button
                                                onClick={() => handleEditarTamanho(usuario.id)}
                                                className="btn-acao editar"
                                                title="Editar tamanho"
                                            >
                                                ✏️
                                            </button>
                                        )}
                                    </div>
                                </td>
                            </tr>
                        ))}
                        </tbody>
                    </table>
                </div>

                {/* Resumo */}
                <div className="summary">
                    <p><strong>Total exibido:</strong> {usuariosFiltrados.length} de {usuarios.length} jovens</p>
                    {filtroTamanho && (
                        <p><strong>Filtro ativo:</strong> {
                            filtroTamanho === 'NAO_INFORMADO' ? 'Não informado' : `Tamanho ${filtroTamanho}`
                        }</p>
                    )}
                    {ordenacao.campo && (
                        <p><strong>Ordenado por:</strong> {ordenacao.campo} ({ordenacao.direcao === 'asc' ? 'Crescente' : 'Decrescente'})</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TamanhosCamisa;