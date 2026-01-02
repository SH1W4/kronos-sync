'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Check, ArrowRight, Lock } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { acceptArtistTerms, checkTermsAcceptance } from '@/app/actions/artists'
import { useSession } from 'next-auth/react'

export function TermsGate({ children }: { children: React.ReactNode }) {
    const { data: session, status } = useSession()
    const [mustAccept, setMustAccept] = useState(false)
    const [loading, setLoading] = useState(false)
    const [scrolledToBottom, setScrolledToBottom] = useState(false)

    useEffect(() => {
        const userRole = (session?.user as any)?.role
        if (status === 'authenticated' && (userRole === 'ARTIST' || userRole === 'ADMIN')) {
            checkTerms()
        }
    }, [status, session])

    async function checkTerms() {
        const res = await checkTermsAcceptance()
        if (!res.accepted) {
            setMustAccept(true)
        }
    }

    const handleAccept = async () => {
        setLoading(true)
        const res = await acceptArtistTerms()
        if (res.success) {
            setMustAccept(false)
        } else {
            alert(res.message)
        }
        setLoading(false)
    }

    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.currentTarget
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) {
            setScrolledToBottom(true)
        }
    }

    if (!mustAccept) return <>{children}</>

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-4 md:p-8 overflow-hidden">
            {/* Cyberpunk Background */}
            <div className="absolute inset-0 data-pattern-grid opacity-20 pointer-events-none" />
            <div className="scanline" />

            <div className="relative w-full max-w-4xl bg-gray-950/80 border border-primary/30 rounded-[2.5rem] flex flex-col md:flex-row overflow-hidden shadow-[0_0_100px_rgba(var(--primary-rgb),0.2)] backdrop-blur-xl animate-in zoom-in-95 duration-500">

                {/* Visual Side */}
                <div className="w-full md:w-1/3 bg-primary/5 p-8 flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/5">
                    <div className="space-y-6">
                        <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center border border-primary/20 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]">
                            <Shield className="text-primary" size={32} />
                        </div>
                        <div className="space-y-2">
                            <h2 className="text-2xl font-orbitron font-black text-white italic uppercase leading-none tracking-tighter">
                                Protocolo <br />
                                <span className="text-primary text-glow">Sincronia</span>
                            </h2>
                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest leading-relaxed">
                                Identidade validada. Necessário aceite dos termos operacionais para liberação do HUD.
                            </p>
                        </div>
                    </div>

                    <div className="hidden md:block space-y-4">
                        <div className="flex items-center gap-3 text-gray-600">
                            <Lock size={12} />
                            <span className="text-[8px] font-mono uppercase tracking-[0.2em]">Criptografia ponta-a-ponta</span>
                        </div>
                        <div className="flex items-center gap-3 text-gray-600">
                            <Check size={12} />
                            <span className="text-[8px] font-mono uppercase tracking-[0.2em]">Conformidade LGPD v2.0</span>
                        </div>
                    </div>
                </div>

                {/* Content Side */}
                <div className="flex-1 flex flex-col max-h-[80vh] md:max-h-none">
                    <div
                        className="flex-1 overflow-y-auto p-6 md:p-10 space-y-6 font-sans text-sm text-gray-300 scrollbar-thin scrollbar-thumb-primary/20"
                        onScroll={handleScroll}
                    >
                        <h1 className="text-xl font-orbitron font-bold text-white uppercase border-b border-white/5 pb-4">Acordo de Colaboração v1.0</h1>

                        <div className="prose prose-invert prose-sm max-w-none space-y-4">
                            <section>
                                <h3 className="text-primary font-mono text-xs uppercase tracking-widest mb-2 font-bold">1. Natureza da Relação</h3>
                                <p>O ARTISTA atua como profissional autônomo e independente, sem qualquer vínculo empregatício com o ESTÚDIO ou com a PLATAFORMA KRONØS.</p>
                            </section>

                            <section>
                                <h3 className="text-primary font-mono text-xs uppercase tracking-widest mb-2 font-bold">2. Regras de Repasse</h3>
                                <p>O ARTISTA concorda com a taxa de uso do Workspace (Comissão) estabelecida pelo ESTÚDIO. A taxa padrão atual é de <span className="text-white font-bold">30%</span>, podendo ser consultada no painel de controle.</p>
                                <p>É dever do ARTISTA realizar o repasse em até 24h após a conclusão da sessão.</p>
                            </section>

                            <section>
                                <h3 className="text-primary font-mono text-xs uppercase tracking-widest mb-2 font-bold">3. Responsabilidade Técnica</h3>
                                <p>O ARTISTA é o único responsável técnico pela execução da tatuagem e pelo cumprimento das normas da ANVISA.</p>
                                <p>É obrigatório o preenchimento da ficha de anamnese digital para cada novo cliente.</p>
                            </section>

                            <section>
                                <h3 className="text-primary font-mono text-xs uppercase tracking-widest mb-2 font-bold">4. Proteção de Dados</h3>
                                <p>O ARTISTA compromete-se a utilizar os dados dos clientes contidos na plataforma exclusivamente para fins profissionais vinculados ao agendamento.</p>
                            </section>

                            <div className="p-4 bg-white/5 rounded-xl border border-white/5 text-[10px] font-mono text-gray-500 uppercase tracking-tighter leading-relaxed">
                                * Leia o documento completo em docs/governance/artist-terms.md. Ao clicar em aceitar, você confirma estar de acordo com todas as cláusulas operacionais e jurídicas do sistema.
                            </div>
                        </div>
                    </div>

                    {/* Footer / Action */}
                    <div className="p-6 md:p-10 border-t border-white/5 bg-black/40">
                        {!scrolledToBottom ? (
                            <div className="text-center animate-bounce text-gray-600 mb-4">
                                <p className="text-[10px] font-mono uppercase tracking-widest">Role para ler tudo</p>
                            </div>
                        ) : null}
                        <Button
                            disabled={loading || !scrolledToBottom}
                            onClick={handleAccept}
                            className={`w-full h-16 rounded-[1.5rem] font-orbitron font-black uppercase tracking-[0.2em] transition-all duration-500 ${scrolledToBottom
                                ? 'bg-primary text-black shadow-[0_0_30px_rgba(var(--primary-rgb),0.4)] hover:scale-[1.02]'
                                : 'bg-gray-800 text-gray-500 opacity-50'
                                }`}
                        >
                            {loading ? 'SINCRONIZANDO...' : (
                                <span className="flex items-center gap-3">
                                    ACEITAR E ENTRAR NO HUD <ArrowRight size={18} />
                                </span>
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
