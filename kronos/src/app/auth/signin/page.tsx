'use client'

import React, { useState } from 'react'
import { BrandLogo } from '@/components/ui/brand-logo'
import MagicLinkLogin from '@/components/auth/MagicLinkLogin'
import VerifyCode from '@/components/auth/VerifyCode'
import { Button } from '@/components/ui/button'
import { signIn } from 'next-auth/react'

export default function SignInPage() {
    const [step, setStep] = useState<'email' | 'code'>('email')
    const [email, setEmail] = useState('')

    const handleEmailSent = (email: string) => {
        setEmail(email)
        setStep('code')
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 cyber-grid opacity-10"></div>

            <div className="cyber-card max-w-md w-full p-8 space-y-8 relative z-10 bg-black/80 backdrop-blur-sm">
                <div className="flex flex-col items-center text-center">
                    <BrandLogo size={60} className="mb-6" />
                    <h2 className="cyber-title text-2xl font-black mb-2 sr-only">ACESSO KRONOS</h2>
                    <p className="text-muted-foreground text-sm font-mono mt-2">
                        {step === 'email' ? 'Acesse sua conta sem senha' : 'Verifique seu email'}
                    </p>
                </div>

                <div className="space-y-6">
                    {step === 'email' ? (
                        <MagicLinkLogin onSuccess={handleEmailSent} />
                    ) : (
                        <VerifyCode email={email} onBack={() => setStep('email')} />
                    )}


                    {step === 'email' && (
                        <div className="pt-4 flex flex-col gap-2">
                            <Button
                                className="w-full h-8 bg-transparent text-gray-500 hover:text-white text-[10px] uppercase tracking-widest"
                                onClick={() => signIn('credentials', { username: 'master', password: '123', callbackUrl: '/artist/dashboard' })}
                                variant="ghost"
                            >
                                👑 MASTER MODE (ADMIN)
                            </Button>
                            <Button
                                className="w-full h-8 bg-transparent text-gray-700 hover:text-white text-[10px] uppercase tracking-widest"
                                onClick={() => signIn('credentials', { username: 'dev', password: '123', callbackUrl: '/artist/dashboard' })}
                                variant="ghost"
                            >
                                🐛 ARTIST MODE (DEV)
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
