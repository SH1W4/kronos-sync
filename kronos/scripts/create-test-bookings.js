const { PrismaClient } = require('@prisma/client')
const path = require('path')
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') })
require('dotenv').config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function createTestBookings() {
    console.log('🎨 Preparando ambiente e criando agendamentos de teste...\n')

    try {
        // 1. Garantir que o Workspace existe
        let workspace = await prisma.workspace.findUnique({
            where: { slug: 'kronos-studio' }
        })

        if (!workspace) {
            console.log('🏛️ Criando Workspace Kronos Studio...')
            // Precisamos de um dono para o workspace
            let owner = await prisma.user.upsert({
                where: { email: 'joao@kronosync.com' },
                create: {
                    name: 'João Founder',
                    email: 'joao@kronosync.com',
                    role: 'ADMIN'
                },
                update: { role: 'ADMIN' }
            })

            workspace = await prisma.workspace.create({
                data: {
                    name: 'Kronos Studio',
                    slug: 'kronos-studio',
                    primaryColor: '#8B5CF6',
                    capacity: 5,
                    ownerId: owner.id
                }
            })
        }
        console.log(`✅ Workspace pronto: ${workspace.name} (ID: ${workspace.id})`)

        // 2. Garantir que o usuário Dev existe e é um artista
        let devUser = await prisma.user.findUnique({
            where: { email: 'dev@kronos.com' },
            include: { artist: true }
        })

        if (!devUser) {
            console.log('👤 Criando usuário Dev...')
            devUser = await prisma.user.create({
                data: {
                    name: 'Dev Artist',
                    email: 'dev@kronos.com',
                    role: 'ARTIST'
                },
                include: { artist: true }
            })
        }

        let artist = devUser.artist
        if (!artist) {
            console.log('🎨 Criando perfil de Artista para Dev...')
            artist = await prisma.artist.create({
                data: {
                    userId: devUser.id,
                    workspaceId: workspace.id,
                    plan: 'RESIDENT',
                    commissionRate: 0.30,
                    isActive: true
                }
            })
        }

        // Garantir membership
        await prisma.workspaceMember.upsert({
            where: { workspaceId_userId: { workspaceId: workspace.id, userId: devUser.id } },
            create: {
                workspaceId: workspace.id,
                userId: devUser.id,
                role: 'ADMIN'
            },
            update: {}
        })

        console.log(`✅ Artista pronto: ${devUser.name}`)

        // 3. Criar 5 clientes diferentes
        const clientsData = [
            { name: 'Ana Silva', email: 'ana.silva@email.com', phone: '(11) 98765-4321' },
            { name: 'Bruno Costa', email: 'bruno.costa@email.com', phone: '(11) 97654-3210' },
            { name: 'Carla Santos', email: 'carla.santos@email.com', phone: '(11) 96543-2109' },
            { name: 'Diego Oliveira', email: 'diego.oliveira@email.com', phone: '(11) 95432-1098' },
            { name: 'Elena Rodrigues', email: 'elena.rodrigues@email.com', phone: '(11) 94321-0987' }
        ]

        const createdClients = []
        for (const clientData of clientsData) {
            const client = await prisma.user.upsert({
                where: { email: clientData.email },
                create: {
                    email: clientData.email,
                    name: clientData.name,
                    role: 'CLIENT',
                    phone: clientData.phone
                },
                update: {}
            })
            createdClients.push(client)
            console.log(`👤 Cliente: ${client.name}`)
        }

        console.log('\n📅 Criando agendamentos...')

        // 4. Limpar agendamentos anteriores do dev para evitar confusão
        await prisma.booking.deleteMany({ where: { artistId: artist.id } })

        const bookingsData = [
            {
                clientIndex: 0,
                date: new Date('2025-12-28T14:00:00'),
                duration: 120,
                price: 400.00,
                description: 'Tatuagem Geovanna (Test)',
                status: 'CONFIRMED'
            },
            {
                clientIndex: 1,
                date: new Date('2025-12-28T17:00:00'),
                duration: 180,
                price: 750.00,
                description: 'Fechamento de braço - Sessão 1',
                status: 'CONFIRMED'
            },
            {
                clientIndex: 2,
                date: new Date('2025-12-29T10:00:00'),
                duration: 60,
                price: 250.00,
                description: 'Fine line minimalista',
                status: 'OPEN'
            },
            {
                clientIndex: 3,
                date: new Date('2025-12-29T13:00:00'),
                duration: 240,
                price: 1200.00,
                description: 'Realismo sombra',
                status: 'CONFIRMED'
            },
            {
                clientIndex: 4,
                date: new Date('2025-12-30T15:00:00'),
                duration: 120,
                price: 450.00,
                description: 'Old school tradicional',
                status: 'OPEN'
            }
        ]

        for (let i = 0; i < bookingsData.length; i++) {
            const b = bookingsData[i]
            const client = createdClients[b.clientIndex]

            const slot = await prisma.slot.create({
                data: {
                    workspaceId: workspace.id,
                    macaId: (i % 5) + 1,
                    startTime: b.date,
                    endTime: new Date(b.date.getTime() + b.duration * 60000),
                    isActive: true
                }
            })

            const artistShare = b.price * (1 - artist.commissionRate)
            const studioShare = b.price * artist.commissionRate

            await prisma.booking.create({
                data: {
                    artistId: artist.id,
                    clientId: client.id,
                    workspaceId: workspace.id,
                    slotId: slot.id,
                    value: b.price,
                    finalValue: b.price,
                    artistShare: artistShare,
                    studioShare: studioShare,
                    status: b.status,
                    scheduledFor: b.date,
                    duration: b.duration,
                    notes: b.description
                }
            })
            console.log(`✅ Agendamento ${i + 1} criado: R$ ${b.price}`)
        }

        console.log('\n🚀 TUDO PRONTO! O sistema financeiro agora tem dados reais para avaliação.')

    } catch (error) {
        console.error('❌ Erro:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createTestBookings()
