import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import CalendarView from "@/components/agenda/CalendarView"

export const dynamic = 'force-dynamic'

export default async function ArtistCalendarPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/auth/signin')
    }

    // Buscar Artista
    const artist = await prisma.artist.findUnique({
        where: { userId: session.user.id }
    })

    if (!artist) {
        return <div className="p-10 text-red-500">Erro: Perfil de artista não encontrado.</div>
    }

    // Buscar Bookings Futuros
    const bookings = await prisma.booking.findMany({
        where: {
            artistId: artist.id,
            status: { not: 'CANCELLED' }
        },
        include: {
            client: true,
            slot: true
        },
        orderBy: {
            slot: { startTime: 'asc' }
        }
    })

    return <CalendarView bookings={bookings} />
}
