'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, ShieldCheck, HeartPulse, Activity, AlertCircle, CheckCircle2, Instagram, DollarSign, PenTool } from 'lucide-react'
import { saveAnamnesis } from '@/app/actions/anamnesis'
import { SignatureCanvas } from '@/components/SignatureCanvas'

export default function FichaAnamnesePage() {
    const params = useParams()
    const router = useRouter()
    const bookingId = params.bookingId as string

    const [loading, setLoading] = useState(false)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        fullName: '',
        whatsapp: '',
        birthDate: '',
        medicalConditionsTattoo: '',
        medicalConditionsHealing: '',
        medicalConditionsHealingDetails: '',
        knownAllergies: '',
        artistHandle: '',
        artDescription: '',
        agreedValue: '',
        understandPermanence: false,
        followInstructions: false,
        acceptedTerms: false,
        allowSharing: false,
        signatureData: ''
    })

    // Fetch initial data to pre-fill
    React.useEffect(() => {
        const fetchInitialData = async () => {
            try {
                const response = await fetch(`/api/bookings/${bookingId}`)
                if (response.ok) {
                    const data = await response.json()
                    setFormData(prev => ({
                        ...prev,
                        fullName: data.client?.name || '',
                        whatsapp: data.client?.phone || '',
                        artistHandle: data.artist?.instagram || '',
                        agreedValue: data.finalValue?.toString() || ''
                    }))
                }
            } catch (error) {
                console.error('Error fetching booking data:', error)
            }
        }
        if (bookingId) fetchInitialData()
    }, [bookingId])

    const toggleBoolean = (field: 'understandPermanence' | 'followInstructions' | 'acceptedTerms') => {
        setFormData(prev => ({ ...prev, [field]: !prev[field] }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!formData.acceptedTerms || !formData.signatureData) {
            alert('Você precisa aceitar os termos e assinar o prontuário para finalizar.')
            return
        }

        setLoading(true)
        try {
            const result = await saveAnamnesis(bookingId, formData)

            if (result.success) {
                setSuccess(true)
            } else {
                alert(result.error || 'Erro ao salvar ficha')
            }
        } catch (error) {
            console.error('Error:', error)
            alert('Erro de conexão')
        } finally {
            setLoading(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-4">
                <div className="max-w-md w-full text-center space-y-6 animate-in fade-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto border border-primary/30">
                        <CheckCircle2 className="text-primary w-10 h-10" />
                    </div>
                    <h1 className="text-3xl font-orbitron text-white italic font-black uppercase tracking-tighter">Ficha Finalizada</h1>
                    <p className="text-zinc-400 font-mono text-sm uppercase tracking-widest">Seu prontuário foi criptografado e enviado ao seu artista com sucesso.</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black text-white py-12 px-4 selection:bg-primary/30">
            {/* Background Effects */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 blur-[120px] rounded-full" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 blur-[120px] rounded-full" />
            </div>

            <div className="max-w-2xl mx-auto relative z-10 space-y-8">
                <header className="text-center space-y-4 mb-12">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-primary text-[10px] font-mono mb-2 tracking-widest uppercase">
                        <ShieldCheck size={12} />
                        KRONØS DATA ARMOR PROTOCØL
                    </div>
                    <h1 className="text-4xl md:text-5xl font-orbitron font-black tracking-tighter bg-gradient-to-b from-white to-zinc-500 bg-clip-text text-transparent italic uppercase">
                        Ficha de <span className="text-zinc-600 font-normal">Anamnese</span>
                    </h1>
                    <p className="text-zinc-500 font-mono text-[11px] uppercase tracking-widest">Responda com honestidade para sua segurança</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Section 0: Personal Data */}
                    <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <PenTool className="text-primary" size={20} />
                            <h2 className="text-lg font-orbitron font-bold uppercase tracking-wider italic">Identificação</h2>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Nome Completo</label>
                                <Input
                                    className="bg-white/5 border-white/10 rounded-xl h-12 focus:ring-primary/50"
                                    value={formData.fullName}
                                    onChange={e => setFormData({ ...formData, fullName: e.target.value })}
                                    placeholder="Como no seu documento"
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">WhatsApp</label>
                                    <Input
                                        className="bg-white/5 border-white/10 rounded-xl h-12 focus:ring-primary/50"
                                        value={formData.whatsapp}
                                        onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                        placeholder="(00) 00000-0000"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Data de Nascimento</label>
                                    <Input
                                        type="date"
                                        className="bg-white/5 border-white/10 rounded-xl h-12 focus:ring-primary/50"
                                        value={formData.birthDate || ''}
                                        onChange={e => setFormData({ ...formData, birthDate: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                    {/* Section 1: Medical History */}
                    <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <HeartPulse className="text-primary" size={20} />
                            <h2 className="text-lg font-orbitron font-bold uppercase tracking-wider italic">Histórico Clínico</h2>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                                    CONDIÇÕES QUE PODEM AFETAR A TATUAGEM? (Ex: Diabetes, Epilepsia, Alergias)
                                </label>
                                <Textarea
                                    placeholder="Descreva aqui ou digite 'Nenhuma'..."
                                    value={formData.medicalConditionsTattoo}
                                    onChange={(e) => setFormData(prev => ({ ...prev, medicalConditionsTattoo: e.target.value }))}
                                    className="bg-zinc-900/50 border-white/5 focus:border-primary/50 min-h-[80px] rounded-2xl text-sm"
                                />
                            </div>

                            <div className="space-y-4">
                                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                                    CONDIÇÃO MÉDICA QUE AFETE A CICATRIZAÇÃO?
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {['SIM', 'NÃO'].map((opt) => (
                                        <button
                                            key={opt}
                                            type="button"
                                            onClick={() => setFormData(prev => ({ ...prev, medicalConditionsHealing: opt }))}
                                            className={`p-3 rounded-xl border text-xs font-bold transition-all ${formData.medicalConditionsHealing === opt
                                                ? 'bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.2)]'
                                                : 'bg-zinc-900/40 border-white/5 text-zinc-500 hover:border-white/10'
                                                }`}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>
                                {formData.medicalConditionsHealing === 'SIM' && (
                                    <Input
                                        placeholder="Se sim, qual?"
                                        value={formData.medicalConditionsHealingDetails}
                                        onChange={(e) => setFormData(prev => ({ ...prev, medicalConditionsHealingDetails: e.target.value }))}
                                        className="bg-zinc-900/50 border-white/5 focus:border-primary/50 rounded-xl text-sm animate-in slide-in-from-top-2 duration-300"
                                    />
                                )}
                            </div>

                            <div className="space-y-3 pt-2">
                                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">
                                    ALERGIAS CONHECIDAS (TINTAS, MATERIAIS, CURATIVOS)
                                </label>
                                <Input
                                    placeholder="Ex: Pigmento vermelho, Iodo, Látex..."
                                    value={formData.knownAllergies}
                                    onChange={(e) => setFormData(prev => ({ ...prev, knownAllergies: e.target.value }))}
                                    className="bg-zinc-900/50 border-white/5 focus:border-primary/50 h-12 rounded-2xl text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 2: Project Details */}
                    <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 space-y-6">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <PenTool className="text-blue-500" size={20} />
                            <h2 className="text-lg font-orbitron font-bold uppercase tracking-wider italic">Detalhes do Projeto</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <Instagram size={10} /> @ DA(O) ARTISTA
                                </label>
                                <Input
                                    placeholder="@artista"
                                    value={formData.artistHandle}
                                    onChange={(e) => setFormData(prev => ({ ...prev, artistHandle: e.target.value }))}
                                    className="bg-zinc-900/50 border-white/5 focus:border-blue-500/50 h-12 rounded-2xl text-sm"
                                />
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest flex items-center gap-2">
                                    <DollarSign size={10} /> VALOR ACERTADO
                                </label>
                                <Input
                                    placeholder="R$ 0,00"
                                    value={formData.agreedValue}
                                    onChange={(e) => setFormData(prev => ({ ...prev, agreedValue: e.target.value }))}
                                    className="bg-zinc-900/50 border-white/5 focus:border-blue-500/50 h-12 rounded-2xl text-sm font-mono"
                                />
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest">QUAL A ARTE? (DESCRIÇÃO DO PROJETO)</label>
                                <Input
                                    placeholder="Ex: Dragão no braço, Mural floral..."
                                    value={formData.artDescription}
                                    onChange={(e) => setFormData(prev => ({ ...prev, artDescription: e.target.value }))}
                                    className="bg-zinc-900/50 border-white/5 focus:border-blue-500/50 h-12 rounded-2xl text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Section 3: Legal & Signature */}
                    <div className="glass-card p-6 md:p-8 rounded-3xl border border-white/5 space-y-6 bg-gradient-to-br from-primary/5 to-transparent">
                        <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                            <ShieldCheck className="text-primary" size={20} />
                            <h2 className="text-lg font-orbitron font-bold uppercase tracking-wider italic">Consentimento & Assinatura</h2>
                        </div>

                        <div className="space-y-4">
                            <button
                                type="button"
                                onClick={() => toggleBoolean('understandPermanence')}
                                className="flex items-start gap-3 w-full text-left group"
                            >
                                <div className={`mt-1 w-5 h-5 rounded border transition-all flex-shrink-0 flex items-center justify-center ${formData.understandPermanence ? 'bg-primary border-primary' : 'bg-white/5 border-white/20 group-hover:border-white/40'
                                    }`}>
                                    {formData.understandPermanence && <CheckCircle2 size={14} className="text-white" />}
                                </div>
                                <span className="text-xs text-zinc-400 leading-relaxed font-mono uppercase tracking-tight">Eu compreendo que a tatuagem é permanente e que os resultados podem variar.</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => toggleBoolean('followInstructions')}
                                className="flex items-start gap-3 w-full text-left group"
                            >
                                <div className={`mt-1 w-5 h-5 rounded border transition-all flex-shrink-0 flex items-center justify-center ${formData.followInstructions ? 'bg-primary border-primary' : 'bg-white/5 border-white/20 group-hover:border-white/40'
                                    }`}>
                                    {formData.followInstructions && <CheckCircle2 size={14} className="text-white" />}
                                </div>
                                <span className="text-xs text-zinc-400 leading-relaxed font-mono uppercase tracking-tight">Eu seguirei todas as instruções de pós-procedimento.</span>
                            </button>

                            <button
                                type="button"
                                onClick={() => setFormData(prev => ({ ...prev, allowSharing: !prev.allowSharing }))}
                                className="flex items-start gap-3 w-full text-left group border border-primary/20 bg-primary/5 p-4 rounded-xl"
                            >
                                <div className={`mt-1 w-5 h-5 rounded border transition-all flex-shrink-0 flex items-center justify-center ${formData.allowSharing ? 'bg-primary border-primary' : 'bg-white/5 border-primary/20 group-hover:border-primary/40'
                                    }`}>
                                    {formData.allowSharing && <CheckCircle2 size={14} className="text-white" />}
                                </div>
                                <div className="space-y-1">
                                    <span className="text-xs text-primary font-bold font-mono uppercase tracking-tight">Autorizo o compartilhamento seguro</span>
                                    <p className="text-[10px] text-zinc-500 leading-relaxed font-mono uppercase">
                                        Autorizo que meus dados médicos sejam compartilhados entre os profissionais deste estúdio para facilitar agendamentos futuros e garantir minha segurança.
                                    </p>
                                </div>
                            </button>

                            <div className="pt-4 border-t border-white/5 space-y-4">
                                <p className="text-[10px] text-zinc-500 italic mb-4 leading-relaxed font-mono uppercase">
                                    "Eu confirmo que todas as informações fornecidas na ficha de anamnese estão corretas. Se eu tiver alguma condição médica que possa afetar a cicatrização da tatuagem ou minha saúde durante o procedimento, informarei o tatuador."
                                </p>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-widest ml-1">Assinatura Digital</label>
                                    <SignatureCanvas
                                        onSave={(data) => setFormData(prev => ({ ...prev, signatureData: data }))}
                                        onClear={() => setFormData(prev => ({ ...prev, signatureData: '' }))}
                                    />
                                </div>

                                <button
                                    type="button"
                                    onClick={() => toggleBoolean('acceptedTerms')}
                                    className={`w-full py-4 rounded-xl font-orbitron font-black text-sm transition-all border ${formData.acceptedTerms
                                        ? 'bg-primary/20 border-primary text-primary'
                                        : 'bg-white/5 border-white/10 text-zinc-600'
                                        }`}
                                >
                                    {formData.acceptedTerms ? 'ACEITE CONFIRMADO' : 'LI E ACEITO OS TERMOS'}
                                </button>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full h-16 rounded-2xl bg-white text-black hover:bg-zinc-200 text-sm font-orbitron font-black shadow-xl active:scale-[0.98] transition-all uppercase tracking-[0.2em] italic"
                    >
                        {loading ? (
                            <Loader2 className="animate-spin" />
                        ) : (
                            "Finalizar e Sincronizar"
                        )}
                    </Button>
                </form>
            </div>
        </div>
    )
}
