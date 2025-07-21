FROM node:18-alpine

WORKDIR /app

# Instalar ferramentas necessárias para compilação e healthcheck
RUN apk add --no-cache curl sqlite python3 make g++

# Copiar package.json primeiro para aproveitar cache do Docker
COPY package*.json ./

# Remover node_modules se existir e instalar dependências
RUN rm -rf node_modules package-lock.json && npm install

# Copiar o resto do código
COPY . .

# Criar diretórios necessários
RUN mkdir -p uploads data

# Criar script de inicialização
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "🚀 Iniciando aplicação..."' >> /app/start.sh && \
    echo 'echo "📁 Verificando diretórios..."' >> /app/start.sh && \
    echo 'mkdir -p /app/data /app/uploads' >> /app/start.sh && \
    echo 'echo "🔄 Executando migrações do banco..."' >> /app/start.sh && \
    echo 'node /app/src/infrastructure/database/migrate-dolly-support.js || echo "⚠️  Migração dolly-support já executada ou erro"' >> /app/start.sh && \
    echo 'node /app/src/infrastructure/database/migrate-dolly-semi-reboque.js || echo "⚠️  Migração dolly-semi-reboque já executada ou erro"' >> /app/start.sh && \
    echo 'echo "✅ Migrações concluídas"' >> /app/start.sh && \
    echo 'echo "🌟 Iniciando servidor..."' >> /app/start.sh && \
    echo 'exec node /app/src/index.js' >> /app/start.sh && \
    chmod +x /app/start.sh

# Expor porta
EXPOSE 3001

# Healthcheck para verificar se a API está respondendo
HEALTHCHECK --interval=5s --timeout=3s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Comando para iniciar a aplicação
CMD ["/app/start.sh"] 