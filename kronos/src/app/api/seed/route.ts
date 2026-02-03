import { auth } from "@clerk/nextjs/server"
import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET() {
    const { userId: clerkUserId } = await auth()

    if (!clerkUserId) {
        return NextResponse.json({ error: "Faça login primeiro!" }, { status: 401 })
    }

    const currUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId }
    })

    if (!currUser) {
        return NextResponse.json({ error: "Usuário não encontrado" }, { status: 404 })
    }

    // 1. Promover Usuário Atual a Artista
    const artist = await prisma.artist.upsert({
        where: { userId: currUser.id },
        update: {},
        create: {
            userId: currUser.id,
            plan: "RESIDENT",
            commissionRate: 50, // 50%
            isActive: true
        }
    })

    // 2. Criar Cliente Fictício
    const dummyClient = await prisma.user.upsert({
        where: { email: "cliente@teste.com" },
        update: {},
        create: {
            name: "Alice Wonderland",
            email: "cliente@teste.com",
            role: "CLIENT",
            phone: "(11) 99999-8888"
        }
    })

    // 3. Criar Slot para Hoje 14:00 - 18:00
    const start = new Date()
    start.setHours(14, 0, 0, 0)

    const end = new Date()
    end.setHours(18, 0, 0, 0)

    const slot = await prisma.slot.create({
        data: {
            macaId: 1,
            startTime: start,
            endTime: end,
            isActive: true
        }
    })

    // 4. Criar Agendamento
    const booking = await prisma.booking.create({
        data: {
            artistId: artist.id,
            clientId: dummyClient.id,
            slotId: slot.id,
            value: 2000.00,
            finalValue: 2000.00,
            studioShare: 1000.00,
            artistShare: 1000.00,
            status: "CONFIRMED",
            fichaStatus: "PENDING",
            scheduledFor: start,
            duration: 240
        }
    })

    return NextResponse.json({
        success: true,
        message: "Ambiente de Teste Configurado!",
        data: {
            artist: artist.id,
            booking: booking.id,
            link_ficha: `/artist/anamnese/${booking.id}`
        }
    })
}
