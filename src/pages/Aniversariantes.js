import React, { useState, useEffect } from 'react';
import { usuarioService } from '../services/api';
import './Aniversariantes.css';

const Aniversariantes = () => {
    const [aniversariantesPorMes, setAniversariantesPorMes] = useState({});
    const [aniversariantesHoje, setAniversariantesHoje] = useState([]);
    const [proximosAniversariantes, setProximosAniversariantes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState({ text: '', type: '' });
    const [mesSelecionado, setMesSelecionado] = useState('');
    const [estatisticas, setEstatisticas] = useState({});

    const meses = [
        'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
        'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];

    const mesAtual = new Date().getMonth(); // 0-11

    useEffect(() => {
        carregarDados();
    }, []);

    const carregarDados = async () => {
        try {
            setLoading(true);
            setMessage({ text: 'Carregando aniversariantes...', type: 'info' });

            const [aniversariantesResponse, hojeResponse, proximosResponse] = await Promise.all([
                usuarioService.listarAniversariantesPorMes(),
                usuarioService.listarAniversariantesHoje(),
                usuarioService.listarProximosAniversariantes(30)
            ]);

            setAniversariantesPorMes(aniversariantesResponse.data);
            setAniversariantesHoje(hojeResponse.data || []);
            setProximosAniversariantes(proximosResponse.data || []);

            calcularEstatisticas(aniversariantesResponse.data);
            setMessage({ text: '', type: '' });

        } catch (error) {
            console.error('Erro ao carregar aniversariantes:', error);
            setMessage({
                text: 'Erro ao carregar dados dos aniversariantes.',
                type: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const calcularEstatisticas = (dados) => {
        const stats = {
            totalComDataNascimento: 0,
            aniversariantesHojeCont: 0,
            mesComMaisAniversariantes: '',
            maiorQuantidade: 0
        };

        let totalAniversariantes = 0;
        let mesComMaior = '';
        let maiorQuant = 0;

        Object.entries(dados).forEach(([mes, usuarios]) => {
            const quantidade = usuarios.length;
            totalAniversariantes += quantidade;

            if (quantidade > maiorQuant) {
                maiorQuant = quantidade;
                mesComMaior = mes;
            }
        });

        stats.totalComDataNascimento = totalAniversariantes;
        stats.mesComMaisAniversariantes = mesComMaior;
        stats.maiorQuantidade = maiorQuant;

        setEstatisticas(stats);
    };

    const formatarData = (data) => {
        if (!data) return '-';

        // Corrigir problema de timezone
        const dataObj = new Date(data + 'T00:00:00');
        return dataObj.toLocaleDateString('pt-BR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };
    const calcularIdade = (dataNascimento) => {
        if (!dataNascimento) return '-';

        // Criar data sem problema de timezone
        const hoje = new Date();
        const nascimento = new Date(dataNascimento + 'T00:00:00');

        let idade = hoje.getFullYear() - nascimento.getFullYear();
        const mesAtual = hoje.getMonth();
        const mesNascimento = nascimento.getMonth();

        if (mesAtual < mesNascimento || (mesAtual === mesNascimento && hoje.getDate() < nascimento.getDate())) {
            idade--;
        }

        return `${idade} anos`;
    };

    const proximaIdade = (dataNascimento) => {
        if (!dataNascimento) return '-';
        const idade = parseInt(calcularIdade(dataNascimento));
        return isNaN(idade) ? '-' : `${idade + 1} anos`;
    };

    const diasParaAniversario = (dataNascimento) => {
        if (!dataNascimento) return null;

        const hoje = new Date();
        const nascimento = new Date(dataNascimento);
        const anoAtual = hoje.getFullYear();

        // Próximo aniversário
        const proximoAniversario = new Date(anoAtual, nascimento.getMonth(), nascimento.getDate());

        // Se já passou este ano, considerar o próximo ano
        if (proximoAniversario < hoje) {
            proximoAniversario.setFullYear(anoAtual + 1);
        }

        const diffTime = proximoAniversario - hoje;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return '🎉 HOJE!';
        if (diffDays === 1) return '🎂 Amanhã';
        if (diffDays <= 7) return `📅 ${diffDays} dias`;
        if (diffDays <= 30) return `📅 ${diffDays} dias`;

        return `📅 ${diffDays} dias`;
    };

    const exportarCSV = () => {
        try {
            const csvData = [];
            csvData.push('Nome,Data Nascimento,Idade Atual,Próxima Idade,Mês,Dias para Aniversário');

            Object.entries(aniversariantesPorMes).forEach(([mes, usuarios]) => {
                usuarios.forEach(usuario => {
                    const linha = [
                        `"${usuario.nome}"`,
                        `"${formatarData(usuario.dataNascimento)}"`,
                        `"${calcularIdade(usuario.dataNascimento)}"`,
                        `"${proximaIdade(usuario.dataNascimento)}"`,
                        `"${mes}"`,
                        `"${diasParaAniversario(usuario.dataNascimento)}"`
                    ].join(',');
                    csvData.push(linha);
                });
            });

            const csvContent = csvData.join('\n');
            const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
            const link = document.createElement('a');

            if (link.download !== undefined) {
                const url = URL.createObjectURL(blob);
                link.setAttribute('href', url);
                link.setAttribute('download', `aniversariantes_unijovem_${new Date().toISOString().split('T')[0]}.csv`);
                link.style.visibility = 'hidden';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }

            setMessage({
                text: '✅ Lista de aniversariantes exportada com sucesso!',
                type: 'success'
            });

        } catch (error) {
            console.error('Erro ao exportar CSV:', error);
            setMessage({
                text: 'Erro ao exportar lista. Tente novamente.',
                type: 'error'
            });
        }
    };

    const irParaMes = (mes) => {
        setMesSelecionado(mes);
        // Scroll suave para o mês selecionado
        setTimeout(() => {
            const elemento = document.getElementById(mes);
            if (elemento) {
                elemento.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }, 100);
    };

    if (loading) {
        return (
            <div className="container">
                <div className="loading">Carregando aniversariantes...</div>
            </div>
        );
    }

    return (
        <div className="container">
            <div className="card">
                <div className="card-header">
                    <h2 className="card-title">🎂 Aniversariantes da UNIJovem</h2>
                    <p className="card-subtitle">
                        Lista completa de aniversariantes organizados por mês
                    </p>
                </div>

                {message.text && (
                    <div className={`alert alert-${message.type}`}>
                        {message.text}
                    </div>
                )}

                {/* Estatísticas Rápidas */}
                <div className="stats-section">
                    <div className="stats-grid">
                        <div className="stat-card hoje">
                            <div className="stat-icon">🎉</div>
                            <div className="stat-info">
                                <span className="stat-number">{aniversariantesHoje.length}</span>
                                <span className="stat-label">Hoje</span>
                            </div>
                        </div>

                        <div className="stat-card total">
                            <div className="stat-icon">👥</div>
                            <div className="stat-info">
                                <span className="stat-number">{estatisticas.totalComDataNascimento}</span>
                                <span className="stat-label">Total com Data</span>
                            </div>
                        </div>

                        <div className="stat-card mes-popular">
                            <div className="stat-icon">📊</div>
                            <div className="stat-info">
                                <span className="stat-number">{estatisticas.maiorQuantidade}</span>
                                <span className="stat-label">{estatisticas.mesComMaisAniversariantes}</span>
                            </div>
                        </div>

                        <div className="stat-card proximos">
                            <div className="stat-icon">📅</div>
                            <div className="stat-info">
                                <span className="stat-number">{proximosAniversariantes.length}</span>
                                <span className="stat-label">Próximos 30 dias</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Aniversariantes de Hoje */}
                {aniversariantesHoje.length > 0 && (
                    <div className="hoje-section">
                        <h3>🎉 Aniversariantes de Hoje</h3>
                        <div className="hoje-grid">
                            {aniversariantesHoje.map(usuario => (
                                <div key={usuario.id} className="hoje-card">
                                    <div className="hoje-icon">🎂</div>
                                    <div className="hoje-info">
                                        <h4>{usuario.nome}</h4>
                                        <p>Fazendo {proximaIdade(usuario.dataNascimento)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Controles */}
                <div className="controles-section">
                    <div className="filtros">
                        <div className="form-group">
                            <label className="form-label">Ir para o mês:</label>
                            <select
                                value={mesSelecionado}
                                onChange={(e) => irParaMes(e.target.value)}
                                className="form-select"
                            >
                                <option value="">Selecione um mês...</option>
                                {meses.map((mes, index) => {
                                    const quantidade = aniversariantesPorMes[mes]?.length || 0;
                                    return (
                                        <option key={index} value={mes}>
                                            {mes} ({quantidade})
                                        </option>
                                    );
                                })}
                            </select>
                        </div>
                    </div>

                    <div className="acoes">
                        <button
                            onClick={exportarCSV}
                            className="btn btn-success"
                            title="Exportar lista completa"
                        >
                            📊 Exportar CSV
                        </button>
                        <button
                            onClick={carregarDados}
                            className="btn btn-secondary"
                            title="Atualizar dados"
                        >
                            🔄 Atualizar
                        </button>
                    </div>
                </div>

                {/* Lista por Meses */}
                <div className="meses-section">
                    {meses.map((mes, index) => {
                        const usuarios = aniversariantesPorMes[mes] || [];
                        const isCurrentMonth = index === mesAtual;
                        const isSelected = mesSelecionado === mes;

                        if (usuarios.length === 0 && !isSelected && mesSelecionado !== '') {
                            return null; // Não mostrar meses vazios quando um mês específico está selecionado
                        }

                        return (
                            <div
                                key={mes}
                                id={mes}
                                className={`mes-card ${isCurrentMonth ? 'mes-atual' : ''} ${isSelected ? 'mes-selecionado' : ''}`}
                            >
                                <div className="mes-header">
                                    <h3>
                                        {isCurrentMonth && '⭐ '}
                                        📅 {mes}
                                        <span className="mes-count">({usuarios.length})</span>
                                    </h3>
                                </div>

                                {usuarios.length === 0 ? (
                                    <div className="mes-vazio">
                                        <p>🗓️ Nenhum aniversariante em {mes}</p>
                                    </div>
                                ) : (
                                    <div className="aniversariantes-grid">
                                        {usuarios.map(usuario => (
                                            <div key={usuario.id} className="aniversariante-card">
                                                <div className="aniversariante-info">
                                                    <h4 className="aniversariante-nome">{usuario.nome}</h4>
                                                    <div className="aniversariante-detalhes">
                                                        <span className="data-nascimento">
                                                            🎂 {formatarData(usuario.dataNascimento)}
                                                        </span>
                                                        <span className="idade-atual">
                                                            👤 {calcularIdade(usuario.dataNascimento)}
                                                        </span>
                                                        <span className="proxima-idade">
                                                            ➡️ {proximaIdade(usuario.dataNascimento)}
                                                        </span>
                                                    </div>
                                                    <div className="dias-para-aniversario">
                                                        {diasParaAniversario(usuario.dataNascimento)}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Próximos Aniversariantes */}
                {proximosAniversariantes.length > 0 && (
                    <div className="proximos-section">
                        <h3>📅 Próximos Aniversários (30 dias)</h3>
                        <div className="proximos-grid">
                            {proximosAniversariantes.slice(0, 10).map(usuario => (
                                <div key={usuario.id} className="proximo-card">
                                    <div className="proximo-info">
                                        <h4>{usuario.nome}</h4>
                                        <p>{formatarData(usuario.dataNascimento)} - {diasParaAniversario(usuario.dataNascimento)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Resumo */}
                <div className="summary">
                    <p><strong>Total de jovens com data de nascimento:</strong> {estatisticas.totalComDataNascimento}</p>
                    <p><strong>Mês com mais aniversariantes:</strong> {estatisticas.mesComMaisAniversariantes} ({estatisticas.maiorQuantidade})</p>
                    {mesSelecionado && (
                        <p><strong>Visualizando:</strong> {mesSelecionado}</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Aniversariantes;