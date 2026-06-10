'use client'

import { useEffect, useState, Suspense } from 'react'
import { useClerk, useUser } from '@clerk/nextjs'
import { useRouter, useSearchParams } from 'next/navigation'
import { BrandLogo } from '@/components/ui/brand-logo'
import { Loader2 } from 'lucide-react'

function SSOCallbackContent() {
    const { handleRedirectCallback } = useClerk()
    const { user, isLoaded } = useUser()
    const router = useRouter()
    const searchParams = useSearchParams()
    const inviteCode = searchParams.get('invite')
    const [callbackDone, setCallbackDone] = useState(false)

    // PASSO 1: Finaliza o handshake OAuth do Clerk
    useEffect(() => {
        async function process() {
            try {
                await handleRedirectCallback({})
                setCallbackDone(true)
            } catch (err) {
                console.error('SSO Callback Error:', err)
                router.push('/sign-in')
            }
        }
        process()
    }, []) // eslint-disable-line react-hooks/exhaustive-deps

    // PASSO 2: Aguarda Clerk carregar o user E o handshake ter terminado
    useEffect(() => {
        // Só executa quando: handshake concluído + Clerk carregado + user disponível
        if (!callbackDone || !isLoaded || !user) return

        async function finalizeSession() {
            try {
                // Garante que o publicMetadata está atualizado (força reload do Clerk)
                await user?.reload()

                const role = (user?.publicMetadata as any)?.role
                const codeToRedeem = inviteCode || sessionStorage.getItem('pendingInviteCode')

                if (codeToRedeem) {
                    sessionStorage.removeItem('pendingInviteCode')
                    const res = await fetch('/api/auth/redeem-invite', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ inviteCode: codeToRedeem })
                    })
                    if (res.ok) {
                        await user?.reload()
                        console.log('✅ Invite redeemed successfully')
                    } else {
                        console.error('Failed to redeem invite:', await res.text())
                    }
                }

                // Reconcile Clerk metadata with DB for any authorized email.
                let finalRole = (user?.publicMetadata as any)?.role
                console.log('[SSO] Before verify-access, finalRole:', finalRole)
                
                const verifyRes = await fetch('/api/auth/verify-access', { cache: 'no-store' })
                if (verifyRes.ok) {
                    const data = await verifyRes.json()
                    console.log('[SSO] verify-access response:', data)
                    if (data.role) {
                        finalRole = data.role
                    }
                    await user?.reload()
                    console.log('[SSO] After reload, finalRole:', finalRole, 'publicMetadata:', (user?.publicMetadata as any)?.role)
                } else {
                    // If access verification fails, we still keep the current role if present
                    console.log('[SSO] verify-access failed:', await verifyRes.text())
                    await user?.reload()
                    finalRole = (user?.publicMetadata as any)?.role
                }

                if (finalRole === 'ARTIST' || finalRole === 'ADMIN') {
                    router.push('/artist/dashboard')
                } else if (finalRole === 'CLIENT') {
                    router.push('/kiosk')
                } else {
                    router.push('/onboarding')
                }
            } catch (err) {
                console.error('SSO Finalize Error:', err)
                router.push('/sign-in')
            }
        }

        finalizeSession()
    }, [callbackDone, isLoaded, user]) // eslint-disable-line react-hooks/exhaustive-deps

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center gap-6">
            <BrandLogo size={48} />
            <div className="flex items-center gap-3 text-zinc-400">
                <Loader2 className="w-5 h-5 animate-spin text-purple-500" />
                <span className="font-mono text-xs uppercase tracking-widest">
                    {inviteCode ? 'Ativando Credencial...' : 'Estabelecendo Sessão...'}
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
