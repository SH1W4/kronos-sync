'use client'

import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createInvite } from '@/app/actions/invites'
import { Button } from '@/components/ui/button'
import { Ticket, Sparkles, Clock, ShieldCheck, ArrowLeft, Zap, Target } from 'lucide-react'

export default function InvitesPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [plan, setPlan] = useState<'RESIDENT' | 'GUEST'>('RESIDENT')
    const [duration, setDuration] = useState(30)
    const [customCode, setCustomCode] = useState('')

    async function handleGenerate() {
        setIsLoading(true)
        const res = await createInvite({
            role: "ARTIST",
            targetPlan: plan,
            durationDays: plan === 'GUEST' ? duration : undefined,
            customCode: customCode || undefined,
            maxUses: 1
        })

        if (res.success) {
            // Redirect back to Team page where the new key will be visible
            router.push('/artist/team')
        } else {
            alert(res.error || "Falha ao gerar protocolo.")
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 data-pattern-grid relative overflow-hidden">
            <div className="scanline" />

            <div className="max-w-3xl mx-auto space-y-12 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-white/5 pb-8">
                    <div className="space-y-1 text-center md:text-left">
                        <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                            <Sparkles size={14} className="text-primary animate-pulse" />
                            <span className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] font-black">Recruitment Protocol v2.1</span>
                        </div>
                        <h1 className="text-4xl font-black tracking-tighter uppercase italic">Gerar Credencial</h1>
                        <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">Configuração de Novo Membro do Silo</p>
                    </div>
                    <Link href="/artist/team">
                        <Button variant="ghost" className="text-gray-500 hover:text-white gap-2 font-mono text-[10px] tracking-widest">
                            <ArrowLeft size={14} /> CANCELAR_OPERACAO
                        </Button>
                    </Link>
                </div>

                {/* Form Console */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-8">
                        {/* Selector: Plan Type */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Target size={16} className="text-primary" />
                                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-black">Tipo de Acesso</label>
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => setPlan('RESIDENT')}
                                    className={`p-4 rounded-2xl border transition-all text-left space-y-2 ${plan === 'RESIDENT' ? 'bg-primary/10 border-primary shadow-[0_0_20px_rgba(var(--primary-rgb),0.1)]' : 'bg-white/2 border-white/5 hover:border-white/20'}`}
                                >
                                    <ShieldCheck size={18} className={plan === 'RESIDENT' ? 'text-primary' : 'text-gray-500'} />
                                    <div>
                                        <p className={`font-bold text-xs ${plan === 'RESIDENT' ? 'text-white' : 'text-gray-400'}`}>RESIDENTE</p>
                                        <p className="text-[9px] text-gray-600 font-mono uppercase">Vínculo Permanente</p>
                                    </div>
                                </button>
                                <button
                                    onClick={() => setPlan('GUEST')}
                                    className={`p-4 rounded-2xl border transition-all text-left space-y-2 ${plan === 'GUEST' ? 'bg-secondary/10 border-secondary shadow-[0_0_20px_rgba(var(--secondary-rgb),0.1)]' : 'bg-white/2 border-white/5 hover:border-white/20'}`}
                                >
                                    <Clock size={18} className={plan === 'GUEST' ? 'text-secondary' : 'text-gray-500'} />
                                    <div>
                                        <p className={`font-bold text-xs ${plan === 'GUEST' ? 'text-white' : 'text-gray-400'}`}>GUEST</p>
                                        <p className="text-[9px] text-gray-600 font-mono uppercase text-orange-500/50">Auto-Revogação</p>
                                    </div>
                                </button>
                            </div>
                        </div>

                        {/* Input: Duration (Conditional) */}
                        {plan === 'GUEST' && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="space-y-4"
                            >
                                <div className="flex items-center gap-2">
                                    <Clock size={16} className="text-orange-500" />
                                    <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-black">Janela de Acesso (Dias)</label>
                                </div>
                                <input
                                    type="number"
                                    value={duration}
                                    onChange={(e) => setDuration(Number(e.target.value))}
                                    className="w-full bg-orange-500/5 border border-orange-500/20 rounded-xl px-4 h-12 text-sm font-mono text-orange-400 focus:outline-none focus:border-orange-500/50"
                                />
                                <p className="text-[9px] text-gray-600 font-mono italic">O acesso será encerrado automaticamente após este período.</p>
                            </motion.div>
                        )}

                        {/* Input: Custom Code */}
                        <div className="space-y-4">
                            <div className="flex items-center gap-2">
                                <Zap size={16} className="text-yellow-500" />
                                <label className="text-[10px] font-mono text-gray-400 uppercase tracking-widest font-black">Sufixo da Chave (Opcional)</label>
                            </div>
                            <input
                                type="text"
                                placeholder="EX: GUEST-JULHO"
                                value={customCode}
                                onChange={(e) => setCustomCode(e.target.value.toUpperCase())}
                                className="w-full bg-white/2 border border-white/10 rounded-xl px-4 h-12 text-sm font-mono text-white focus:outline-none focus:border-primary/50 placeholder:text-gray-700"
                            />
                        </div>
                    </div>

                    {/* Preview / Action */}
                    <div className="bg-gray-900/40 border border-white/5 p-8 rounded-3xl flex flex-col justify-between items-center text-center space-y-8 backdrop-blur-md">
                        <div className="space-y-4">
                            <div className="w-20 h-20 bg-primary/5 rounded-full flex items-center justify-center mx-auto border border-primary/20 shadow-[0_0_30px_rgba(var(--primary-rgb),0.1)]">
                                <Ticket size={40} className="text-primary" />
                            </div>
                            <h3 className="text-xl font-bold uppercase tracking-tight">Pronto para Gerar</h3>
                            <p className="text-xs text-gray-500 leading-relaxed font-mono px-4">
                                Esta credencial dará acesso imediato ao seu estúdio. <br />
                                <span className="text-white">Uso único por integrante.</span>
                            </p>
                        </div>

                        <Button
                            onClick={handleGenerate}
                            disabled={isLoading}
                            className="w-full bg-white text-black hover:bg-primary hover:text-black font-black h-14 rounded-2xl text-lg flex items-center justify-center gap-4 transition-all group scale-100 hover:scale-[1.02] active:scale-95 shadow-xl shadow-white/5"
                        >
                            {isLoading ? "PROCESANDO..." : "EXECUTAR PROTOCOLO"}
                            <Zap size={20} className="group-hover:fill-current" />
                        </Button>
                    </div>
                </div>

                {/* Warning Hud */}
                <div className="p-4 bg-red-500/5 border border-red-500/10 rounded-2xl flex items-center gap-4">
                    <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                    <p className="text-[9px] font-mono text-red-500/70 uppercase tracking-widest">
                        Ação Crítica: A geração de chaves deve ser feita apenas sob supervisão do mestre administrador.
                    </p>
                </div>
            </div>
        </div>
    )
}
