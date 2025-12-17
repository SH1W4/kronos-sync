import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateCommission, calculateBookingSplit, applyCoupon, BUSINESS_RULES } from '@/lib/business-rules'
import { generateId } from '@/lib/utils'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { artistId, clientId, slotId, value, couponCode } = body

    // Validate minimum value
    if (value < BUSINESS_RULES.MINIMUM_BOOKING_VALUE) {
      return NextResponse.json(
        { error: `Valor mínimo é R$ ${BUSINESS_RULES.MINIMUM_BOOKING_VALUE}` },
        { status: 400 }
      )
    }

    // Get artist and slot info
    const [artist, slot] = await Promise.all([
      prisma.artist.findUnique({
        where: { id: artistId },
        include: { user: true }
      }),
      prisma.slot.findUnique({
        where: { id: slotId },
        include: { bookings: true }
      })
    ])

    if (!artist || !slot) {
      return NextResponse.json(
        { error: 'Artista ou slot não encontrado' },
        { status: 404 }
      )
    }

    // Check if slot is available
    const existingBooking = slot.bookings.find(b =>
      b.status === 'CONFIRMED'
    )

    if (existingBooking) {
      return NextResponse.json(
        { error: 'Slot não disponível' },
        { status: 409 }
      )
    }

    let discountValue = 0
    let couponId = null

    // Apply coupon if provided
    // Apply coupon if provided
    if (couponCode) {
      const coupon = await prisma.coupon.findFirst({
        where: {
          code: couponCode,
          status: 'ACTIVE',
          OR: [
            { artistId: artistId },
            { artistId: null }
          ]
        }
      })

      if (coupon && (!coupon.expiresAt || coupon.expiresAt > new Date())) {
        const discount = (value * (coupon.discountPercent / 100))
        discountValue = discount
        couponId = coupon.id
      }
    }

    // Calculate commission and split
    const commissionRate = calculateCommission(artist.plan, artist.monthlyEarnings)
    const { finalValue, artistShare, studioShare } = calculateBookingSplit(
      value,
      discountValue,
      commissionRate
    )

    // Create booking with transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create booking
      const newBooking = await tx.booking.create({
        data: {
          artistId,
          clientId,
          slotId,
          value,
          discountValue,
          finalValue,
          artistShare,
          studioShare,
          status: 'CONFIRMED',
          couponId,
          fichaUrl: null,
          fichaStatus: 'PENDING'
        }
      })

      // Update coupon usage if applied
      if (couponId) {
        await tx.coupon.update({
          where: { id: couponId },
          data: {
            status: 'USED',
            usedByUserId: clientId
          }
        })
      }

      // Update artist monthly earnings
      await tx.artist.update({
        where: { id: artistId },
        data: { monthlyEarnings: { increment: artistShare } }
      })

      return newBooking
    })

    // Generate ficha (stub)
    const fichaUrl = `${process.env.NEXTAUTH_URL}/fichas/${booking.id}/proxy`

    await prisma.booking.update({
      where: { id: booking.id },
      data: { fichaUrl }
    })

    // Send confirmations (stub)
    console.log(`Confirmação enviada para cliente e artista - Booking ${booking.id}`)

    await prisma.booking.update({
      where: { id: booking.id },
      data: { confirmationSent: true }
    })

    return NextResponse.json({
      success: true,
      booking: {
        ...booking,
        fichaUrl
      }
    })

  } catch (error) {
    console.error('Error creating booking:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const artistId = searchParams.get('artistId')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 20

    const where: any = {}
    if (artistId) where.artistId = artistId
    if (status) where.status = status

    const [bookings, total] = await Promise.all([
      prisma.booking.findMany({
        where,
        include: {
          artist: { include: { user: true } },
          client: true,
          slot: true,
          coupon: true
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.booking.count({ where })
    ])

    return NextResponse.json({
      bookings,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

