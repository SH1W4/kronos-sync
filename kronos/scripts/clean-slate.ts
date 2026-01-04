import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script to purge all test data before production recruitment.
 * DANGER: This will delete all Bookings, Anamnesis, Slots, Clients, Feedbacks, and Invites.
 * Usage: npx tsx scripts/clean-slate.ts
 */
async function cleanSlate() {
    console.log('🧹 Iniciando protocolo CLEAN SLATE: Purga de Dados de Teste...')

    try {
        // 1. Delete dependent data first
        const anamnesisDeleted = await prisma.anamnesis.deleteMany({})
        console.log(`- ${anamnesisDeleted.count} Fichas de Anamnese removidas.`)

        const agentLogsDeleted = await prisma.agentLog.deleteMany({})
        console.log(`- ${agentLogsDeleted.count} Logs da KAI removidos.`)

        const feedbacksDeleted = await prisma.agentFeedback.deleteMany({})
        console.log(`- ${feedbacksDeleted.count} Feedbacks removidos.`)

        const settlementDeleted = await prisma.settlement.deleteMany({})
        console.log(`- ${settlementDeleted.count} Acertos Financeiros removidos.`)

        // 2. Delete Bookings and related
        const bookingsDeleted = await prisma.booking.deleteMany({})
        console.log(`- ${bookingsDeleted.count} Agendamentos removidos.`)

        const slotsDeleted = await prisma.slot.deleteMany({})
        console.log(`- ${slotsDeleted.count} Slots de agenda removidos.`)

        // 3. Delete temporary business data
        const invitesDeleted = await prisma.inviteCode.deleteMany({})
        console.log(`- ${invitesDeleted.count} Códigos de Convite removidos.`)

        const qrDeleted = await prisma.qrScan.deleteMany({})
        console.log(`- ${qrDeleted.count} Métricas de QR Code removidas.`)

        const kioskDeleted = await prisma.kioskEntry.deleteMany({})
        console.log(`- ${kioskDeleted.count} Entradas de Kiosk (Leads) removidas.`)

        // 4. Delete CLIENT USERS (keep Artists and Admins)
        const clientsDeleted = await prisma.user.deleteMany({
            where: { role: 'CLIENT' }
        })
        console.log(`- ${clientsDeleted.count} Perfis de Cliente (Usuários) removidos.`)

        console.log('\n✅ AMBIENTE LIMPO E PRONTO PARA O LANÇAMENTO!')

    } catch (error) {
        console.error('❌ Erro durante a purga de dados:', error)
    } finally {
        await prisma.$disconnect()
    }
}

cleanSlate()
