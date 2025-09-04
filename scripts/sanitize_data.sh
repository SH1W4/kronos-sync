#!/bin/bash

echo "🧹 Sanitizing sensitive data..."

# Arquivos temporários
TEMP_FILE=$(mktemp)
TEMP_ERROR=$(mktemp)

# Função de limpeza
cleanup() {
    rm -f "$TEMP_FILE" "$TEMP_ERROR"
}

# Registrar cleanup para execução na saída
trap cleanup EXIT

# Padrões para substituição
# Patterns for credentials and sensitive data
SENSITIVE_PATTERNS=(
    's/password[=:].*$/password: {{PASSWORD}}/g'
    's/passwd[=:].*$/passwd: {{PASSWORD}}/g'
    's/DATABASE_URL[=:].*$/DATABASE_URL: {{DATABASE_URL}}/g'
    's/POSTGRES_PASSWORD[=:].*$/POSTGRES_PASSWORD: {{PASSWORD}}/g'
    's/token[=:].*$/token: {{TOKEN}}/g'
    's/secret[=:].*$/secret: {{SECRET}}/g'
    's/api[-_]?key[=:].*$/api_key: {{API_KEY}}/g'
    's/[0-9]{10,16}/{{PHONE}}/g'
    's/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/{{EMAIL}}/g'
)

# Lista de arquivos para processar
files=$(git diff --cached --name-only --diff-filter=ACM)

# Contador para mudanças
changes=0

# Processar cada arquivo
for file in $files; do
    # Ignorar arquivos binários e específicos
    if [[ -f "$file" ]] && [[ ! "$file" =~ \.(png|jpg|jpeg|gif|ico|pdf|ttf|woff|woff2|eot)$ ]] && [[ ! "$file" =~ \.(env|env\.|credentials|secrets) ]]; then
        echo "Processando $file..."
        
        # Criar cópia do arquivo
        cp "$file" "$TEMP_FILE"
        
        # Aplicar todas as substituições
        for pattern in "${SENSITIVE_PATTERNS[@]}"; do
            sed -i "" -E "$pattern" "$TEMP_FILE" 2>"$TEMP_ERROR"
        done
        
        # Verificar se houve alterações
        if ! diff -q "$file" "$TEMP_FILE" >/dev/null 2>&1; then
            cp "$TEMP_FILE" "$file"
            git add "$file"
            ((changes++))
        fi
    fi
done

# Relatar resultados
if [ "$changes" -gt 0 ]; then
    echo "✅ Sanitização completa! $changes arquivos modificados."
else
    echo "✅ Nenhuma alteração necessária."
fi

exit 0
