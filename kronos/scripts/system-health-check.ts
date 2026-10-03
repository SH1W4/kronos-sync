import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function main() {
    console.log('=== RELATÓRIO DE SAÚDE DO SISTEMA (PRODUÇÃO / NEON) ===\n')

    const totalUsers = await prisma.user.count()
    const artists = await prisma.artist.findMany({
        include: { user: true }
    })
    const totalClients = await prisma.user.count({ where: { role: 'CLIENT' } })
    const totalBookings = await prisma.booking.count()
    const bookingsByStatus = await prisma.booking.groupBy({
        by: ['status'],
        _count: true
    })
    const settlements = await prisma.settlement.findMany({
        include: { artist: { include: { user: true } } },
        orderBy: { createdAt: 'desc' },
        take: 10
    })
    const totalAnamneses = await prisma.anamnesis.count()
    const totalKiosk = await prisma.kioskEntry.count()

    console.log(`👤 Total Usuários no DB: ${totalUsers}`)
    console.log(`🎨 Artistas Cadastrados: ${artists.length}`)
    artists.forEach(a => {
        console.log(`   - ${a.user?.name || a.id} (${a.user?.email}) | Ativo: ${a.isActive} | Plano: ${a.plan} | Ganhos: R$ ${a.monthlyEarnings}`)
    })

    console.log(`\n👥 Total Clientes (Users com role CLIENT): ${totalClients}`)
    console.log(`📅 Total Agendamentos: ${totalBookings}`)
    console.log('   Por Status:')
    bookingsByStatus.forEach(b => console.log(`   - ${b.status}: ${b._count}`))

    const recentBookings = await prisma.booking.findMany({
        take: 8,
        orderBy: { scheduledFor: 'desc' },
        include: { client: true, artist: { include: { user: true } } }
    })
    console.log('\n📅 Últimos Agendamentos:')
    recentBookings.forEach(b => {
        console.log(`   - ${b.scheduledFor.toISOString().split('T')[0]} | ${b.client?.name || 'Sem cliente'} | Artista: ${b.artist?.user?.name || 'Sem artista'} | Status: ${b.status} | R$ ${b.value}`)
    })

    console.log(`\n💰 Total Liquidações (Settlements): ${settlements.length}`)
    settlements.forEach(s => {
        console.log(`   - R$ ${s.totalValue} | Artista: ${s.artist?.user?.name} | Status: ${s.status} | IA: ${s.aiConfidence} | Data: ${s.createdAt.toISOString().split('T')[0]}`)
    })

    console.log(`\n📋 Fichas de Anamnese: ${totalAnamneses}`)
    console.log(`📱 Leads de Kiosk (Totem): ${totalKiosk}`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
