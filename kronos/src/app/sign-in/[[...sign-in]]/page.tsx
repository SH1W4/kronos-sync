'use client'

import React, { useState } from 'react'
import { useSignIn } from '@clerk/nextjs'
import { BrandLogo } from '@/components/ui/brand-logo'
import { Loader2 } from 'lucide-react'

export default function CustomSignInPage() {
    const { isLoaded, signIn } = useSignIn()
    const callbackUrl = '/artist/dashboard'

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleGoogleSignIn = async () => {
        if (!isLoaded) return
        setLoading(true)
        setError('')
        try {
            await signIn.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: '/sso-callback',
                redirectUrlComplete: callbackUrl
            })
        } catch (err: any) {
            console.error('Google Sign In error:', err)
            setError('Erro ao autenticar com o Google.')
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Holographic Cyber Grid Background */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.015)_1px,_transparent_1px),_linear-gradient(90deg,_rgba(255,255,255,0.015)_1px,_transparent_1px)] bg-[size:30px_30px] opacity-20" />
            
            {/* Scanline Ambient FX */}
            <div className="absolute inset-0 bg-[linear-gradient(rgba(18,16,16,0)_50%,_rgba(0,0,0,0.25)_50%),_linear-gradient(90deg,_rgba(255,0,0,0.06),_rgba(0,255,0,0.02),_rgba(0,0,255,0.06))] bg-[size:100%_4px,_6px_100%] pointer-events-none" />

            {/* Glowing Nebulas */}
            <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-purple-600/10 blur-[130px] rounded-full animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-emerald-500/10 blur-[130px] rounded-full animate-pulse pointer-events-none" />

            <div className="relative z-10 w-full max-w-md">
                <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/5 p-8 rounded-3xl shadow-2xl space-y-8 relative">
                    
                    {/* Header Logo & Title */}
                    <div className="flex flex-col items-center text-center space-y-4">
                        <BrandLogo size={55} className="mb-2" />
                        <h2 className="text-2xl font-orbitron font-bold text-white tracking-widest uppercase">
                            IDENTIFICAÇÃO SOBERANA
                        </h2>
                        <p className="text-zinc-400 text-[11px] font-mono leading-relaxed tracking-wider uppercase">
                            Painel de Controle e Sincronização
                        </p>
                    </div>

                    <div className="bg-black/40 border border-white/5 p-4 rounded-xl text-center space-y-3">
                        <p className="text-xs text-zinc-500 font-sans leading-relaxed">
                            O ecossistema Kronos sincroniza automaticamente sua agenda profissional. Para acessar o painel, autentique-se com sua <strong>Conta Google profissional</strong>.
                        </p>
                    </div>

                    {/* Google OAuth Login */}
                    <button
                        onClick={handleGoogleSignIn}
                        type="button"
                        className="w-full flex items-center justify-center gap-4 bg-white text-black hover:bg-zinc-200 py-4 px-6 rounded-2xl transition-all duration-300 font-orbitron text-xs tracking-widest uppercase italic font-black active:scale-[0.98] shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                        disabled={loading}
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin text-black" /> : (
                            <>
                                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                                </svg>
                                CONECTAR IDENTIDADE GOOGLE
                            </>
                        )}
                    </button>

                    {/* Error Alert */}
                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs text-center font-mono uppercase tracking-wider">
                            {error}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
