# Sistema de Cadastro de Associados

Este é um sistema para gerenciamento de associados de caminhão, permitindo o cadastro de informações como nome, CNH e foto.

## Tecnologias Utilizadas

- Backend: Node.js com Express
- Frontend: React com Material-UI
- Banco de Dados: SQLite
- Docker para containerização

## Como Executar

### Com Docker (Recomendado)

1. Certifique-se de ter o Docker e Docker Compose instalados
2. Execute o comando:
```bash
docker-compose up -d
```
3. Acesse a aplicação em: http://localhost

### Desenvolvimento Local

#### Backend
```bash
cd backend
npm install
npm start
```

#### Frontend
```bash
cd frontend
npm install
npm start
```

## Estrutura do Projeto

- `/backend` - API Node.js
- `/frontend` - Aplicação React
- `docker-compose.yml` - Configuração do Docker Compose
- `database.sqlite` - Banco de dados SQLite (criado automaticamente)
- `/backend/uploads` - Diretório onde as fotos são armazenadas

## Funcionalidades

- Cadastro de associados com nome e CNH
- Upload de fotos
- Visualização em grid responsivo
- Armazenamento persistente em SQLite 