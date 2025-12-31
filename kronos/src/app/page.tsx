'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/ui/brand-logo'
import { useSession } from 'next-auth/react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { X } from 'lucide-react'

// --- CONTENT CONFIGURATION ---
const FEATURES = [
    {
        id: 'studio',
        title: 'GESTÃO DE ESTÚDIO',
        subtitle: 'Controle integral de agenda e residentes.',
        colSpan: 'md:col-span-2',
        image: '/features/studio-management.png',
        description: `
            A visão "Studio Manager" oferece um panorama completo de todas as macas.
            Ideal para o gerente ou head artist acompanhar o fluxo do estúdio em tempo real.
            
            Funcionalidades:
            • Visualização de conflitos de horário.
            • Gestão de "Guests" e residentes.
            • Bloqueio de datas para eventos.
        `
    },
    {
        id: 'reception',
        title: 'RECEPÇÃO DIGITAL',
        subtitle: 'Auto-atendimento via Tablet ou QR Code.',
        colSpan: 'md:col-span-1',
        image: '/features/kiosk.png',
        description: `
            Modernize a chegada do seu cliente. Este módulo pode ser usado de duas formas:
            
            1. Tablet no Balcão: O cliente toca na tela e faz o check-in.
            2. QR Code: O cliente escaneia com o próprio celular e preenche a ficha enquanto aguarda.
            
            Elimina pranchetas e agiliza o início da sessão.
        `
    },
    {
        id: 'store',
        title: 'BOUTIQUE & ART',
        subtitle: 'Venda de prints e produtos exclusivos.',
        colSpan: 'md:col-span-1',
        image: '/features/marketplace.png',
        description: `
            Transforme sua arte em produtos escaláveis. 
            Gerencie o estoque de prints, camisetas e produtos de aftercare diretamente pelo sistema.
            O cliente pode adicionar itens à "conta" da sessão.
        `
    },
    {
        id: 'bi',
        title: 'BUSINESS INTELLIGENCE',
        subtitle: 'Métricas financeiras e performance.',
        colSpan: 'md:col-span-2',
        image: '/features/performance.png',
        description: `
            Dados claros para decisões estratégicas.
            Acompanhe o faturamento líquido, comissões pagas e ticket médio por cliente.
            Saiba exatamente qual artista está performando melhor e onde otimizar os custos.
        `
    }
]

export default function LandingPage() {
    const { data: session } = useSession()
    const [activeFeature, setActiveFeature] = useState<any>(null)

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans selection:bg-white selection:text-black">

            {/* Minimal Navbar */}
            <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-zinc-950/80 backdrop-blur-md">
                <div className="container mx-auto px-6 h-20 flex items-center justify-between">
                    <BrandLogo size={32} animated={false} />
                    <div className="flex items-center gap-8">
                        {session ? (
                            <Link href={((session.user as any).role === 'ARTIST' || (session.user as any).role === 'ADMIN') ? '/artist/dashboard' : '/kiosk'}>
                                <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-black font-medium tracking-wide text-xs h-9 px-6 uppercase transition-all">
                                    Meu Painel
                                </Button>
                            </Link>
                        ) : (
                            <Link href="/onboarding">
                                <Button variant="outline" className="border-white/20 text-white hover:bg-white hover:text-black font-medium tracking-wide text-xs h-9 px-6 uppercase transition-all">
                                    Login
                                </Button>
                            </Link>
                        )}
                    </div>
                </div>
            </nav>

            {/* Elegant Hero with ORIGINAL WALLPAPER & FONTS */}
            <section className="relative pt-40 pb-24 px-6 md:pt-52 md:pb-40 overflow-hidden">
                {/* RESTORED BACKGROUND IMAGE */}
                <Image
                    src="/hero-bg.png"
                    alt="Abstract Liquid Background"
                    fill
                    className="object-cover opacity-40 mix-blend-screen pointer-events-none"
                    priority
                />

                {/* Background Noise/Texture Overlay */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-soft-light"></div>

                {/* Subtle spotlight */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-white/5 blur-[100px] rounded-full pointer-events-none opacity-40"></div>

                <div className="container mx-auto max-w-4xl relative z-10 flex flex-col items-center text-center">
                    <div className="mb-8">
                        <BrandLogo size={140} variant="icon" animated={true} />
                    </div>

                    <h1 className="text-4xl md:text-6xl font-orbitron font-bold tracking-tight text-white mb-6 leading-tight">
                        Ordem absoluta para <br />
                        <span className="font-orbitron font-light text-zinc-400">estúdios de alto desempenho.</span>
                    </h1>

                    <p className="text-sm md:text-base text-zinc-400 max-w-xl font-mono leading-relaxed mb-10">
                        Soberania financeira, gestão de fluxo e inteligência de dados.
                        <br />A inteligência que organiza o seu fluxo e remove o ruído para você focar no seu legado.
                    </p>

                    <div className="flex gap-4">
                        <Link href={session ? (((session.user as any).role === 'ARTIST' || (session.user as any).role === 'ADMIN') ? '/artist/dashboard' : '/kiosk') : '/onboarding'}>
                            <Button className="h-12 px-8 bg-white text-black hover:bg-zinc-200 text-xs font-bold font-orbitron tracking-widest uppercase rounded flex items-center gap-2 shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:shadow-[0_0_30px_rgba(255,255,255,0.3)] transition-all">
                                {session ? 'ENTRAR NO SISTEMA' : 'ACESSAR FLOW'}
                            </Button>
                        </Link>
                    </div>
                </div>
            </section>

            {/* Elegant Features Grid */}
            <section id="features" className="py-24 px-6 bg-zinc-900/80 border-t border-white/10 backdrop-blur-sm">
                <div className="container mx-auto max-w-6xl">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                        {FEATURES.map((feature) => (
                            <div
                                key={feature.id}
                                onClick={() => setActiveFeature(feature)}
                                className={`
                                    ${feature.colSpan} 
                                    group relative h-[22rem] md:h-80 lg:h-96 overflow-hidden rounded-2xl bg-black border border-white/5 cursor-pointer 
                                    transition-all duration-700 hover:border-primary/40 hover:shadow-[0_0_50px_rgba(var(--primary-rgb),0.1)]
                                    active:scale-[0.98] active:border-primary/60
                                `}
                            >
                                {/* Image Background (B&W -> Color on Hover) */}
                                <div className="absolute inset-0 bg-zinc-950">
                                    <Image
                                        src={feature.image}
                                        alt={feature.title}
                                        fill
                                        className="object-cover opacity-50 grayscale group-hover:grayscale-0 group-hover:scale-105 group-hover:opacity-80 transition-all duration-700 ease-out"
                                    />
                                    {/* Gradient Overlay */}
                                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90 group-hover:opacity-60 transition-opacity duration-700"></div>
                                </div>

                                {/* Text Content */}
                                <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end z-10">
                                    <div className="transform translate-y-4 group-hover:translate-y-0 group-active:translate-y-0 transition-transform duration-700 ease-out">
                                        <p className="text-[9px] tracking-[0.3em] font-black text-primary/70 mb-3 uppercase font-mono drop-shadow-md">Módulo</p>
                                        <h3 className="text-2xl md:text-3xl font-orbitron font-black tracking-tighter text-white mb-3 group-hover:text-primary transition-colors text-glow">{feature.title}</h3>
                                        <div className="w-10 h-[2px] bg-white/20 mb-5 group-hover:w-20 group-hover:bg-primary transition-all duration-700"></div>
                                        <p className="text-xs md:text-sm text-zinc-400 font-mono tracking-wide opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-700 delay-100">
                                            {feature.subtitle}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <footer className="py-12 border-t border-white/5 text-center text-zinc-600 text-xs tracking-widest uppercase">
                <p>Kronos Sync &copy; {new Date().getFullYear()} // Estúdio Inteligente</p>
            </footer>

            {/* Feature Details Modal */}
            <Dialog open={!!activeFeature} onOpenChange={() => setActiveFeature(null)}>
                <DialogContent className="bg-zinc-950 border border-zinc-800 text-zinc-100 max-w-2xl p-0 overflow-hidden">
                    <div className="relative h-48 w-full">
                        {activeFeature && (
                            <Image
                                src={activeFeature.image}
                                alt={activeFeature.title}
                                fill
                                className="object-cover opacity-80"
                            />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 to-transparent"></div>
                        <button
                            onClick={() => setActiveFeature(null)}
                            className="absolute top-4 right-4 p-2 bg-black/50 rounded-full hover:bg-white/10 transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="p-8">
                        <div className="mb-6">
                            <h2 className="text-2xl font-light tracking-tight text-white mb-1">{activeFeature?.title}</h2>
                            <p className="text-zinc-500 text-sm tracking-widest uppercase">{activeFeature?.subtitle}</p>
                        </div>

                        <div className="space-y-4 text-zinc-400 font-light leading-relaxed whitespace-pre-line">
                            {activeFeature?.description}
                        </div>

                        <div className="mt-8 flex justify-end">
                            <Button
                                onClick={() => setActiveFeature(null)}
                                variant="outline"
                                className="border-white/10 text-white hover:bg-white hover:text-black"
                            >
                                Fechar
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
