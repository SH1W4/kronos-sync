import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Mail, Phone, Calendar, DollarSign, AlertTriangle, Activity, FileText } from 'lucide-react'
import Link from 'next/link'
import { GiftButton } from '@/components/clients/gift-button'

export const dynamic = 'force-dynamic'

export default async function ClientProfilePage({ params }: { params: Promise<{ id: string }> }) {
    const session = await getServerSession(authOptions)
    if (!session?.user) redirect('/auth/signin')

    // Unwrap params in Next.js 15
    const { id } = await params

    const client = await prisma.user.findUnique({
        where: { id },
        include: {
            bookings: {
                orderBy: { createdAt: 'desc' },
                include: {
                    anamnesis: true,
                    slot: true
                }
            },
            generatedCoupons: {
                where: { status: 'ACTIVE' },
                take: 1
            }
        }
    })

    if (!client) return <div>Cliente não encontrado</div>

    // Insights AI (Simulados por enquanto)
    const bookingsCount = client.bookings.length
    const totalSpent = client.bookings.reduce((acc, b) => acc + (b.value || 0), 0)
    const lastBooking = client.bookings[0]

    // Safety Alerts from Anamnesis
    const allAnamnesis = client.bookings.map(b => b.anamnesis).filter(Boolean)
    const hasConditions = allAnamnesis.some(a =>
        (a?.medicalConditionsTattoo && a.medicalConditionsTattoo !== 'NÃO') ||
        (a?.medicalConditionsHealing === 'SIM') ||
        (a?.knownAllergies && a.knownAllergies !== 'NÃO')
    )

    // Aggregated lists for display
    const conditionsList = Array.from(new Set(allAnamnesis.flatMap(a => {
        const list = []
        if (a?.medicalConditionsTattoo && a.medicalConditionsTattoo !== 'NÃO') list.push(a.medicalConditionsTattoo)
        if (a?.medicalConditionsHealingDetails) list.push(a.medicalConditionsHealingDetails)
        return list
    })))

    const allergiesList = Array.from(new Set(allAnamnesis.flatMap(a =>
        (a?.knownAllergies && a.knownAllergies !== 'NÃO') ? [a.knownAllergies] : []
    )))

    return (
        <div className="p-6 md:p-10 max-w-5xl mx-auto space-y-8 text-white">

            {/* Header / Profile Card */}
            <div className="flex flex-col md:flex-row gap-6 items-start">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-gray-700 to-black border-2 border-purple-500/30 flex items-center justify-center shadow-lg shadow-purple-900/20">
                    <span className="font-orbitron font-bold text-3xl">{client.name?.charAt(0)}</span>
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-orbitron font-bold mb-2">{client.name}</h1>
                    <div className="flex flex-wrap gap-4 text-sm text-gray-400">
                        <span className="flex items-center gap-2"><Mail size={14} /> {client.email}</span>
                        <span className="flex items-center gap-2"><Phone size={14} /> {client.phone || 'Sem telefone'}</span>
                        <span className="flex items-center gap-2"><Calendar size={14} /> Cliente desde {new Date(client.createdAt).getFullYear()}</span>
                    </div>
                </div>
                <div className="flex gap-2">
                    <GiftButton clientId={client.id} existingCode={client.generatedCoupons?.[0]?.code} />
                </div>
            </div>

            {/* AI Insights / Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Stats */}
                <div className="bg-gray-900/60 border border-white/5 p-6 rounded-xl space-y-4">
                    <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest">METRÍCAS</h3>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Total Investido</span>
                        <span className="font-orbitron font-bold text-green-400">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(totalSpent)}
                        </span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Sessões Realizadas</span>
                        <span className="font-orbitron font-bold text-white">{bookingsCount}</span>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-gray-400 text-sm">Ticket Médio</span>
                        <span className="font-orbitron font-bold text-purple-400">
                            {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(bookingsCount > 0 ? totalSpent / bookingsCount : 0)}
                        </span>
                    </div>
                </div>

                {/* Health & Safety (Anamnesis Summary) */}
                <div className={`col-span-1 md:col-span-2 border p-6 rounded-xl relative overflow-hidden ${hasConditions ? 'bg-red-900/10 border-red-500/30' : 'bg-gray-900/60 border-white/5'}`}>
                    <div className="absolute top-0 right-0 p-4 opacity-50">
                        {hasConditions ? <AlertTriangle className="text-red-500" size={40} /> : <Activity className="text-green-500" size={40} />}
                    </div>
                    <h3 className="font-mono text-xs text-gray-500 uppercase tracking-widest mb-4">RESUMO DE SAÚDE & SEGURANÇA</h3>

                    {hasConditions ? (
                        <div className="space-y-4">
                            {conditionsList.length > 0 && (
                                <div>
                                    <span className="text-xs text-red-400 font-bold uppercase block mb-1">Condições Médicas:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {conditionsList.map(c => (
                                            <span key={c} className="bg-red-500/20 text-red-300 text-xs px-2 py-1 rounded border border-red-500/20">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            {allergiesList.length > 0 && (
                                <div>
                                    <span className="text-xs text-orange-400 font-bold uppercase block mb-1">Alergias:</span>
                                    <div className="flex flex-wrap gap-2">
                                        {allergiesList.map(c => (
                                            <span key={c} className="bg-orange-500/20 text-orange-300 text-xs px-2 py-1 rounded border border-orange-500/20">{c}</span>
                                        ))}
                                    </div>
                                </div>
                            )}
                            <p className="text-xs text-gray-400 mt-4">*Baseado em {allAnamnesis.length} fichas preenchidas.</p>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4 h-full">
                            <p className="text-gray-400 text-sm">Nenhuma condição de risco ou alergia reportada nas fichas anteriores.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* History Timeline */}
            <div className="bg-gray-900/40 border border-white/5 rounded-xl overflow-hidden">
                <div className="p-6 border-b border-white/5">
                    <h3 className="font-orbitron font-bold text-lg">HISTÓRICO DE SESSÕES</h3>
                </div>
                <div className="divide-y divide-white/5">
                    {client.bookings.map((booking) => (
                        <div key={booking.id} className="p-6 hover:bg-white/5 transition-colors flex flex-col md:flex-row gap-4 justify-between items-center">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-black rounded flex items-center justify-center border border-white/10">
                                    <span className="font-mono text-xs text-gray-500 flex flex-col items-center">
                                        <span className="text-lg font-bold text-white">{new Date(booking.slot.startTime).getDate()}</span>
                                        <span>{new Date(booking.slot.startTime).toLocaleDateString('pt-BR', { month: 'short' }).toUpperCase()}</span>
                                    </span>
                                </div>
                                <div>
                                    <p className="font-bold text-white">Sessão de Tatuagem</p>
                                    <p className="text-xs text-gray-400">{booking.anamnesis?.projectDescription || 'Sem descrição'}</p>
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="text-right">
                                    <p className="text-xs text-gray-500 uppercase">Valor</p>
                                    <p className="font-mono text-green-400">{new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(booking.value)}</p>
                                </div>
                                {booking.anamnesis ? (
                                    <Link href={`/artist/anamnese/${booking.id}`}>
                                        <span className="px-3 py-1 bg-green-500/10 text-green-400 border border-green-500/20 rounded text-xs uppercase font-bold hover:bg-green-500/20 transition-colors">
                                            Ficha OK
                                        </span>
                                    </Link>
                                ) : (
                                    <span className="px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded text-xs uppercase font-bold">
                                        Pendente
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

        </div>
    )
}
