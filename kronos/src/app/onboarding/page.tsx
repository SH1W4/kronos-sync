'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BrandLogo } from '@/components/ui/brand-logo'
import { User, ShieldCheck, ArrowRight, Loader2 } from 'lucide-react'

export default function OnboardingPage() {
    const { data: session, update } = useSession()
    const router = useRouter()
    const [mode, setMode] = useState<'SELECT' | 'CODE'>('SELECT')
    const [inviteCode, setInviteCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleClientAccess = async () => {
        // Para clientes, apenas redirecionamos.
        // Futuramente podemos pedir telefone/CPF aqui.
        router.push('/dashboard')
    }

    const handleArtistAccess = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inviteCode) return

        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/validate-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: inviteCode })
            })

            const data = await response.json()

            if (response.ok) {
                // Força atualização da sessão no front para pegar a nova role
                await update()

                // Redireciona baseado na role
                if (data.role === 'ARTIST' || data.role === 'ADMIN') {
                    router.push('/artist/dashboard')
                } else {
                    router.push('/dashboard')
                }
            } else {
                setError(data.error || 'Código inválido')
            }
        } catch (err) {
            setError('Erro ao validar conexão. Tente novamente.')
        } finally {
            setLoading(false)
        }
    }

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
                    <h1 className="text-3xl md:text-5xl font-orbitron font-bold mb-4 tracking-tight">BEM-VINDO AO <span className="text-[#00FF88]">KRONOS</span></h1>
                    <p className="text-gray-400 font-mono">Identifique-se para configurar seu ambiente.</p>
                </div>

                {mode === 'SELECT' ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* CLIENTE CARD */}
                        <button
                            onClick={handleClientAccess}
                            className="group relative p-8 bg-gray-900/30 border border-white/10 hover:border-[#00FF88]/50 hover:bg-gray-900/50 rounded-xl transition-all duration-300 text-left"
                        >
                            <div className="absolute top-4 right-4 text-gray-600 group-hover:text-[#00FF88] transition-colors">
                                <User size={24} />
                            </div>
                            <h3 className="text-xl font-bold font-orbitron mb-2 group-hover:text-[#00FF88]">CLIENTE</h3>
                            <p className="text-sm text-gray-500 font-mono leading-relaxed">
                                Quero agendar sessões, acompanhar meus projetos e ver meu histórico.
                            </p>
                            <div className="mt-6 flex items-center text-sm font-bold text-gray-500 group-hover:text-white transition-colors">
                                ACESSAR PAINEL <ArrowRight size={16} className="ml-2" />
                            </div>
                        </button>

                        {/* PROFISSIONAL CARD */}
                        <button
                            onClick={() => setMode('CODE')}
                            className="group relative p-8 bg-gray-900/30 border border-white/10 hover:border-[#8B5CF6]/50 hover:bg-gray-900/50 rounded-xl transition-all duration-300 text-left"
                        >
                            <div className="absolute top-4 right-4 text-gray-600 group-hover:text-[#8B5CF6] transition-colors">
                                <ShieldCheck size={24} />
                            </div>
                            <h3 className="text-xl font-bold font-orbitron mb-2 group-hover:text-[#8B5CF6]">PROFISSIONAL</h3>
                            <p className="text-sm text-gray-500 font-mono leading-relaxed">
                                Sou tatuador, guest ou staff. Tenho um código de acesso ou convite.
                            </p>
                            <div className="mt-6 flex items-center text-sm font-bold text-gray-500 group-hover:text-white transition-colors">
                                INSERIR CÓDIGO <ArrowRight size={16} className="ml-2" />
                            </div>
                        </button>
                    </div>
                ) : (
                    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-gray-900/50 border border-white/10 p-8 rounded-xl backdrop-blur-sm">
                            <h3 className="text-xl font-orbitron font-bold mb-6 text-center">VALIDAÇÃO DE ACESSO</h3>

                            <form onSubmit={handleArtistAccess} className="space-y-4">
                                <div>
                                    <label className="text-xs font-mono uppercase text-gray-500 mb-2 block">Código de Convite ou Chave Mestra</label>
                                    <Input
                                        className="bg-black/50 border-white/10 text-center font-mono text-lg tracking-widest uppercase h-12"
                                        placeholder="XXXX-XXXX"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        autoFocus
                                    />
                                </div>

                                {error && (
                                    <p className="text-red-500 text-xs font-mono text-center bg-red-500/10 p-2 rounded">
                                        {error}
                                    </p>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setMode('SELECT')} className="flex-1">
                                        Voltar
                                    </Button>
                                    <Button type="submit" disabled={loading} className="flex-1 bg-[#8B5CF6] hover:bg-[#7c4dff] text-white">
                                        {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                        Validar
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
