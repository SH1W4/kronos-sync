import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
const prisma = new PrismaClient()

async function main() {
    console.log('🧐 Auditando Cálculos de Comissão...')
    try {
        const artist = await prisma.artist.findFirst({
            include: { user: true }
        })

        if (!artist) {
            console.log('❌ Nenhum artista encontrado.')
            return
        }

        console.log(`👤 Artista: ${artist.user.name}`)
        console.log(`📊 Taxa de Comissão (Config): ${artist.commissionRate * 100}%`)

        const bookings = await prisma.booking.findMany({
            where: { artistId: artist.id },
            include: { client: true }
        })

        console.log(`\n📅 Detalhes dos Agendamentos:`)
        bookings.forEach((b, i) => {
            const expectedShare = b.value * artist.commissionRate
            console.log(`[${i + 1}] Cliente: ${b.client.name}`)
            console.log(`    Valor Total: R$ ${b.value}`)
            console.log(`    Artist Share (Banco): R$ ${b.artistShare}`)
            console.log(`    Artist Share (Esperado @ ${artist.commissionRate * 100}%): R$ ${expectedShare}`)
            console.log(`    Diferença: R$ ${b.artistShare - expectedShare}`)
        })

        const totalRevenue = bookings.reduce((acc, b) => acc + b.value, 0)
        const totalArtistShare = bookings.reduce((acc, b) => acc + b.artistShare, 0)

        console.log(`\n📈 TOTAIS:`)
        console.log(`   Faturamento Bruto: R$ ${totalRevenue}`)
        console.log(`   Total Artist Share: R$ ${totalArtistShare}`)

    } catch (e) {
        console.error('❌ Erro:', e)
    } finally {
        await prisma.$disconnect()
    }
}
main()
