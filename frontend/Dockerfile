# Build stage
FROM node:18-alpine as build

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

# Production stage
FROM nginx:alpine

# Remover a configuração padrão do nginx
RUN rm /etc/nginx/conf.d/default.conf

# Copiar nossa configuração personalizada
COPY nginx.conf /etc/nginx/nginx.conf

# Copiar os arquivos buildados do React
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"] 