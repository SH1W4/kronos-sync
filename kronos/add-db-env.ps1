$envLocalPath = "C:\Users\João\Desktop\PROJETOS\05_PLATFORMS\kronos_sync\kronos\.env.local"

# Connection strings do Neon
$pooledUrl = "postgresql://neondb_owner:npg_K5pzLT0MQYWq@ep-long-rain-a498adc9-pooler.us-east-1.aws.neon.tech/neondb?sslmode=require&pgbouncer=true"
$directUrl = "postgresql://neondb_owner:npg_K5pzLT0MQYWq@ep-long-rain-a498adc9.us-east-1.aws.neon.tech/neondb?sslmode=require"

# Lê o arquivo atual se existir
$envContent = ""
if (Test-Path $envLocalPath) {
    $envContent = Get-Content $envLocalPath -Raw
}

# Remove variáveis antigas de database se existirem
$envContent = $envContent -replace 'POSTGRES_PRISMA_URL=.*\r?\n?', ''
$envContent = $envContent -replace 'POSTGRES_URL_NON_POOLING=.*\r?\n?', ''
$envContent = $envContent -replace 'DATABASE_URL=.*\r?\n?', ''

# Adiciona as novas variáveis
$newVars = @"

# Database Connection (Neon)
POSTGRES_PRISMA_URL="$pooledUrl"
POSTGRES_URL_NON_POOLING="$directUrl"
"@

$envContent = $envContent.TrimEnd() + $newVars

# Salva o arquivo
Set-Content -Path $envLocalPath -Value $envContent -NoNewline

Write-Host "✅ Variáveis de banco de dados adicionadas ao .env.local" -ForegroundColor Green
Write-Host "🔄 Reinicie o servidor com: npm run dev" -ForegroundColor Yellow
