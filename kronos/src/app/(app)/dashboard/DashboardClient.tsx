'use client'

import React, { useState, useEffect } from 'react'
import { BrandLogo } from '@/components/ui/brand-logo'
import { SlotGrid } from '@/components/agenda/slot-grid'
import BookingModal from '@/components/agenda/booking-modal'

interface Slot {
    id: string
    macaId: number
    startTime: string
    endTime: string
    date: string
    status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED'
    booking?: {
        client: { name: string }
        artist: { user: { name: string } }
    }
}

export default function AgendaPage() {
    const [slots, setSlots] = useState<Slot[]>([])
    const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchSlots()
        fetchArtistProfile()
    }, [])

    const fetchArtistProfile = async () => {
        try {
            const response = await fetch('/api/artist/profile')
            const data = await response.json()
            if (data.artist?.user?.phone) {
                const pin = data.artist.user.phone.slice(-4)
                localStorage.setItem('artistPin', pin)
                // Force a re-render for the header if needed, but since it reads from localStorage on render, it should work next tick.
                // For immediate update, we could use state.
            }
        } catch (error) {
            console.error('Error fetching artist profile:', error)
        }
    }

    const fetchSlots = async () => {
        try {
            const response = await fetch('/api/slots')
            const data = await response.json()
            setSlots(data.slots || [])
        } catch (error) {
            console.error('Error fetching slots:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSlotClick = (slot: Slot) => {
        if (slot.status === 'AVAILABLE') {
            setSelectedSlot(slot)
            setIsModalOpen(true)
        }
    }

    const handleBookingSuccess = () => {
        setIsModalOpen(false)
        setSelectedSlot(null)
        fetchSlots()
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center">
                <div className="cyber-title text-2xl">Carregando...</div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-background cyber-grid">
            {/* Header */}
            <header className="border-b border-primary/30 bg-muted/50 backdrop-blur-sm">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <BrandLogo size={48} />
                        <div className="flex items-center space-x-6">
                            {/* Artist PIN Badge */}
                            <div className="bg-secondary/10 border border-secondary/20 px-4 py-2 rounded-xl flex flex-col items-center">
                                <span className="text-[8px] font-mono text-secondary uppercase tracking-widest">PIN KIOSK</span>
                                <span className="text-lg font-bold font-orbitron text-white mt-1">
                                    {/* Will be fetched or obtained from session */}
                                    {typeof window !== 'undefined' ? localStorage.getItem('artistPin') : '....'}
                                </span>
                            </div>
                            <div className="hidden md:block text-sm font-mono text-primary/70 uppercase tracking-wider">
                                Sistema de Agendamento Avançado
                            </div>
                        </div>
                    </div>

                    <nav className="flex space-x-6 mt-4 overflow-x-auto pb-2 md:pb-0">
                        <a href="/" className="text-primary font-mono uppercase tracking-wider hover:text-accent transition-colors border-b-2 border-primary">
                            Agenda
                        </a>
                        <a href="/marketplace" className="text-muted-foreground font-mono uppercase tracking-wider hover:text-primary transition-colors whitespace-nowrap">
                            Marketplace
                        </a>
                        <a href="/kiosk" className="text-muted-foreground font-mono uppercase tracking-wider hover:text-primary transition-colors whitespace-nowrap">
                            Kiosk
                        </a>
                        <a href="/dashboard" className="text-muted-foreground font-mono uppercase tracking-wider hover:text-primary transition-colors whitespace-nowrap">
                            Dashboard
                        </a>
                    </nav>
                </div>
            </header>

            {/* Main Content */}
            <main className="container mx-auto px-4 py-8">
                <div className="cyber-card p-8">
                    <div className="text-center mb-8">
                        <h2 className="cyber-title text-2xl font-orbitron mb-2">
                            Agenda do Estúdio
                        </h2>
                        <p className="text-muted-foreground font-mono">
                            Selecione um horário disponível
                        </p>
                    </div>

                    {/* Legend */}
                    <div className="flex flex-wrap justify-center gap-4 md:space-x-8 mb-8">
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-primary border border-primary"></div>
                            <span className="text-sm font-mono text-primary">Disponível</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-yellow-500 border border-yellow-500"></div>
                            <span className="text-sm font-mono text-yellow-500">Reservado</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <div className="w-4 h-4 bg-secondary border border-secondary"></div>
                            <span className="text-sm font-mono text-secondary">Ocupado</span>
                        </div>
                    </div>

                    {/* Slot Grid */}
                    <SlotGrid slots={slots} onSlotClick={handleSlotClick} />
                </div>
            </main>

            {/* Booking Modal */}
            {selectedSlot && (
                <BookingModal
                    open={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    slot={selectedSlot}
                    onBookingCreated={handleBookingSuccess}
                />
            )}
        </div>
    )
}
