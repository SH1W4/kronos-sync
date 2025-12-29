// Script para criar agendamentos de teste
// Execute: npx ts-node scripts/create-test-bookings.ts

import { PrismaClient, BookingStatus } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestBookings() {
    console.log('🎨 Criando agendamentos de teste...\n')

    try {
        // 1. Buscar ou criar o artista Dev
        let artist = await prisma.artist.findFirst({
            where: { user: { email: 'dev@kronos.com' } },
            include: { user: true, workspace: true }
        })

        if (!artist) {
            console.error('❌ Artista Dev não encontrado. Execute o Dev Mode primeiro.')
            process.exit(1)
        }

        console.log(`✅ Artista encontrado: ${artist.user.name}`)
        console.log(`🏢 Workspace: ${artist.workspace?.name}\n`)

        // 2. Criar 5 clientes diferentes
        const clients = [
            { name: 'Ana Silva', email: 'ana.silva@email.com', phone: '(11) 98765-4321' },
            { name: 'Bruno Costa', email: 'bruno.costa@email.com', phone: '(11) 97654-3210' },
            { name: 'Carla Santos', email: 'carla.santos@email.com', phone: '(11) 96543-2109' },
            { name: 'Diego Oliveira', email: 'diego.oliveira@email.com', phone: '(11) 95432-1098' },
            { name: 'Elena Rodrigues', email: 'elena.rodrigues@email.com', phone: '(11) 94321-0987' }
        ]

        const createdClients = []
        for (const clientData of clients) {
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
            console.log(`👤 Cliente criado: ${client.name}`)
        }

        console.log('\n📅 Criando agendamentos...\n')

        // 3. Criar agendamentos com valores e datas diferentes
        const bookings = [
            {
                client: createdClients[0],
                date: new Date('2025-01-15T14:00:00'),
                duration: 2,
                price: 350.00,
                description: 'Tatuagem floral no braço',
                status: 'CONFIRMED'
            },
            {
                client: createdClients[1],
                date: new Date('2025-01-16T10:00:00'),
                duration: 3,
                price: 550.00,
                description: 'Tatuagem geométrica nas costas',
                status: 'CONFIRMED'
            },
            {
                client: createdClients[2],
                date: new Date('2025-01-17T15:00:00'),
                duration: 1.5,
                price: 250.00,
                description: 'Tatuagem minimalista no pulso',
                status: 'OPEN'
            },
            {
                client: createdClients[3],
                date: new Date('2025-01-18T11:00:00'),
                duration: 4,
                price: 800.00,
                description: 'Tatuagem realista de retrato',
                status: 'CONFIRMED'
            },
            {
                client: createdClients[4],
                date: new Date('2025-01-19T16:00:00'),
                duration: 2.5,
                price: 450.00,
                description: 'Tatuagem oriental no antebraço',
                status: 'OPEN'
            }
        ]

        for (let i = 0; i < bookings.length; i++) {
            const bookingData = bookings[i]
            const endDate = new Date(bookingData.date)
            endDate.setHours(endDate.getHours() + bookingData.duration)

            // Criar slot
            const slot = await prisma.slot.create({
                data: {
                    startTime: bookingData.date,
                    endTime: endDate,
                    workspaceId: artist.workspaceId,
                    macaId: 1
                }
            })

            // Calcular comissão do artista (30%)
            const artistShare = bookingData.price * artist.commissionRate

            // Criar booking
            const booking = await prisma.booking.create({
                data: {
                    slotId: slot.id,
                    clientId: bookingData.client.id,
                    artistId: artist.id,
                    workspaceId: artist.workspaceId,
                    status: bookingData.status as BookingStatus,
                    value: bookingData.price,
                    finalValue: bookingData.price,
                    artistShare: artistShare,
                    studioShare: bookingData.price - artistShare,
                    scheduledFor: bookingData.date,
                    duration: bookingData.duration * 60, // Convierte horas a minutos
                    notes: bookingData.description
                }
            })

            console.log(`✅ Agendamento ${i + 1}:`)
            console.log(`   Cliente: ${bookingData.client.name}`)
            console.log(`   Data: ${bookingData.date.toLocaleDateString('pt-BR')} às ${bookingData.date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`)
            console.log(`   Duração: ${bookingData.duration}h`)
            console.log(`   Valor: R$ ${bookingData.price.toFixed(2)}`)
            console.log(`   Comissão Artista: R$ ${artistShare.toFixed(2)}`)
            console.log(`   Status: ${bookingData.status}`)
            console.log(`   Descrição: ${bookingData.description}\n`)
        }

        // 4. Criar alguns cupons de teste
        console.log('🎟️  Criando cupons de desconto...\n')

        const coupons = [
            {
                code: 'PRIMEIRATAT',
                discount: 50,
                description: 'Desconto de R$ 50 para primeira tatuagem'
            },
            {
                code: 'VERÃO2025',
                discount: 15,
                description: 'Desconto de 15% para sessões no verão'
            },
            {
                code: 'CLIENTE-VIP',
                discount: 10,
                description: 'Desconto especial para clientes VIP'
            }
        ]

        for (const couponData of coupons) {
            const coupon = await prisma.coupon.create({
                data: {
                    code: couponData.code,
                    discountPercent: couponData.discount,
                    workspaceId: artist.workspaceId,
                    expiresAt: new Date('2025-12-31')
                }
            })

            console.log(`✅ Cupom criado: ${coupon.code}`)
            console.log(`   Tipo: ${coupon.type}`)
            console.log(`   Desconto: ${coupon.type === 'PERCENTAGE' ? coupon.discount + '%' : 'R$ ' + coupon.discount.toFixed(2)}`)
            console.log(`   Descrição: ${couponData.description}\n`)
        }

        // 5. Resumo financeiro
        console.log('━'.repeat(60))
        console.log('📊 RESUMO FINANCEIRO\n')

        const totalBookings = bookings.length
        const totalRevenue = bookings.reduce((sum, b) => sum + b.price, 0)
        const totalArtistShare = bookings.reduce((sum, b) => sum + (b.price * artist.commissionRate), 0)
        const totalStudioShare = totalRevenue - totalArtistShare

        console.log(`Total de Agendamentos: ${totalBookings}`)
        console.log(`Faturamento Total: R$ ${totalRevenue.toFixed(2)}`)
        console.log(`Comissão do Artista (30%): R$ ${totalArtistShare.toFixed(2)}`)
        console.log(`Comissão do Estúdio (70%): R$ ${totalStudioShare.toFixed(2)}`)
        console.log('━'.repeat(60))

        console.log('\n✅ Dados de teste criados com sucesso!')
        console.log('\n💡 Próximos passos:')
        console.log('1. Acesse /artist/dashboard para ver os agendamentos')
        console.log('2. Acesse /artist/finance para ver o financeiro')
        console.log('3. Teste os cupons no processo de agendamento')

    } catch (error) {
        console.error('❌ Erro ao criar dados de teste:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createTestBookings()
