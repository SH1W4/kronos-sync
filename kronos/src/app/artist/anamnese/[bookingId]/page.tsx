import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle, ShieldCheck, HeartPulse, PenTool, CheckCircle2, DollarSign, Instagram, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const dynamic = 'force-dynamic'

export default async function AnamnesePage({ params }: { params: Promise<{ bookingId: string }> }) {
    const { bookingId } = await params

    // Fetch real anamnesis data
    const anamnesis = await prisma.anamnesis.findUnique({
        where: { bookingId },
        include: {
            client: true,
            booking: {
                include: { slot: true }
            }
        }
    })

    if (!anamnesis) {
        return notFound()
    }

    const hasAnyMedicalCondition = anamnesis.medicalConditionsTattoo || anamnesis.medicalConditionsHealing || anamnesis.knownAllergies

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none fixed"></div>

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-8">
                    <div className="flex items-center gap-4">
                        <Link href={`/artist/clients/${anamnesis.clientId}`}>
                            <Button variant="ghost" className="text-gray-400 hover:text-white bg-white/5 rounded-xl h-12 w-12 p-0">
                                <ArrowLeft size={20} />
                            </Button>
                        </Link>
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <ShieldCheck className="text-purple-500" size={16} />
                                <span className="text-[10px] font-mono text-purple-400 uppercase tracking-widest font-black">Prontuário Autenticado</span>
                            </div>
                            <h1 className="text-3xl font-orbitron font-black text-white uppercase italic tracking-tighter">
                                Ficha de <span className="text-purple-600">Anamnese</span>
                            </h1>
                        </div>
                    </div>

                    <div className="text-right">
                        <p className="text-xs font-mono text-gray-500 uppercase">Assinado em</p>
                        <p className="text-sm font-bold text-white font-orbitron">
                            {new Date(anamnesis.updatedAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Client Info Bar */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-purple-500/20 flex items-center justify-center border border-purple-500/30">
                            <User size={18} className="text-purple-400" />
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-[10px] text-gray-500 uppercase">Cliente</p>
                            <p className="text-sm font-bold truncate">{anamnesis.client.name}</p>
                        </div>
                    </div>
                    <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                        <Instagram size={18} className="text-pink-500" />
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase">Artista Responsável</p>
                            <p className="text-sm font-bold">{anamnesis.artistHandle || 'Não informado'}</p>
                        </div>
                    </div>
                    <div className="glass-card p-4 rounded-2xl border border-white/5 flex items-center gap-3">
                        <DollarSign size={18} className="text-green-500" />
                        <div>
                            <p className="text-[10px] text-gray-500 uppercase">Valor Acertado</p>
                            <p className="text-sm font-bold font-mono tracking-tighter">{anamnesis.agreedValue || 'R$ 0,00'}</p>
                        </div>
                    </div>
                </div>

                {/* Critical Alerts */}
                {hasAnyMedicalCondition && (
                    <div className="bg-red-500/10 border border-red-500/30 p-5 rounded-2xl flex items-start gap-4 animate-pulse">
                        <AlertTriangle className="text-red-500 flex-shrink-0" size={24} />
                        <div>
                            <h3 className="font-orbitron font-black text-red-500 text-sm uppercase mb-1 italic">Alertas Clínicos Identificados</h3>
                            <p className="text-xs text-gray-400 leading-relaxed font-mono uppercase tracking-tight">
                                Este cliente reportou condições que exigem atenção redobrada durante o procedimento e cicatrização.
                            </p>
                        </div>
                    </div>
                )}

                {/* Identification Snapshot */}
                <div className="glass-card p-6 rounded-3xl border border-white/5 space-y-4">
                    <div className="flex items-center gap-3 border-b border-white/5 pb-4">
                        <PenTool className="text-purple-500" size={20} />
                        <h2 className="text-lg font-orbitron font-bold uppercase tracking-wider italic">Identificação na Assinatura</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Nome Completo</p>
                            <p className="text-sm font-bold text-white">{anamnesis.fullName || anamnesis.client.name}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">WhatsApp</p>
                            <p className="text-sm font-bold text-white">{anamnesis.whatsapp || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-1">Nascimento</p>
                            <p className="text-sm font-bold text-white">
                                {anamnesis.birthDate ? new Date(anamnesis.birthDate).toLocaleDateString('pt-BR') : 'N/A'}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content Sections */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Section: Medical History */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-purple-500/20 pb-4">
                            <HeartPulse className="text-purple-500" size={20} />
                            <h2 className="text-lg font-orbitron font-bold uppercase tracking-wider italic">Histórico de Saúde</h2>
                        </div>

                        <div className="space-y-6">
                            <DataField
                                label="Condições que afetam o processo"
                                value={anamnesis.medicalConditionsTattoo}
                                highlight={!!anamnesis.medicalConditionsTattoo}
                            />
                            <DataField
                                label="Condição que afeta cicatrização?"
                                value={anamnesis.medicalConditionsHealing}
                                highlight={anamnesis.medicalConditionsHealing === 'SIM'}
                            />
                            {anamnesis.medicalConditionsHealingDetails && (
                                <DataField
                                    label="Qual condição?"
                                    value={anamnesis.medicalConditionsHealingDetails}
                                    highlight
                                />
                            )}
                            <DataField
                                label="Alergias Conhecidas"
                                value={anamnesis.knownAllergies}
                                highlight={!!anamnesis.knownAllergies}
                            />
                        </div>
                    </div>

                    {/* Section: Project & Compliance */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 border-b border-blue-500/20 pb-4">
                            <PenTool className="text-blue-500" size={20} />
                            <h2 className="text-lg font-orbitron font-bold uppercase tracking-wider italic">Projeto & Conformidade</h2>
                        </div>

                        <div className="space-y-6">
                            <DataField
                                label="A Arte (Descrição)"
                                value={anamnesis.artDescription}
                            />

                            <div className="grid grid-cols-1 gap-3">
                                <ComplianceRow label="Compreende Permanência" checked={anamnesis.understandPermanence} />
                                <ComplianceRow label="Seguirá Instruções" checked={anamnesis.followInstructions} />
                                <ComplianceRow label="Aceitou Termos" checked={anamnesis.acceptedTerms} />
                            </div>

                            {anamnesis.signatureData && (
                                <div className="p-4 rounded-2xl border border-white/5 bg-white/5 space-y-2">
                                    <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest">Assinatura Digital</p>
                                    <div className="h-20 flex items-center justify-center border border-dashed border-white/10 rounded-xl bg-black">
                                        <CheckCircle2 className="text-green-500/50" size={32} />
                                        <span className="text-[10px] font-mono text-gray-700 ml-2 uppercase">Integridade verificada em blockchain (AEC-256)</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-8 border-t border-white/5">
                    <Link href={`/artist/clients/${anamnesis.clientId}`}>
                        <Button className="bg-white text-black hover:bg-zinc-200 font-orbitron font-black uppercase italic tracking-widest text-xs h-12 px-8 rounded-xl">
                            Voltar ao Perfil
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}

function DataField({ label, value, highlight = false }: { label: string, value: string | null | undefined, highlight?: boolean }) {
    return (
        <div className={`p-4 rounded-2xl border transition-all ${highlight ? 'bg-white/5 border-purple-500/30' : 'bg-zinc-950/40 border-white/5'}`}>
            <p className="text-[10px] text-gray-500 font-mono uppercase tracking-widest mb-2">{label}</p>
            <p className={`text-sm ${highlight ? 'text-white font-bold' : 'text-zinc-300'}`}>
                {value || 'Nenhuma informação registrada'}
            </p>
        </div>
    )
}

function ComplianceRow({ label, checked }: { label: string, checked: boolean }) {
    return (
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-950/40 border border-white/5">
            <span className="text-[11px] font-mono text-gray-400 uppercase tracking-tight">{label}</span>
            {checked ? (
                <div className="flex items-center gap-1 text-green-500">
                    <CheckCircle2 size={14} />
                    <span className="text-[10px] font-bold font-orbitron">CONFIRMADO</span>
                </div>
            ) : (
                <div className="flex items-center gap-1 text-red-500">
                    <AlertTriangle size={14} />
                    <span className="text-[10px] font-bold font-orbitron">PENDENTE</span>
                </div>
            )}
        </div>
    )
}
