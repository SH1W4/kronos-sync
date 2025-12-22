import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
const prisma = new PrismaClient()

async function main() {
    console.log('🚀 Migrando agendamentos para a lógica 70/30 (Artista fica com 70%)...')
    try {
        const artist = await prisma.artist.findFirst()
        if (!artist) {
            console.log('❌ Nenhum artista encontrado para migração.')
            return
        }

        const rate = artist.commissionRate // Assume-se que seja 0.30 (Estúdio)
        console.log(`📊 Taxa do Estúdio: ${rate * 100}% | Lucro Artista: ${(1 - rate) * 100}%`)

        const bookings = await prisma.booking.findMany({
            where: { artistId: artist.id }
        })

        for (const b of bookings) {
            await prisma.booking.update({
                where: { id: b.id },
                data: {
                    studioShare: b.value * rate,
                    artistShare: b.value * (1 - rate)
                }
            })
        }

        console.log(`✅ ${bookings.length} agendamentos migrados com sucesso.`)

    } catch (e) {
        console.error('❌ Erro na migração:', e)
    } finally {
        await prisma.$disconnect()
    }
}
main()
