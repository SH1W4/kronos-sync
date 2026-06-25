'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { useToast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Loader2, CheckCircle, DollarSign, Calendar, User, ChevronDown, ChevronUp } from 'lucide-react'

interface Booking {
  id: string
  scheduledFor: string
  finalValue: number
  status: string
  client: {
    name: string
    email: string
  }
}

interface ArtistSettlement {
  artistId: string
  artistName: string
  artistEmail: string
  bookings: Booking[]
  totalValue: number
}

export default function AdminSettlementsPage() {
  const { user } = useUser()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [settlements, setSettlements] = useState<ArtistSettlement[]>([])
  const [expandedArtists, setExpandedArtists] = useState<Set<string>>(new Set())
  const [processing, setProcessing] = useState<string | null>(null)

  useEffect(() => {
    loadSettlements()
  }, [])

  const loadSettlements = async () => {
    try {
      const res = await fetch('/api/admin/settlements')
      if (!res.ok) throw new Error('Erro ao carregar comissões')
      
      const data = await res.json()
      setSettlements(data.data || [])
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const toggleArtist = (artistId: string) => {
    setExpandedArtists(prev => {
      const newSet = new Set(prev)
      if (newSet.has(artistId)) {
        newSet.delete(artistId)
      } else {
        newSet.add(artistId)
      }
      return newSet
    })
  }

  const finalizeSettlement = async (artistId: string, bookingIds: string[], totalValue: number) => {
    setProcessing(artistId)
    try {
      const res = await fetch('/api/admin/settlements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          artistId,
          bookingIds,
          totalValue,
          status: 'APPROVED'
        })
      })

      if (!res.ok) throw new Error('Erro ao finalizar comissão')

      toast({
        title: 'Sucesso',
        description: 'Comissão finalizada com sucesso'
      })

      // Remove o artista da lista após finalizar
      setSettlements(prev => prev.filter(s => s.artistId !== artistId))
    } catch (error: any) {
      toast({
        title: 'Erro',
        description: error.message,
        variant: 'destructive'
      })
    } finally {
      setProcessing(null)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Gerenciamento de Comissões</h1>
          <p className="text-gray-400">Finalize as comissões dos artistas manualmente</p>
        </div>

        {settlements.length === 0 ? (
          <Card className="bg-zinc-950 border-zinc-800">
            <CardContent className="p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <p className="text-gray-400">Nenhuma comissão pendente</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {settlements.map((settlement) => (
              <Card key={settlement.artistId} className="bg-zinc-950 border-zinc-800">
                <CardHeader className="pb-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-500/20 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-purple-500" />
                      </div>
                      <div>
                        <CardTitle className="text-white">{settlement.artistName}</CardTitle>
                        <p className="text-sm text-gray-400">{settlement.artistEmail}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-bold text-white">
                          R$ {settlement.totalValue.toFixed(2)}
                        </p>
                        <p className="text-sm text-gray-400">{settlement.bookings.length} agendamentos</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => toggleArtist(settlement.artistId)}
                      >
                        {expandedArtists.has(settlement.artistId) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                {expandedArtists.has(settlement.artistId) && (
                  <CardContent className="pt-0">
                    <div className="border-t border-zinc-800 pt-4 space-y-3">
                      {settlement.bookings.map((booking) => (
                        <div
                          key={booking.id}
                          className="flex items-center justify-between p-3 bg-zinc-900/50 rounded-lg"
                        >
                          <div className="flex items-center gap-3">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <div>
                              <p className="text-sm text-white">
                                {new Date(booking.scheduledFor).toLocaleDateString('pt-BR')}
                              </p>
                              <p className="text-xs text-gray-400">{booking.client.name}</p>
                            </div>
                          </div>
                          <Badge variant={booking.status === 'CONFIRMED' ? 'primary' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                      ))}
                    </div>

                    <div className="mt-4 pt-4 border-t border-zinc-800">
                      <Button
                        onClick={() =>
                          finalizeSettlement(
                            settlement.artistId,
                            settlement.bookings.map(b => b.id),
                            settlement.totalValue
                          )
                        }
                        disabled={processing === settlement.artistId}
                        className="w-full bg-green-600 hover:bg-green-700"
                      >
                        {processing === settlement.artistId ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Processando...
                          </>
                        ) : (
                          <>
                            <DollarSign className="w-4 h-4 mr-2" />
                            Finalizar Comissão
                          </>
                        )}
                      </Button>
                    </div>
                  </CardContent>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
