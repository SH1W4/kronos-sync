'use client'

import React from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Clock, User, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { deleteBooking, updateBookingStatus, revertBookingCompletion } from '@/app/actions/bookings'

interface BookingCardProps {
    booking: any
    onClick: () => void
    onStatusChange: () => void
    compact?: boolean
}

const STATUS_STYLES = {
    OPEN:      { border: 'border-yellow-500/30', bg: 'bg-yellow-500/5',  badge: 'bg-yellow-500/20 text-yellow-400',  label: 'Pendente'   },
    CONFIRMED: { border: 'border-blue-500/30',   bg: 'bg-blue-500/5',    badge: 'bg-blue-500/20 text-blue-400',      label: 'Confirmado' },
    COMPLETED: { border: 'border-green-500/30',  bg: 'bg-green-500/5',   badge: 'bg-green-500/20 text-green-400',    label: 'Concluído'  },
    CANCELLED: { border: 'border-red-500/30',    bg: 'bg-red-500/5',     badge: 'bg-red-500/20 text-red-400',        label: 'Cancelado'  },
}

const BAR_COLORS = {
    OPEN:      'bg-yellow-400',
    CONFIRMED: 'bg-blue-400',
    COMPLETED: 'bg-green-400',
    CANCELLED: 'bg-red-400',
}

export function BookingCard({ booking, onClick, onStatusChange, compact = false }: BookingCardProps) {
    const status = booking.status as keyof typeof STATUS_STYLES
    const styles = STATUS_STYLES[status] || STATUS_STYLES.OPEN
    const barColor = BAR_COLORS[status] || BAR_COLORS.OPEN

    const clientName: string = booking.client?.name || '(sem cliente)'
    const artistName: string = booking.artist?.user?.name || booking.artistName || ''
    const scheduledFor = new Date(booking.scheduledFor)

    const handleStatusChange = async (newStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
        const result = await updateBookingStatus({ bookingId: booking.id, status: newStatus })
        if (result.success) {
            onStatusChange()
        } else {
            alert(result.error || 'Erro ao atualizar status')
        }
    }

    const handleDeleteBooking = async () => {
        if (!confirm('Deseja realmente excluir este agendamento pendente?')) return

        const result = await deleteBooking(booking.id)
        if (result.success) {
            onStatusChange()
        } else {
            alert(result.error || 'Erro ao excluir agendamento')
        }
    }

    // ── Compact (week view chip) ─────────────────────────────────────────────
    if (compact) {
        return (
            <div
                onClick={onClick}
                className={`flex gap-1.5 px-1.5 py-1 mb-0.5 rounded cursor-pointer transition-colors border ${styles.border} ${styles.bg} hover:brightness-125`}
                title={`${artistName ? artistName + ' — ' : ''}${clientName} · ${booking.type || ''}`}
            >
                <div className={`w-1 flex-shrink-0 rounded-full self-stretch ${barColor}`} />
                <div className="min-w-0">
                    {artistName && (
                        <p className="text-[9px] font-bold text-gray-300 truncate leading-tight uppercase tracking-wide">
                            {artistName.split(' ')[0]}
                        </p>
                    )}
                    <p className="text-[10px] font-semibold text-white truncate leading-tight">
                        {clientName}
                    </p>
                    <p className="text-[9px] text-gray-500 truncate leading-tight">
                        {format(scheduledFor, 'HH:mm')}
                    </p>
                </div>
            </div>
        )
    }

    // ── Full (day view card) ─────────────────────────────────────────────────
    return (
        <div
            className={`flex flex-col gap-3 p-4 rounded-xl border cursor-pointer transition-all hover:brightness-110 ${styles.border} ${styles.bg}`}
            onClick={onClick}
        >
            <div className="flex gap-3 w-full">
                {/* Color bar */}
                <div className={`w-1 flex-shrink-0 rounded-full self-stretch ${barColor}`} />

                <div className="flex-1 min-w-0">
                {/* Artist name — destaque principal */}
                {artistName && (
                    <div className="flex items-center gap-1.5 mb-0.5">
                        <Palette size={11} className="text-gray-500 flex-shrink-0" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-gray-300 truncate">
                            {artistName}
                        </span>
                    </div>
                )}

                {/* Client name */}
                <div className="flex items-center gap-1.5 mb-1">
                    <User size={13} className="text-gray-400 flex-shrink-0" />
                    <h4 className="font-bold text-white truncate">{clientName}</h4>
                </div>

                {/* Time + duration */}
                <div className="flex items-center gap-1.5 text-xs text-gray-400 mb-1">
                    <Clock size={11} className="flex-shrink-0" />
                    <span>
                        {format(scheduledFor, 'HH:mm', { locale: ptBR })}
                        {' · '}
                        {booking.duration}min
                    </span>
                </div>

                {/* Type tag */}
                {booking.type && (
                    <span className="inline-block text-[10px] font-mono uppercase tracking-wider text-gray-500 bg-white/5 px-2 py-0.5 rounded mt-0.5">
                        {booking.type}
                    </span>
                )}

                {/* Notes */}
                {booking.notes && (
                    <p className="text-xs text-gray-500 mt-2 line-clamp-2 italic">{booking.notes}</p>
                )}
            </div>

            {/* Right: status badge */}
            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${styles.badge}`}>
                    {styles.label}
                </span>
            </div>
            </div>

            {/* Action buttons */}
            {booking.status !== 'COMPLETED' && booking.status !== 'CANCELLED' && (
                <div
                    className="flex gap-2 pt-3 border-t border-white/5 mt-1"
                    onClick={e => e.stopPropagation()}
                >
                    {booking.status === 'OPEN' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange('CONFIRMED')}
                            className="flex-1 text-xs bg-white/5 hover:bg-white/10 text-white border-white/10 h-8"
                        >
                            Confirmar
                        </Button>
                    )}
                    {booking.status === 'CONFIRMED' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange('COMPLETED')}
                            className="flex-1 text-xs bg-green-500/10 hover:bg-green-500/20 text-green-400 border-green-500/20 h-8"
                        >
                            Concluir
                        </Button>
                    )}
                    {booking.status === 'OPEN' && (
                        <Button
                            size="sm"
                            variant="outline"
                            onClick={handleDeleteBooking}
                            className="flex-1 text-xs h-8 text-red-400 border-red-500/20 hover:text-red-300 hover:bg-red-500/10"
                        >
                            Excluir
                        </Button>
                    )}
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleStatusChange('CANCELLED')}
                        className="flex-1 text-xs text-red-400/70 hover:text-red-400 hover:bg-red-500/10 h-8"
                    >
                        Cancelar
                    </Button>
                </div>
            )}

            {booking.status === 'COMPLETED' &&
             booking.updatedAt &&
             (new Date().getTime() - new Date(booking.updatedAt).getTime() < 24 * 60 * 60 * 1000) &&
             !booking.settlementId && (
                <div
                    className="flex gap-2 pt-3 border-t border-white/5 mt-1"
                    onClick={e => e.stopPropagation()}
                >
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={async () => {
                            if (confirm('Deseja reverter a conclusão desta sessão para "Confirmado"?')) {
                                const result = await revertBookingCompletion(booking.id)
                                if (result.success) {
                                    onStatusChange()
                                } else {
                                    alert(result.error || 'Erro ao reverter conclusão')
                                }
                            }
                        }}
                        className="flex-1 text-xs bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border-yellow-500/20 h-8"
                    >
                        Reverter Conclusão
                    </Button>
                </div>
            )}
        </div>
    )
}

