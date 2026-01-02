import React from 'react'
import { getInviteByCode } from '@/app/actions/invites'
import { InkPassCard } from '@/components/invites/InkPassCard'
import { ShieldAlert, ArrowRight, Sparkles, Zap, Shield } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { trackQrScan } from '@/app/actions/analytics'

interface PageProps {
    params: { code: string }
}

export default async function InvitePage({ params }: PageProps) {
    const { code } = params
    const result = await getInviteByCode(code)

    // Track Scan (Analytics)
    if (result.invite) {
        await trackQrScan('INVITE', result.invite.id, code)
    }

    if (result.error || !result.invite) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center p-6 data-pattern-grid relative overflow-hidden">
                <div className="scanline" />
                <div className="max-w-md w-full bg-gray-950/60 border border-red-500/20 p-8 rounded-3xl text-center space-y-6 relative z-10">
                    <div className="w-16 h-16 bg-red-500/10 rounded-2xl border border-red-500/20 flex items-center justify-center mx-auto">
                        <ShieldAlert className="text-red-500" size={32} />
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-xl font-orbitron font-black tracking-tighter uppercase text-red-500 pixel-text">Acesso Negado</h1>
                        <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">{result.error || 'Credencial inválida ou expirada.'}</p>
                    </div>
                    <Link href="/">
                        <Button className="w-full bg-white text-black hover:bg-gray-200 font-bold rounded-xl mt-4">
                            RETORNAR AO TERMINAL
                        </Button>
                    </Link>
                </div>
            </div>
        )
    }

    const { invite } = result

    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 data-pattern-grid relative overflow-hidden">
            <div className="scanline opacity-20" />

            {/* Background Decorative Elements */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="max-w-4xl w-full flex flex-col md:flex-row items-center gap-12 relative z-10">
                {/* Left Side: The Pass */}
                <div className="w-full md:w-1/2 animate-in fade-in zoom-in-95 duration-700">
                    <InkPassCard
                        code={invite.code}
                        type={invite.targetPlan as any}
                        studioName={invite.workspace?.name || 'KRONØS'}
                        primaryColor={invite.workspace?.primaryColor || '#8B5CF6'}
                    />
                </div>

                {/* Right Side: Welcome Content */}
                <div className="w-full md:w-1/2 space-y-8 text-center md:text-left animate-in fade-in slide-in-from-right-8 duration-700 delay-300">
                    <div className="space-y-4">
                        <div className="flex items-center justify-center md:justify-start gap-2">
                            <Sparkles size={16} className="text-primary" />
                            <span className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] font-bold">Protocolo de Recrutamento</span>
                        </div>
                        <h1 className="text-4xl md:text-6xl font-orbitron font-black tracking-tight uppercase leading-none italic text-glitch" data-text="VOCÊ FOI CONVOCADO.">
                            VOCÊ FOI <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-white to-gray-500">CONVOCADO.</span>
                        </h1>
                        <p className="text-sm text-gray-400 font-mono uppercase leading-relaxed max-w-sm mx-auto md:mx-0">
                            Uma credencial de elite foi gerada em seu nome. O estúdio <span className="text-white font-bold">{invite.workspace?.name || 'KRONØS'}</span> aguarda sua integração.
                        </p>
                    </div>

                    <div className="space-y-4">
                        <Link href={`/auth/register?invite=${invite.code}`}>
                            <Button className="w-full md:w-auto bg-white text-black hover:bg-gray-200 font-black px-12 h-14 rounded-2xl text-lg flex items-center justify-center gap-4 group transition-all">
                                RECLAMAR ACESSO
                                <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </Link>

                        <div className="flex items-center justify-center md:justify-start gap-6 pt-4 text-gray-600">
                            <div className="flex items-center gap-1.5">
                                <Zap size={12} />
                                <span className="text-[8px] font-mono uppercase tracking-widest">Setup Instantâneo</span>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <Shield size={12} />
                                <span className="text-[8px] font-mono uppercase tracking-widest">Silo Protegido</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Hud */}
            <div className="absolute bottom-8 left-0 w-full flex justify-between px-12 pointer-events-none opacity-20 hidden md:flex">
                <div className="font-mono text-[8px] text-gray-500 uppercase tracking-[0.5em]">
                    KRONOS_SYNC_V1.2 // ESTABLISHED_CONNECTION
                </div>
                <div className="font-mono text-[8px] text-gray-500 uppercase tracking-[0.5em]">
                    SYSTEM_STATUS: NOMINAL
                </div>
            </div>
        </div>
    )
}
