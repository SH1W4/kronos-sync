import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('--- PROTOCOLO DE EXPANSÃO DE HIERARQUIA ---')

    try {
        // Adiciona ASSOCIATED ao enum ArtistPlan no PostgreSQL
        await prisma.$executeRawUnsafe(`ALTER TYPE "ArtistPlan" ADD VALUE IF NOT EXISTS 'ASSOCIATED'`)
        console.log('✅ Nível [ASSOCIATED] injetado no enum ArtistPlan.')
    } catch (error) {
        console.error('❌ Erro ao injetar ASSOCIATED:', error)
    }

    await prisma.$disconnect()
}

main()
