'use client'

import React, { useState, useEffect } from 'react'
import { Shield, Check, ArrowRight, Lock, FileText, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { acceptArtistTerms, checkTermsAcceptance } from '@/app/actions/artists'
import { useUser } from '@clerk/nextjs'

export function TermsGate({ children }: { children: React.ReactNode }) {
    const { user, isLoaded, isSignedIn } = useUser()
    const [mustAccept, setMustAccept] = useState(false)
    const [loading, setLoading] = useState(false)
    const [scrolledToBottom, setScrolledToBottom] = useState(false)

    useEffect(() => {
        if (isLoaded && isSignedIn) {
            const userRole = user?.publicMetadata?.role
            if (userRole === 'ARTIST' || userRole === 'ADMIN') {
                checkTerms()
            }
        }
    }, [isLoaded, isSignedIn, user])

    async function checkTerms() {
        // Double check status to avoid flickers
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
        // Consider scrolled to bottom if within 50px of end
        if (target.scrollHeight - target.scrollTop <= target.clientHeight + 50) {
            setScrolledToBottom(true)
        }
    }

    // If active, render the Gate INSTEAD of children, ensuring full blocking.
    if (mustAccept) {
        return (
            <div className="fixed inset-0 z-[9999] bg-black flex items-center justify-center p-0 md:p-8 overflow-hidden touch-none">
                {/* Cyberpunk Background Layers */}
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-br from-black via-gray-950 to-black pointer-events-none" />
                <div className="scanline" />

                <div className="relative w-full max-w-5xl h-full md:h-[90vh] bg-gray-950 border md:border-white/10 flex flex-col md:flex-row overflow-hidden shadow-2xl md:rounded-[2rem] animate-in zoom-in-95 duration-500">

                    {/* Visual Side (Left) */}
                    <div className="w-full md:w-1/3 bg-black flex flex-col justify-between border-b md:border-b-0 md:border-r border-white/10 relative overflow-hidden">

                        {/* Header Area */}
                        <div className="p-8 md:p-10 relative z-10">
                            <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10 mb-8 backdrop-blur-sm">
                                <Shield className="text-white" size={32} />
                            </div>

                            <h2 className="text-4xl md:text-5xl font-orbitron font-black text-white italic uppercase leading-[0.9] tracking-tighter mb-4">
                                Protocolo <br />
                                <span className="text-outline-white">Sincronia</span>
                            </h2>

                            <div className="prose prose-invert">
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest leading-relaxed max-w-[200px]">
                                    Identidade Validada.<br />
                                    Aceite mandatório dos termos operacionais para liberação do HUD.
                                </p>
                            </div>
                        </div>

                        {/* Status Area */}
                        <div className="p-8 md:p-10 bg-white/[0.02] border-t border-white/5 relative z-10">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3 text-gray-400">
                                    <Lock size={14} className="text-primary" />
                                    <span className="text-[9px] font-mono uppercase tracking-[0.2em]">Criptografia Militar</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <FileText size={14} className="text-primary" />
                                    <span className="text-[9px] font-mono uppercase tracking-[0.2em]">Contrato Digital v1.0</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-400">
                                    <AlertTriangle size={14} className="text-primary" />
                                    <span className="text-[9px] font-mono uppercase tracking-[0.2em]">Vínculo Jurídico</span>
                                </div>
                            </div>
                        </div>

                        {/* Background Decor */}
                        <div className="absolute top-0 right-0 w-[300px] h-[300px] bg-primary/20 blur-[150px] rounded-full pointer-events-none opacity-20 -translate-y-1/2 translate-x-1/2" />
                    </div>

                    {/* Content Side (Right) - The Contract */}
                    <div className="flex-1 flex flex-col bg-gray-950/50 backdrop-blur-md">
                        {/* Contract Header */}
                        <div className="p-6 md:p-8 border-b border-white/5 flex items-center justify-between">
                            <h1 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
                                Acordo de Colaboração e Termo de Responsabilidade
                            </h1>
                            <span className="text-[10px] font-mono text-gray-600 bg-white/5 px-2 py-1 rounded">REV 1.0.2026</span>
                        </div>

                        {/* Scrollable Contract Text */}
                        <div
                            className="flex-1 overflow-y-auto p-6 md:p-10 font-sans text-sm text-gray-300 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent leading-relaxed"
                            onScroll={handleScroll}
                        >
                            <div className="max-w-2xl mx-auto space-y-8 pb-10">
                                <p className="text-xs text-gray-500 font-mono mb-8 uppercase">
                                    Este documento ("Termo") estabelece as condições para o uso da infraestrutura tecnológica e física do Workspace vinculado ao <strong>SISTEMA KRONØS</strong>. Ao clicar em "ACEITAR", você, o <strong>ARTISTA</strong>, declara plena ciência e concordância com as cláusulas abaixo.
                                </p>

                                <section className="space-y-3">
                                    <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                        <span className="text-gray-600 font-mono">01.</span> Natureza da Relação
                                    </h3>
                                    <p>1.1. O ARTISTA atua como profissional autônomo e independente, sem qualquer vínculo empregatício com o ESTÚDIO ou com a PLATAFORMA KRONØS.</p>
                                    <p>1.2. O ARTISTA possui total liberdade para definir seus horários (respeitando a disponibilidade de agenda do Workspace), suas técnicas de aplicação e sua precificação base, desde que respeitados os mínimos da plataforma.</p>
                                </section>

                                <section className="space-y-3">
                                    <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                        <span className="text-gray-600 font-mono">02.</span> Regras de Repasse (Financial Sync)
                                    </h3>
                                    <p>2.1. O ARTISTA concorda com a taxa de uso do Workspace (Comissão) estabelecida pelo ESTÚDIO, a qual será aplicada sobre o valor bruto de cada procedimento ou venda realizada.</p>
                                    <p>2.2. O ARTISTA declara ciência de que sua taxa individual de comissão pode ser consultada em tempo real no seu painel de configurações e financeiro. Para este Workspace, a taxa configurada é de <strong>30% (trinta por cento)</strong>, salvo negociação específica registrada no sistema.</p>
                                    <p>2.3. <strong>Fluxo de Caixa:</strong> O ARTISTA receberá o pagamento integral do cliente via PIX ou meios próprios. É dever irrevogável do ARTISTA registrar a transação no <strong>SOVEREIGN HUD</strong> e realizar o repasse da comissão devida para a chave PIX do ESTÚDIO em até 24h após a conclusão da sessão.</p>
                                    <p>2.4. O não registro de procedimentos no sistema será considerado quebra de confiança e resultará na revogação imediata do <strong>INK PASS</strong> (acesso ao sistema).</p>
                                </section>

                                <section className="space-y-3">
                                    <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                        <span className="text-gray-600 font-mono">03.</span> Responsabilidade Técnica
                                    </h3>
                                    <p>3.1. O ARTISTA é o único responsável técnico pela execução da tatuagem e pelo cumprimento das normas da ANVISA e órgãos de saúde locais.</p>
                                    <p>3.2. É obrigatório o preenchimento da <strong>FICHA DE ANAMNESE DIGITAL</strong> para cada novo cliente. O início de um procedimento sem a ficha assinada digitalmente é de total responsabilidade e risco do ARTISTA.</p>
                                </section>

                                <section className="space-y-3">
                                    <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                        <span className="text-gray-600 font-mono">04.</span> Propriedade Intelectual
                                    </h3>
                                    <p>4.1. As artes criadas pelo ARTISTA pertencem ao mesmo. No entanto, o ARTISTA concede ao ESTÚDIO uma licença de uso das imagens dos trabalhos realizados nas dependências do Workspace para fins de marketing, portfólio e redes sociais.</p>
                                </section>

                                <section className="space-y-3">
                                    <h3 className="text-white font-bold text-sm uppercase tracking-wider flex items-center gap-2">
                                        <span className="text-gray-600 font-mono">05.</span> Proteção de Dados (LGPD)
                                    </h3>
                                    <p>5.1. O ARTISTA compromete-se a utilizar os dados dos clientes contidos na plataforma exclusivamente para fins profissionais vinculados ao agendamento.</p>
                                    <p>5.2. É proibido o download ou compartilhamento de bases de dados de clientes do Workspace com terceiros ou para uso em outros estabelecimentos sem autorização prévia.</p>
                                </section>

                                <div className="p-6 bg-white/[0.03] border border-white/5 rounded-lg mt-8 text-xs font-mono text-gray-500">
                                    <strong>CLÁUSULA DE VÍNCULO:</strong> AO PROSSEGUIR, VOCÊ ESTABELECE UM CONTRATO DIGITAL VÁLIDO CONFORME A LEGISLAÇÃO VIGENTE. SEU IP, DISPOSITIVO E HORÁRIO SERÃO REGISTRADOS PARA FINS DE AUDITORIA.
                                </div>
                            </div>
                        </div>

                        {/* Footer / Action */}
                        <div className="p-6 md:p-8 border-t border-white/5 bg-gray-950 flex flex-col items-center justify-center gap-4">
                            {!scrolledToBottom && (
                                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest animate-pulse">
                                    ↓ Role até o final para habilitar o aceite
                                </p>
                            )}
                            <Button
                                disabled={loading || !scrolledToBottom}
                                onClick={handleAccept}
                                className={`w-full max-w-sm h-14 rounded-xl font-bold uppercase tracking-[0.1em] transition-all duration-300 relative overflow-hidden group ${scrolledToBottom
                                        ? 'bg-white text-black hover:scale-105 shadow-[0_0_40px_rgba(255,255,255,0.2)]'
                                        : 'bg-white/10 text-gray-500 cursor-not-allowed'
                                    }`}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {loading ? 'GERANDO TOKEN...' : 'ACEITAR PROTOCOLO'}
                                    {scrolledToBottom && !loading && <ArrowRight size={16} />}
                                </span>
                                {scrolledToBottom && <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] group-hover:animate-shimmer" />}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return <>{children}</>
}
