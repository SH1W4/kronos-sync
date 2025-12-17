import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Search, MapPin, Calendar, Mail, Phone } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function ClientsPage() {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
        redirect('/auth/signin')
    }

    const artist = await prisma.artist.findUnique({
        where: { userId: session.user.id }
    })

    if (!artist) return <div>Perfil não encontrado</div>

    // Buscar Clientes que já fizeram booking com este artista
    // Prisma: Find Users where bookings some artistId
    const clients = await prisma.user.findMany({
        where: {
            bookings: {
                some: {
                    artistId: artist.id
                }
            }
        },
        include: {
            bookings: {
                where: { artistId: artist.id },
                orderBy: { createdAt: 'desc' },
                include: {
                    anamnesis: true
                }
            }
        }
    })

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 text-white min-h-screen">

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-orbitron font-bold">CARTEIRA DE CLIENTES</h1>
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">{clients.length} Clientes Ativos</p>
                </div>

                <div className="relative w-full md:w-64">
                    <Search className="absolute left-3 top-3 text-gray-500" size={16} />
                    <input
                        type="text"
                        placeholder="Buscar por nome..."
                        className="w-full bg-black/50 border border-white/10 rounded-lg py-2 pl-10 text-sm focus:border-purple-500 outline-none"
                    />
                </div>
            </div>

            {/* Clients Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {clients.length === 0 ? (
                    <div className="col-span-full text-center py-20 text-gray-500">
                        Nenhum cliente encontrado. Os clientes aparecerão aqui após o primeiro agendamento.
                    </div>
                ) : (
                    clients.map((client) => {
                        const totalSpent = client.bookings.reduce((acc, b) => acc + b.value, 0)
                        const lastVisit = client.bookings[0]?.createdAt
                            ? new Date(client.bookings[0].createdAt).toLocaleDateString()
                            : 'N/A'
                        const projectCount = client.bookings.length

                        return (
                            <div key={client.id} className="bg-gray-900/40 border border-white/5 p-6 rounded-xl hover:bg-gray-900/60 transition-all group relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-20 h-20 bg-purple-500/10 blur-3xl -z-10 group-hover:bg-purple-500/20 transition-all"></div>

                                <div className="flex items-center gap-4 mb-6">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center border border-white/10">
                                        <span className="font-orbitron font-bold text-lg">{client.name?.charAt(0)}</span>
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg leading-tight">{client.name}</h3>
                                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                                            <Mail size={10} /> {client.email || 'Sem email'}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 border-t border-white/5 pt-4">
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Total Investido</p>
                                        <p className="text-sm font-bold text-green-400 font-orbitron">
                                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent)}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Última Visita</p>
                                        <p className="text-sm font-bold text-white font-orbitron">{lastVisit}</p>
                                    </div>
                                    <div>
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Sessões</p>
                                        <p className="text-sm font-bold text-purple-400 font-orbitron">{projectCount}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] text-gray-500 uppercase tracking-wider font-mono">Anamneses</p>
                                        <p className="text-sm font-bold text-white font-orbitron">
                                            {client.bookings.filter(b => b.anamnesis).length} Assinadas
                                        </p>
                                    </div>
                                </div>

                                <button className="w-full mt-6 py-2 bg-white/5 hover:bg-white/10 rounded text-xs uppercase font-bold tracking-widest text-gray-300 transition-colors">
                                    Ver Histórico Completo
                                </button>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}
