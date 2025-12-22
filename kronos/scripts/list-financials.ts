import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
const prisma = new PrismaClient()

async function main() {
    console.log('🧐 Listando Detalhes Financeiros de TODOS os Agendamentos...')
    try {
        const bookings = await prisma.booking.findMany({
            include: {
                client: true,
                artist: { include: { user: true } }
            }
        })

        console.log(`📊 Total: ${bookings.length} agendamentos.`)

        let sumValue = 0
        let sumArtist = 0
        let sumStudio = 0

        bookings.forEach((b, i) => {
            sumValue += b.value
            sumArtist += b.artistShare
            sumStudio += b.studioShare
            console.log(`[${i + 1}] ${b.client.name} | Total: R$ ${b.value} | Artista: R$ ${b.artistShare} | Estúdio: R$ ${b.studioShare} | Status: ${b.status}`)
        })

        console.log(`\n📈 SOMATÓRIA:`)
        console.log(`   Bruto: R$ ${sumValue}`)
        console.log(`   LUCRO ARTISTA: R$ ${sumArtist}`)
        console.log(`   PARTE ESTÚDIO: R$ ${sumStudio}`)

    } catch (e) {
        console.error('❌ Erro:', e)
    } finally {
        await prisma.$disconnect()
    }
}
main()
