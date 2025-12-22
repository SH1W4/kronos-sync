import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

// Carrega explicitamente o .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Iniciando Mega-Sincronização de Banco Local...')

    try {
        await prisma.$connect()
        console.log('🔗 Conexão estabelecida.')

        // 1. Tabela Artists
        await prisma.$executeRawUnsafe(`ALTER TABLE "artists" ADD COLUMN IF NOT EXISTS "instagram" TEXT;`)

        // 2. Tabela Bookings (Campos de Liquidação e Financeiro)
        console.log('⚙️ Atualizando tabela bookings...')
        await prisma.$executeRawUnsafe(`
      ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "settlementId" TEXT;
      ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "paymentMethod" TEXT;
      ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "paymentStatus" TEXT DEFAULT 'PENDING';
    `)

        // 3. Criar Tabela Settlement se não existir (necessária para os IDs acima)
        console.log('⚙️ Verificando tabela settlements...')
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "settlements" (
        "id" TEXT NOT NULL,
        "artistId" TEXT NOT NULL,
        "workspaceId" TEXT NOT NULL,
        "amount" DOUBLE PRECISION NOT NULL,
        "status" TEXT NOT NULL DEFAULT 'PENDING',
        "receiptUrl" TEXT,
        "aiConfidence" DOUBLE PRECISION,
        "aiMetadata" JSONB,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        "updatedAt" TIMESTAMP(3) NOT NULL,
        CONSTRAINT "settlements_pkey" PRIMARY KEY ("id")
      );
    `)

        // 4. Tabela VerificationCode (Magic Link)
        console.log('⚙️ Verificando tabela verification_codes...')
        await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "verification_codes" (
        "id" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "code" TEXT NOT NULL,
        "expiresAt" TIMESTAMP(3) NOT NULL,
        "used" BOOLEAN NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "verification_codes_pkey" PRIMARY KEY ("id")
      );
    `)

        console.log('✅ Mega-Sincronização concluída com sucesso.')

    } catch (error) {
        console.error('❌ Falha na sincronização:', error)
    } finally {
        await prisma.$disconnect()
    }
}

main()
