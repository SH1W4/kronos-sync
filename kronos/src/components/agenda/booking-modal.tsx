"use client"

import React, { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

interface Slot {
  id: string
  macaId: number
  startTime: string
  endTime: string
}

interface Artist {
  id: string
  user: {
    name: string
  }
  plan: 'GUEST' | 'RESIDENT'
  commissionRate: number
}

interface Client {
  id: string
  name: string
  email: string
}

interface BookingModalProps {
  slot: Slot | null
  open: boolean
  onClose: () => void
  onBookingCreated: () => void
}

const BookingModal: React.FC<BookingModalProps> = ({
  slot,
  open,
  onClose,
  onBookingCreated
}) => {
  const [artists, setArtists] = useState<Artist[]>([])
  const [clients, setClients] = useState<Client[]>([])
  const [selectedArtist, setSelectedArtist] = useState('')
  const [selectedClient, setSelectedClient] = useState('')
  const [value, setValue] = useState(400)
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [loading, setLoading] = useState(false)
  const [validatingCoupon, setValidatingCoupon] = useState(false)

  useEffect(() => {
    if (open) {
      fetchArtistsAndClients()
    }
  }, [open])

  const fetchArtistsAndClients = async () => {
    try {
      // Mock data - in real app, fetch from API
      const mockArtists: Artist[] = [
        {
          id: 'artist-1',
          user: { name: 'João Silva' },
          plan: 'RESIDENT',
          commissionRate: 0.20
        },
        {
          id: 'artist-2',
          user: { name: 'Maria Santos' },
          plan: 'GUEST',
          commissionRate: 0.30
        },
        {
          id: 'artist-3',
          user: { name: 'Pedro Costa' },
          plan: 'RESIDENT',
          commissionRate: 0.25
        }
      ]

      const mockClients: Client[] = [
        { id: 'client-1', name: 'Ana Oliveira', email: 'ana@email.com' },
        { id: 'client-2', name: 'Carlos Lima', email: 'carlos@email.com' },
        { id: 'client-3', name: 'Lucia Ferreira', email: 'lucia@email.com' }
      ]

      setArtists(mockArtists)
      setClients(mockClients)
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const validateCoupon = async () => {
    if (!couponCode || !selectedArtist) return

    setValidatingCoupon(true)
    try {
      const response = await fetch(`/api/coupons?code=${couponCode}&artistId=${selectedArtist}`)

      if (response.ok) {
        const data = await response.json()
        const discount = data.coupon.type === 'PERCENT'
          ? value * (data.coupon.value / 100)
          : Math.min(data.coupon.value, value)

        setCouponDiscount(discount)
      } else {
        setCouponDiscount(0)
        alert('Cupom inválido ou expirado')
      }
    } catch (error) {
      console.error('Error validating coupon:', error)
      setCouponDiscount(0)
    } finally {
      setValidatingCoupon(false)
    }
  }

  const calculateSplit = () => {
    const artist = artists.find(a => a.id === selectedArtist)
    if (!artist) return { finalValue: 0, artistShare: 0, studioShare: 0 }

    const finalValue = value - couponDiscount
    const artistShare = finalValue * (1 - artist.commissionRate)
    const studioShare = finalValue * artist.commissionRate

    return { finalValue, artistShare, studioShare }
  }

  const [isSuccess, setIsSuccess] = useState(false)

  const handleSuccessClose = () => {
    setIsSuccess(false)
    onClose()
  }

  const sendWhatsApp = () => {
    if (!slot || !selectedClient) return
    const client = clients.find(c => c.id === selectedClient)
    const artist = artists.find(a => a.id === selectedArtist)

    if (!client || !artist) return

    const date = new Date(slot.startTime).toLocaleDateString('pt-BR')
    const time = new Date(slot.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })

    const message = `Olá *${client.name}*! 👋%0A%0A` +
      `Seu agendamento para o dia *${date} às ${time}* com *${artist.user.name}* está pré-reservado! ✅%0A%0A` +
      `Para confirmar, por favor preencha nossa Ficha de Anamnese neste link:%0A` +
      `👉 https://docs.google.com/forms/d/1j4bgfWDHxrFkqkIu4dIkNmdypRGDjKbewXX81zrK5yU/viewform`

    window.open(`https://wa.me/?text=${message}`, '_blank')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!slot || !selectedArtist || !selectedClient) return

    setLoading(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId: selectedArtist,
          clientId: selectedClient,
          slotId: slot.id,
          value,
          couponCode: couponCode || undefined
        })
      })

      if (response.ok) {
        setIsSuccess(true) // Mostra a tela de sucesso em vez de fechar
        onBookingCreated()
        resetForm()
      } else {
        const error = await response.json()
        alert(error.error || 'Erro ao criar agendamento')
      }
    } catch (error) {
      console.error('Error creating booking:', error)
      alert('Erro ao criar agendamento')
    } finally {
      setLoading(false)
    }
  }

  if (!slot) return null

  // Render Success Screen
  if (isSuccess) {
    return (
      <Dialog open={open} onOpenChange={handleSuccessClose}>
        <DialogContent className="max-w-md text-center py-10">
          <div className="mx-auto w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mb-4 text-3xl">
            🎉
          </div>
          <DialogTitle className="text-2xl font-orbitron text-center mb-2">Agendamento Criado!</DialogTitle>
          <p className="text-muted-foreground mb-8">
            Agora envie a ficha de anamnese para o cliente confirmar o horário.
          </p>

          <div className="space-y-3">
            <Button onClick={sendWhatsApp} className="w-full bg-[#25D366] hover:bg-[#20bd5a] text-black h-12 text-lg font-bold shadow-[0_0_15px_rgba(37,211,102,0.4)]">
              Enviar via WhatsApp 📲
            </Button>
            <Button variant="outline" onClick={handleSuccessClose} className="w-full">
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // Regular Form Render
  const { finalValue, artistShare, studioShare } = calculateSplit()

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

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Novo Agendamento</DialogTitle>
          <p className="text-muted-foreground">
            Maca {slot.macaId} • {formatTimeSlot(slot.startTime, slot.endTime)}
          </p>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Artista</label>
              <Select
                value={selectedArtist}
                onChange={(e) => setSelectedArtist(e.target.value)}
                required
              >
                <option value="">Selecione um artista</option>
                {artists.map(artist => (
                  <option key={artist.id} value={artist.id}>
                    {artist.user.name} ({artist.plan})
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Cliente</label>
              <Select
                value={selectedClient}
                onChange={(e) => setSelectedClient(e.target.value)}
                required
              >
                <option value="">Selecione um cliente</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>
                    {client.name}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">
              Valor (mínimo {formatCurrency(400)})
            </label>
            <Input
              type="number"
              min="400"
              step="0.01"
              value={value}
              onChange={(e) => setValue(Number(e.target.value))}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Cupom de Desconto</label>
            <div className="flex gap-2">
              <Input
                type="text"
                placeholder="Código do cupom"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
              />
              <Button
                type="button"
                variant="outline"
                onClick={validateCoupon}
                disabled={!couponCode || !selectedArtist || validatingCoupon}
              >
                {validatingCoupon ? 'Validando...' : 'Validar'}
              </Button>
            </div>
            {couponDiscount > 0 && (
              <p className="text-sm text-green-400 mt-1">
                Desconto aplicado: {formatCurrency(couponDiscount)}
              </p>
            )}
          </div>

          {/* Preview do split */}
          {selectedArtist && (
            <div className="bg-accent p-4 rounded-lg space-y-2">
              <h4 className="font-medium">Preview do Pagamento</h4>
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Valor Total:</span>
                  <div className="font-medium">{formatCurrency(finalValue)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Artista:</span>
                  <div className="font-medium text-green-400">{formatCurrency(artistShare)}</div>
                </div>
                <div>
                  <span className="text-muted-foreground">Estúdio:</span>
                  <div className="font-medium text-secondary">{formatCurrency(studioShare)}</div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? 'Criando...' : 'Confirmar Agendamento'}
            </Button>
          </div>

          {/* Seção Google Calendar */}
          <div className="mt-4 p-3 bg-gray-800/50 rounded-lg border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-white">Sincronizar com Google Calendar</p>
                <p className="text-xs text-gray-400">Adicione automaticamente ao seu calendário</p>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={() => {
                  alert('Conecte-se em /auth/signin para ativar a sincronização')
                }}
              >
                <svg className="w-4 h-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" />
                </svg>
                Conectar
              </Button>
            </div>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default BookingModal

