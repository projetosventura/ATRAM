#!/bin/sh

echo "🚀 Iniciando aplicação..."
echo "📁 Verificando diretórios..."
mkdir -p /app/data /app/uploads

echo "🔄 Verificando estrutura do banco..."
echo "✅ Estrutura do banco verificada"

echo "🌟 Iniciando servidor..."
exec node /app/src/index.js 