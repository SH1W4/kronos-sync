import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
const prisma = new PrismaClient()

async function main() {
    console.log('🧐 Verificando Estrutura Final...')
    try {
        const artistsCols = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = 'artists';`)
        const bookingsCols = await prisma.$queryRawUnsafe(`SELECT column_name FROM information_schema.columns WHERE table_name = 'bookings';`)

        console.log('🎨 Colunas Artist:', (artistsCols as any[]).map(c => c.column_name).join(', '))
        console.log('📅 Colunas Booking:', (bookingsCols as any[]).map(c => c.column_name).join(', '))

        const hasSettlementId = (bookingsCols as any[]).some(c => c.column_name === 'settlementId')
        const hasInstagram = (artistsCols as any[]).some(c => c.column_name === 'instagram')

        if (hasSettlementId && hasInstagram) {
            console.log('✅ TUDO OK! Banco sincronizado.')
        } else {
            console.log('⚠️ AINDA FALTAM COLUNAS. Refazendo correção granular...')
            if (!hasInstagram) await prisma.$executeRawUnsafe('ALTER TABLE "artists" ADD COLUMN IF NOT EXISTS "instagram" TEXT;')
            if (!hasSettlementId) await prisma.$executeRawUnsafe('ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "settlementId" TEXT;')
        }
    } catch (e) {
        console.error('❌ Erro na verificação:', e)
    } finally {
        await prisma.$disconnect()
    }
}
main()
