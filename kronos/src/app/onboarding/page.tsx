'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BrandLogo } from '@/components/ui/brand-logo'
import { User, ShieldCheck, ArrowRight, Loader2, Rocket, Palette, MessageSquare, Users as UsersIcon, CheckCircle2 } from 'lucide-react'
import { submitWorkspaceRequest } from '@/app/actions/workspaces'

export const dynamic = 'force-dynamic'

function OnboardingContent() {
    const { data: session, update, status } = useSession()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Check if user is already authenticated to bypass onboarding
    React.useEffect(() => {
        if (status === 'authenticated' && session?.user) {
            const role = (session.user as any).role
            if (role === 'ARTIST' || role === 'ADMIN') {
                router.replace('/artist/dashboard')
            } else if (role === 'CLIENT') {
                router.replace('/kiosk')
            }
        }
    }, [session, status, router])

    const initialRole = searchParams.get('role')
    const initialMode = searchParams.get('mode')
    const urlCode = searchParams.get('inviteCode')

    const [mode, setMode] = useState<'SELECT' | 'CODE' | 'REQUEST' | 'SUCCESS'>(
        (urlCode || initialMode === 'CODE') ? 'CODE' : (initialRole === 'artist' ? 'CODE' : 'SELECT')
    )
    const [inviteCode, setInviteCode] = useState(urlCode || '')
    const [studioName, setStudioName] = useState('')
    const [motivation, setMotivation] = useState('')
    const [teamDetails, setTeamDetails] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    // Auto-validate if code is in URL and user just logged in
    React.useEffect(() => {
        if (urlCode && status === 'authenticated' && !loading && !successMessage && !error) {
            const autoValidate = async () => {
                setLoading(true)
                try {
                    const response = await fetch('/api/auth/validate-invite', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ code: urlCode })
                    })
                    const data = await response.json()
                    if (response.ok) {
                        await update()
                        if (data.role === 'ARTIST' || data.role === 'ADMIN') {
                            router.push('/artist/dashboard')
                        } else {
                            router.push('/dashboard')
                        }
                    } else {
                        setError(data.error || 'Código expirado ou inválido')
                    }
                } catch (err) {
                    setError('Erro na auto-validação.')
                } finally {
                    setLoading(false)
                }
            }
            autoValidate()
        }
    }, [urlCode, status])

    const handleClientAccess = async () => {
        // Para clientes, o HUB central é o Kiosk (Ficha, Acompanhante, Loja)
        router.push('/kiosk')
    }

    const handleArtistAccess = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inviteCode) return

        if (status === 'unauthenticated') {
            router.push(`/auth/signin?callbackUrl=/onboarding?inviteCode=${inviteCode}`)
            return
        }

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
                await update()
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

    const handleRequestAccess = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!studioName || !motivation) return

        setLoading(true)
        setError('')

        try {
            const result = await submitWorkspaceRequest({
                studioName,
                teamDetails,
                motivation
            })

            if (result.success) {
                setSuccessMessage(result.message || '')
                setMode('SUCCESS')
            } else {
                setError(result.error || 'Erro ao enviar solicitação')
            }
        } catch (err) {
            setError('Falha de conexão com o servidor.')
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
                    <h1 className="text-4xl md:text-5xl font-orbitron font-bold mb-4 tracking-tight">BOAS-VINDAS</h1>
                    <p className="text-gray-400 font-mono text-sm md:text-base">Escolha como você vai usar a plataforma.</p>
                </div>

                {mode === 'SELECT' ? (
                    <div className="flex flex-col gap-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* CLIENTE CARD */}
                            <button
                                onClick={handleClientAccess}
                                className="group relative p-8 bg-gray-900/30 border border-white/10 hover:border-accent/50 hover:bg-gray-900/50 rounded-xl transition-all duration-300 text-left"
                            >
                                <div className="absolute top-4 right-4 text-gray-600 group-hover:text-accent transition-colors">
                                    <User size={24} />
                                </div>
                                <h3 className="text-xl font-bold font-orbitron mb-2 group-hover:text-accent">CLIENTE</h3>
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
                                className="group relative p-8 bg-gray-900/30 border border-white/10 hover:border-primary/50 hover:bg-gray-900/50 rounded-xl transition-all duration-300 text-left"
                            >
                                <div className="absolute top-4 right-4 text-gray-600 group-hover:text-primary transition-colors">
                                    <ShieldCheck size={24} />
                                </div>
                                <h3 className="text-xl font-bold font-orbitron mb-2 group-hover:text-primary">PROFISSIONAL</h3>
                                <p className="text-sm text-gray-500 font-mono leading-relaxed">
                                    Sou tatuador, guest ou staff. Tenho um código de acesso ou convite.
                                </p>
                                <div className="mt-6 flex items-center text-sm font-bold text-gray-500 group-hover:text-white transition-colors">
                                    INSERIR CÓDIGO <ArrowRight size={16} className="ml-2" />
                                </div>
                            </button>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-4">Já é da casa?</p>
                            <Button
                                onClick={() => router.push('/auth/signin')}
                                variant="outline"
                                className="border-white/10 text-white hover:bg-white/10 h-10 px-8 rounded-xl font-bold font-orbitron text-[10px] tracking-widest uppercase"
                            >
                                Ir direto para o Login (E-mail)
                            </Button>
                        </div>
                    </div>
                ) : mode === 'CODE' ? (
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
                                    <Button type="submit" disabled={loading} className="flex-1 bg-primary hover:bg-primary/80 text-white">
                                        {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                        VALIDAR
                                    </Button>
                                </div>

                                <div className="mt-6 pt-6 border-t border-white/5 text-center">

                                    <Button
                                        type="button"
                                        variant="ghost"
                                        className="text-gray-600 hover:text-white text-[10px] uppercase tracking-widest mt-2"
                                        onClick={async () => {
                                            const { signIn } = await import('next-auth/react')
                                            signIn('credentials', { username: 'dev', password: '123', callbackUrl: '/artist/dashboard' })
                                        }}
                                    >
                                        🐛 DEV MODE
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : mode === 'REQUEST' ? (
                    <div className="max-w-md mx-auto animate-in fade-in slide-in-from-right-4 duration-500">
                        <div className="bg-gray-900/50 border border-purple-500/20 p-8 rounded-3xl backdrop-blur-md shadow-[0_0_50px_rgba(139,92,246,0.1)]">
                            <div className="flex justify-center mb-6">
                                <div className="p-3 bg-primary/10 rounded-2xl border border-primary/20">
                                    <Rocket className="text-primary animate-bounce" size={32} />
                                </div>
                            </div>

                            <h3 className="text-2xl font-orbitron font-bold mb-2 text-center text-white">SOLICITAR ACESSO</h3>
                            <p className="text-[10px] text-gray-500 font-mono text-center mb-8 uppercase tracking-widest leading-relaxed">
                                Conte mais sobre seu estúdio para construirmos o alicerce do KRONØS juntos.
                            </p>

                            <form onSubmit={handleRequestAccess} className="space-y-4 text-left">
                                <div>
                                    <label className="text-[10px] font-mono uppercase text-gray-400 mb-2 block tracking-widest">Nome do Estúdio</label>
                                    <Input
                                        className="bg-black/50 border-white/10 h-10 font-bold placeholder:text-gray-700 uppercase"
                                        placeholder="NOME DO SEU ESPAÇO"
                                        value={studioName}
                                        onChange={(e) => setStudioName(e.target.value.toUpperCase())}
                                        autoFocus
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-mono uppercase text-gray-400 mb-2 block tracking-widest flex items-center gap-2 text-gray-400">
                                        <UsersIcon size={12} /> Equipe (Artistas/Staff)
                                    </label>
                                    <textarea
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-mono focus:border-primary outline-none min-h-[80px] text-white"
                                        placeholder="Ex: 3 artistas residentes, 1 recepcionista..."
                                        value={teamDetails}
                                        onChange={(e) => setTeamDetails(e.target.value)}
                                    />
                                </div>

                                <div>
                                    <label className="text-[10px] font-mono uppercase text-gray-400 mb-2 block tracking-widest flex items-center gap-2 text-gray-400">
                                        <MessageSquare size={12} /> Por que o KRONØS?
                                    </label>
                                    <textarea
                                        className="w-full bg-black/50 border border-white/10 rounded-lg p-3 text-sm font-mono focus:border-primary outline-none min-h-[100px] text-white"
                                        placeholder="Como o KRONOS seria útil para sua equipe hoje?"
                                        value={motivation}
                                        onChange={(e) => setMotivation(e.target.value)}
                                        required
                                    />
                                </div>

                                {error && (
                                    <p className="text-red-500 text-[10px] font-mono text-center bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                                        {error}
                                    </p>
                                )}

                                <div className="flex gap-3 pt-2">
                                    <Button type="button" variant="outline" onClick={() => setMode('CODE')} className="flex-1 rounded-xl font-bold">
                                        VOLTAR
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading || !studioName || !motivation}
                                        className="flex-[2] bg-primary hover:bg-primary/80 text-white rounded-xl shadow-[0_0_20px_rgba(var(--primary-rgb),0.2)] font-bold transition-all hover:scale-[1.02]"
                                    >
                                        {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                        ENVIAR SOLICITAÇÃO
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                ) : (
                    /* SUCCESS MODE */
                    <div className="max-w-md mx-auto animate-in zoom-in-95 duration-500 text-center">
                        <div className="bg-gray-900/50 border border-[#00FF88]/20 p-12 rounded-3xl backdrop-blur-md shadow-[0_0_50px_rgba(0,255,136,0.05)]">
                            <div className="flex justify-center mb-6">
                                <div className="w-20 h-20 bg-[#00FF88]/10 rounded-full flex items-center justify-center border border-[#00FF88]/20 shadow-[0_0_30px_rgba(0,255,136,0.1)]">
                                    <CheckCircle2 className="text-[#00FF88]" size={40} />
                                </div>
                            </div>
                            <h3 className="text-2xl font-orbitron font-bold mb-4 text-white uppercase tracking-tight">Solicitação Recebida</h3>
                            <p className="text-gray-400 font-mono text-xs leading-relaxed mb-8">
                                {successMessage}
                            </p>
                            <Button onClick={() => setMode('SELECT')} variant="outline" className="w-full rounded-xl border-[#00FF88]/20 hover:bg-[#00FF88]/10 hover:text-[#00FF88] font-bold">
                                VOLTAR AO INÍCIO
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-primary" /></div>}>
            <OnboardingContent />
        </Suspense>
    )
}

