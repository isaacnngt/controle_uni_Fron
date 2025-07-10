# Estágio de build
FROM node:18-alpine AS build

# Diretório de trabalho
WORKDIR /app

# Copiar arquivos de dependências primeiro (para melhor cache)
COPY package*.json ./

# Instalar dependências (incluindo devDependencies para o build)
RUN npm ci

# Copiar código fonte
COPY . .

# Variáveis de ambiente para build
ENV REACT_APP_API_URL=https://controleuniback-production.up.railway.app/api
ENV NODE_ENV=production
ENV CI=false
ENV GENERATE_SOURCEMAP=false

# Build da aplicação React (ignorando warnings do ESLint)
RUN npm run build

# Estágio de produção
FROM nginx:alpine

# Copiar arquivos buildados do React (pasta 'build')
COPY --from=build /app/build /usr/share/nginx/html

# Configuração customizada do Nginx
COPY nginx.conf /etc/nginx/nginx.conf

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Comando para iniciar
CMD ["nginx", "-g", "daemon off;"]