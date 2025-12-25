'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { BrandLogo } from '@/components/ui/brand-logo'
import { User, ShieldCheck, ArrowRight } from 'lucide-react'

export default function AuthSelectPage() {
    const router = useRouter()

    return (
        <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
            {/* Background FX */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-900/40 via-black to-black -z-10"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            <div className="max-w-2xl w-full relative z-10">
                <div className="flex justify-center mb-12">
                    <BrandLogo size={80} animated={true} />
                </div>

                <div className="text-center mb-12">
                    <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-4 tracking-tight uppercase">
                        BEM-VINDO AO KRONØS
                    </h1>
                    <p className="text-gray-400 font-mono text-xs md:text-sm uppercase tracking-widest leading-relaxed">
                        Identifique-se para configurar seu ambiente.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* CLIENTE CARD */}
                    <button
                        onClick={() => router.push('/kiosk')}
                        className="group relative p-8 bg-gray-900/30 border border-white/10 hover:border-[#00FF88]/50 hover:bg-gray-900/50 rounded-xl transition-all duration-300 text-left"
                    >
                        <div className="absolute top-4 right-4 text-gray-600 group-hover:text-[#00FF88] transition-colors">
                            <User size={24} />
                        </div>
                        <h3 className="text-xl font-bold font-orbitron mb-2 group-hover:text-[#00FF88]">CLIENTE</h3>
                        <p className="text-[10px] text-gray-500 font-mono leading-relaxed uppercase tracking-wider">
                            Quero agendar sessões, acompanhar meus projetos e ver meu histórico.
                        </p>
                        <div className="mt-6 flex items-center text-[10px] font-bold text-gray-500 group-hover:text-white transition-colors uppercase tracking-widest">
                            ACESSAR PAINEL <ArrowRight size={14} className="ml-2" />
                        </div>
                    </button>

                    {/* PROFISSIONAL CARD */}
                    <button
                        onClick={() => router.push('/auth/signin?callbackUrl=/onboarding?role=artist')}
                        className="group relative p-8 bg-gray-900/30 border border-white/10 hover:border-[#8B5CF6]/50 hover:bg-gray-900/50 rounded-xl transition-all duration-300 text-left"
                    >
                        <div className="absolute top-4 right-4 text-gray-600 group-hover:text-[#8B5CF6] transition-colors">
                            <ShieldCheck size={24} />
                        </div>
                        <h3 className="text-xl font-bold font-orbitron mb-2 group-hover:text-[#8B5CF6]">PROFISSIONAL</h3>
                        <p className="text-[10px] text-gray-500 font-mono leading-relaxed uppercase tracking-wider">
                            Sou tatuador, guest ou staff. Tenho um código de acesso ou convite.
                        </p>
                        <div className="mt-6 flex items-center text-[10px] font-bold text-gray-500 group-hover:text-white transition-colors uppercase tracking-widest">
                            FAZER LOGIN <ArrowRight size={14} className="ml-2" />
                        </div>
                    </button>
                </div>

                {/* Dev Mode Shortcut for Presentation */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mt-12 flex justify-center animate-pulse">
                        <button
                            onClick={() => {
                                const { signIn } = require('next-auth/react')
                                signIn('credentials', { username: 'dev', password: '123', callbackUrl: '/artist/dashboard' })
                            }}
                            className="px-6 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-full font-mono text-[10px] uppercase tracking-widest hover:bg-red-500 hover:text-white transition-all shadow-[0_0_20px_rgba(239,68,68,0.2)]"
                        >
                            🚀 ACESSO RÁPIDO: MODO PROFISSIONAL (DEV)
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
