'use client'

import React, { useState } from 'react'
import { useSignUp } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { BrandLogo } from '@/components/ui/brand-logo'
import { Input } from '@/components/ui/input'
import { GooeyButton } from '@/components/ui/GooeyButton'
import { Loader2, ShieldCheck, Mail, Lock, Key, ArrowRight, Eye, EyeOff } from 'lucide-react'
import Link from 'next/link'

export default function CustomSignUpPage() {
    const { isLoaded, signUp, setActive } = useSignUp()
    const router = useRouter()

    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [confirmPassword, setConfirmPassword] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    // Sub-view: True if we need to verify the OTP code sent to the email
    const [verifying, setVerifying] = useState(false)
    const [verificationCode, setVerificationCode] = useState('')

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLoaded) return

        if (password !== confirmPassword) {
            setError('As senhas não coincidem.')
            return
        }

        setLoading(true)
        setError('')

        try {
            await signUp.create({
                emailAddress: email,
                password: password,
            })

            // Disparar o e-mail de verificação OTP
            await signUp.prepareEmailAddressVerification({
                strategy: 'email_code',
            })

            setVerifying(true)
        } catch (err: any) {
            console.error('Error signing up:', err)
            // Traduzir erros comuns do Clerk
            if (err.errors?.[0]?.code === 'form_identifier_exists') {
                setError('Este endereço de e-mail já possui uma conta ativa.')
            } else if (err.errors?.[0]?.code === 'password_weak') {
                setError('Senha fraca. Tente misturar letras, números e símbolos.')
            } else {
                setError(err.errors?.[0]?.message || 'Erro ao criar conta. Verifique os dados.')
            }
        } finally {
            setLoading(false)
        }
    }

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!isLoaded) return

        setLoading(true)
        setError('')

        try {
            const completeSignUp = await signUp.attemptEmailAddressVerification({
                code: verificationCode,
            })

            if (completeSignUp.status === 'complete') {
                await setActive({ session: completeSignUp.createdSessionId })
                // Direcionar para onboarding (onde valida celular e convite)
                router.push('/onboarding')
            } else {
                console.log('Verification status not complete:', completeSignUp)
                setError('Falha na validação. Tente reenviar o código.')
            }
        } catch (err: any) {
            console.error('Verification code error:', err)
            setError(err.errors?.[0]?.message || 'Código de verificação incorreto.')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSignUp = async () => {
        if (!isLoaded) return
        setLoading(true)
        setError('')
        try {
            await signUp.authenticateWithRedirect({
                strategy: 'oauth_google',
                redirectUrl: '/sso-callback',
                redirectUrlComplete: '/onboarding'
            })
        } catch (err: any) {
            console.error('Google Sign Up error:', err)
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
                    <div className="flex flex-col items-center text-center">
                        <BrandLogo size={55} className="mb-6" />
                        <h2 className="text-2xl font-orbitron font-bold text-white tracking-widest uppercase">
                            {verifying ? "VALIDAÇÃO DE IDENTIDADE" : "NOVA CREDENCIAL RESIDENTE"}
                        </h2>
                        <p className="text-zinc-500 text-[10px] font-mono mt-2 uppercase tracking-widest">
                            {verifying ? "Insira o código de 6 dígitos enviado para seu e-mail" : "Cadastre sua conta mestra no ecossistema"}
                        </p>
                    </div>

                    {!verifying ? (
                        <>
                            {/* Sign Up Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Mail className="w-3.5 h-3.5" /> Email Pessoal
                                    </label>
                                    <Input
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        required
                                        className="bg-black/50 border-white/10 text-white font-sans focus:border-emerald-500/50"
                                        placeholder="seu@email.com"
                                        disabled={loading}
                                    />
                                </div>

                                {/* Password Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <Lock className="w-3.5 h-3.5" /> Senha Segura
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type={showPassword ? "text" : "password"}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            required
                                            className="bg-black/50 border-white/10 text-white font-sans focus:border-emerald-500/50 pr-10"
                                            placeholder="••••••••"
                                            disabled={loading}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                </div>

                                {/* Confirm Password Input */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                        <ShieldCheck className="w-3.5 h-3.5" /> Confirmar Senha
                                    </label>
                                    <Input
                                        type="password"
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        required
                                        className="bg-black/50 border-white/10 text-white font-sans focus:border-emerald-500/50"
                                        placeholder="••••••••"
                                        disabled={loading}
                                    />
                                </div>

                                {/* Error Alert */}
                                {error && (
                                    <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs text-center font-mono uppercase tracking-wider">
                                        {error}
                                    </div>
                                )}

                                {/* Submit Button */}
                                <GooeyButton type="submit" variant="primary" className="w-full mt-6" disabled={loading}>
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "PROSSEGUIR CADASTRO"}
                                </GooeyButton>
                            </form>

                            {/* Divider */}
                            <div className="relative my-6">
                                <div className="absolute inset-0 flex items-center" aria-hidden="true">
                                    <div className="w-full border-t border-white/5"></div>
                                </div>
                                <div className="relative flex justify-center text-[10px] font-mono uppercase tracking-widest">
                                    <span className="bg-zinc-950/40 px-3 text-zinc-600">Ou use a rede</span>
                                </div>
                            </div>

                            {/* Google OAuth SignUp */}
                            <button
                                onClick={handleGoogleSignUp}
                                type="button"
                                className="w-full flex items-center justify-center gap-3 bg-white/5 border border-white/10 text-white hover:bg-white/10 py-3.5 px-4 rounded-2xl transition-all duration-300 font-orbitron text-[10px] tracking-widest uppercase italic font-bold active:scale-[0.98]"
                                disabled={loading}
                            >
                                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05"/>
                                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335"/>
                                </svg>
                                Registrar com Google
                            </button>
                        </>
                    ) : (
                        /* Verification OTP Form */
                        <form onSubmit={handleVerify} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider flex items-center gap-1.5">
                                    <Key className="w-3.5 h-3.5" /> Token de Confirmação (E-mail)
                                </label>
                                <Input
                                    type="text"
                                    value={verificationCode}
                                    onChange={e => setVerificationCode(e.target.value)}
                                    required
                                    className="bg-black/50 border-white/10 text-white font-mono text-center text-xl tracking-widest h-14 focus:border-emerald-500/50"
                                    placeholder="000000"
                                    maxLength={6}
                                    disabled={loading}
                                />
                            </div>

                            {/* Error Alert */}
                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 p-3 rounded-xl text-red-400 text-xs text-center font-mono uppercase tracking-wider">
                                    {error}
                                </div>
                            )}

                            {/* Verify Button */}
                            <GooeyButton type="submit" variant="primary" className="w-full" disabled={loading}>
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <span className="flex items-center gap-2">
                                        ATIVAR CONTRATO <ArrowRight className="w-4 h-4" />
                                    </span>
                                )}
                            </GooeyButton>
                        </form>
                    )}

                    {/* Footer Links */}
                    <div className="text-center pt-2">
                        <p className="text-zinc-500 text-[10px] font-mono uppercase tracking-wider">
                            Já possui credencial?{' '}
                            <Link href="/sign-in" className="text-purple-400 hover:text-purple-300 font-bold transition-colors">
                                Entrar no Painel
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}
