'use client'

import React, { useState } from 'react'
import { BrandLogo } from '@/components/ui/brand-logo'
import { GooeyButton } from '@/components/ui/GooeyButton'
import { Input } from '@/components/ui/input'
import { ArrowLeft, Loader2, Mail } from 'lucide-react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/reset-password/request', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            // Always show success for security
            setSent(true)
        } catch (err) {
            setError('Erro ao enviar solicitação.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 cyber-grid opacity-10"></div>

            <div className="cyber-card max-w-md w-full p-8 space-y-8 relative z-10 bg-black/80 backdrop-blur-sm border border-white/10">
                <div className="flex flex-col items-center text-center">
                    <BrandLogo size={50} className="mb-4" />
                    <h2 className="text-xl font-orbitron font-bold text-white tracking-widest uppercase">Recuperar Conta</h2>
                    <p className="text-zinc-500 text-xs font-mono mt-2">
                        Confirmaremos sua identidade via sistema seguro.
                    </p>
                </div>

                {!sent ? (
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-zinc-500 uppercase">Email Cadastrado</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <Input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    required
                                    className="pl-10 bg-black/50 border-white/10 text-white font-sans"
                                    placeholder="seu@email.com"
                                />
                            </div>
                        </div>

                        {error && <div className="text-red-400 text-xs text-center">{error}</div>}

                        <GooeyButton type="submit" className="w-full" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ENVIAR LINK DE RESGATE"}
                        </GooeyButton>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-4 rounded-xl">
                            <p className="text-emerald-400 text-sm font-medium">Link Enviado!</p>
                            <p className="text-zinc-400 text-xs mt-2">
                                Se o email <strong>{email}</strong> existir em nossa base, você receberá as instruções em instantes.
                            </p>
                        </div>
                    </div>
                )}

                <div className="text-center pt-4">
                    <Link href="/auth/signin" className="text-zinc-500 text-xs hover:text-white transition-colors">
                        <ArrowLeft className="w-3 h-3 inline mr-1" />
                        Voltar para Login
                    </Link>
                </div>
            </div>
        </div>
    )
}
