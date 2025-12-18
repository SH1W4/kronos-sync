import 'dotenv/config'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    console.log('\n🔍 --- INICIANDO DIAGNÓSTICO KRONOS SYNC ---')
    console.log('📅 Data:', new Date().toLocaleString())
    console.log('🔑 DB URL Status:', process.env.DATABASE_URL ? '✅ Carregada' : '❌ AUSENTE')
    console.log('-------------------------------------------')

    // 1. TESTE DE BANCO DE DADOS
    try {
        console.log('\n[1/5] 📡 Testando Conexão com Banco de Dados...')
        await prisma.$connect()
        console.log('✅ Conectado com sucesso!')
    } catch (e) {
        console.error('❌ ERRO AO CONECTAR:', e)
        process.exit(1)
    }

    // 2. CONTAGEM DE USUÁRIOS
    try {
        console.log('\n[2/5] 👥 Verificando Usuários...')
        const userCount = await prisma.user.count()
        const artists = await prisma.user.count({ where: { role: 'ARTIST' } })
        const admins = await prisma.user.count({ where: { role: 'ADMIN' } })

        console.log(`✅ Total de Usuários: ${userCount}`)
        console.log(`   - Artistas: ${artists}`)
        console.log(`   - Admins: ${admins}`)

        if (artists === 0 && admins === 0) {
            console.warn('⚠️ ALERTA: Nenhum Artista ou Admin encontrado. Use /api/seed para criar um.')
        }
    } catch (e) {
        console.error('❌ Erro ao ler usuários:', e)
    }

    // 3. VERIFICAR AGENDAMENTOS (BOOKINGS)
    try {
        console.log('\n[3/5] 📅 Verificando Agendamentos...')
        const bookings = await prisma.booking.findMany({
            take: 5,
            orderBy: { createdAt: 'desc' },
            include: { artist: { include: { user: true } }, slot: true }
        })

        console.log(`✅ Agendamentos Encontrados: ${bookings.length}`)
        bookings.forEach(b => {
            console.log(`   - [${b.status}] ${b.slot ? new Date(b.slot.startTime).toLocaleDateString() : 'N/A'} - Artista: ${b.artist.user.name || 'Desconhecido'}`)
        })
    } catch (e) {
        console.error('❌ Erro ao ler agendamentos:', e)
    }

    // 4. TESTE DE SISTEMA DE CONVITES
    try {
        console.log('\n[4/5] 🎟️ Testando Sistema de Convites...')
        const testCode = `TEST-DIAG-${Math.floor(Math.random() * 1000)}`

        // Precisamos de um criador ID. Pegando o primeiro usuário.
        const creator = await prisma.user.findFirst()

        if (creator) {
            await prisma.inviteCode.create({
                data: {
                    code: testCode,
                    role: 'ARTIST',
                    creatorId: creator.id,
                    maxUses: 1
                }
            })
            console.log(`✅ Convite de Teste Criado: ${testCode}`)

            // Clean up
            await prisma.inviteCode.delete({ where: { code: testCode } })
            console.log(`✅ Convite de Teste Excluído (Limpeza)`)
        } else {
            console.log('⚠️ Pulei teste de convite (Nenhum usuário criador encontrado)')
        }

    } catch (e) {
        console.error('❌ Erro no sistema de convites:', e)
    }

    // 5. TESTE DE ANAMNESE (DB CHECK)
    try {
        console.log('\n[5/5] 📝 Checando Fichas de Anamnese...')
        const anamneses = await prisma.anamnesis.count()
        console.log(`✅ Fichas preenchidas no sistema: ${anamneses}`)
    } catch (e) {
        console.error('❌ Erro ao ler fichas:', e)
    }

    console.log('\n-------------------------------------------')
    console.log('🏁 DIAGNÓSTICO FINALIZADO')
    console.log('-------------------------------------------')
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
