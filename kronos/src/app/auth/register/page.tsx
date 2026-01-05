'use client'

import React, { useState, Suspense } from 'react'
import { BrandLogo } from '@/components/ui/brand-logo'
import { Input } from '@/components/ui/input'
import { GooeyButton } from '@/components/ui/GooeyButton'
import { ArrowLeft, Loader2, ShieldCheck } from 'lucide-react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function RegisterContent() {
    const searchParams = useSearchParams()
    const router = useRouter()

    // Get pre-filled data from VerifyGate
    const initialInvite = searchParams.get('invite') || ''
    const initialPhone = searchParams.get('phone') || ''

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        phone: initialPhone || '',
        inviteCode: initialInvite || ''
    })

    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')

        try {
            const res = await fetch('/api/auth/register', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(form)
            })

            const data = await res.json()

            if (!res.ok) {
                throw new Error(data.error || 'Erro ao criar conta')
            }

            // Redirect to Login
            router.push('/auth/signin?registered=true')
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute inset-0 cyber-grid opacity-10"></div>

            <div className="cyber-card max-w-md w-full p-8 space-y-8 relative z-10 bg-black/80 backdrop-blur-sm border border-white/10">
                <div className="flex flex-col items-center text-center">
                    <BrandLogo size={50} className="mb-4" />
                    <h2 className="text-2xl font-orbitron font-bold text-white tracking-widest">
                        SOBERANIA
                    </h2>
                    <p className="text-zinc-400 text-xs font-mono mt-2 uppercase tracking-wider">
                        Crie sua Credencial de Acesso
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase">Nome Profissional</label>
                        <Input
                            value={form.name}
                            onChange={e => setForm({ ...form, name: e.target.value })}
                            required
                            className="bg-black/50 border-white/10 text-white font-sans"
                            placeholder="Como você é conhecido?"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase">Email de Acesso</label>
                        <Input
                            type="email"
                            value={form.email}
                            onChange={e => setForm({ ...form, email: e.target.value })}
                            required
                            className="bg-black/50 border-white/10 text-white font-sans"
                            placeholder="seu@email.com"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-mono text-zinc-500 uppercase">Senha Mestra</label>
                        <Input
                            type="password"
                            value={form.password}
                            onChange={e => setForm({ ...form, password: e.target.value })}
                            required
                            minLength={6}
                            className="bg-black/50 border-white/10 text-white font-sans"
                            placeholder="••••••••"
                        />
                    </div>

                    {/* Hidden/Read-only Identity Fields */}
                    <div className="pt-4 border-t border-white/5">
                        <div className="flex items-center gap-2 mb-2">
                            <ShieldCheck className="w-4 h-4 text-emerald-500" />
                            <span className="text-xs font-mono text-emerald-500">IDENTIDADE VINCULADA</span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <Input
                                value={form.inviteCode}
                                disabled
                                className="bg-emerald-950/20 border-emerald-500/20 text-emerald-400 text-xs font-mono text-center"
                            />
                            <Input
                                value={form.phone}
                                disabled
                                className="bg-emerald-950/20 border-emerald-500/20 text-emerald-400 text-xs font-mono text-center"
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 p-3 rounded text-red-400 text-xs text-center">
                            {error}
                        </div>
                    )}

                    <GooeyButton type="submit" className="w-full mt-6" disabled={loading}>
                        {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : "CRIAR ACESSO PERMANENTE"}
                    </GooeyButton>

                    <div className="text-center pt-4">
                        <Link href="/auth/signin" className="text-zinc-500 text-xs hover:text-white transition-colors">
                            <ArrowLeft className="w-3 h-3 inline mr-1" />
                            Voltar para Login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black" />}>
            <RegisterContent />
        </Suspense>
    )
}
