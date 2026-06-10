'use client'

import React, { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { BrandLogo } from '@/components/ui/brand-logo'
import { ArrowRight, Loader2, Key } from 'lucide-react'
import { useUser, useAuth, useClerk } from '@clerk/nextjs'

export const dynamic = 'force-dynamic'

function OnboardingContent() {
    const { user, isLoaded, isSignedIn } = useUser()
    const { userId } = useAuth()
    const { signOut } = useClerk()
    const router = useRouter()
    const searchParams = useSearchParams()

    // Redirecionamento automático se já estiver logado (e sem código de convite)
    React.useEffect(() => {
        if (isLoaded && isSignedIn && user && !searchParams.get('inviteCode')) {
            const role = (user.publicMetadata as any)?.role
            if (role === 'ARTIST' || role === 'ADMIN') {
                router.replace('/artist/dashboard')
            } else if (role === 'CLIENT') {
                router.replace('/kiosk')
            }
        }
    }, [user, isLoaded, isSignedIn, router, searchParams])

    const urlCode = searchParams.get('inviteCode')
    
    // Mode 'RESTRICTED' = Sem convite na URL, porta fechada.
    // Mode 'CODE' = Com convite na URL, permite resgate.
    const [mode, setMode] = useState<'RESTRICTED' | 'CODE'>(urlCode ? 'CODE' : 'RESTRICTED')
    const [inviteCode, setInviteCode] = useState(urlCode || '')
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const [successMessage, setSuccessMessage] = useState('')

    // Validação automática se logou após clicar no convite
    React.useEffect(() => {
        if (urlCode && isSignedIn && !loading && !successMessage && !error) {
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
                        await user?.reload()
                        if (data.role === 'ARTIST' || data.role === 'ADMIN') {
                            router.push('/artist/dashboard')
                        } else {
                            router.push('/dashboard')
                        }
                    } else {
                        setError(data.error || 'Código expirado ou inválido')
                        setMode('CODE') // Mostra o formulário para ele tentar de novo
                    }
                } catch (err) {
                    setError('Erro na auto-validação.')
                    setMode('CODE')
                } finally {
                    setLoading(false)
                }
            }
            autoValidate()
        }
    }, [urlCode, isSignedIn])

    const handleArtistAccess = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!inviteCode) return

        if (!isSignedIn) {
            // Vai para a tela de signin customizada passando o convite
            router.push(`/sign-in?invite=${inviteCode}`)
            return
        }

        setLoading(true)
        setError('')

        try {
            const response = await fetch('/api/auth/validate-invite', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ code: inviteCode, phone })
            })

            const data = await response.json()

            if (response.ok) {
                await user?.reload()
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
            {/* Background Minimalista */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-neutral-900/40 via-black to-black -z-10"></div>
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none"></div>

            <div className="max-w-md w-full relative z-10">
                <div className="flex justify-center mb-12">
                    <BrandLogo size={100} animated={true} />
                </div>

                {mode === 'RESTRICTED' ? (
                    <div className="text-center animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-mono mb-8 uppercase tracking-widest">
                            <Key size={12} /> Acesso Restrito
                        </div>
                        
                        <h1 className="text-3xl font-orbitron font-bold mb-4 tracking-tight">PLATAFORMA PRIVADA</h1>
                        <p className="text-neutral-400 font-mono text-sm leading-relaxed mb-10">
                            O acesso ao KAIRØS OS é exclusivo para estúdios parceiros e artistas convidados. 
                        </p>

                        <div className="space-y-4">
                            <Button
                                onClick={() => router.push('/sign-in')}
                                className="w-full bg-white hover:bg-neutral-200 text-black h-12 rounded-xl font-bold font-orbitron text-sm tracking-widest uppercase transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)]"
                            >
                                SOU MEMBRO E TENHO ACESSO
                            </Button>
                            
                            <Button
                                onClick={() => setMode('CODE')}
                                variant="outline"
                                className="w-full border-neutral-800 text-neutral-400 hover:bg-neutral-900 hover:text-white h-12 rounded-xl font-mono text-xs tracking-widest uppercase transition-all"
                            >
                                TENHO UM CÓDIGO VIP
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="bg-neutral-900/50 border border-white/10 p-8 rounded-xl backdrop-blur-sm">
                            <h3 className="text-xl font-orbitron font-bold mb-2 text-center">VALIDAR CREDENCIAL</h3>
                            <p className="text-[10px] text-neutral-500 font-mono text-center mb-8 uppercase tracking-widest">
                                Insira a chave mestra fornecida pelo seu estúdio
                            </p>

                            <form onSubmit={handleArtistAccess} className="space-y-5">
                                <div>
                                    <Input
                                        className="bg-black/50 border-white/10 text-center font-mono text-xl tracking-widest uppercase h-14"
                                        placeholder="CÓDIGO (EX: KRN-123)"
                                        value={inviteCode}
                                        onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                                        autoFocus
                                        required
                                    />
                                </div>

                                <div>
                                    <Input
                                        className="bg-black/50 border-white/10 text-center font-mono text-lg h-12"
                                        placeholder="CELULAR (00) 00000-0000"
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value)}
                                        required
                                    />
                                    <p className="text-[9px] text-neutral-600 font-mono mt-2 uppercase tracking-tight text-center">
                                        Vinculação de segurança
                                    </p>
                                </div>

                                {error && (
                                    <p className="text-red-500 text-xs font-mono text-center bg-red-500/10 p-2 rounded">
                                        {error}
                                    </p>
                                )}

                                <div className="flex gap-3 pt-4">
                                    {!urlCode && (
                                        <Button type="button" variant="outline" onClick={() => setMode('RESTRICTED')} className="flex-1 h-12 border-neutral-800 rounded-lg hover:bg-neutral-900">
                                            VOLTAR
                                        </Button>
                                    )}
                                    <Button type="submit" disabled={loading} className="flex-[2] h-12 rounded-lg bg-white hover:bg-neutral-200 text-black font-bold">
                                        {loading ? <Loader2 className="animate-spin w-4 h-4 mr-2" /> : null}
                                        AUTENTICAR
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {isSignedIn && user && (
                    <div className="mt-8 pt-6 border-t border-white/5 text-center">
                        <p className="text-neutral-500 text-[10px] font-mono mb-2 uppercase tracking-widest">
                            Conectado como {user.primaryEmailAddress?.emailAddress}
                        </p>
                        <button
                            type="button"
                            onClick={async () => {
                                setLoading(true)
                                await signOut()
                                setLoading(false)
                                window.location.reload()
                            }}
                            disabled={loading}
                            className="text-red-500 hover:text-red-400 font-mono text-[10px] uppercase underline tracking-wider cursor-pointer"
                        >
                            Sair da conta / Entrar com outra conta
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default function OnboardingPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-black flex items-center justify-center"><Loader2 className="animate-spin text-white" /></div>}>
            <OnboardingContent />
        </Suspense>
    )
}


