import { PrismaClient } from '@prisma/client'
import path from 'path'
import dotenv from 'dotenv'

// Carrega explicitamente o .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Injetando coluna customColor no modelo User...')

    try {
        await prisma.$connect()
        console.log('🔗 Conexão estabelecida.')

        // Tenta adicionar a coluna customColor
        console.log('⚙️ Executando ALTER TABLE...')
        await prisma.$executeRawUnsafe(`
            ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "customColor" TEXT DEFAULT '#8B5CF6';
        `)

        console.log('✅ Coluna customColor injetada com sucesso.')

    } catch (error) {
        console.error('❌ Falha na injeção:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
