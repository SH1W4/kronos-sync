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
  await prisma.artist.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️ Dados existentes removidos')

  // Criar usuários (artistas)
  const artistUsers = await Promise.all([
    prisma.user.create({
      data: {
        name: 'Marcus Silva',
        email: 'marcus@kronosync.com',
        phone: '(11) 99999-1111',
        role: 'ARTIST'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Ana Costa',
        email: 'ana@kronosync.com',
        phone: '(11) 99999-2222',
        role: 'ARTIST'
      }
    }),
    prisma.user.create({
      data: {
        name: 'Carlos Mendes',
        email: 'carlos@kronosync.com',
        phone: '(11) 99999-3333',
        role: 'ARTIST'
      }
    })
  ])

  // Criar perfis de artistas
  const artists = await Promise.all([
    prisma.artist.create({
      data: {
        userId: artistUsers[0].id,
        plan: 'RESIDENT',
        commissionRate: 0.8,
        isActive: true
      }
    }),
    prisma.artist.create({
      data: {
        userId: artistUsers[1].id,
        plan: 'RESIDENT',
        commissionRate: 0.75,
        isActive: true
      }
    }),
    prisma.artist.create({
      data: {
        userId: artistUsers[2].id,
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

  // Criar cupons
  const coupons = await Promise.all([
    prisma.coupon.create({
      data: {
        code: 'DESCONTO10',
        type: 'PERCENTAGE',
        value: 10,
        isActive: true,
        expiresAt: new Date('2025-12-31'),
        artistId: artists[0].id
      }
    }),
    prisma.coupon.create({
      data: {
        code: 'PRIMEIRA50',
        type: 'FIXED',
        value: 50,
        isActive: true,
        expiresAt: new Date('2025-12-31'),
        artistId: artists[0].id
      }
    }),
    prisma.coupon.create({
      data: {
        code: 'FINELINE20',
        type: 'PERCENTAGE',
        value: 20,
        isActive: true,
        expiresAt: new Date('2025-12-31'),
        artistId: artists[1].id
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
        endsAt: new Date('2025-09-15')
      }
    }),
    prisma.offer.create({
      data: {
        title: 'Promoção Fine Line',
        description: 'Desconto especial em tatuagens fine line durante todo o mês',
        isActive: true,
        endsAt: new Date('2025-09-30')
      }
    }),
    prisma.offer.create({
      data: {
        title: 'Evento Tribal',
        description: 'Workshop de tatuagem tribal + desconto especial',
        isActive: true,
        endsAt: new Date('2025-10-15')
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
      const times = ['09:00', '14:00', '18:00']

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
            isActive: true
          }
        })
        slots.push(slot)
      }
    }
  }

  console.log('⏰ Slots criados:', slots.length)

  // Criar alguns agendamentos
  const bookings = await Promise.all([
    prisma.booking.create({
      data: {
        clientId: clients[0].id,
        artistId: artists[0].id,
        slotId: slots[0].id,
        value: 400,
        finalValue: 400,
        studioShare: 80,
        artistShare: 320,
        status: 'CONFIRMED'
      }
    }),
    prisma.booking.create({
      data: {
        clientId: clients[1].id,
        artistId: artists[1].id,
        slotId: slots[3].id,
        value: 300,
        finalValue: 300,
        studioShare: 75,
        artistShare: 225,
        status: 'OPEN'
      }
    })
  ])

  console.log('📅 Agendamentos criados:', bookings.length)

  // Criar assinantes
  const subscribers = await Promise.all([
    prisma.subscriber.create({
      data: {
        name: 'João Silva',
        email: 'joao@email.com',
        isActive: true
      }
    }),
    prisma.subscriber.create({
      data: {
        name: 'Maria Santos',
        email: 'maria@email.com',
        isActive: true
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
- ${bookings.length} agendamentos
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

