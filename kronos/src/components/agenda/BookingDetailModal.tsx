'use client'

import React, { useState, useRef, useEffect } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import {
    X, Clock, User, Palette, FileText, Calendar,
    Check, Pencil, Trash2, RotateCcw, AlertTriangle, ExternalLink,
    Save, XCircle
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    updateBookingStatus,
    deleteBooking,
    revertBookingCompletion,
    updateBooking
} from '@/app/actions/bookings'

// ─── Types ──────────────────────────────────────────────────────────────────

interface BookingDetailModalProps {
    booking: any
    onClose: () => void
    onRefresh: () => void
    isReadOnly?: boolean
}

// ─── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    OPEN:      { label: 'Pendente',   color: 'bg-yellow-500',  text: 'text-yellow-400', border: 'border-yellow-500/30', glow: 'shadow-[0_0_20px_rgba(234,179,8,0.15)]' },
    CONFIRMED: { label: 'Confirmado', color: 'bg-blue-500',    text: 'text-blue-400',   border: 'border-blue-500/30',   glow: 'shadow-[0_0_20px_rgba(59,130,246,0.15)]' },
    COMPLETED: { label: 'Concluído',  color: 'bg-green-500',   text: 'text-green-400',  border: 'border-green-500/30',  glow: 'shadow-[0_0_20px_rgba(34,197,94,0.15)]' },
    CANCELLED: { label: 'Cancelado',  color: 'bg-red-500',     text: 'text-red-400',    border: 'border-red-500/30',    glow: 'shadow-[0_0_20px_rgba(239,68,68,0.15)]' },
}

// ─── Inline editable field ──────────────────────────────────────────────────

function EditableField({
    label,
    value,
    type = 'text',
    onSave,
    prefix,
    suffix,
    disabled = false,
    placeholder,
}: {
    label: string
    value: string | number
    type?: 'text' | 'number' | 'time' | 'date' | 'textarea'
    onSave: (v: string) => Promise<void>
    prefix?: React.ReactNode
    suffix?: string
    disabled?: boolean
    placeholder?: string
}) {
    const [editing, setEditing] = useState(false)
    const [draft, setDraft] = useState(String(value))
    const [saving, setSaving] = useState(false)
    const inputRef = useRef<any>(null)

    useEffect(() => {
        if (editing && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select?.()
        }
    }, [editing])

    const handleSave = async () => {
        if (draft === String(value)) { setEditing(false); return }
        setSaving(true)
        try {
            await onSave(draft)
        } finally {
            setSaving(false)
            setEditing(false)
        }
    }

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && type !== 'textarea') handleSave()
        if (e.key === 'Escape') { setDraft(String(value)); setEditing(false) }
    }

    return (
        <div className="group relative">
            <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-0.5">{label}</p>
            {editing ? (
                <div className="flex items-center gap-2">
                    {type === 'textarea' ? (
                        <textarea
                            ref={inputRef}
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            onKeyDown={handleKey}
                            rows={3}
                            placeholder={placeholder}
                            className="flex-1 bg-white/5 border border-primary/30 rounded-lg px-3 py-2 text-sm text-white outline-none resize-none focus:border-primary/60 transition-colors"
                        />
                    ) : (
                        <input
                            ref={inputRef}
                            type={type}
                            value={draft}
                            onChange={e => setDraft(e.target.value)}
                            onKeyDown={handleKey}
                            placeholder={placeholder}
                            className="flex-1 bg-white/5 border border-primary/30 rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-primary/60 transition-colors"
                        />
                    )}
                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="p-1.5 bg-primary/20 hover:bg-primary/30 text-primary rounded-lg transition-colors flex-shrink-0"
                    >
                        <Save size={13} />
                    </button>
                    <button
                        onClick={() => { setDraft(String(value)); setEditing(false) }}
                        className="p-1.5 bg-white/5 hover:bg-white/10 text-gray-400 rounded-lg transition-colors flex-shrink-0"
                    >
                        <XCircle size={13} />
                    </button>
                </div>
            ) : (
                <div
                    className={`flex items-center gap-2 py-1 rounded-lg transition-all ${!disabled ? 'cursor-pointer hover:bg-white/5 px-2 -mx-2' : ''}`}
                    onClick={() => !disabled && setEditing(true)}
                >
                    {prefix && <span className="text-gray-500 flex-shrink-0">{prefix}</span>}
                    <span className={`text-sm font-medium ${value ? 'text-white' : 'text-gray-600 italic'}`}>
                        {value || placeholder || '—'}
                        {suffix && <span className="text-gray-500 ml-1 text-xs">{suffix}</span>}
                    </span>
                    {!disabled && (
                        <Pencil size={10} className="text-gray-700 opacity-0 group-hover:opacity-100 transition-opacity ml-auto flex-shrink-0" />
                    )}
                </div>
            )}
        </div>
    )
}

// ─── Main Modal ─────────────────────────────────────────────────────────────

export function BookingDetailModal({ booking, onClose, onRefresh, isReadOnly = false }: BookingDetailModalProps) {
    const [localBooking, setLocalBooking] = useState(booking)
    const [loading, setLoading] = useState<string | null>(null)
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
    const [showCancelConfirm, setShowCancelConfirm] = useState(false)

    const status = localBooking.status as keyof typeof STATUS_CONFIG
    const statusCfg = STATUS_CONFIG[status] || STATUS_CONFIG.OPEN
    const scheduledFor = new Date(localBooking.scheduledFor)
    const endTime = new Date(scheduledFor.getTime() + (localBooking.duration || 60) * 60000)

    const canEdit = !isReadOnly && (status === 'OPEN' || status === 'CONFIRMED')
    const canRevert = status === 'COMPLETED'
        && !localBooking.settlementId
        && localBooking.updatedAt
        && (new Date().getTime() - new Date(localBooking.updatedAt).getTime() < 24 * 60 * 60 * 1000)

    const handleStatusChange = async (newStatus: 'CONFIRMED' | 'COMPLETED' | 'CANCELLED') => {
        setLoading(newStatus)
        const result = await updateBookingStatus({ bookingId: localBooking.id, status: newStatus })
        setLoading(null)
        if (result.success) {
            setLocalBooking({ ...localBooking, status: newStatus, updatedAt: new Date().toISOString() })
            onRefresh()
            if (newStatus === 'CANCELLED') onClose()
        } else {
            alert(result.error || 'Erro ao atualizar status')
        }
    }

    const handleDelete = async () => {
        setLoading('DELETE')
        const result = await deleteBooking(localBooking.id)
        setLoading(null)
        if (result.success) {
            onRefresh()
            onClose()
        } else {
            alert(result.error || 'Erro ao excluir')
        }
    }

    const handleRevert = async () => {
        setLoading('REVERT')
        const result = await revertBookingCompletion(localBooking.id)
        setLoading(null)
        if (result.success) {
            setLocalBooking({ ...localBooking, status: 'CONFIRMED', updatedAt: new Date().toISOString() })
            onRefresh()
        } else {
            alert(result.error || 'Erro ao reverter')
        }
    }

    const handleUpdate = async (field: string, rawValue: string) => {
        let payload: any = { bookingId: localBooking.id }

        if (field === 'time') {
            const [h, m] = rawValue.split(':').map(Number)
            if (isNaN(h) || isNaN(m)) throw new Error('Horário inválido')
            const newDate = new Date(localBooking.scheduledFor)
            newDate.setHours(h, m, 0, 0)
            payload.scheduledFor = newDate
        } else if (field === 'date') {
            const [y, mo, d] = rawValue.split('-').map(Number)
            if (isNaN(y)) throw new Error('Data inválida')
            const newDate = new Date(localBooking.scheduledFor)
            newDate.setFullYear(y, mo - 1, d)
            payload.scheduledFor = newDate
        } else if (field === 'duration') {
            payload.duration = parseInt(rawValue)
        } else if (field === 'value') {
            payload.value = parseFloat(rawValue)
        } else if (field === 'notes') {
            payload.notes = rawValue
        }

        const result = await updateBooking(payload)
        if (result.success && result.booking) {
            setLocalBooking({ ...localBooking, ...result.booking })
            onRefresh()
        } else if (result.error) {
            alert(result.error)
            throw new Error(result.error)
        }
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />

            {/* Modal */}
            <div className={`relative w-full max-w-lg bg-gray-950 border ${statusCfg.border} ${statusCfg.glow} rounded-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl`}>

                {/* Status color bar (topo) */}
                <div className={`h-1 w-full ${statusCfg.color}`} />

                {/* Header */}
                <div className="flex items-start justify-between gap-3 px-6 pt-5 pb-4">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`text-[9px] font-mono font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border ${statusCfg.border} ${statusCfg.text} bg-white/5`}>
                                {statusCfg.label}
                            </span>
                            {localBooking.syncedToGoogle && (
                                <span className="text-[9px] font-mono text-blue-400/70 uppercase tracking-widest px-2 py-0.5 rounded-full border border-blue-500/20 bg-blue-500/5 flex items-center gap-1">
                                    <ExternalLink size={8} /> Google
                                </span>
                            )}
                        </div>
                        <h2 className="text-xl font-orbitron font-bold text-white truncate">
                            {localBooking.client?.name || '(sem cliente)'}
                        </h2>
                        <p className="text-[11px] text-gray-500 font-mono mt-0.5">
                            {localBooking.type || ''}
                        </p>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex-shrink-0 p-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body — scrollável */}
                <div className="overflow-y-auto flex-1 px-6 pb-6 space-y-5">

                    {/* Bloco de horário estilo Google Agenda */}
                    <div className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-3">
                        <div className="flex items-start gap-3">
                            <Calendar size={16} className="text-primary flex-shrink-0 mt-0.5" />
                            <div className="flex-1 grid grid-cols-2 gap-3">
                                <EditableField
                                    label="Data"
                                    value={format(scheduledFor, 'yyyy-MM-dd')}
                                    type="date"
                                    disabled={!canEdit}
                                    onSave={(v) => handleUpdate('date', v)}
                                />
                                <div>
                                    <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest mb-1">Horário</p>
                                    <p className="text-sm font-medium text-white">
                                        {format(scheduledFor, 'HH:mm')} → {format(endTime, 'HH:mm')}
                                    </p>
                                    <p className="text-[10px] text-gray-600 font-mono mt-0.5 capitalize">
                                        {format(scheduledFor, "EEEE, d 'de' MMMM", { locale: ptBR })}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-start gap-3 border-t border-white/5 pt-3">
                            <Clock size={16} className="text-gray-500 flex-shrink-0 mt-0.5" />
                            <div className="flex-1 grid grid-cols-2 gap-3">
                                <EditableField
                                    label="Hora início"
                                    value={format(scheduledFor, 'HH:mm')}
                                    type="time"
                                    disabled={!canEdit}
                                    onSave={(v) => handleUpdate('time', v)}
                                />
                                <EditableField
                                    label="Duração"
                                    value={localBooking.duration || 60}
                                    type="number"
                                    suffix="min"
                                    disabled={!canEdit}
                                    onSave={(v) => handleUpdate('duration', v)}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Cliente */}
                    {localBooking.client && (
                        <div className="bg-white/3 border border-white/5 rounded-xl p-4 space-y-2">
                            <div className="flex items-center gap-2 mb-3">
                                <User size={14} className="text-gray-500" />
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Cliente</p>
                            </div>
                            <p className="text-base font-bold text-white">{localBooking.client.name}</p>
                        </div>
                    )}

                    {/* Artista */}
                    {localBooking.artist?.user?.name && (
                        <div className="flex items-center gap-3 px-4 py-3 bg-white/3 border border-white/5 rounded-xl">
                            <Palette size={14} className="text-primary flex-shrink-0" />
                            <div>
                                <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest">Artista</p>
                                <p className="text-sm font-bold text-white">{localBooking.artist.user.name}</p>
                            </div>
                        </div>
                    )}

                    {/* Observações */}
                    <div className="bg-white/3 border border-white/5 rounded-xl p-4">
                        <div className="flex items-center gap-2 mb-3">
                            <FileText size={14} className="text-gray-500" />
                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Observações</p>
                        </div>
                        <EditableField
                            label=""
                            value={localBooking.notes || ''}
                            type="textarea"
                            disabled={!canEdit}
                            placeholder="Nenhuma observação..."
                            onSave={(v) => handleUpdate('notes', v)}
                        />
                    </div>

                    {/* Aviso de reversão disponível */}
                    {canRevert && (
                        <div className="flex items-start gap-3 px-4 py-3 bg-yellow-500/5 border border-yellow-500/20 rounded-xl">
                            <AlertTriangle size={14} className="text-yellow-400 flex-shrink-0 mt-0.5" />
                            <p className="text-[11px] text-yellow-400/80 leading-relaxed">
                                Esta sessão foi concluída recentemente. Você pode revertê-la para <strong>Confirmado</strong> dentro da janela de 24h.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer — ações */}
                {!isReadOnly && (
                    <div className="border-t border-white/5 px-6 py-4 flex flex-col gap-2">

                        {/* Ações primárias */}
                        <div className="flex gap-2">
                            {status === 'OPEN' && (
                                <Button
                                    onClick={() => handleStatusChange('CONFIRMED')}
                                    disabled={!!loading}
                                    className="flex-1 h-10 bg-blue-500/15 hover:bg-blue-500/25 text-blue-400 border border-blue-500/30 font-bold text-xs"
                                    variant="outline"
                                >
                                    {loading === 'CONFIRMED' ? '...' : <><Check size={14} className="mr-1.5" /> Confirmar</>}
                                </Button>
                            )}
                            {status === 'CONFIRMED' && (
                                <Button
                                    onClick={() => handleStatusChange('COMPLETED')}
                                    disabled={!!loading}
                                    className="flex-1 h-10 bg-green-500/15 hover:bg-green-500/25 text-green-400 border border-green-500/30 font-bold text-xs"
                                    variant="outline"
                                >
                                    {loading === 'COMPLETED' ? '...' : <><Check size={14} className="mr-1.5" /> Concluir</>}
                                </Button>
                            )}
                            {canRevert && (
                                <Button
                                    onClick={handleRevert}
                                    disabled={!!loading}
                                    className="flex-1 h-10 bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-400 border border-yellow-500/20 font-bold text-xs"
                                    variant="outline"
                                >
                                    {loading === 'REVERT' ? '...' : <><RotateCcw size={13} className="mr-1.5" /> Reverter</>}
                                </Button>
                            )}
                        </div>

                        {/* Ações destrutivas */}
                        <div className="flex gap-2">
                            {(status === 'OPEN' || status === 'CONFIRMED') && (
                                <>
                                    {!showCancelConfirm ? (
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowCancelConfirm(true)}
                                            disabled={!!loading}
                                            className="flex-1 h-9 text-red-400/70 hover:text-red-400 hover:bg-red-500/10 text-xs font-bold"
                                        >
                                            Cancelar Sessão
                                        </Button>
                                    ) : (
                                        <div className="flex-1 flex gap-2">
                                            <Button
                                                variant="ghost"
                                                onClick={() => handleStatusChange('CANCELLED')}
                                                disabled={!!loading}
                                                className="flex-1 h-9 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold"
                                            >
                                                {loading === 'CANCELLED' ? '...' : 'Confirmar Cancelamento'}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setShowCancelConfirm(false)}
                                                className="h-9 px-3 text-gray-500 hover:text-white text-xs"
                                            >
                                                Não
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}

                            {status === 'OPEN' && (
                                <>
                                    {!showDeleteConfirm ? (
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowDeleteConfirm(true)}
                                            disabled={!!loading}
                                            className="h-9 px-3 text-gray-600 hover:text-red-400 hover:bg-red-500/5 text-xs"
                                        >
                                            <Trash2 size={13} />
                                        </Button>
                                    ) : (
                                        <div className="flex gap-2">
                                            <Button
                                                variant="ghost"
                                                onClick={handleDelete}
                                                disabled={!!loading}
                                                className="h-9 px-3 bg-red-500/20 text-red-400 border border-red-500/30 text-xs font-bold"
                                            >
                                                {loading === 'DELETE' ? '...' : <><Trash2 size={13} className="mr-1" />Excluir</>}
                                            </Button>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setShowDeleteConfirm(false)}
                                                className="h-9 px-3 text-gray-500 hover:text-white text-xs"
                                            >
                                                Não
                                            </Button>
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
