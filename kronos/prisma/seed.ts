import * as dotenv from 'dotenv'
import * as path from 'path'
import { PrismaClient, UserRole, ArtistPlan, BookingStatus, SettlementStatus } from '@prisma/client'

// Load .env.local first (Vercel convention), then .env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed PROFISSIONAL (Final) do KRONOS SYNC...')

  // 1. Limpeza Profunda (Ordem correta de dependências)
  await prisma.qrScan.deleteMany()
  await prisma.anamnesis.deleteMany()
  await prisma.booking.deleteMany()
  await prisma.slot.deleteMany()
  await prisma.coupon.deleteMany()
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.settlement.deleteMany()
  await prisma.product.deleteMany()
  await prisma.offer.deleteMany()
  await prisma.subscriber.deleteMany()
  await prisma.kioskEntry.deleteMany()
  await prisma.inviteCode.deleteMany()
  await prisma.workspaceMember.deleteMany()
  await prisma.artist.deleteMany()
  await prisma.workspace.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️ Banco limpo')

  // 2. Workspace & Master Owner (galeria.kronos@gmail.com)
  const masterOwner = await prisma.user.create({
    data: {
      name: 'João Galeria',
      email: 'galeria.kronos@gmail.com',
      role: 'ADMIN',
      phone: '(11) 98888-0000'
    }
  })

  const workspace = await prisma.workspace.create({
    data: {
      name: 'KRONOS HQ',
      slug: 'kronos-hq',
      primaryColor: '#8B5CF6',
      ownerId: masterOwner.id,
      pixKey: 'pix@kronosync.com',
      pixRecipient: 'KRONOS SYNC LTD',
      capacity: 5
    }
  })

  await prisma.workspaceMember.create({
    data: { workspaceId: workspace.id, userId: masterOwner.id, role: 'ADMIN' }
  })

  // 3. Artistas (Incluindo neo.sh1w4@gmail.com como DEV ARTIST)
  const artistUsers = await Promise.all([
    prisma.user.create({ data: { name: 'Neo Developer', email: 'neo.sh1w4@gmail.com', phone: '(11) 99999-1111', role: 'ARTIST' } }),
    prisma.user.create({ data: { name: 'Marcus Silva', email: 'marcus@kronosync.com', phone: '(11) 99999-2222', role: 'ARTIST' } }),
    prisma.user.create({ data: { name: 'Ana Costa', email: 'ana@kronosync.com', phone: '(11) 99999-3333', role: 'ARTIST' } })
  ])

  const artists: any[] = await Promise.all([
    prisma.artist.create({
      data: {
        userId: artistUsers[0].id,
        workspaceId: workspace.id,
        plan: 'RESIDENT',
        commissionRate: 0.8,
        instagram: '@neo.sh1w4'
      }
    }),
    prisma.artist.create({
      data: {
        userId: artistUsers[1].id,
        workspaceId: workspace.id,
        plan: 'RESIDENT',
        commissionRate: 0.75,
        instagram: '@marcus.tattoos'
      }
    }),
    prisma.artist.create({
      data: {
        userId: artistUsers[2].id,
        workspaceId: workspace.id,
        plan: 'GUEST',
        commissionRate: 0.7,
        instagram: '@ana.fine.art'
      }
    })
  ])

  await Promise.all(artistUsers.map(u =>
    prisma.workspaceMember.create({ data: { workspaceId: workspace.id, userId: u.id, role: 'ARTIST' } })
  ))

  // 4. Clientes VIP
  const clients: any[] = await Promise.all([
    prisma.user.create({ data: { name: 'Roberto Carlos', email: 'roberto@email.com', phone: '(11) 91111-0000', role: 'CLIENT' } }),
    prisma.user.create({ data: { name: 'Julia Roberts', email: 'julia@email.com', phone: '(11) 92222-0000', role: 'CLIENT' } }),
    prisma.user.create({ data: { name: 'Stan Lee', email: 'stan@email.com', phone: '(11) 93333-0000', role: 'CLIENT' } }),
    prisma.user.create({ data: { name: 'Ana Rodrigues', email: 'ana.r@email.com', phone: '(11) 94444-0000', role: 'CLIENT' } }),
    prisma.user.create({ data: { name: 'Pedro Olive', email: 'pedro@email.com', phone: '(11) 95555-0000', role: 'CLIENT' } }),
    prisma.user.create({ data: { name: 'Maria Santos', email: 'maria@email.com', phone: '(11) 96666-0000', role: 'CLIENT' } })
  ])

  // 5. Segurança & Marketing
  const invite = await prisma.inviteCode.create({
    data: {
      code: 'JOIN-KRONOS',
      role: 'ARTIST',
      targetPlan: 'GUEST',
      maxUses: 1,
      currentUses: 0,
      creatorId: masterOwner.id,
      workspaceId: workspace.id,
      expiresAt: new Date('2026-12-31')
    }
  })

  // 6. Marketplace
  const product = await prisma.product.create({
    data: {
      title: 'Kit Cuidados Pós-Tattoo',
      description: 'Pomada + Sabonete Neutro',
      basePrice: 50,
      finalPrice: 65,
      type: 'PHYSICAL',
      artistId: artists[0].id,
      workspaceId: workspace.id,
      isSold: false
    }
  })

  // 7. HISTÓRICO RICO (6 MESES DE DADOS)
  console.log('📅 Gerando 6 meses de histórico financeiro...')
  const now = new Date()
  // Ajuste para garantir que "hoje" seja Jan 1 no fuso local do seed
  const today = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }))
  today.setHours(12, 0, 0, 0)

  let totalHistorical = 0

  for (let monthsAgo = 5; monthsAgo >= 0; monthsAgo--) {
    const monthDate = new Date(today)
    monthDate.setMonth(today.getMonth() - monthsAgo)

    for (let artistIdx = 0; artistIdx < artists.length; artistIdx++) {
      const currentArtist = artists[artistIdx]

      for (let i = 0; i < 5; i++) {
        const bookingDay = new Date(monthDate)
        bookingDay.setDate(2 + i * 5)

        const value = 400 + (Math.random() * 600)
        const commission = currentArtist.commissionRate
        const artistShare = value * commission
        const studioShare = value - artistShare

        const slot = await prisma.slot.create({
          data: {
            workspaceId: workspace.id,
            macaId: (i % 3) + 1,
            startTime: bookingDay,
            endTime: new Date(bookingDay.getTime() + 3 * 60 * 60 * 1000)
          }
        })

        await prisma.booking.create({
          data: {
            artistId: currentArtist.id,
            clientId: clients[i % clients.length].id,
            workspaceId: workspace.id,
            slotId: slot.id,
            value: value,
            finalValue: value,
            studioShare,
            artistShare,
            status: monthsAgo > 0 ? 'COMPLETED' : 'CONFIRMED',
            scheduledFor: bookingDay
          }
        })
        totalHistorical++
      }

      if (monthsAgo > 0) {
        await prisma.settlement.create({
          data: {
            artistId: currentArtist.id,
            workspaceId: workspace.id,
            totalValue: 1200 + (Math.random() * 500),
            status: 'APPROVED',
            aiFeedback: 'Acerto mensal automático via Seed.',
            proofUrl: 'https://placehold.co/400x600?text=SEED_PROOF',
            createdAt: monthDate
          }
        })
      }
    }
  }

  // 8. AGENDA DE HOJE (Garantindo dados para neo.sh1w4@gmail.com)
  const todayBookingDate = new Date(today)
  todayBookingDate.setHours(10, 0, 0, 0)

  const todaySlot = await prisma.slot.create({
    data: { workspaceId: workspace.id, macaId: 1, startTime: todayBookingDate, endTime: new Date(todayBookingDate.getTime() + 4 * 60 * 60 * 1000) }
  })

  const todayBooking = await prisma.booking.create({
    data: {
      artistId: artists[0].id, // Neo
      clientId: clients[1].id,
      workspaceId: workspace.id,
      slotId: todaySlot.id,
      value: 1200,
      finalValue: 1200,
      studioShare: 240,
      artistShare: 960,
      status: 'CONFIRMED',
      scheduledFor: todayBookingDate
    }
  })

  // 9. ANAMNESE REALISTA
  await prisma.anamnesis.create({
    data: {
      bookingId: todayBooking.id,
      clientId: clients[1].id,
      workspaceId: workspace.id,
      fullName: clients[1].name,
      whatsapp: clients[1].phone,
      knownAllergies: "Nenhuma",
      medicalConditionsTattoo: "Nenhum",
      artDescription: "Fechamento de braço (Sessão 1)",
      acceptedTerms: true,
      understandPermanence: true,
      followInstructions: true,
      signatureData: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PHBhdGggZD0iTTEwIDIwIEwyMCAzMCBMNDAgMTAiIHN0cm9rZT0iYmxhY2siIGZpbGw9Im5vbmUiLz48L3N2Zz4="
    }
  })

  console.log('✅ SEED COMPLETO COM SUCESSO!')
  console.log(`- Workspace: ${workspace.name}`)
  console.log(`- Master: galeria.kronos@gmail.com`)
  console.log(`- Dev: neo.sh1w4@gmail.com`)
  console.log(`- Histórico: ${totalHistorical} agendamentos nos últimos 6 meses`)
}

main()
  .catch((e) => {
    console.error('❌ Erro no seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
