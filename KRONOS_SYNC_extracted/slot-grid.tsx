"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { formatDate } from '@/lib/utils'

interface Slot {
  id: string
  macaId: number
  startTime: string
  endTime: string
  isActive: boolean
}

interface Booking {
  id: string
  slotId: string
  status: 'OPEN' | 'HELD' | 'BOOKED' | 'COMPLETED' | 'CANCELLED'
  artist: {
    user: {
      name: string
    }
  }
  client: {
    name: string
  }
}

interface SlotGridProps {
  onSlotSelect: (slot: Slot) => void
}

const SlotGrid: React.FC<SlotGridProps> = ({ onSlotSelect }) => {
  const [slots, setSlots] = useState<Slot[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSlotsAndBookings()
  }, [])

  const fetchSlotsAndBookings = async () => {
    try {
      // In a real app, these would be separate API calls
      // For now, we'll generate mock data
      const mockSlots: Slot[] = []
      const mockBookings: Booking[] = []

      // Generate slots for 3 macas, 4 time slots each
      const timeSlots = [
        { start: '09:00', end: '12:00' },
        { start: '13:00', end: '16:00' },
        { start: '16:30', end: '19:30' },
        { start: '20:00', end: '23:00' }
      ]

      for (let maca = 1; maca <= 3; maca++) {
        timeSlots.forEach((time, index) => {
          const slotId = `slot-${maca}-${index}`
          mockSlots.push({
            id: slotId,
            macaId: maca,
            startTime: `2024-01-15T${time.start}:00`,
            endTime: `2024-01-15T${time.end}:00`,
            isActive: true
          })

          // Add some mock bookings
          if (Math.random() > 0.7) {
            mockBookings.push({
              id: `booking-${slotId}`,
              slotId,
              status: Math.random() > 0.5 ? 'BOOKED' : 'HELD',
              artist: { user: { name: `Artista ${maca}` } },
              client: { name: `Cliente ${index + 1}` }
            })
          }
        })
      }

      setSlots(mockSlots)
      setBookings(mockBookings)
    } catch (error) {
      console.error('Error fetching slots:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSlotStatus = (slot: Slot) => {
    const booking = bookings.find(b => b.slotId === slot.id)
    if (!booking) return 'OPEN'
    return booking.status
  }

  const getSlotColor = (status: string) => {
    switch (status) {
      case 'OPEN':
        return 'bg-green-600 hover:bg-green-500 text-white'
      case 'HELD':
        return 'bg-yellow-600 hover:bg-yellow-500 text-white'
      case 'BOOKED':
        return 'bg-primary hover:bg-primary/90 text-white'
      default:
        return 'bg-gray-600 text-gray-300 cursor-not-allowed'
    }
  }

  const formatTimeSlot = (startTime: string, endTime: string) => {
    const start = new Date(startTime).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    const end = new Date(endTime).toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
    return `${start} - ${end}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Agenda do Estúdio</h2>
        <p className="text-muted-foreground">Selecione um horário disponível</p>
      </div>

      {/* Legend */}
      <div className="flex justify-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-green-600 rounded"></div>
          <span>Disponível</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-yellow-600 rounded"></div>
          <span>Reservado</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-primary rounded"></div>
          <span>Ocupado</span>
        </div>
      </div>

      {/* Cinema-style grid */}
      <div className="max-w-4xl mx-auto">
        {/* Header with maca numbers */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div></div> {/* Empty corner */}
          <div className="text-center font-semibold text-foreground">Maca 1</div>
          <div className="text-center font-semibold text-foreground">Maca 2</div>
          <div className="text-center font-semibold text-foreground">Maca 3</div>
        </div>

        {/* Time slots rows */}
        {[0, 1, 2, 3].map(timeIndex => {
          const timeSlot = slots.find(s => s.macaId === 1 && slots.indexOf(s) % 4 === timeIndex)
          if (!timeSlot) return null

          return (
            <div key={timeIndex} className="grid grid-cols-4 gap-4 mb-4">
              {/* Time label */}
              <div className="flex items-center justify-end pr-4 text-sm text-muted-foreground font-medium">
                {formatTimeSlot(timeSlot.startTime, timeSlot.endTime)}
              </div>

              {/* Slots for each maca */}
              {[1, 2, 3].map(macaId => {
                const slot = slots.find(s => s.macaId === macaId && slots.indexOf(s) % 4 === timeIndex)
                if (!slot) return <div key={macaId}></div>

                const status = getSlotStatus(slot)
                const booking = bookings.find(b => b.slotId === slot.id)
                const isAvailable = status === 'OPEN'

                return (
                  <Button
                    key={slot.id}
                    className={`h-16 ${getSlotColor(status)} transition-all duration-200 transform hover:scale-105`}
                    onClick={() => isAvailable && onSlotSelect(slot)}
                    disabled={!isAvailable}
                  >
                    <div className="text-center">
                      {status === 'OPEN' && (
                        <div className="font-medium">Disponível</div>
                      )}
                      {status === 'HELD' && (
                        <div>
                          <div className="font-medium text-xs">Reservado</div>
                        </div>
                      )}
                      {status === 'BOOKED' && booking && (
                        <div>
                          <div className="font-medium text-xs">{booking.artist.user.name}</div>
                          <div className="text-xs opacity-80">{booking.client.name}</div>
                        </div>
                      )}
                    </div>
                  </Button>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default SlotGrid

