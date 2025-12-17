'use client'

import { useState } from 'react'
import { Plus, Calendar as CalendarIcon, Clock, User, DollarSign, Share2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { createBooking } from '@/app/actions/booking'

export default function CalendarView({ bookings }: { bookings: any[] }) {
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        date: new Date().toISOString().split('T')[0],
        startTime: '14:00',
        endTime: '18:00',
        clientName: '',
        serviceType: 'Tatuagem',
        value: 500
    })

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        try {
            await createBooking({
                date: new Date(formData.date),
                startTime: formData.startTime,
                endTime: formData.endTime,
                clientName: formData.clientName,
                serviceType: formData.serviceType,
                value: Number(formData.value)
            })
            setIsModalOpen(false)
            alert("Agendamento criado com sucesso!")
        } catch (error) {
            alert("Erro ao criar agendamento")
        } finally {
            setLoading(false)
        }
    }

    const copyLink = (id: string) => {
        const url = `${window.location.origin}/f/${id}`
        navigator.clipboard.writeText(url)
        alert('Link da ficha copiado!')
    }

    return (
        <div className="p-6 md:p-10 max-w-7xl mx-auto space-y-8 min-h-screen text-white">

            {/* Header */}
            <div className="flex justify-between items-center border-b border-white/10 pb-6">
                <div>
                    <h1 className="text-3xl font-orbitron font-bold">AGENDA</h1>
                    <p className="text-xs font-mono text-gray-500 uppercase tracking-widest">Gerenciamento de Slots</p>
                </div>
                <Button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-700 font-bold"
                >
                    <Plus size={18} className="mr-2" /> NOVO AGENDAMENTO
                </Button>
            </div>

            {/* Calendar Grid (Simplified List for MVP) */}
            <div className="grid gap-4">
                {bookings.length === 0 ? (
                    <div className="text-center py-20 bg-white/5 rounded-xl border border-dashed border-white/10">
                        <CalendarIcon size={48} className="mx-auto text-gray-600 mb-4" />
                        <h3 className="font-orbitron text-gray-400">Agenda Vazia</h3>
                        <p className="text-sm text-gray-600">Nenhuma sessão agendada para os próximos dias.</p>
                    </div>
                ) : (
                    bookings.map((booking) => (
                        <div key={booking.id} className="bg-gray-900/40 border border-white/5 p-4 rounded-xl flex justify-between items-center hover:border-purple-500/30 transition-all">
                            <div className="flex items-center gap-6">
                                <div className="text-center min-w-[60px]">
                                    <p className="text-xs font-mono text-gray-500 uppercase">{new Date(booking.slot.startTime).toLocaleDateString('pt-BR', { weekday: 'short' })}</p>
                                    <p className="text-xl font-bold font-orbitron">{new Date(booking.slot.startTime).getDate()}</p>
                                </div>
                                <div className="h-10 w-px bg-white/10"></div>
                                <div>
                                    <h4 className="font-bold text-white text-lg">{booking.client.name}</h4>
                                    <p className="text-xs font-mono text-purple-400 flex items-center gap-2">
                                        <Clock size={12} />
                                        {new Date(booking.slot.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} -
                                        {new Date(booking.slot.endTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2">
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-7 text-xs border-purple-500/30 hover:bg-purple-500/20 text-purple-300"
                                        onClick={() => copyLink(booking.id)}
                                    >
                                        <Share2 size={12} className="mr-1" /> Link Ficha
                                    </Button>
                                    <span className="bg-green-500/10 text-green-400 border border-green-500/20 px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider">
                                        {booking.status}
                                    </span>
                                </div>
                                {booking.googleEventId && (
                                    <span className="text-[10px] text-gray-500 flex items-center gap-1">
                                        <img src="https://upload.wikimedia.org/wikipedia/commons/a/a5/Google_Calendar_icon_%282020%29.svg" alt="G" className="w-3 h-3 grayscale opacity-50" />
                                        Synced
                                    </span>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Novo Agendamento (Simples) */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-zinc-900 border border-white/10 rounded-xl p-8 max-w-md w-full shadow-2xl animate-in fade-in zoom-in duration-300">
                        <h2 className="text-xl font-orbitron font-bold mb-6 text-white border-b border-white/10 pb-4">Nova Sessão</h2>

                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="text-xs font-mono text-gray-400 block mb-1">CLIENTE</label>
                                <div className="relative">
                                    <User size={16} className="absolute left-3 top-3 text-gray-500" />
                                    <input
                                        required
                                        type="text"
                                        className="w-full bg-black/50 border border-white/10 rounded p-2 pl-10 text-sm focus:border-purple-500 outline-none"
                                        placeholder="Nome do Cliente"
                                        value={formData.clientName}
                                        onChange={e => setFormData({ ...formData, clientName: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-mono text-gray-400 block mb-1">DATA</label>
                                    <input
                                        required
                                        type="date"
                                        className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm focus:border-purple-500 outline-none text-white calendar-picker-indicator:invert"
                                        value={formData.date}
                                        onChange={e => setFormData({ ...formData, date: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-mono text-gray-400 block mb-1">VALOR (R$)</label>
                                    <div className="relative">
                                        <DollarSign size={16} className="absolute left-3 top-3 text-gray-500" />
                                        <input
                                            required
                                            type="number"
                                            className="w-full bg-black/50 border border-white/10 rounded p-2 pl-10 text-sm focus:border-purple-500 outline-none"
                                            value={formData.value}
                                            onChange={e => setFormData({ ...formData, value: Number(e.target.value) })}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-mono text-gray-400 block mb-1">INÍCIO</label>
                                    <input
                                        required
                                        type="time"
                                        className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm focus:border-purple-500 outline-none text-white"
                                        value={formData.startTime}
                                        onChange={e => setFormData({ ...formData, startTime: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-mono text-gray-400 block mb-1">FIM</label>
                                    <input
                                        required
                                        type="time"
                                        className="w-full bg-black/50 border border-white/10 rounded p-2 text-sm focus:border-purple-500 outline-none text-white"
                                        value={formData.endTime}
                                        onChange={e => setFormData({ ...formData, endTime: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="pt-4 flex gap-3">
                                <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)} className="flex-1 text-gray-400">
                                    Cancelar
                                </Button>
                                <Button type="submit" disabled={loading} className="flex-1 bg-purple-600 hover:bg-purple-700">
                                    {loading ? 'Salvando...' : 'Confirmar'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
