FROM node:18-alpine

WORKDIR /app

# Instalar ferramentas necessárias para healthcheck
RUN apk add --no-cache curl sqlite

COPY package*.json ./

RUN npm install

COPY . .

# Criar diretórios necessários
RUN mkdir -p uploads data

# Expor porta
EXPOSE 3001

# Healthcheck para verificar se a API está respondendo
HEALTHCHECK --interval=5s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

# Comando para iniciar a aplicação
CMD ["node", "src/index.js"] 