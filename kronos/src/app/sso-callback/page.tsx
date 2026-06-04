'use client'

import { useEffect, Suspense } from 'react'
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

    useEffect(() => {
        async function process() {
            try {
                // 1. Finaliza o handshake OAuth do Clerk
                await handleRedirectCallback({})

                // Aguarda o Clerk carregar o usuário atualizado
                // (dá tempo ao webhook de sincronizar com o Prisma)
                await new Promise(resolve => setTimeout(resolve, 1500))

            } catch (err) {
                console.error('SSO Callback Error:', err)
                router.push('/sign-in')
            }
        }
        process()
    }, [handleRedirectCallback, router])

    // Executa após o Clerk ter o usuário carregado na memória
    useEffect(() => {
        if (!isLoaded || !user) return

        async function finalizeSession() {
            try {
                // 2. Se há convite, resgata via API (novo artista)
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
                        // Recarrega o usuário para obter o role atualizado
                        await user?.reload()
                        console.log('✅ Invite redeemed successfully')
                    }
                }

                // 3. Lê o role do publicMetadata do Clerk (já disponível, sem precisar do DB)
                const role = (user?.publicMetadata as any)?.role

                if (role === 'ARTIST' || role === 'ADMIN') {
                    // ✅ Artista/Admin existente → vai direto pro dashboard
                    router.push('/artist/dashboard')
                } else if (role === 'CLIENT') {
                    router.push('/kiosk')
                } else {
                    // Role ainda não definido (usuário novo sem invite ou webhook em processamento)
                    // Redireciona para onboarding para completar o processo de convite
                    router.push('/onboarding')
                }
            } catch (err) {
                console.error('SSO Finalize Error:', err)
                router.push('/sign-in')
            }
        }

        finalizeSession()
    }, [isLoaded, user, inviteCode, router])

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

