import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
const prisma = new PrismaClient()

async function main() {
    console.log('🧐 Listando TODO o banco de Agendamentos...')
    try {
        const allBookings = await prisma.booking.findMany({
            include: {
                client: true
            }
        })

        console.log(`📊 Encontrados ${allBookings.length} agendamentos totais.`)

        allBookings.forEach((b, i) => {
            console.log(`[${i + 1}] Cliente: ${b.client.name} | Status: ${b.status} | Valor: ${b.value} | ID: ${b.id}`)
        })

    } catch (e) {
        console.error('❌ Erro:', e)
    } finally {
        await prisma.$disconnect()
    }
}
main()
