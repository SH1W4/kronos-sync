'use client'

import { useEffect, Suspense } from 'react'
import { useClerk } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { BrandLogo } from '@/components/ui/brand-logo'
import { Loader2 } from 'lucide-react'

function SSOCallbackContent() {
    const { handleRedirectCallback } = useClerk()
    const router = useRouter()
    const searchParams = useSearchParams()
    const inviteCode = searchParams.get('invite')

    useEffect(() => {
        async function process() {
            try {
                // 1. Finaliza o handshake OAuth do Clerk
                await handleRedirectCallback({})

                // 2. Se há convite, resgata via API
                const codeToRedeem = inviteCode || sessionStorage.getItem('pendingInviteCode')

                if (codeToRedeem) {
                    sessionStorage.removeItem('pendingInviteCode')

                    const res = await fetch('/api/auth/redeem-invite', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ inviteCode: codeToRedeem })
                    })

                    if (!res.ok) {
                        console.error('Failed to redeem invite:', await res.text())
                    } else {
                        console.log('✅ Invite redeemed successfully')
                    }
                }

                // 3. Redireciona para o dashboard
                router.push('/artist/dashboard')
            } catch (err) {
                console.error('SSO Callback Error:', err)
                router.push('/sign-in')
            }
        }

        process()
    }, [handleRedirectCallback, router, inviteCode])

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
            <BrandLogo size={48} />
            <div className="flex items-center gap-3 text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                <span className="font-mono text-xs uppercase tracking-widest">
                    {inviteCode ? 'Ativando Credencial...' : 'Estabelecendo Sessão Soberana...'}
                </span>
            </div>
            {inviteCode && (
                <p className="text-emerald-500 text-[10px] font-mono uppercase tracking-wider animate-pulse">
                    Vinculando convite ao seu perfil...
                </p>
            )}
        </div>
    )
}

export default function SSOCallbackPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-black flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-purple-500" />
            </div>
        }>
            <SSOCallbackContent />
        </Suspense>
    )
}
