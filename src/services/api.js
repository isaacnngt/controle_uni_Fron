import axios from 'axios';

const API_BASE_URL = 'https://controleuniback-production.up.railway.app/api';

const api = axios.create({
    baseURL: API_BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const usuarioService = {
    listarTodos: () => api.get('/usuarios'),
    buscarPorId: (id) => api.get(`/usuarios/${id}`),
    buscarPorNome: (nome) => api.get(`/usuarios/buscar?nome=${nome}`),
    criar: (usuario) => api.post('/usuarios', usuario),
    atualizar: (id, usuario) => api.put(`/usuarios/${id}`, usuario),
    deletar: (id) => api.delete(`/usuarios/${id}`),
    contar: () => api.get('/usuarios/count'),
};

export const parametrosService = {
    buscarAtuais: () => api.get('/parametros'),
    salvar: (parametros) => api.post('/parametros', parametros),
    atualizar: (parametros) => api.put('/parametros', parametros),
};

export const prestacaoContasService = {
    listarTodas: () => api.get('/prestacao-contas'),
    listarPorAno: (ano) => api.get(`/prestacao-contas/ano/${ano}`),
    listarPorUsuario: (usuarioId) => api.get(`/prestacao-contas/usuario/${usuarioId}`),
    criar: (usuarioId, ano) => api.post(`/prestacao-contas/usuario/${usuarioId}/ano/${ano}`),
    atualizarPagamentos: (id, dados) => {
        const params = new URLSearchParams();
        if (dados.valorMensalidadePago) params.append('valorMensalidadePago', dados.valorMensalidadePago);
        if (dados.valorCamisaPago) params.append('valorCamisaPago', dados.valorCamisaPago);
        if (dados.formaPagamento) params.append('formaPagamento', dados.formaPagamento);
        return api.put(`/prestacao-contas/${id}/pagamentos?${params.toString()}`);
    },
    listarAnosVigentes: () => api.get('/prestacao-contas/anos'),
    listarComDividas: () => api.get('/prestacao-contas/com-dividas'),
};

export default api;