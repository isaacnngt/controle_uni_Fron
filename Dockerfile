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

# Criar configuração nginx inline (sem arquivo externo)
RUN echo 'events { worker_connections 1024; } \
http { \
    include /etc/nginx/mime.types; \
    default_type application/octet-stream; \
    sendfile on; \
    keepalive_timeout 65; \
    gzip on; \
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript; \
    server { \
        listen 80; \
        server_name _; \
        root /usr/share/nginx/html; \
        index index.html; \
        location / { \
            try_files $uri $uri/ /index.html; \
        } \
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ { \
            expires 1y; \
            add_header Cache-Control "public, immutable"; \
        } \
    } \
}' > /etc/nginx/nginx.conf

# Expor porta
EXPOSE 80

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost/ || exit 1

# Comando para iniciar
CMD ["nginx", "-g", "daemon off;"]