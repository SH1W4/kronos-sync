import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Iniciando correção de banco local...')
    try {
        // Adiciona a coluna instagram na tabela artists se ela não existir
        // Usamos SQL puro para evitar problemas de tipos do Prisma Client desatualizado
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "artists" ADD COLUMN IF NOT EXISTS "instagram" TEXT;
    `)
        console.log('✅ Coluna "instagram" adicionada com sucesso (ou já existia).')

        // Tenta adicionar também na tabela Artist (caso o nome do map seja diferente ou use CamelCase)
        // O erro do usuário diz "artists.instagram", então a tabela acima deve ser a correta.

        // Aproveita para garantir outras colunas que podem estar faltando
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "pixKey" TEXT;
      ALTER TABLE "workspaces" ADD COLUMN IF NOT EXISTS "pixRecipient" TEXT;
    `)
        console.log('✅ Colunas PIX no Workspace verificadas.')

    } catch (error) {
        console.error('❌ Erro ao executar SQL:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
