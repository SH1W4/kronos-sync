import * as dotenv from 'dotenv'
import * as path from 'path'

// Load .env.local first (Vercel convention), then .env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
dotenv.config({ path: path.resolve(__dirname, '../.env') })

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...')

  // Limpar dados existentes
  await prisma.booking.deleteMany()
  await prisma.slot.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.product.deleteMany()
  await prisma.offer.deleteMany()
  await prisma.subscriber.deleteMany()
  await prisma.kioskEntry.deleteMany()
  await prisma.workspace.deleteMany()
  await prisma.artist.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️ Dados existentes removidos')

  // 1. Criar o Workspace Principal
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Kronos Studio',
      slug: 'kronos-studio',
      primaryColor: '#8B5CF6',
      owner: {
        create: {
          name: 'João Founder',
          email: 'joao@kronosync.com',
          role: 'ADMIN'
        }
      }
    }
  })

  console.log('🏛️ Workspace criado:', workspace.name)

  // Criar usuários (artistas)
  const artistUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Marcus Silva',
        email: 'marcus@kronosync.com',
        phone: '(11) 99999-1111',
        role: 'ARTIST',
        memberships: {
          create: {
            workspaceId: workspace.id,
            role: 'ARTIST'
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        name: 'Ana Costa',
        email: 'ana@kronosync.com',
        phone: '(11) 99999-2222',
        role: 'ARTIST',
        memberships: {
          create: {
            workspaceId: workspace.id,
            role: 'ARTIST'
          }
        }
      }
    }),
    prisma.user.create({
      data: {
        name: 'Carlos Mendes',
        email: 'carlos@kronosync.com',
        phone: '(11) 99999-3333',
        role: 'ARTIST',
        memberships: {
          create: {
            workspaceId: workspace.id,
            role: 'ARTIST'
          }
        }
      }
    })
  ])

  // Criar perfis de artistas
  const artists = await Promise.all([
    prisma.artist.create({
      data: {
        userId: artistUsers[0].id,
        workspaceId: workspace.id,
        plan: 'RESIDENT',
        commissionRate: 0.8,
        isActive: true
      }
    }),
    prisma.artist.create({
      data: {
        userId: artistUsers[1].id,
        workspaceId: workspace.id,
        plan: 'RESIDENT',
        commissionRate: 0.75,
        isActive: true
      }
    }),
    prisma.artist.create({
      data: {
        userId: artistUsers[2].id,
        workspaceId: workspace.id,
        plan: 'GUEST',
        commissionRate: 0.7,
        isActive: true
      }
    })
  ])

  console.log('👨‍🎨 Artistas criados:', artists.length)

  // Criar usuários clientes
  const clients = await Promise.all([
    prisma.user.create({
      data: {
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '(11) 98888-1111',
        role: 'CLIENT'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Maria Santos',
        email: 'maria@email.com',
        phone: '(11) 98888-2222',
        role: 'CLIENT'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Pedro Oliveira',
        email: 'pedro@email.com',
        phone: '(11) 98888-3333',
        role: 'CLIENT'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Ana Rodrigues',
        email: 'ana.rodrigues@email.com',
        phone: '(11) 98888-4444',
        role: 'CLIENT'
      }
    })
  ])

  console.log('👥 Clientes criados:', clients.length)

  // Criar entradas do kiosk
  const kioskEntries = await Promise.all([
    prisma.kioskEntry.create({
      data: {
        name: 'João Silva',
        email: 'joao@email.com',
        phone: '(11) 98888-1111',
        type: 'CLIENT',
        marketingOptIn: true
      }
    }),
    prisma.kioskEntry.create({
      data: {
        name: 'Carla Acompanhante',
        email: 'carla@email.com',
        phone: '(11) 98888-5555',
        type: 'COMPANION',
        marketingOptIn: false
      }
    })
  ])

  console.log('🏪 Entradas do kiosk criadas:', kioskEntries.length)

  // Criar cupons (Atualizado para Schema Novo)
  const coupons = await Promise.all([
    prisma.coupon.create({
      data: {
        code: 'DESCONTO10',
        discountPercent: 10,
        status: 'ACTIVE',
        expiresAt: new Date('2025-12-31'),
        artistId: artists[0].id,
        workspaceId: workspace.id
      }
    }),
    prisma.coupon.create({
      data: {
        code: 'VIP20',
        discountPercent: 20,
        status: 'ACTIVE',
        expiresAt: new Date('2025-12-31'),
        artistId: artists[0].id,
        workspaceId: workspace.id
      }
    }),
    prisma.coupon.create({
      data: {
        code: 'FINELINE20',
        discountPercent: 20,
        status: 'ACTIVE',
        expiresAt: new Date('2025-12-31'),
        artistId: artists[1].id,
        workspaceId: workspace.id
      }
    })
  ])

  console.log('🎫 Cupons criados:', coupons.length)

  // Criar produtos do marketplace
  const products = await Promise.all([
    prisma.product.create({
      data: {
        title: 'Flash Tattoo - Caveira',
        description: 'Design exclusivo de caveira em estilo tradicional',
        basePrice: 150,
        finalPrice: 180,
        type: 'PHYSICAL',
        artistId: artists[0].id,
        workspaceId: workspace.id,
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        title: 'Arte Digital - Rosa Minimalista',
        description: 'Design digital de rosa em traços finos',
        basePrice: 100,
        finalPrice: 120,
        type: 'DIGITAL',
        artistId: artists[1].id,
        workspaceId: workspace.id,
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        title: 'Flash Tattoo - Mandala',
        description: 'Mandala geométrica detalhada',
        basePrice: 200,
        finalPrice: 240,
        type: 'PHYSICAL',
        artistId: artists[2].id,
        workspaceId: workspace.id,
        isActive: true
      }
    }),
    prisma.product.create({
      data: {
        title: 'Pack Digital - Animais',
        description: 'Coleção de 5 designs de animais',
        basePrice: 250,
        finalPrice: 300,
        type: 'DIGITAL',
        artistId: artists[0].id,
        workspaceId: workspace.id,
        isActive: true
      }
    })
  ])

  console.log('🛍️ Produtos criados:', products.length)

  // Criar ofertas
  const offers = await Promise.all([
    prisma.offer.create({
      data: {
        title: 'Flash Day - Tatuagens Pequenas',
        description: 'Tatuagens pequenas por apenas R$ 200! Válido apenas hoje.',
        isActive: true,
        endsAt: new Date('2025-09-15'),
        workspaceId: workspace.id
      }
    }),
    prisma.offer.create({
      data: {
        title: 'Promoção Fine Line',
        description: 'Desconto especial em tatuagens fine line durante todo o mês',
        isActive: true,
        endsAt: new Date('2025-09-30'),
        workspaceId: workspace.id
      }
    }),
    prisma.offer.create({
      data: {
        title: 'Evento Tribal',
        description: 'Workshop de tatuagem tribal + desconto especial',
        isActive: true,
        endsAt: new Date('2025-10-15'),
        workspaceId: workspace.id
      }
    })
  ])

  console.log('🎉 Ofertas criadas:', offers.length)

  // Criar slots de horários
  const slots = []
  const today = new Date()

  // Criar slots para os próximos 7 dias
  for (let day = 0; day < 7; day++) {
    const date = new Date(today)
    date.setDate(today.getDate() + day)

    // Para cada maca (1, 2, 3)
    for (let maca = 1; maca <= 3; maca++) {
      // Horários: 9h, 14h, 18h
      const times = ['09:00', '13:00', '16:30', '20:00']

      for (const time of times) {
        const [hours, minutes] = time.split(':')
        const startTime = new Date(date)
        startTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)

        const endTime = new Date(startTime)
        endTime.setHours(startTime.getHours() + 3) // 3 horas de duração

        const slot = await prisma.slot.create({
          data: {
            macaId: maca,
            startTime,
            endTime,
            isActive: true,
            workspaceId: workspace.id
          }
        })
        slots.push(slot)
      }
    }
  }

  console.log('⏰ Slots criados:', slots.length)

  // Criar alguns agendamentos históricos para validação financeira
  // Criando dados para os últimos 6 meses
  const historicalBookings = []
  const artistList = [artists[0], artists[1], artists[2]]
  const clientList = [clients[0], clients[1], clients[2], clients[3], clients[4]]

  // Generate bookings for the past 6 months
  for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
    const bookingDate = new Date()
    bookingDate.setMonth(bookingDate.getMonth() - monthsAgo)
    bookingDate.setDate(15) // Mid-month

    // Create 3-5 bookings per month per artist
    for (let artistIdx = 0; artistIdx < 3; artistIdx++) {
      const numBookings = 3 + Math.floor(Math.random() * 3) // 3-5 bookings

      for (let i = 0; i < numBookings; i++) {
        const bookingDay = new Date(bookingDate)
        bookingDay.setDate(5 + i * 5) // Days 5, 10, 15, 20, 25

        const value = 300 + Math.floor(Math.random() * 500) // R$ 300 - R$ 800
        const commissionRate = artistList[artistIdx].commissionRate || 0.75
        const artistShare = Math.round(value * commissionRate)
        const studioShare = value - artistShare

        // Create slot for historical booking
        const slotStart = new Date(bookingDay)
        slotStart.setHours(10 + i * 2, 0, 0, 0)
        const slotEnd = new Date(slotStart)
        slotEnd.setHours(slotStart.getHours() + 3)

        const historicalSlot = await prisma.slot.create({
          data: {
            macaId: (i % 3) + 1,
            startTime: slotStart,
            endTime: slotEnd,
            isActive: true,
            workspaceId: workspace.id
          }
        })

        const booking = await prisma.booking.create({
          data: {
            clientId: clientList[i % clientList.length].id,
            artistId: artistList[artistIdx].id,
            slotId: historicalSlot.id,
            workspaceId: workspace.id,
            value: value,
            finalValue: value,
            studioShare: studioShare,
            artistShare: artistShare,
            status: monthsAgo > 0 ? 'COMPLETED' : (i < 2 ? 'COMPLETED' : 'CONFIRMED'),
            settlementId: null, // All unsettled for testing
            scheduledFor: bookingDay,
            duration: 180
          }
        })
        historicalBookings.push(booking)
      }
    }
  }

  console.log('📅 Agendamentos históricos criados:', historicalBookings.length)

  // Criar assinantes
  const subscribers = await Promise.all([
    prisma.subscriber.create({
      data: {
        name: 'João Silva',
        email: 'joao@email.com',
        isActive: true,
        workspaceId: workspace.id
      }
    }),
    prisma.subscriber.create({
      data: {
        name: 'Maria Santos',
        email: 'maria@email.com',
        isActive: true,
        workspaceId: workspace.id
      }
    })
  ])

  console.log('📧 Assinantes criados:', subscribers.length)

  console.log('✅ Seed concluído com sucesso!')
  console.log(`
📊 Resumo dos dados criados:
- ${artists.length} artistas
- ${clients.length} clientes
- ${kioskEntries.length} entradas do kiosk
- ${coupons.length} cupons
- ${products.length} produtos
- ${offers.length} ofertas
- ${slots.length} slots de horários
- ${historicalBookings.length} agendamentos
- ${subscribers.length} assinantes
  `)
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

