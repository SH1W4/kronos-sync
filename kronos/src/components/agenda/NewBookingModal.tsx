'use client'

import React, { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, X } from 'lucide-react'
import { createBooking } from '@/app/actions/bookings'
import { searchClients, createQuickClient } from '@/app/actions/clients'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'

interface BookingModalProps {
    onClose: () => void
    onSuccess: () => void
    initialDate: Date
}

export function BookingModal({ onClose, onSuccess, initialDate }: BookingModalProps) {
    const [clientSearch, setClientSearch] = useState('')
    const [clients, setClients] = useState<any[]>([])
    const [selectedClient, setSelectedClient] = useState<any>(null)
    const [showNewClientForm, setShowNewClientForm] = useState(false)

    // New client form
    const [newClientName, setNewClientName] = useState('')
    const [newClientPhone, setNewClientPhone] = useState('')
    const [newClientEmail, setNewClientEmail] = useState('')

    // Booking details
    const [date, setDate] = useState(format(initialDate, 'yyyy-MM-dd'))
    const [time, setTime] = useState('14:00')
    const [duration, setDuration] = useState(120)
    const [type, setType] = useState('Nova tattoo')
    const [price, setPrice] = useState(400)
    const [notes, setNotes] = useState('')

    const [loading, setLoading] = useState(false)
    const [searchLoading, setSearchLoading] = useState(false)

    // Search clients
    const handleSearchClients = async (query: string) => {
        setClientSearch(query)
        if (query.length < 2) {
            setClients([])
            return
        }

        setSearchLoading(true)
        try {
            const result = await searchClients(query)
            if (result.success && result.clients) {
                setClients(result.clients)
            }
        } catch (error) {
            console.error('Error searching clients:', error)
        } finally {
            setSearchLoading(false)
        }
    }

    // Create new client
    const handleCreateClient = async () => {
        if (!newClientName || !newClientPhone) return

        setLoading(true)
        try {
            const result = await createQuickClient({
                name: newClientName,
                phone: newClientPhone,
                email: newClientEmail
            })

            if (result.success && result.client) {
                setSelectedClient(result.client)
                setShowNewClientForm(false)
                setNewClientName('')
                setNewClientPhone('')
                setNewClientEmail('')
            } else {
                alert(result.error || 'Erro ao criar cliente')
            }
        } catch (error) {
            console.error('Error creating client:', error)
            alert('Erro ao criar cliente')
        } finally {
            setLoading(false)
        }
    }

    // Create booking
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!selectedClient) {
            alert('Selecione um cliente')
            return
        }

        setLoading(true)
        try {
            const scheduledFor = new Date(`${date}T${time}:00`)

            const result = await createBooking({
                clientId: selectedClient.id,
                scheduledFor,
                duration,
                type,
                estimatedPrice: price,
                notes,
                status: 'OPEN',
                syncToGoogle: false
            })

            if (result.success) {
                onSuccess()
            } else {
                alert(result.error || 'Erro ao criar agendamento')
            }
        } catch (error) {
            console.error('Error creating booking:', error)
            alert('Erro ao criar agendamento')
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={true} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="font-orbitron">Novo Agendamento</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Client Selection */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Cliente</label>
                        {selectedClient ? (
                            <div className="flex items-center justify-between p-3 bg-purple-500/10 border border-purple-500/20 rounded-lg">
                                <div>
                                    <p className="font-bold">{selectedClient.name}</p>
                                    <p className="text-sm text-gray-400">{selectedClient.phone}</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setSelectedClient(null)}
                                >
                                    <X size={16} />
                                </Button>
                            </div>
                        ) : showNewClientForm ? (
                            <div className="space-y-3 p-4 bg-gray-900 rounded-lg border border-white/10">
                                <h4 className="font-bold text-sm">Novo Cliente</h4>
                                <Input
                                    placeholder="Nome completo"
                                    value={newClientName}
                                    onChange={(e) => setNewClientName(e.target.value)}
                                    required
                                />
                                <Input
                                    placeholder="Telefone"
                                    value={newClientPhone}
                                    onChange={(e) => setNewClientPhone(e.target.value)}
                                    required
                                />
                                <Input
                                    type="email"
                                    placeholder="Email (opcional)"
                                    value={newClientEmail}
                                    onChange={(e) => setNewClientEmail(e.target.value)}
                                />
                                <div className="flex gap-2">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setShowNewClientForm(false)}
                                        className="flex-1"
                                    >
                                        Cancelar
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleCreateClient}
                                        disabled={loading || !newClientName || !newClientPhone}
                                        className="flex-1"
                                    >
                                        Criar Cliente
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                <Input
                                    placeholder="Buscar cliente por nome ou telefone..."
                                    value={clientSearch}
                                    onChange={(e) => handleSearchClients(e.target.value)}
                                />
                                {searchLoading && (
                                    <p className="text-sm text-gray-400">Buscando...</p>
                                )}
                                {clients.length > 0 && (
                                    <div className="max-h-40 overflow-y-auto space-y-1 border border-white/10 rounded-lg p-2">
                                        {clients.map(client => (
                                            <button
                                                key={client.id}
                                                type="button"
                                                onClick={() => {
                                                    setSelectedClient(client)
                                                    setClients([])
                                                    setClientSearch('')
                                                }}
                                                className="w-full text-left p-2 hover:bg-purple-500/10 rounded transition-colors"
                                            >
                                                <p className="font-bold text-sm">{client.name}</p>
                                                <p className="text-xs text-gray-400">{client.phone}</p>
                                            </button>
                                        ))}
                                    </div>
                                )}
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setShowNewClientForm(true)}
                                    className="w-full"
                                >
                                    + Novo Cliente
                                </Button>
                            </div>
                        )}
                    </div>

                    {/* Date and Time */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Data</label>
                            <Input
                                type="date"
                                value={date}
                                onChange={(e) => setDate(e.target.value)}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Horário</label>
                            <Input
                                type="time"
                                value={time}
                                onChange={(e) => setTime(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    {/* Duration and Type */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-2">Duração</label>
                            <select
                                value={duration}
                                onChange={(e) => setDuration(Number(e.target.value))}
                                className="w-full bg-black border border-white/10 rounded-lg p-2 text-white"
                            >
                                <option value={60}>1 hora</option>
                                <option value={120}>2 horas</option>
                                <option value={180}>3 horas</option>
                                <option value={240}>4 horas</option>
                                <option value={300}>5+ horas</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Tipo</label>
                            <select
                                value={type}
                                onChange={(e) => setType(e.target.value)}
                                className="w-full bg-black border border-white/10 rounded-lg p-2 text-white"
                            >
                                <option>Nova tattoo</option>
                                <option>Retoque</option>
                                <option>Orçamento</option>
                                <option>Cover-up</option>
                                <option>Remoção</option>
                            </select>
                        </div>
                    </div>

                    {/* Price */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Valor Estimado</label>
                        <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={price}
                            onChange={(e) => setPrice(Number(e.target.value))}
                            required
                        />
                    </div>

                    {/* Notes */}
                    <div>
                        <label className="block text-sm font-medium mb-2">Observações</label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full bg-black border border-white/10 rounded-lg p-3 text-white min-h-[80px]"
                            placeholder="Detalhes do agendamento..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={onClose}
                            className="flex-1"
                        >
                            Cancelar
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !selectedClient}
                            className="flex-1 bg-purple-600 hover:bg-purple-500"
                        >
                            {loading && <Loader2 className="animate-spin mr-2" size={16} />}
                            Criar Agendamento
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    )
}
