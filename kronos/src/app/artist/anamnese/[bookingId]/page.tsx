import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { AnamnesisForm } from "./form"

export default async function AnamnesisPage({ params }: { params: { bookingId: string } }) {
    const session = await getServerSession(authOptions)

    // Apenas artistas/admins podem abrir o modo Kiosk inicialmente
    if (!session?.user) {
        redirect('/auth/signin')
    }

    const booking = await prisma.booking.findUnique({
        where: { id: params.bookingId },
        include: {
            client: true,
            artist: true,
            slot: true
        }
    })

    if (!booking) {
        return <div className="p-10 text-white">Agendamento não encontrado.</div>
    }

    return (
        <div className="min-h-screen bg-black text-white selection:bg-purple-500/30">
            {/* Kiosk Header - Minimalist */}
            <header className="p-6 border-b border-white/10 flex justify-between items-center bg-zinc-950">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center font-bold font-orbitron">K</div>
                    <span className="font-mono text-sm tracking-widest text-gray-400">FICHA DIGITAL</span>
                </div>
                <div className="text-right">
                    <p className="font-bold text-sm">{booking.client.name}</p>
                    <p className="text-xs text-gray-500 font-mono">ID: {booking.id.slice(-6).toUpperCase()}</p>
                </div>
            </header>

            <main className="max-w-2xl mx-auto p-6 md:p-12">
                <AnamnesisForm
                    bookingId={booking.id}
                    clientId={booking.clientId}
                    initialData={{
                        name: booking.client.name,
                        phone: booking.client.phone,
                        email: booking.client.email
                    }}
                />
            </main>
        </div>
    )
}
