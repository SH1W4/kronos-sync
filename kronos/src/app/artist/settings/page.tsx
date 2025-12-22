'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Settings, User, Shield, Calendar, CreditCard, Bell, Link as LinkIcon, Copy, Check, Instagram, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GoogleSyncStatus } from '@/components/agenda/GoogleSyncStatus'
import { updateArtistSettings } from '@/app/actions/settings'
import { analyzeInstagramProfile, applyKaiBranding } from '@/app/actions/kai'
import { KaiAnalysisModal } from '@/components/kai/AnalysisModal'

export default function SettingsPage() {
    const { data: session, update: updateSession } = useSession()
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    // Form state
    const [name, setName] = useState('')
    const [commission, setCommission] = useState('')
    const [instagram, setInstagram] = useState('')

    // KAI State
    const [isKaiModalOpen, setIsKaiModalOpen] = useState(false)
    const [isKaiLoading, setIsKaiLoading] = useState(false)
    const [kaiSuggestions, setKaiSuggestions] = useState<any>(undefined)

    // Initialize values when session is available
    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || '')
            if ((session.user as any).commissionRate !== undefined) {
                setCommission(String((session.user as any).commissionRate * 100))
            }
        }
    }, [session])

    const handleSave = async () => {
        setLoading(true)
        try {
            const result = await updateArtistSettings({
                name,
                commissionRate: parseFloat(commission)
            })

            if (result.success) {
                await updateSession()
                alert('Configurações salvas com sucesso!')
            } else {
                alert(result.error || 'Erro ao salvar')
            }
        } catch (error) {
            console.error('Error saving settings:', error)
            alert('Erro ao salvar as configurações')
        } finally {
            setLoading(false)
        }
    }

    const handleKaiAnalysis = async () => {
        if (!instagram) {
            alert('Por favor, insira o seu arroba do Instagram primeiro.')
            return
        }
        setIsKaiModalOpen(true)
        setIsKaiLoading(true)
        try {
            const result = await analyzeInstagramProfile(instagram)
            if (result.success) {
                setKaiSuggestions(result.suggestions)
            } else {
                alert(result.error || 'Falha na análise KAI')
                setIsKaiModalOpen(false)
            }
        } catch (error) {
            console.error('KAI Error:', error)
            alert('Erro ao processar análise KAI')
            setIsKaiModalOpen(false)
        } finally {
            setIsKaiLoading(false)
        }
    }

    const handleApplyKaiBranding = async (data: any) => {
        setLoading(true)
        try {
            const result = await applyKaiBranding(data)
            if (result.success) {
                // Mock update local status
                alert('Branding aplicado com sucesso!')
                setIsKaiModalOpen(false)
            } else {
                alert(result.error || 'Erro ao aplicar')
            }
        } catch (e) {
            alert('Erro ao aplicar branding')
        } finally {
            setLoading(false)
        }
    }

    const clientLink = session?.user ? `${window.location.protocol}//${window.location.host}/onboarding` : '#'

    const copyToClipboard = () => {
        navigator.clipboard.writeText(clientLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 relative overflow-hidden data-pattern-grid">
            {/* Cyber Y2K Effects */}
            <div className="scanline" />
            <div className="max-w-4xl mx-auto space-y-12 pb-20">
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                    <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                        <Settings className="text-purple-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-orbitron font-black tracking-tighter uppercase pixel-text">Configurações</h1>
                        <p className="text-sm text-gray-500 font-mono uppercase tracking-widest">Painel de Controle do Sistema</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Navigation Sidebar */}
                    <aside className="space-y-2">
                        <SidebarLink icon={<User size={18} />} label="Perfil do Artista" active />
                        <SidebarLink icon={<LinkIcon size={18} />} label="Link do Cliente" />
                        <SidebarLink icon={<Calendar size={18} />} label="Sincronização" />
                        <SidebarLink icon={<CreditCard size={18} />} label="Assinatura & Plano" />
                        <SidebarLink icon={<Shield size={18} />} label="Segurança" />
                    </aside>

                    {/* Content */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Workspace Link (Locked) */}
                        <div className="space-y-4 mb-8">
                            <label className="text-[10px] font-mono text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Shield className="w-3 h-3 text-purple-500" />
                                Vínculo de Workspace
                            </label>
                            <div className="bg-purple-500/5 border border-purple-500/20 p-4 rounded-xl flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                                    <span className="font-mono text-xs text-white font-bold uppercase tracking-widest">
                                        {(session as any)?.workspaces?.find((w: any) => w.id === (session as any).activeWorkspaceId)?.name || 'ESTÚDIO KRONØS'}
                                    </span>
                                </div>
                                <span className="text-[8px] font-black font-mono text-purple-500/60 uppercase tracking-widest border border-purple-500/30 px-2 py-1 rounded">VÍNCULO ATIVO</span>
                            </div>
                            <p className="text-[9px] font-mono text-gray-500 italic opacity-60">Status: Account bound to this studio. Deployment locked.</p>
                        </div>

                        {/* Profile Section */}
                        <section className="bg-gray-950/60 border border-white/5 p-6 rounded-2xl space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="text-purple-400" size={20} />
                                <h2 className="font-bold uppercase tracking-wider text-sm pixel-text">Informações Pessoais</h2>
                            </div>

                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-gray-500 uppercase">Nome de Exibição</label>
                                    <Input
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        className="bg-black/50 border-white/10"
                                    />
                                </div>

                                {/* Instagram & KAI Section */}
                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-gray-500 uppercase">Instagram Business (@)</label>
                                    <div className="flex gap-2">
                                        <div className="relative flex-1">
                                            <Instagram size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <Input
                                                placeholder="@seu_perfil"
                                                value={instagram}
                                                onChange={(e) => setInstagram(e.target.value)}
                                                className="bg-black/50 border-white/10 pl-9"
                                            />
                                        </div>
                                        <Button
                                            onClick={handleKaiAnalysis}
                                            disabled={isKaiLoading}
                                            className="bg-purple-600/10 border border-purple-500/20 text-purple-400 hover:bg-purple-600 hover:text-white transition-all gap-2 text-xs font-bold"
                                        >
                                            <Sparkles size={14} className={isKaiLoading ? 'animate-spin' : ''} />
                                            ANALISAR KAI
                                        </Button>
                                    </div>
                                    <p className="text-[10px] text-gray-500 leading-relaxed italic">
                                        DICA: Usamos IA para analisar seu feed e sugerir automaticamente bio, cores e tags de estilo para o seu perfil.
                                    </p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-mono text-gray-500 uppercase">Comissão Padrão (%)</label>
                                    <Input
                                        type="number"
                                        value={commission}
                                        onChange={(e) => setCommission(e.target.value)}
                                        className="bg-black/50 border-white/10"
                                    />
                                </div>
                            </div>
                        </section>

                        {/* Client Link Section */}
                        <section className="bg-gray-900/40 border border-white/5 p-6 rounded-2xl space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <LinkIcon className="text-purple-400" size={20} />
                                <h2 className="font-bold uppercase tracking-wider text-sm">Jornada do Cliente</h2>
                            </div>

                            <div className="space-y-4">
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Compartilhe este link com seus clientes ou gere um QR Code para que eles iniciem o processo de agendamento e anamnese.
                                </p>

                                <div className="flex gap-2">
                                    <div className="flex-1 bg-black/50 border border-white/10 rounded-xl px-4 h-12 flex items-center overflow-hidden">
                                        <code className="text-xs text-purple-400 truncate">{clientLink}</code>
                                    </div>
                                    <Button
                                        onClick={copyToClipboard}
                                        variant="outline"
                                        className="h-12 w-12 border-white/10 p-0 flex items-center justify-center hover:bg-white hover:text-black transition-all"
                                    >
                                        {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                    </Button>
                                </div>

                                <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                                    <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest text-center">
                                        DICA: Este link levará o cliente diretamente para o fluxo de triagem do seu estúdio.
                                    </p>
                                </div>
                            </div>
                        </section>

                        {/* Integration Section */}
                        <section className="bg-gray-900/40 border border-white/5 p-6 rounded-2xl space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <Calendar className="text-purple-400" size={20} />
                                <h2 className="font-bold uppercase tracking-wider text-sm">Integrações Externas</h2>
                            </div>

                            <div className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-4">
                                <p className="text-xs text-gray-400 leading-relaxed">
                                    Conecte sua conta Google para sincronizar automaticamente seus agendamentos no KRONØS com sua agenda pessoal.
                                </p>
                                <div className="flex justify-start">
                                    <GoogleSyncStatus />
                                </div>
                            </div>
                        </section>

                        {/* Save Button */}
                        <div className="flex justify-end pt-4">
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                className="bg-purple-600 hover:bg-purple-500 font-bold px-8 h-12 rounded-xl transition-all hover:scale-105 active:scale-95"
                            >
                                {loading ? 'SALVANDO...' : 'SALVAR ALTERAÇÕES'}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            {/* KAI MODAL */}
            <KaiAnalysisModal
                isOpen={isKaiModalOpen}
                isLoading={isKaiLoading}
                suggestions={kaiSuggestions}
                onClose={() => setIsKaiModalOpen(false)}
                onApply={handleApplyKaiBranding}
            />
        </div>
    )
}

function SidebarLink({ icon, label, active = false }: { icon: React.ReactNode, label: string, active?: boolean }) {
    return (
        <button className={`
            w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-widest uppercase transition-all
            ${active ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'text-gray-500 hover:bg-white/5 hover:text-white'}
        `}>
            {icon}
            <span>{label}</span>
        </button>
    )
}
