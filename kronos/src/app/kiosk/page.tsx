'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BrandLogo } from '@/components/ui/brand-logo'
import {
  User,
  Instagram,
  Phone,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  CalendarCheck
} from 'lucide-react'
import { getKioskArtists, getKioskAvailableSlots, createKioskBooking } from '@/app/actions/kiosk'

interface KioskArtist {
  id: string
  user: {
    name: string | null
    image: string | null
  }
  workspace: {
    id: string
    name: string
    primaryColor: string
  } | null
  instagram: string | null
}

export default function KioskPage() {
  const [step, setStep] = useState<1 | 2 | 3 | 'success'>(1)
  const [artists, setArtists] = useState<KioskArtist[]>([])
  const [loadingArtists, setLoadingArtists] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [submitting, setSubmitting] = useState(false)

  // Form states
  const [name, setName] = useState('')
  const [instagram, setInstagram] = useState('')
  const [phone, setPhone] = useState('')
  const [selectedArtistId, setSelectedArtistId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  const [workType, setWorkType] = useState('TATTOO')
  const [duration, setDuration] = useState(120) // in minutes
  const [notes, setNotes] = useState('')
  const [honeypot, setHoneypot] = useState('')

  // UI Feedback
  const [errorMessage, setErrorMessage] = useState('')

  // Fetch active artists on mount
  useEffect(() => {
    async function loadArtists() {
      try {
        const res = await getKioskArtists()
        if (res.success && res.artists) {
          setArtists(res.artists as any)
          if (res.artists.length > 0) {
            setSelectedArtistId(res.artists[0].id)
          }
        }
      } catch (err) {
        console.error('Erro ao buscar artistas:', err)
      } finally {
        setLoadingArtists(false)
      }
    }
    loadArtists()
  }, [])

  // Fetch available slots when artist, date, or duration changes in Step 2
  useEffect(() => {
    if (step === 2 && selectedArtistId && selectedDate) {
      async function loadSlots() {
        setLoadingSlots(true)
        setSelectedSlot('') // Reset selected slot
        try {
          const res = await getKioskAvailableSlots(selectedArtistId, selectedDate, duration)
          if (res.success && res.slots) {
            setAvailableSlots(res.slots)
          } else {
            setAvailableSlots([])
          }
        } catch (err) {
          console.error('Erro ao buscar slots:', err)
          setAvailableSlots([])
        } finally {
          setLoadingSlots(false)
        }
      }
      loadSlots()
    }
  }, [step, selectedArtistId, selectedDate, duration])

  // Validation for Step 1
  const validateStep1 = () => {
    setErrorMessage('')
    if (!name.trim()) {
      setErrorMessage('O nome é obrigatório.')
      return false
    }
    if (!instagram.trim() && !phone.trim()) {
      setErrorMessage('Por favor, informe pelo menos um contato: Instagram ou Telefone.')
      return false
    }
    if (!selectedArtistId) {
      setErrorMessage('Selecione o artista para o agendamento.')
      return false
    }
    return true
  }

  // Validation for Step 2
  const validateStep2 = () => {
    setErrorMessage('')
    if (!selectedDate) {
      setErrorMessage('Selecione uma data para a sessão.')
      return false
    }
    if (!selectedSlot) {
      setErrorMessage('Escolha um dos horários disponíveis.')
      return false
    }
    return true
  }

  const handleNextStep1 = () => {
    if (validateStep1()) {
      // Auto-set tomorrow's date if empty to facilitate interaction
      if (!selectedDate) {
        const tomorrow = new Date()
        tomorrow.setDate(tomorrow.getDate() + 1)
        setSelectedDate(tomorrow.toISOString().split('T')[0])
      }
      setStep(2)
    }
  }

  const handleNextStep2 = () => {
    if (validateStep2()) {
      setStep(3)
    }
  }

  const handleSubmit = async () => {
    setErrorMessage('')
    setSubmitting(true)

    // Assemble date + slot into ISO String
    // SelectedDate is 'YYYY-MM-DD', SelectedSlot is 'HH:MM'
    // Local Time (America/Sao_Paulo) conversion:
    const scheduledFor = `${selectedDate}T${selectedSlot}:00-03:00`

    const payload = {
      name,
      phone,
      instagram,
      artistId: selectedArtistId,
      scheduledFor,
      duration,
      type: workType,
      notes,
      honeypot
    }

    try {
      const res = await createKioskBooking(payload)
      if (res.success) {
        setStep('success')
      } else {
        setErrorMessage(res.error || 'Erro ao processar agendamento.')
      }
    } catch (err: any) {
      console.error('Erro na submissão:', err)
      setErrorMessage('Erro de comunicação com o servidor.')
    } finally {
      setSubmitting(false)
    }
  }

  const resetKiosk = () => {
    setName('')
    setInstagram('')
    setPhone('')
    setSelectedSlot('')
    setNotes('')
    setErrorMessage('')
    setStep(1)
  }

  const selectedArtist = artists.find(a => a.id === selectedArtistId)

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 relative overflow-hidden font-mono selection:bg-primary selection:text-black">
      {/* Cyber Y2K Scanlines */}
      <div className="scanline absolute inset-0 pointer-events-none z-50 opacity-10" />

      {/* Cyber Grid Background */}
      <div className="absolute inset-0 opacity-[0.03] pointer-events-none cyber-grid" />

      {/* Decorative HUD Details */}
      <div className="absolute top-4 left-4 text-[8px] text-gray-600 uppercase tracking-widest hidden md:block">
        TERMINAL: KIOSK_PUB_v0.4<br />
        SECURE_LINK: ACTIVE
      </div>
      <div className="absolute top-4 right-4 text-[8px] text-gray-600 uppercase tracking-widest text-right hidden md:block">
        LOC_TIME: {new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}<br />
        ENCRYPT: SHA-256
      </div>

      {/* Background radial Glows */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Core Layout */}
      <div className="w-full max-w-md flex flex-col items-center space-y-8 mt-12 relative z-10">
        
        {/* Brand identity */}
        <div className="flex flex-col items-center space-y-4">
          <BrandLogo size={100} animated={true} />
          <div className="h-[1px] w-24 bg-primary/30" />
          <p className="text-[10px] text-gray-400 uppercase tracking-[0.3em] text-center font-bold">
            Agendamento Rápido
          </p>
        </div>

        {/* Dynamic Card Container */}
        <div className="w-full bg-zinc-950 border border-white/5 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden">
          
          {/* Progress Indicators */}
          {step !== 'success' && (
            <div className="flex items-center justify-between px-2 pb-4 border-b border-white/5">
              <div className="flex items-center space-x-2">
                <span className={`text-[11px] font-bold ${step >= 1 ? 'text-primary' : 'text-gray-600'}`}>01 DADOS</span>
                <span className="text-gray-700 text-[10px]">/</span>
                <span className={`text-[11px] font-bold ${step >= 2 ? 'text-primary' : 'text-gray-600'}`}>02 QUANDO</span>
                <span className="text-gray-700 text-[10px]">/</span>
                <span className={`text-[11px] font-bold ${step >= 3 ? 'text-primary' : 'text-gray-600'}`}>03 DETALHES</span>
              </div>
              <span className="text-[10px] text-primary/60 bg-primary/5 px-2 py-0.5 rounded border border-primary/10">
                PASSO {step}/3
              </span>
            </div>
          )}

          {/* Error Feedbacks */}
          {errorMessage && (
            <div className="bg-red-950/40 border border-red-500/30 text-red-400 text-xs p-4 rounded-2xl flex items-start space-x-3">
              <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* STEP 1: Client Data & Artist Selection */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="space-y-2">
                <h2 className="text-sm uppercase tracking-wider text-primary font-bold">Seus Contatos</h2>
                <p className="text-[10px] text-gray-500 leading-normal">
                  Insira seu nome e pelo menos um canal de contato (Instagram ou Telefone).
                </p>
              </div>

              {/* Honeypot field (hidden from users) */}
              <input 
                type="text" 
                name="user_website" 
                value={honeypot} 
                onChange={(e) => setHoneypot(e.target.value)} 
                className="hidden" 
                autoComplete="off" 
              />

              <div className="space-y-4">
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Seu nome completo"
                    className="bg-black/40 border-white/10 h-12 rounded-xl text-white text-xs pl-10 placeholder:text-gray-600 focus:border-primary/50 transition-all font-mono"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="relative group">
                  <Instagram className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="Instagram (@perfil)"
                    className="bg-black/40 border-white/10 h-12 rounded-xl text-white text-xs pl-10 placeholder:text-gray-600 focus:border-primary/50 transition-all font-mono"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>

                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <Input
                    placeholder="WhatsApp/Telefone"
                    className="bg-black/40 border-white/10 h-12 rounded-xl text-white text-xs pl-10 placeholder:text-gray-600 focus:border-primary/50 transition-all font-mono"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <h3 className="text-xs uppercase tracking-wider text-primary font-bold">Escolha o Profissional</h3>
                {loadingArtists ? (
                  <div className="text-center py-4 text-xs text-gray-500 animate-pulse">
                    Carregando artistas do estúdio...
                  </div>
                ) : artists.length === 0 ? (
                  <div className="text-center py-4 text-xs text-gray-500">
                    Nenhum artista disponível no momento.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-2.5">
                    {artists.map((artist) => (
                      <button
                        key={artist.id}
                        type="button"
                        onClick={() => setSelectedArtistId(artist.id)}
                        className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all ${
                          selectedArtistId === artist.id
                            ? 'bg-primary/5 border-primary text-white shadow-[0_0_15px_rgba(0,255,136,0.1)]'
                            : 'bg-black/20 border-white/5 text-gray-400 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          {artist.user.image ? (
                            <img
                              src={artist.user.image}
                              alt={artist.user.name || 'Artista'}
                              className="w-8 h-8 rounded-full border border-white/10 object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 bg-zinc-800 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-400">
                              {artist.user.name?.charAt(0) || 'A'}
                            </div>
                          )}
                          <div>
                            <p className="text-xs font-bold">{artist.user.name || 'Sem nome'}</p>
                            <p className="text-[10px] text-gray-500 font-mono">
                              {artist.instagram || '@studio'}
                            </p>
                          </div>
                        </div>
                        {selectedArtistId === artist.id && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleNextStep1}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-black font-bold uppercase rounded-2xl transition-all flex items-center justify-center space-x-2 mt-4"
              >
                <span>Avançar</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* STEP 2: Date & Available Slots */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm uppercase tracking-wider text-primary font-bold">Data & Horário</h2>
                  <p className="text-[10px] text-gray-500">
                    Selecione a data para consultar horários livres de {selectedArtist?.user.name}.
                  </p>
                </div>
                <button
                  onClick={() => setStep(1)}
                  className="text-gray-500 hover:text-white transition-colors flex items-center space-x-1 text-[10px] uppercase font-bold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>
              </div>

              <div className="space-y-4">
                <div className="relative group">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                  <input
                    type="date"
                    min={new Date().toISOString().split('T')[0]}
                    className="w-full bg-black/40 border border-white/10 h-12 rounded-xl text-white text-xs pl-10 pr-4 placeholder:text-gray-600 focus:border-primary/50 transition-all font-mono outline-none"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs uppercase tracking-wider text-primary font-bold">Horários Disponíveis</h3>
                  {loadingSlots && <span className="text-[10px] text-primary/60 animate-pulse font-bold">CARREGANDO...</span>}
                </div>

                {loadingSlots ? (
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                      <div key={i} className="h-10 bg-zinc-900/40 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : !selectedDate ? (
                  <div className="text-center py-6 border border-white/5 border-dashed rounded-2xl text-[10px] text-gray-500">
                    SELECIONE UMA DATA PARA VER SLOT DISPONÍVEIS
                  </div>
                ) : availableSlots.length === 0 ? (
                  <div className="text-center py-6 border border-white/5 border-dashed rounded-2xl text-[10px] text-gray-500 space-y-2">
                    <Clock className="w-6 h-6 text-gray-600 mx-auto animate-pulse" />
                    <p>NENHUM HORÁRIO LIVRE NESTE DIA.</p>
                    <p className="text-[8px] text-gray-600">TENTE SELECIONAR OUTRA DATA ACIMA.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-4 gap-2">
                    {availableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => setSelectedSlot(slot)}
                        className={`h-11 rounded-xl text-xs font-mono font-bold transition-all border flex items-center justify-center ${
                          selectedSlot === slot
                            ? 'bg-primary border-primary text-black shadow-[0_0_15px_rgba(0,255,136,0.2)]'
                            : 'bg-black/40 border-white/5 text-gray-300 hover:border-white/10 hover:text-white'
                        }`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <Button
                onClick={handleNextStep2}
                disabled={!selectedSlot}
                className="w-full h-14 bg-primary hover:bg-primary/90 text-black font-bold uppercase rounded-2xl transition-all flex items-center justify-center space-x-2 mt-4 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <span>Avançar</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* STEP 3: Job Details & Customizations */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm uppercase tracking-wider text-primary font-bold">Detalhes do Job</h2>
                  <p className="text-[10px] text-gray-500">
                    Resumo do horário e especificações para o artista.
                  </p>
                </div>
                <button
                  onClick={() => setStep(2)}
                  className="text-gray-500 hover:text-white transition-colors flex items-center space-x-1 text-[10px] uppercase font-bold"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar</span>
                </button>
              </div>

              {/* Summary Hud */}
              <div className="bg-black/50 border border-white/5 rounded-2xl p-4 text-[11px] space-y-2 leading-relaxed">
                <div>
                  <span className="text-gray-500">CLIENTE:</span> <span className="font-bold text-white">{name}</span>
                </div>
                <div>
                  <span className="text-gray-500">ARTISTA:</span> <span className="font-bold text-white">{selectedArtist?.user.name}</span>
                </div>
                <div>
                  <span className="text-gray-500">AGENDA:</span> <span className="font-bold text-primary">{selectedDate.split('-').reverse().join('/')} às {selectedSlot}</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Work Type Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider pl-1 font-bold">Tipo de Trabalho</label>
                  <select
                    className="w-full bg-black/40 border border-white/10 h-12 rounded-xl text-white text-xs px-3 font-mono outline-none focus:border-primary/50 transition-all appearance-none"
                    value={workType}
                    onChange={(e) => setWorkType(e.target.value)}
                  >
                    <option value="TATTOO" className="bg-zinc-950">Tatuagem (Nova)</option>
                    <option value="RETOUCH" className="bg-zinc-950">Retoque / Cobertura</option>
                    <option value="PIERCING" className="bg-zinc-950">Piercing / Joia</option>
                    <option value="CONSULTATION" className="bg-zinc-950">Orçamento / Consulta</option>
                  </select>
                </div>

                {/* Duration Selection */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider pl-1 font-bold">Duração Estimada</label>
                  <select
                    className="w-full bg-black/40 border border-white/10 h-12 rounded-xl text-white text-xs px-3 font-mono outline-none focus:border-primary/50 transition-all appearance-none"
                    value={duration}
                    onChange={(e) => setDuration(Number(e.target.value))}
                  >
                    <option value={60} className="bg-zinc-950">Rápido (1 hora)</option>
                    <option value={120} className="bg-zinc-950">Médio (2 horas)</option>
                    <option value={180} className="bg-zinc-950">Longo (3 horas)</option>
                    <option value={240} className="bg-zinc-950">Sessão inteira (4 horas)</option>
                    <option value={360} className="bg-zinc-950">Fechamento (6 horas)</option>
                  </select>
                </div>

                {/* Observation / Idea Details */}
                <div className="space-y-1.5">
                  <label className="text-[10px] text-gray-400 uppercase tracking-wider pl-1 font-bold">Observações / Ideias</label>
                  <textarea
                    placeholder="Ex: Tatuagem no antebraço, estilo Blackwork. Quero algo com flores ou geométrico."
                    rows={4}
                    className="w-full bg-black/40 border border-white/10 rounded-xl text-white text-xs p-4 placeholder:text-gray-600 focus:border-primary/50 transition-all font-mono outline-none resize-none"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                  />
                </div>
              </div>

              <Button
                onClick={handleSubmit}
                disabled={submitting}
                className="w-full h-14 bg-white hover:bg-primary text-black font-bold uppercase rounded-2xl transition-all flex items-center justify-center space-x-2 mt-4 disabled:opacity-50"
              >
                {submitting ? (
                  <span className="animate-pulse">ENVIANDO REQUISIÇÃO...</span>
                ) : (
                  <>
                    <CalendarCheck className="w-5 h-5" />
                    <span>Concluir Agendamento</span>
                  </>
                )}
              </Button>
            </div>
          )}

          {/* SUCCESS SCREEN */}
          {step === 'success' && (
            <div className="text-center py-8 space-y-6">
              <div className="flex justify-center">
                <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-[0_0_30px_rgba(0,255,136,0.2)] animate-pulse">
                  <CheckCircle2 className="w-10 h-10 text-primary" />
                </div>
              </div>

              <div className="space-y-3">
                <h2 className="text-xl font-bold uppercase tracking-widest text-white italic">
                  Pedido Recebido
                </h2>
                <p className="text-xs text-gray-300 px-4 leading-relaxed">
                  Agendamento recebido, aguardando confirmação.
                </p>
                <p className="text-[10px] text-gray-500 px-6 leading-relaxed">
                  O artista entrará em contato em breve através do Instagram ou WhatsApp informado para acertar os valores e confirmar a sessão.
                </p>
              </div>

              <div className="pt-4">
                <Button
                  onClick={resetKiosk}
                  className="bg-zinc-900 border border-white/5 text-gray-400 hover:text-white hover:border-white/20 transition-all text-[10px] uppercase font-bold tracking-widest rounded-xl px-8 h-12"
                >
                  Novo Agendamento
                </Button>
              </div>
            </div>
          )}

        </div>

        {/* Studio branding at bottom */}
        {selectedArtist?.workspace && (
          <div className="text-center text-[9px] text-gray-600 uppercase tracking-widest opacity-60">
            Estúdio: {selectedArtist.workspace.name}
          </div>
        )}

        {/* Elegant Footer decorative element */}
        <div className="flex items-center space-x-1.5 opacity-30">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="w-1 h-1 rounded-full bg-white animate-pulse"
              style={{ animationDelay: `${i * 0.3}s` }}
            />
          ))}
        </div>

      </div>

      <style jsx global>{`
        .cyber-grid {
          background-image: 
            linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
          background-size: 40px 40px;
        }
        .scanline {
          background: linear-gradient(
            to bottom,
            rgba(255,255,255,0),
            rgba(255,255,255,0) 50%,
            rgba(0, 255, 136, 0.04) 50%,
            rgba(0, 255, 136, 0.04)
          );
          background-size: 100% 4px;
        }
      `}</style>
    </div>
  )
}
