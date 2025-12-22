import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Finalizando agendamentos de teste para aparecerem no Financeiro...')
    try {
        const result = await prisma.booking.updateMany({
            where: {
                status: { in: ['OPEN', 'CONFIRMED'] }
            },
            data: {
                status: 'COMPLETED'
            }
        })

        console.log(`✅ ${result.count} agendamentos foram marcados como COMPLETED.`)
        console.log('💡 Agora eles devem aparecer na aba "Sessões para Acerto" do Financeiro.')

    } catch (e) {
        console.error('❌ Erro:', e)
    } finally {
        await prisma.$disconnect()
    }
}
main()
