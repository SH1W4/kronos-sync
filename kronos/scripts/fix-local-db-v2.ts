import { PrismaClient } from '@prisma/client'
import fs from 'fs'
import dotenv from 'dotenv'
import path from 'path'

// Carrega explicitamente o .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function main() {
    const logFile = 'db_fix_status.json'
    console.log('🚀 Iniciando script de correção definitiva...')

    try {
        // 1. Verifica conexão
        await prisma.$connect()
        console.log('🔗 Conexão estabelecida.')

        // 2. Tenta adicionar a coluna instagram
        console.log('⚙️ Executando ALTER TABLE...')
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "artists" ADD COLUMN IF NOT EXISTS "instagram" TEXT;
    `)

        // 3. Verifica se as colunas agora existem
        const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'artists';
    `)

        fs.writeFileSync(logFile, JSON.stringify({
            success: true,
            columns: columns
        }, null, 2))
        console.log('✅ Banco sincronizado localmente.')

    } catch (error) {
        console.error('❌ Falha na correção:', error)
        fs.writeFileSync(logFile, JSON.stringify({
            success: false,
            error: String(error)
        }, null, 2))
    } finally {
        await prisma.$disconnect()
    }
}

main()
