import dotenv from 'dotenv'
dotenv.config({ path: '.env.local', override: true })
dotenv.config()
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Protocol SUPREME SHOWCASE v2.1: Artistic Lifestyle & Economic Intelligence.
 * Seeds 6 strategic scenarios + Boutique Marketplace items.
 * Usage: npx tsx scripts/clean-slate.ts
 */
async function cleanSlate() {
    console.log('🧹 Iniciando Protocolo SUPREME SHOWCASE v2.1 (Lifestyle Edition)...')

    try {
        // 1. Purge all existing test data
        await prisma.anamnesis.deleteMany({})
        await prisma.agentLog.deleteMany({})
        await prisma.agentFeedback.deleteMany({})
        await prisma.settlement.deleteMany({})
        await prisma.booking.deleteMany({})
        await prisma.slot.deleteMany({})
        await prisma.inviteCode.deleteMany({})
        await prisma.qrScan.deleteMany({})
        await prisma.kioskEntry.deleteMany({})
        await prisma.orderItem.deleteMany({})
        await prisma.order.deleteMany({})
        await prisma.product.deleteMany({})
        await prisma.coupon.deleteMany({})
        await prisma.user.deleteMany({ where: { role: 'CLIENT' } })

        console.log('✅ Purga concluída. Semeando Ecossistema Artístico...')

        // 2. Setup environment
        const workspace = await prisma.workspace.findUnique({ where: { slug: 'demo-studio' } })
        if (!workspace) throw new Error('Workspace demo-studio não encontrado.')

        const artist = await prisma.artist.findFirst({ where: { workspaceId: workspace.id } })
        if (!artist) throw new Error('Nenhum artista encontrado no workspace.')

        // Reference Date: 1 week ago
        const baseDate = new Date()
        baseDate.setDate(baseDate.getDate() - 7)

        const createCase = async (name: string, email: string, val: number, status: any, ficha: any, healthAlert = false, medicalDetails = '', offsetHours = 0) => {
            const date = new Date(baseDate)
            date.setHours(10 + offsetHours, 0, 0, 0)

            const user = await prisma.user.create({
                data: { name, email, role: 'CLIENT', phone: `(11) 9${Math.floor(10000000 + Math.random() * 90000000)}` }
            })

            const slot = await prisma.slot.create({
                data: { workspaceId: workspace.id, macaId: (offsetHours % 3) + 1, startTime: date, endTime: new Date(date.getTime() + 180 * 60000) }
            })

            const booking = await prisma.booking.create({
                data: {
                    workspaceId: workspace.id, artistId: artist.id, clientId: user.id, slotId: slot.id,
                    status: status, value: val, finalValue: val,
                    studioShare: val * 0.3, artistShare: val * 0.7,
                    scheduledFor: date, duration: 180, fichaStatus: ficha
                }
            })

            await prisma.anamnesis.create({
                data: {
                    clientId: user.id, workspaceId: workspace.id, bookingId: booking.id, fullName: name, whatsapp: user.phone,
                    artDescription: `Projeto ${name}`,
                    medicalConditionsHealing: healthAlert ? 'SIM' : 'NÃO',
                    medicalConditionsHealingDetails: medicalDetails,
                    knownAllergies: healthAlert ? 'ALERGIA IDENTIFICADA' : 'NENHUMA',
                    understandPermanence: true, followInstructions: true, acceptedTerms: true, allowSharing: true
                }
            })
            return booking
        }

        // --- THE 6 SCENARIOS ---
        const b1 = await createCase('Mariana Silva', 'mariana@example.com', 800, 'COMPLETED', 'COMPLETED', false, '', 0)
        const b2 = await createCase('Bruno Rocha', 'bruno@example.com', 1500, 'COMPLETED', 'COMPLETED', true, 'Alergia a Pigmento Vermelho e Iodo.', 4)
        const b3 = await createCase('Ana Costa', 'ana@example.com', 3500, 'COMPLETED', 'COMPLETED', false, '', 8)
        const b4 = await createCase('Pedro Santos', 'pedro@example.com', 450, 'COMPLETED', 'COMPLETED', false, '', 24)
        const b5 = await createCase('Julia Lima', 'julia@example.com', 0, 'CANCELLED', 'PENDING', false, '', 28)
        const b6 = await createCase('Rafael Souza', 'rafael@example.com', 1200, 'COMPLETED', 'COMPLETED', false, '', 32)

        // --- SEED EXTRA DATA ---

        // Financial: Finalize Settlement for Mariana and Bruno
        await prisma.settlement.create({
            data: {
                artistId: artist.id, workspaceId: workspace.id, totalValue: 2300, status: 'APPROVED', isAudited: true,
                bookings: { connect: [{ id: b1.id }, { id: b2.id }] }
            }
        })

        // Products for Marketplace (Arte & Lifestyle)
        const p1 = await prisma.product.create({ data: { artistId: artist.id, workspaceId: workspace.id, title: 'Camisa Exclusiva KRONØS v1', basePrice: 60, finalPrice: 120, type: 'PHYSICAL', isActive: true, imageUrl: '/assets/showcase/shirt.png' } })
        const p2 = await prisma.product.create({ data: { artistId: artist.id, workspaceId: workspace.id, title: 'Print FineArt "Cyber-Soul" - Numerado', basePrice: 40, finalPrice: 85, type: 'PHYSICAL', isActive: true, imageUrl: '/assets/showcase/print.png' } })
        const p3 = await prisma.product.create({ data: { artistId: artist.id, workspaceId: workspace.id, title: 'Kit Aftercare Premium', basePrice: 20, finalPrice: 45, type: 'PHYSICAL', isActive: true, imageUrl: '/assets/showcase/kit.png' } })

        // Order for Rafael (Merchandise Upsell)
        await prisma.order.create({
            data: {
                clientId: b6.clientId, workspaceId: workspace.id, total: 120, finalTotal: 120, status: 'PAID',
                items: { create: [{ productId: p1.id, quantity: 1, price: 120 }] }
            }
        })

        // Coupons
        await prisma.coupon.create({
            data: { code: 'KRONOS-WELCOME', discountPercent: 15, workspaceId: workspace.id, artistId: artist.id, status: 'ACTIVE' }
        })

        // AI Kaizen Logs
        const adminUser = await prisma.user.findFirst({ where: { role: 'ADMIN' } })
        if (adminUser) {
            await prisma.agentFeedback.createMany({
                data: [
                    { userId: adminUser.id, workspaceId: workspace.id, type: 'SUGGESTION', message: 'Notificar automaticamente quando o estoque de Camisas chegar a 5 unidades.', status: 'PENDING' },
                    { userId: adminUser.id, workspaceId: workspace.id, type: 'BUG', message: 'Ajuste estético no widget de relatórios financeiros.', status: 'IMPLEMENTED' }
                ]
            })
        }

        console.log('\n✅ SUPREME SHOWCASE v2.1 CONCLUÍDO!')
        console.log('Ambiente configurado com Lifestyle Boutique (Prints/Camisas), Dossiês e IA.')

    } catch (error) {
        console.error('❌ Erro no supreme-showcase:', error)
    } finally {
        await prisma.$disconnect()
    }
}

cleanSlate()
