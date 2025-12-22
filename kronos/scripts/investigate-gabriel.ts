import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
const prisma = new PrismaClient()

async function main() {
    console.log('🧐 Investigando agendamentos do Gabriel...')
    try {
        const gabriel = await prisma.user.findFirst({
            where: { name: { contains: 'Gabriel', mode: 'insensitive' } },
            include: {
                bookings: {
                    orderBy: { createdAt: 'desc' }
                }
            }
        })

        if (!gabriel) {
            console.log('❌ Gabriel não encontrado.')
            return
        }

        console.log(`👤 Cliente: ${gabriel.name}`)
        console.log(`📅 Total de Bookings: ${gabriel.bookings.length}`)

        gabriel.bookings.forEach((b, i) => {
            console.log(`[${i + 1}] ID: ${b.id} | Status: ${b.status} | Valor: R$ ${b.value}`)
        })

        const completed = gabriel.bookings.filter(b => b.status === 'COMPLETED')
        console.log(`\n✅ Bookings COMPLETED: ${completed.length}`)

    } catch (e) {
        console.error('❌ Erro:', e)
    } finally {
        await prisma.$disconnect()
    }
}
main()
