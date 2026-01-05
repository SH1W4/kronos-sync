'use client'

import React, { useState, Suspense } from 'react'
import { BrandLogo } from '@/components/ui/brand-logo'
import { GooeyButton } from '@/components/ui/GooeyButton'
import { Input } from '@/components/ui/input'
import { Loader2, Lock, ShieldCheck } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'

function ResetPasswordContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get('token')

    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')

        if (password !== confirm) {
            setError('As senhas não coincidem.')
            return
        }

        if (password.length < 6) {
            setError('A senha deve ter no mínimo 6 caracteres.')
            return
        }

        setLoading(true)

        try {
            const res = await fetch('/api/auth/reset-password/confirm', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ token, password })
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao redefinir senha.')
            }

            setSuccess(true)
            setTimeout(() => {
                router.push('/auth/signin')
            }, 3000)

        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!token) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center text-white">
                <p className="text-red-500">Token inválido ou ausente.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            <div className="absolute inset-0 cyber-grid opacity-10"></div>

            <div className="cyber-card max-w-md w-full p-8 space-y-8 relative z-10 bg-black/80 backdrop-blur-sm border border-white/10">
                <div className="flex flex-col items-center text-center">
                    <BrandLogo size={50} className="mb-4" />
                    <h2 className="text-xl font-orbitron font-bold text-white tracking-widest uppercase">Nova Senha</h2>
                    <p className="text-zinc-500 text-xs font-mono mt-2">
                        Defina sua nova credencial de acesso soberano.
                    </p>
                </div>

                {!success ? (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-xs font-mono text-zinc-500 uppercase">Nova Senha</label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <Input
                                    type="password"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    required
                                    className="pl-10 bg-black/50 border-white/10 text-white font-sans"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-mono text-zinc-500 uppercase">Confirmar Senha</label>
                            <div className="relative">
                                <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                                <Input
                                    type="password"
                                    value={confirm}
                                    onChange={e => setConfirm(e.target.value)}
                                    required
                                    className="pl-10 bg-black/50 border-white/10 text-white font-sans"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-3 rounded text-red-400 text-xs text-center">
                                {error}
                            </div>
                        )}

                        <GooeyButton type="submit" className="w-full mt-4" disabled={loading}>
                            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "ATUALIZAR CREDENCIAL"}
                        </GooeyButton>
                    </form>
                ) : (
                    <div className="text-center space-y-4">
                        <div className="bg-emerald-500/10 border border-emerald-500/20 p-6 rounded-xl flex flex-col items-center gap-2">
                            <ShieldCheck className="w-12 h-12 text-emerald-500" />
                            <p className="text-emerald-400 text-lg font-bold font-orbitron">Sucesso!</p>
                            <p className="text-zinc-400 text-xs">
                                Sua senha foi atualizada. Redirecionando para o login...
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <ResetPasswordContent />
        </Suspense>
    )
}
