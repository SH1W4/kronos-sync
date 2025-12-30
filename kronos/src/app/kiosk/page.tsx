'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BrandLogo } from '@/components/ui/brand-logo'
import { GooeyButton } from '@/components/ui/GooeyButton'
import {
    ShoppingBag,
    Users,
    FileText,
    X,
    Instagram,
    CheckCircle2,
    Zap,
    Target,
    ShieldAlert,
    Compass,
    Smartphone
} from 'lucide-react'
import Link from 'next/link'
import { trackQrScan } from '@/app/actions/analytics'

// Custom Tattoo Machine Icon SVG (Refined & Elegant)
const TattooMachineIcon = ({ className }: { className?: string }) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" className="opacity-30" />
        <rect x="10" y="10" width="4" height="4" rx="1" />
        <path d="M12 8v2M12 14v2M10 12h4" className="opacity-60" />
        <path d="M7 21l10-10M17 21L7 11" className="opacity-10" />
    </svg>
)

export default function KioskPage() {
    const [showCompanionModal, setShowCompanionModal] = useState(false)
    const [showFichaModal, setShowFichaModal] = useState(false)
    const [loading, setLoading] = useState(false)
    const [successCode, setSuccessCode] = useState<string | null>(null)
    const [showIntroArt, setShowIntroArt] = useState(false)

    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        instagram: '',
        barrier: '',
        intent: '',
        artistPin: '',
        marketingOptIn: false
    })

    useEffect(() => {
        // Track Scan (Analytics)
        trackQrScan('KIOSK', 'KIOSK_MAIN_TERMINAL')

        if (showCompanionModal) {
            setShowIntroArt(true)
            const timer = setTimeout(() => setShowIntroArt(false), 2200)
            return () => clearTimeout(timer)
        }
    }, [showCompanionModal])

    const calculateSyncProgress = () => {
        let progress = 0
        if (formData.name.length > 2) progress += 15
        if (formData.phone.length > 8) progress += 15
        if (formData.instagram.length > 2) progress += 15
        if (formData.barrier) progress += 15
        if (formData.intent.length > 5) progress += 15
        if (formData.marketingOptIn) progress += 5
        if (formData.artistPin.length === 4) progress += 20
        return progress
    }

    const handleRegisterLead = async () => {
        setLoading(true)
        try {
            const { registerCompanionLead } = await import('@/app/actions/leads')
            const res = await registerCompanionLead(formData)

            if (res.success) {
                setSuccessCode(res.couponCode || 'KRONOS_MAGIC')
            } else {
                alert(res.message)
            }
        } catch (error) {
            console.error(error)
            alert('Erro ao processar convite INK PASS.')
        } finally {
            setLoading(false)
        }
    }

    const progress = calculateSyncProgress()

    return (
        <div className="min-h-screen bg-black flex flex-col items-center p-6 relative overflow-hidden data-pattern-grid">
            {/* Cyber Y2K Effects */}
            <div className="scanline" />

            {/* Visual HUD Decorative Elements (Top Corners) */}
            <div className="absolute top-4 left-4 font-mono text-[8px] text-gray-700 uppercase tracking-[0.4em] hidden md:block">
                SYS_STATUS: OPERATIONAL<br />
                LINK: NEURAL_ACTIVE
            </div>
            <div className="absolute top-4 right-4 font-mono text-[8px] text-gray-700 uppercase tracking-[0.4em] text-right hidden md:block">
                UP_TIME: 99.9%<br />
                AUTH_ENCRYPTED: YES
            </div>

            {/* Background "Ink Flow" Effects (Deep & Artistic) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.08]">
                {/* Simulated Ink Clouds */}
                <div className="absolute -top-1/4 -left-1/4 w-full h-full bg-gradient-radial from-white/20 to-transparent animate-ink-flow blur-3xl"></div>
                <div className="absolute -bottom-1/4 -right-1/4 w-full h-full bg-gradient-radial from-white/10 to-transparent animate-ink-flow-reverse blur-3xl"></div>

                {/* Arrival-Style Watermarks */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] border border-white/5 rounded-full border-dashed animate-spin-slow"></div>
            </div>

            {/* Content Container (Premium Minimalism) */}
            <div className="relative z-10 w-full max-w-sm flex flex-col items-center space-y-16 mt-20">

                {/* Simplified Brand Identity */}
                <div className="flex flex-col items-center space-y-6">
                    <BrandLogo size={120} animated={true} />
                    <div className="h-[2px] w-12 bg-primary/40 rounded-full"></div>
                </div>

                {/* Focused Primary Actions (Dual Core) */}
                <div className="w-full space-y-8">

                    {/* Primary Action 1: Companion (INK PASS) */}
                    <div className="space-y-4">
                        <GooeyButton
                            onClick={() => setShowCompanionModal(true)}
                            variant="primary"
                            className="h-28 rounded-[2.5rem] shadow-[0_0_40px_rgba(0,255,136,0.15)] group relative"
                        >
                            <div className="flex flex-col items-center justify-center space-y-1">
                                <div className="flex items-center space-x-3 z-10">
                                    <Users className="w-6 h-6 animate-pulse" />
                                    <span className="tracking-[0.2em] font-black uppercase text-lg">Sou Acompanhante</span>
                                </div>
                                <span className="text-[10px] font-mono opacity-80 z-10 tracking-[0.3em] uppercase">
                                    r e s g a t a r _ i n k _ p a s s
                                </span>
                            </div>
                        </GooeyButton>
                        <p className="text-[9px] font-mono text-gray-500 text-center uppercase tracking-[0.2em] leading-relaxed px-6 opacity-60">
                            Solicite o PIN da sessão ao seu artista
                        </p>
                    </div>

                    {/* Primary Action 2: Store (Direct Sales) */}
                    <div className="pt-2">
                        <Link href="/marketplace" className="block group">
                            <Button
                                className="w-full h-20 text-sm font-orbitron border border-white/10 bg-white hover:bg-primary hover:text-black text-black transition-all duration-500 flex items-center justify-center space-x-4 rounded-[2.2rem] shadow-xl group"
                            >
                                <div className="p-2 bg-black/5 rounded-full group-hover:bg-black/10 transition-colors">
                                    <ShoppingBag className="w-5 h-5 text-black" />
                                </div>
                                <span className="tracking-[0.3em] font-black uppercase pixel-text">VISITAR LOJA</span>
                            </Button>
                        </Link>
                    </div>

                    {/* Legacy / Utility Link (Minimal but Real Highlight) */}
                    <div className="flex flex-col items-center pt-8 space-y-4">
                        <Button
                            onClick={() => setShowFichaModal(true)}
                            className="text-[11px] font-mono text-gray-500 hover:text-white transition-all bg-white/[0.02] border border-white/5 hover:border-white/20 flex items-center space-x-3 px-10 py-6 rounded-2xl group shadow-sm"
                            variant="ghost"
                        >
                            <div className="p-1.5 bg-white/5 rounded-lg group-hover:bg-primary/10 transition-colors">
                                <FileText className="w-4 h-4 opacity-40 group-hover:opacity-100 group-hover:text-primary transition-all" />
                            </div>
                            <span className="tracking-[0.4em] uppercase font-bold">Minha Ficha</span>
                        </Button>
                        <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest opacity-40">
                            Acesse sua anamnese segura
                        </p>
                    </div>
                </div>

                {/* Connect Section (Social Engagement) */}
                <div className="pt-12 w-full max-w-[200px] flex flex-col items-center space-y-4">
                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
                    <div className="flex items-center space-x-8">
                        <Link href="https://instagram.com" target="_blank" className="group">
                            <Instagram className="w-5 h-5 text-gray-600 group-hover:text-primary transition-all duration-300 transform group-hover:scale-110" />
                        </Link>
                        <Link href="/portfolio" className="group">
                            <Compass className="w-5 h-5 text-gray-600 group-hover:text-primary transition-all duration-300 transform group-hover:scale-110" />
                        </Link>
                    </div>
                    <p className="text-[8px] font-mono text-gray-700 uppercase tracking-[0.6em] animate-pulse">Connect</p>
                </div>

                {/* Elegant Footer Decor */}
                <div className="pt-12 flex flex-col items-center space-y-4 opacity-30">
                    <div className="flex gap-1.5">
                        {[1, 2, 3].map(i => (
                            <div
                                key={i}
                                className="w-0.5 h-0.5 rounded-full bg-white animate-pulse"
                                style={{ animationDelay: `${i * 0.3}s` }}
                            ></div>
                        ))}
                    </div>
                    <p className="text-[8px] font-mono text-gray-400 uppercase tracking-[0.5em] text-center">
                        Digital Experience by Symbeon
                    </p>
                </div>
            </div>

            {/* Companion Capture Modal (INK PASS) */}
            {showCompanionModal && (
                <div className="fixed inset-0 z-50 bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4 overflow-y-auto relative">
                    <div className="scanline" />

                    {/* Artistic Watermarks for Modal - Integration of arrival_symbols */}
                    <div className="absolute inset-0 pointer-events-none overflow-hidden opacity-[0.05] grayscale invert flex items-center justify-center">
                        <img src="docs/assets/arrival_symbols.png" alt="watermark" className="w-[120%] h-auto animate-spin-slow opacity-20" />
                    </div>

                    <div className="bg-gray-950 border border-white/5 w-full max-w-sm rounded-[3.5rem] p-10 space-y-8 relative my-auto shadow-[0_0_80px_rgba(0,0,0,0.8)] overflow-hidden">

                        {/* Elegant Machine Intro */}
                        {showIntroArt && (
                            <div className="absolute inset-0 z-[60] bg-gray-950 rounded-[3.5rem] flex flex-col items-center justify-center space-y-8 animate-out fade-out duration-1000 fill-mode-forwards">
                                <TattooMachineIcon className="w-20 h-20 text-primary animate-ink-pulse" />
                                <div className="text-center space-y-2">
                                    <p className="text-[10px] font-mono text-primary/60 tracking-[0.6em] animate-pulse uppercase">Syncing</p>
                                    <h3 className="text-2xl font-orbitron font-black text-white tracking-widest italic uppercase">Ink Link</h3>
                                </div>
                            </div>
                        )}

                        {!successCode ? (
                            <>
                                <div className="absolute top-0 right-0 p-8 z-20">
                                    <button onClick={() => setShowCompanionModal(false)} className="text-gray-500 hover:text-white transition-colors">
                                        <X className="w-6 h-6" />
                                    </button>
                                </div>

                                <div className="space-y-8 relative z-10">
                                    {/* Sync Header */}
                                    <div className="space-y-6">
                                        <div className="flex items-center justify-between space-x-6">
                                            <div className="flex-1 h-3 bg-gray-900 rounded-full overflow-hidden border border-white/5 relative">
                                                <div
                                                    className="h-full bg-primary transition-all duration-1500 shadow-[0_0_20px_rgba(0,255,136,1)] relative z-10"
                                                    style={{ width: `${progress}%` }}
                                                >
                                                    <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)] animate-scanline-fast"></div>
                                                </div>
                                                <div className="absolute inset-0 bg-primary/5 pattern-grid opacity-20"></div>
                                            </div>
                                            <span className="text-[10px] font-mono text-primary font-black animate-pulse tracking-[0.1em] uppercase">{progress}% Sync</span>
                                        </div>

                                        <div className="text-center">
                                            <h2 className="text-4xl font-orbitron font-black tracking-tighter text-white uppercase italic pixel-text">INK PASS</h2>
                                            <p className="text-[11px] font-mono text-gray-300 uppercase tracking-widest mt-2 font-bold">
                                                ATIVE SEU CUPOM DE <span className="text-primary tracking-normal">10% OFF</span>
                                            </p>
                                        </div>
                                    </div>

                                    <div className="space-y-5">
                                        {/* Name & Phone Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="relative group">
                                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    placeholder="NOME"
                                                    className="bg-gray-900 border-white/10 h-14 rounded-2xl text-white text-[12px] font-mono pl-10 placeholder:text-gray-600 focus:border-primary/50 transition-all font-bold"
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                />
                                            </div>
                                            <div className="relative group">
                                                <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    placeholder="WHATSAPP"
                                                    className="bg-gray-900 border-white/10 h-14 rounded-2xl text-white text-[12px] font-mono pl-10 placeholder:text-gray-600 focus:border-primary/50 transition-all font-bold"
                                                    value={formData.phone}
                                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Instagram */}
                                        <div className="relative group">
                                            <Instagram className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                            <Input
                                                placeholder="INSTAGRAM (@SEUPERFIL)"
                                                className="bg-gray-900 border-white/10 h-16 rounded-[1.5rem] text-white text-[12px] font-mono pl-14 placeholder:text-gray-600 focus:border-primary/50 transition-all font-bold"
                                                value={formData.instagram}
                                                onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                                            />
                                        </div>

                                        {/* Barrier (The "Why") */}
                                        <div className="relative group space-y-2">
                                            <p className="text-[9px] font-mono text-gray-400 font-bold uppercase tracking-widest pl-3 flex items-center gap-2">
                                                <ShieldAlert className="w-3 h-3 text-secondary" />
                                                O QUE TE IMPEDE DE TATUAR HOJE?
                                            </p>
                                            <div className="relative">
                                                <select
                                                    className="w-full bg-gray-900 border border-white/10 h-16 rounded-[1.5rem] text-white text-[12px] font-mono px-14 appearance-none outline-none focus:border-primary/50 transition-all font-bold"
                                                    value={formData.barrier}
                                                    onChange={(e) => setFormData({ ...formData, barrier: e.target.value })}
                                                >
                                                    <option value="" className="bg-gray-950 text-gray-600">SELECIONE UMA BARREIRA</option>
                                                    <option value="PRECO" className="bg-gray-950">ORÇAMENTO / PREÇO (PRECISO DE 10%!)</option>
                                                    <option value="DOR" className="bg-gray-950">MEDO DA DOR (QUERO APOIO)</option>
                                                    <option value="ESTILO" className="bg-gray-950">NÃO ACHEI O ESTILO (PRECISO DE AJUDA)</option>
                                                    <option value="OUTRO" className="bg-gray-950">OUTRO MOTIVO</option>
                                                </select>
                                                <Compass className="absolute right-6 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-600 pointer-events-none" />
                                                <Target className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors pointer-events-none" />
                                            </div>
                                        </div>

                                        {/* Intent (The "Dream") */}
                                        <div className="relative group space-y-2">
                                            <p className="text-[9px] font-mono text-gray-400 font-bold uppercase tracking-widest pl-3 flex items-center gap-2">
                                                <Zap className="w-3 h-3 text-primary" />
                                                QUAL O SEU SONHO DE TATUAGEM?
                                            </p>
                                            <div className="relative">
                                                <Target className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 group-focus-within:text-primary transition-colors" />
                                                <Input
                                                    placeholder="EX: FECHAMENTO DE BRAÇO REALISTA"
                                                    className="bg-gray-900 border-white/10 h-16 rounded-[1.5rem] text-white text-[12px] font-mono pl-14 placeholder:text-gray-600 focus:border-primary/50 transition-all font-bold"
                                                    value={formData.intent}
                                                    onChange={(e) => setFormData({ ...formData, intent: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        {/* Artist PIN */}
                                        <div className="pt-8 border-t border-white/10 space-y-4">
                                            <div className="text-center space-y-1">
                                                <p className="text-[10px] font-mono text-secondary font-black uppercase tracking-[0.5em]">Session Master Key</p>
                                                <p className="text-[9px] font-mono text-gray-500 uppercase tracking-widest italic leading-none opacity-80 font-bold">
                                                    Solicite o PIN ao seu tatuador
                                                </p>
                                            </div>
                                            <div className="flex justify-center">
                                                <Input
                                                    placeholder="0000"
                                                    maxLength={4}
                                                    className="w-72 bg-secondary/5 border-secondary/20 h-24 rounded-[2.5rem] text-white text-center text-6xl font-orbitron tracking-[0.4em] placeholder:text-secondary/10 focus:border-secondary/50 transition-all shadow-[0_0_30px_rgba(255,100,255,0.05)] font-black"
                                                    value={formData.artistPin}
                                                    onChange={(e) => setFormData({ ...formData, artistPin: e.target.value })}
                                                />
                                            </div>
                                        </div>

                                        <div className="flex items-center space-x-4 px-3 pt-2">
                                            <input
                                                type="checkbox"
                                                id="mkt"
                                                className="accent-primary w-5 h-5 rounded-full border-white/20 bg-transparent"
                                                checked={formData.marketingOptIn}
                                                onChange={(e) => setFormData({ ...formData, marketingOptIn: e.target.checked })}
                                            />
                                            <label htmlFor="mkt" className="text-[10px] font-mono text-gray-400 font-bold uppercase leading-relaxed cursor-pointer select-none tracking-widest">
                                                Sincronizar com o canal restrito KRONØS (LGPD)
                                            </label>
                                        </div>
                                    </div>

                                    <Button
                                        className="w-full h-20 bg-white hover:bg-primary text-black font-black font-orbitron tracking-[0.3em] rounded-[2rem] transition-all shadow-2xl disabled:opacity-20 group overflow-hidden relative"
                                        disabled={progress < 100 || loading}
                                        onClick={handleRegisterLead}
                                    >
                                        <div className="absolute inset-0 bg-primary/20 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                                        <span className="relative z-10 text-xs">{loading ? 'STABILIZING LINK...' : 'CONNECT INK LINK'}</span>
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <div className="py-8 text-center space-y-10 animate-in zoom-in-95 duration-700 relative z-10">
                                <div className="flex justify-center">
                                    <div className="w-28 h-28 bg-primary/10 rounded-full flex items-center justify-center border border-primary/20 shadow-[0_0_50px_rgba(0,255,136,0.3)] animate-ink-pulse">
                                        <CheckCircle2 className="w-14 h-14 text-primary" />
                                    </div>
                                </div>
                                <div className="space-y-4">
                                    <h2 className="text-5xl font-orbitron font-black text-white tracking-widest italic uppercase">Sync'd</h2>
                                    <p className="text-[11px] font-mono text-gray-300 uppercase tracking-[0.3em] leading-relaxed italic px-6 font-bold">
                                        BOOOOM! ⚡️ Sua primeira tattoo com o KRONØS agora é prioridade.
                                    </p>
                                </div>

                                <div className="space-y-6">
                                    <div className="bg-white p-6 rounded-[2.5rem] flex items-center justify-center shadow-[0_0_40px_rgba(255,255,255,0.1)] group transition-transform hover:scale-105 duration-500">
                                        {/* Dynamic QR Code Integration - Using import would be better but qrcode.react is already in dependencies */}
                                        <div className="relative">
                                            {/* Mocking QR code visual for immediate feedback as qrcode.react requires component structure */}
                                            <div className="w-40 h-40 bg-black flex items-center justify-center rounded-2xl p-2">
                                                <div className="w-full h-full bg-white relative overflow-hidden flex flex-wrap gap-1 p-1">
                                                    {[...Array(64)].map((_, i) => (
                                                        <div key={i} className={`w-3.5 h-3.5 ${Math.random() > 0.5 ? 'bg-black' : 'bg-transparent'}`}></div>
                                                    ))}
                                                    <div className="absolute inset-x-0 bottom-1 flex justify-center">
                                                        <span className="text-[8px] font-black tracking-tighter text-black uppercase">INK LINK SCAN</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="absolute -top-3 -right-3 w-10 h-10 bg-primary rounded-full flex items-center justify-center shadow-lg border-4 border-white">
                                                <Zap className="w-5 h-5 text-black" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-black/80 border border-primary/20 p-8 rounded-[2.5rem] backdrop-blur-xl relative overflow-hidden group">
                                        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity animate-pulse"></div>
                                        <p className="text-[10px] font-mono text-primary/60 uppercase tracking-[0.6em] mb-4 relative z-10 font-bold">INK ACCESS KEY</p>
                                        <p className="text-4xl font-orbitron font-black text-white tracking-[0.2em] relative z-10">{successCode}</p>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-[0.2em] max-w-[240px] mx-auto leading-relaxed font-bold">
                                        ESCANEIE OU APRESENTE ESTA INTERFACE AO ARTISTA
                                    </p>
                                    <GooeyButton
                                        onClick={() => setShowCompanionModal(false)}
                                        variant="outline"
                                        className="h-16 rounded-2xl opacity-60 hover:opacity-100"
                                    >
                                        TERMINATE SESSION
                                    </GooeyButton>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )
            }

            {/* Ficha Info Modal (Refined) */}
            {
                showFichaModal && (
                    <div className="fixed inset-0 z-50 bg-black/98 backdrop-blur-3xl flex items-center justify-center p-4">
                        <div className="bg-gray-950 border border-white/5 w-full max-w-sm rounded-[3.5rem] p-12 text-center space-y-10 shadow-3xl relative overflow-hidden">

                            <div className="absolute inset-0 pointer-events-none opacity-[0.02]">
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 border border-white rounded-full border-dotted animate-spin-slow"></div>
                            </div>

                            <div className="flex justify-center">
                                <div className="p-8 bg-primary/5 rounded-full border border-primary/10 shadow-inner">
                                    <FileText className="w-12 h-12 text-primary/60" />
                                </div>
                            </div>
                            <div className="space-y-4">
                                <h2 className="text-2xl font-orbitron font-black text-white tracking-[0.1em] uppercase">Private Archive</h2>
                                <p className="text-xs text-gray-500 font-sans leading-relaxed tracking-wide px-4">
                                    Seu link seguro é transmitido via <strong className="text-primary/80">Ink Cloud</strong> direto no WhatsApp. Verifique suas mensagens.
                                </p>
                            </div>
                            <Button
                                onClick={() => setShowFichaModal(false)}
                                className="w-full h-16 bg-white/2 hover:bg-white/5 text-gray-500 font-mono uppercase text-[10px] tracking-[0.5em] rounded-[1.5rem] border border-white/5 transition-all"
                            >
                                CLOSE ARCHIVE
                            </Button>
                        </div>
                    </div>
                )
            }

            {/* Custom Premium Animations */}
            <style jsx global>{`
                @keyframes ink-flow {
                    0% { transform: translate(0, 0) scale(1); opacity: 0.1; }
                    50% { transform: translate(10%, 10%) scale(1.1); opacity: 0.15; }
                    100% { transform: translate(0, 0) scale(1); opacity: 0.1; }
                }

                @keyframes ink-flow-reverse {
                    0% { transform: translate(0, 0) scale(1.1); opacity: 0.08; }
                    50% { transform: translate(-10%, -5%) scale(1); opacity: 0.12; }
                    100% { transform: translate(0, 0) scale(1.1); opacity: 0.08; }
                }

                @keyframes ink-pulse {
                    0%, 100% { transform: scale(1); filter: drop-shadow(0 0 0px rgba(0, 255, 136, 0)); }
                    50% { transform: scale(1.05); filter: drop-shadow(0 0 15px rgba(0, 255, 136, 0.4)); }
                }

                .animate-ink-flow { animation: ink-flow 20s ease-in-out infinite; }
                .animate-ink-flow-reverse { animation: ink-flow-reverse 25s ease-in-out infinite; }
                .animate-ink-pulse { animation: ink-pulse 3s ease-in-out infinite; }

                @keyframes buzz-soft {
                    0%, 100% { transform: translate(0, 0); }
                    25% { transform: translate(1px, 1px); }
                    50% { transform: translate(-1px, 0.5px); }
                    75% { transform: translate(0.5px, -1px); }
                }

                .animate-buzz {
                    animation: buzz-soft 0.2s infinite;
                }

                .animate-spin-slow { animation: spin-slow 60s linear infinite; }
                .animate-reverse-spin { animation: reverse-spin 50s linear infinite; }

                .cyber-grid {
                    background-image: 
                        linear-gradient(to right, rgba(255, 255, 255, 0.02) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
                    background-size: 60px 60px;
                }
            `}</style>
        </div >
    )
}
