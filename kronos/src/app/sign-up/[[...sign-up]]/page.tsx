'use client'

import React from 'react'
import { BrandLogo } from '@/components/ui/brand-logo'
import { GooeyButton } from '@/components/ui/GooeyButton'
import { Lock } from 'lucide-react'
import Link from 'next/link'

export default function CustomSignUpPage() {
    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Holographic Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[size:30px_30px] opacity-20" />
            
            {/* Scanline Ambient FX */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_6px_100%] pointer-events-none" />

            {/* Glowing Nebulas */}
            <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-red-600/10 blur-[130px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-purple-600/10 blur-[130px] rounded-full animate-pulse pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-zinc-950/40 backdrop-blur-xl border border-red-500/10 p-8 rounded-3xl shadow-2xl space-y-8 relative">
                    
                    {/* Header Logo & Title */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <BrandLogo size={55} className="mb-2" />
                        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center border border-red-500/20">
                            <Lock className="w-8 h-8 text-red-500" />
                        </div>
                        <h2 className="text-2xl font-orbitron font-bold text-white tracking-widest uppercase">
                            ACESSO RESTRITO
                        </h2>
                        
                        <p className="text-zinc-400 text-[11px] font-mono leading-relaxed tracking-wider uppercase">
                            O ecossistema Kronos opera sob regime de 
                            <span className="text-red-400 font-bold block mt-1">Soberania Fechada</span>
                        </p>
                    </div>

                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center space-y-3">
                        <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                            A criação de novas credenciais não é pública. Você precisa de um <strong>Convite Oficial</strong> ou passar pela nossa triagem interna para integrar a rede.
                        </p>
                    </div>

                    {/* Submit Button */}
                    <Link href="/sign-in" className="block w-full">
                        <GooeyButton variant="secondary" className="w-full mt-2">
                            JÁ POSSUI CREDENCIAL? ENTRAR
                        </GooeyButton>
                    </Link>

                    {/* Footer */}
                    <div className="text-center pt-2">
                        <a href="https://instagram.com/sh1w4" target="_blank" rel="noopener noreferrer" className="text-zinc-600 text-[10px] font-mono uppercase tracking-wider hover:text-white transition-colors">
                            Solicitar Triagem de Acesso
                        </a>
                    </div>
                </div>
            </div>
        </div>
    )
}
