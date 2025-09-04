#!/bin/bash

echo "🧹 Cleaning repository of sensitive data..."

# Mover dados sensíveis para diretório seguro
mkdir -p .secure_data/

# Lista de diretórios/arquivos a proteger
SENSITIVE_DIRS=(
    "data"
    "reports"
    ".env*"
    "*credentials*"
    "*secrets*"
    "kronos/prisma/migrations"
)

# Backup e remoção
for pattern in "${SENSITIVE_DIRS[@]}"; do
    # Encontrar arquivos
    find . -name "$pattern" ! -path "./.secure_data/*" -print0 | while IFS= read -r -d '' file; do
        if [ -e "$file" ]; then
            echo "Protegendo: $file"
            
            # Criar diretório destino
            dest_dir=".secure_data/$(dirname "${file#./}")"
            mkdir -p "$dest_dir"
            
            # Mover arquivo
            mv "$file" "$dest_dir/"
            
            # Se for diretório de dados, criar placeholder
            if [[ "$pattern" == "data" || "$pattern" == "reports" ]]; then
                echo "# Este diretório contém dados sensíveis
Os arquivos originais foram movidos para .secure_data/
Para restaurar, execute: ./scripts/restore_data.sh" > "${file#./}/README.md"
            fi
        fi
    done
done

# Criar arquivo de template para dados sensíveis
cat > .env.template << EOL
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kronos_sync
DB_USER={{DB_USER}}
DB_PASSWORD={{DB_PASSWORD}}

# JWT Configuration
JWT_SECRET={{JWT_SECRET}}
NEXTAUTH_SECRET={{NEXTAUTH_SECRET}}
NEXTAUTH_URL=http://localhost:3000

# N8N Configuration
N8N_BASIC_AUTH_USER={{N8N_USER}}
N8N_BASIC_AUTH_PASSWORD={{N8N_PASSWORD}}
N8N_ENCRYPTION_KEY={{N8N_KEY}}

# Redis Configuration
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD={{REDIS_PASSWORD}}

# WhatsApp Integration
WHATSAPP_API_TOKEN={{WHATSAPP_TOKEN}}
WHATSAPP_PHONE_NUMBER={{WHATSAPP_NUMBER}}

# Monitoring
GRAFANA_ADMIN_PASSWORD={{GRAFANA_PASSWORD}}

# Replace all values with actual credentials
# DO NOT commit the actual .env file
EOL

# Criar script de restauração
cat > scripts/restore_data.sh << EOL
#!/bin/bash

echo "🔄 Restaurando dados sensíveis..."

if [ ! -d ".secure_data" ]; then
    echo "❌ Diretório .secure_data não encontrado!"
    exit 1
fi

# Restaurar arquivos
cp -r .secure_data/* ./

echo "✅ Dados restaurados com sucesso!"
EOL

chmod +x scripts/restore_data.sh

# Atualizar .gitignore
cat >> .gitignore << EOL

# Secure Data
.secure_data/
.env
.env.*
!.env.template
*credentials*
*secrets*
data/*
!data/README.md
reports/*
!reports/README.md
EOL

echo "✅ Limpeza concluída! Dados sensíveis foram movidos para .secure_data/"
echo "Para restaurar os dados: ./scripts/restore_data.sh"
