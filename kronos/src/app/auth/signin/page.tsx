'use client'

import React, { useState, Suspense } from 'react'
import { BrandLogo } from '@/components/ui/brand-logo'
import { GooeyButton } from '@/components/ui/GooeyButton'
import { Input } from '@/components/ui/input'
import { ArrowRight, Loader2, Lock, Mail } from 'lucide-react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

function SignInContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const inviteCode = searchParams.get('invite') || ''
    const callbackUrl = searchParams.get('callbackUrl') || '/artist/dashboard'
    const registered = searchParams.get('registered')

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await signIn('credentials', {
                email,
                password,
                redirect: false,
                callbackUrl
            })

            if (res?.error) {
                setError('Credenciais inválidas.')
                setLoading(false)
            } else {
                router.push(callbackUrl)
                router.refresh()
            }
        } catch (err) {
            setError('Erro de conexão.')
            setLoading(false)
        }
    }

    // Auto-redirect to register if invite code is present?
    // User requested: "Ir direto para o Login" sends here.
    // "Inserir Código" sends to VerifyCode which sends to Register.

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 cyber-grid opacity-10"></div>

            <div className="cyber-card max-w-md w-full p-8 space-y-8 relative z-10 bg-black/80 backdrop-blur-sm">
                <div className="flex flex-col items-center text-center">
                    <BrandLogo size={60} className="mb-6" />
                    <h2 className="cyber-title text-2xl font-black mb-2 sr-only">ACESSO KRONOS</h2>
                    <p className="text-zinc-400 text-sm font-mono mt-2 uppercase">
                        {registered ? 'CONTA CRIADA. ACESSE AGORA.' : 'IDENTIFICAÇÃO SOBERANA'}
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase">Email</label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="pl-10 bg-black/40 border-white/10 text-white"
                                placeholder="seu@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase">Senha do Estúdio</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                            <Input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="pl-10 bg-black/40 border-white/10 text-white"
                                placeholder="••••••••"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-xs text-red-400 text-center">
                            {error}
                        </div>
                    )}

                    <GooeyButton
                        type="submit"
                        className="w-full"
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Validando...
                            </>
                        ) : (
                            <>
                                Acessar Painel
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </>
                        )}
                    </GooeyButton>
                </form>

                <div className="text-center space-y-4 pt-4 border-t border-white/5">
                    <p className="text-zinc-500 text-xs">
                        Novo por aqui?
                        <Link href="/onboarding?modal=code" className="text-white hover:underline ml-1">
                            Use seu Código de Convite
                        </Link>
                    </p>
                    <p className="text-zinc-600 text-[10px] uppercase tracking-widest">
                        Infraestrutura Segura v2.1
                    </p>
                </div>
            </div>
        </div>
    )
}

export default function SignInPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <SignInContent />
        </Suspense>
    )
}
