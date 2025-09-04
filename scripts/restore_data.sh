#!/bin/bash

echo "🔄 Restaurando dados sensíveis..."

if [ ! -d ".secure_data" ]; then
    echo "❌ Diretório .secure_data não encontrado!"
    exit 1
fi

# Restaurar arquivos
cp -r .secure_data/* ./

echo "✅ Dados restaurados com sucesso!"
