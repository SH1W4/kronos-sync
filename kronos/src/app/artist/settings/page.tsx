'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Settings, User, Shield, Calendar, CreditCard, Bell, Link as LinkIcon, Copy, Check, Instagram, Sparkles, Users, Landmark, Trash2, Palette } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GoogleSyncStatus } from '@/components/agenda/GoogleSyncStatus'
import { updateArtistSettings } from '@/app/actions/settings'
import { updateWorkspaceFinance, updateWorkspaceBranding, updateWorkspaceCalendar } from '@/app/actions/workspaces'
import { updateUserTheme, updateWorkspaceCapacity } from '@/app/actions/settings'
import { useRouter } from 'next/navigation'
import { InkPassCard } from '@/components/invites/InkPassCard'
import { getInvites, createInvite, revokeInvite } from '@/app/actions/invites'

import { useTheme } from '@/contexts/theme-context'

export default function SettingsPage() {
    const { data: session, update: updateSession } = useSession()
    const { theme, setTheme } = useTheme()
    const router = useRouter()
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    // Form state
    const [name, setName] = useState('')
    const [commission, setCommission] = useState('')
    const [instagram, setInstagram] = useState('')

    const [kaiSuggestions, setKaiSuggestions] = useState<any>(undefined)

    // PIX State
    const [pixKey, setPixKey] = useState('')
    const [pixRecipient, setPixRecipient] = useState('')
    const [isPixLoading, setIsPixLoading] = useState(false)

    // Workspace Stats
    const [studioName, setStudioName] = useState('')
    const [studioColor, setStudioColor] = useState('#8B5CF6')
    const [studioCapacity, setStudioCapacity] = useState(5)

    // Personal State
    const [personalColor, setPersonalColor] = useState('#8B5CF6')

    // Google Calendar State
    const [googleCalendarId, setGoogleCalendarId] = useState('')

    // Invite/Team State
    const [invites, setInvites] = useState<any[]>([])
    const [isInvitesLoading, setIsInvitesLoading] = useState(false)
    const [newInviteType, setNewInviteType] = useState<'RESIDENT' | 'GUEST'>('RESIDENT')
    const [newInviteCode, setNewInviteCode] = useState('')
    const [selectedInvite, setSelectedInvite] = useState<any>(null)
    const [activeTab, setActiveTab] = useState<'profile' | 'link' | 'sync' | 'plan' | 'security' | 'payments' | 'studio' | 'appearance'>('profile')

    // Initialize values when session is available
    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || '')
            if ((session.user as any).commissionRate !== undefined) {
                setCommission(String((session.user as any).commissionRate * 100))
            }
            if ((session.user as any).instagram) {
                setInstagram((session.user as any).instagram)
            }

            // Initialize PIX if available
            const activeWsid = (session as any).activeWorkspaceId || (session?.user as any).activeWorkspaceId
            const currentWorkspace = (session as any)?.workspaces?.find((w: any) => w.id === activeWsid)
            if (currentWorkspace) {
                setPixKey(currentWorkspace.pixKey || '')
                setPixRecipient(currentWorkspace.pixRecipient || '')
                setStudioName(currentWorkspace.name || '')
                setStudioColor(currentWorkspace.primaryColor || '#8B5CF6')
                setStudioCapacity(currentWorkspace.capacity || 5)
                setGoogleCalendarId(currentWorkspace.googleCalendarId || '')
            }

            if ((session?.user as any).customColor) {
                setPersonalColor((session.user as any).customColor)
            }
        }
    }, [session])

    const fetchInvites = async () => {
        setIsInvitesLoading(true)
        try {
            const data = await getInvites()
            setInvites(data)
        } catch (e) {
            console.error(e)
        } finally {
            setIsInvitesLoading(false)
        }
    }

    /* Removing automatic fetch of invites in settings as it moved to /team */

    const handleSave = async () => {
        setLoading(true)
        try {
            const result = await updateArtistSettings({
                name,
                commissionRate: parseFloat(commission),
                instagram
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


    const clientLink = session?.user ? `${window.location.protocol}//${window.location.host}/onboarding` : '#'

    const copyToClipboard = () => {
        navigator.clipboard.writeText(clientLink)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }


    const handleCreateInvite = async () => {
        setLoading(true)
        try {
            const result = await createInvite({
                role: 'ARTIST',
                targetPlan: newInviteType,
                customCode: newInviteCode || undefined
            })
            if (result.success) {
                alert('Chave gerada com sucesso!')
                setNewInviteCode('')
                fetchInvites()
            } else {
                alert(result.error)
            }
        } catch (e) {
            alert('Erro ao gerar chave')
        } finally {
            setLoading(false)
        }
    }

    const handleRevokeInvite = async (id: string) => {
        if (!confirm('Deseja realmente revogar esta chave?')) return
        try {
            const result = await revokeInvite(id)
            if (result.success) {
                fetchInvites()
            } else {
                alert(result.error)
            }
        } catch (e) {
            alert('Erro ao revogar')
        }
    }

    const handleStudioSave = async () => {
        setLoading(true)
        try {
            // Update Branding
            const brandingResult = await updateWorkspaceBranding({
                name: studioName,
                primaryColor: studioColor
            })

            // Update Capacity
            const capacityResult = await updateWorkspaceCapacity(studioCapacity)

            // Update Google Calendar
            const calendarResult = await updateWorkspaceCalendar({
                googleCalendarId: googleCalendarId || undefined
            })

            if (brandingResult.success && capacityResult.success && calendarResult.success) {
                alert('Configurações do estúdio salvas com sucesso!')
                await updateSession()
            } else {
                alert(brandingResult.error || capacityResult.error || calendarResult.error || 'Erro ao salvar')
            }
        } catch (e) {
            alert('Erro ao salvar configurações do estúdio')
        } finally {
            setLoading(false)
        }
    }

    const handleThemeSave = async () => {
        setLoading(true)
        try {
            const result = await updateUserTheme(personalColor)
            if (result.success) {
                alert('Tema aplicado com sucesso!')
                await updateSession()
            } else {
                alert(result.error || 'Erro ao aplicar tema')
            }
        } catch (e) {
            alert('Erro ao aplicar tema')
        } finally {
            setLoading(false)
        }
    }

    const handleSaveStudio = async () => {
        setLoading(true)
        try {
            const result = await updateWorkspaceBranding({
                name: studioName,
                primaryColor: studioColor
            })
            if (result.success) {
                alert('Branding do estúdio atualizado!')
                await updateSession()
            } else {
                alert(result.error)
            }
        } catch (e) {
            alert('Erro ao salvar branding')
        } finally {
            setLoading(false)
        }
    }

    const handleSavePersonalTheme = async () => {
        setLoading(true)
        try {
            const result = await updateUserTheme(personalColor)
            if (result.success) {
                // Update in-memory theme immediately
                setTheme({ ...theme, primaryColor: personalColor })

                alert('Tema pessoal atualizado!')
                await updateSession()
            } else {
                alert(result.error)
            }
        } catch (e) {
            alert('Erro ao salvar tema')
        } finally {
            setLoading(false)
        }
    }

    const handleSavePix = async () => {
        setIsPixLoading(true)
        try {
            const result = await updateWorkspaceFinance({ pixKey, pixRecipient })
            if (result.success) {
                alert('Dados PIX atualizados!')
                await updateSession()
            } else {
                alert(result.error)
            }
        } catch (e) {
            alert('Erro ao salvar PIX')
        } finally {
            setIsPixLoading(false)
        }
    }

    const isAdmin = (session?.user as any)?.role === 'ADMIN'

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
                        <SidebarLink
                            icon={<User size={18} />}
                            label="Perfil do Artista"
                            active={activeTab === 'profile'}
                            onClick={() => setActiveTab('profile')}
                        />
                        <SidebarLink
                            icon={<LinkIcon size={18} />}
                            label="Link do Cliente"
                            active={activeTab === 'link'}
                            onClick={() => setActiveTab('link')}
                        />
                        <SidebarLink
                            icon={<Calendar size={18} />}
                            label="Sincronização"
                            active={activeTab === 'sync'}
                            onClick={() => setActiveTab('sync')}
                        />
                        <SidebarLink
                            icon={<CreditCard size={18} />}
                            label="Assinatura & Plano"
                            active={activeTab === 'plan'}
                            onClick={() => setActiveTab('plan')}
                        />
                        <SidebarLink
                            icon={<Shield size={18} />}
                            label="Segurança"
                            active={activeTab === 'security'}
                            onClick={() => setActiveTab('security')}
                        />
                        {isAdmin && (
                            <>
                                <SidebarLink
                                    icon={<Users size={18} />}
                                    label="Ir para Equipe"
                                    active={false}
                                    onClick={() => router.push('/artist/team')}
                                />
                                <SidebarLink
                                    icon={<Settings size={18} />}
                                    label="Estúdio"
                                    active={activeTab === 'studio'}
                                    onClick={() => setActiveTab('studio')}
                                />
                                <SidebarLink
                                    icon={<Landmark size={18} />}
                                    label="Pagamentos"
                                    active={activeTab === 'payments'}
                                    onClick={() => setActiveTab('payments')}
                                />
                            </>
                        )}
                        <SidebarLink
                            icon={<Palette size={18} />}
                            label="Aparência"
                            active={activeTab === 'appearance'}
                            onClick={() => setActiveTab('appearance')}
                        />
                    </aside>

                    {/* Content */}
                    <div className="md:col-span-2 space-y-8 animate-in fade-in slide-in-from-right-4 duration-300">
                        {activeTab === 'profile' && (
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
                                        <div className="relative">
                                            <Instagram size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
                                            <Input
                                                placeholder="@seu_perfil"
                                                value={instagram}
                                                onChange={(e) => setInstagram(e.target.value)}
                                                className="bg-black/50 border-white/10 pl-9"
                                            />
                                        </div>
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

                                    <div className="flex justify-end pt-4 border-t border-white/5">
                                        <Button
                                            onClick={handleSave}
                                            disabled={loading}
                                            className="bg-purple-600 hover:bg-purple-500 font-bold px-8 h-10 rounded-xl transition-all"
                                        >
                                            {loading ? 'SALVANDO...' : 'SALVAR PERFIL'}
                                        </Button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'link' && (
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
                                </div>
                            </section>
                        )}

                        {activeTab === 'sync' && (
                            <section className="bg-gray-900/40 border border-white/5 p-6 rounded-2xl space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Calendar className="text-purple-400" size={20} />
                                    <h2 className="font-bold uppercase tracking-wider text-sm">Sincronização</h2>
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
                        )}

                        {activeTab === 'plan' && (
                            <section className="bg-gray-900/40 border border-white/5 p-6 rounded-2xl space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <CreditCard className="text-purple-400" size={20} />
                                    <h2 className="font-bold uppercase tracking-wider text-sm text-purple-400">Assinatura & Plano</h2>
                                </div>

                                <div className="border border-purple-500/20 bg-purple-500/5 p-8 rounded-2xl text-center space-y-4">
                                    <h3 className="text-xl font-orbitron font-bold">PLANO RESIDENTE</h3>
                                    <p className="text-xs text-gray-500 font-mono uppercase tracking-widest">Status: Ativo até 2026</p>
                                    <div className="h-px bg-white/5 w-full" />
                                    <p className="text-[10px] text-gray-400 leading-relaxed">Seu plano atual permite acesso ilimitado ao Kiosk, Financeiro Avançado e Assistente KAI.</p>
                                </div>
                            </section>
                        )}

                        {activeTab === 'security' && (
                            <section className="bg-gray-900/40 border border-white/5 p-6 rounded-2xl space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Shield className="text-red-400" size={20} />
                                    <h2 className="font-bold uppercase tracking-wider text-sm text-red-400">Segurança de Workspace</h2>
                                </div>

                                <div className="space-y-4">
                                    <p className="text-xs text-gray-400 leading-relaxed">
                                        Este dispositivo e conta estão vinculados permanentemente ao workspace abaixo. Esta trava garante a integridade dos dados e o isolamento de silo.
                                    </p>
                                    <div className="bg-red-500/5 border border-red-500/20 p-4 rounded-xl flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                                            <span className="font-mono text-xs text-white font-bold uppercase tracking-widest">
                                                {(session as any)?.workspaces?.find((w: any) => w.id === (session?.user as any).activeWorkspaceId)?.name || 'ESTÚDIO KRONØS'}
                                            </span>
                                        </div>
                                        <span className="text-[8px] font-black font-mono text-red-500/60 uppercase tracking-widest border border-red-500/30 px-2 py-1 rounded">VÍNCULO ATIVO</span>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'payments' && isAdmin && (
                            <section className="bg-gray-950/60 border border-white/5 p-6 rounded-2xl space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Landmark className="text-green-400" size={20} />
                                    <h2 className="font-bold uppercase tracking-wider text-sm pixel-text">Configuração de Recebimento</h2>
                                </div>

                                <div className="space-y-4">
                                    <div className="p-4 bg-green-500/5 border border-green-500/10 rounded-xl mb-6">
                                        <p className="text-[10px] font-mono text-green-400 uppercase tracking-widest leading-relaxed">
                                            ATENÇÃO: Este PIX será utilizado para todos os recebimentos do estúdio através do Kiosk e links de pagamento.
                                        </p>
                                    </div>

                                    <div className="grid gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-gray-500 uppercase">Chave PIX do Estúdio</label>
                                            <Input
                                                placeholder="CPF, CNPJ, E-mail ou Chave Aleatória"
                                                value={pixKey}
                                                onChange={(e) => setPixKey(e.target.value)}
                                                className="bg-black/50 border-white/10 font-mono text-green-400"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-gray-500 uppercase">Nome do Recebedor (Titular)</label>
                                            <Input
                                                placeholder="Nome completo ou Razão Social"
                                                value={pixRecipient}
                                                onChange={(e) => setPixRecipient(e.target.value)}
                                                className="bg-black/50 border-white/10"
                                            />
                                        </div>

                                        <div className="flex justify-end pt-4 border-t border-white/5">
                                            <Button
                                                onClick={handleSavePix}
                                                disabled={isPixLoading}
                                                className="bg-green-600 hover:bg-green-500 font-bold px-8 h-10 rounded-xl transition-all"
                                            >
                                                {isPixLoading ? 'PROCESSANDO...' : 'SALVAR CHAVE PIX'}
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </section>
                        )}


                        {activeTab === 'studio' && isAdmin && (
                            <section className="bg-gray-950/60 border border-white/5 p-6 rounded-2xl space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Settings className="text-purple-400" size={20} />
                                    <h2 className="font-bold uppercase tracking-wider text-sm pixel-text">Configuração do Estúdio</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-4 bg-purple-500/5 border border-purple-500/10 rounded-xl">
                                        <p className="text-[10px] font-mono text-purple-400 uppercase tracking-widest mb-2">Soberania de Workspace</p>
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            Configure a identidade visual global e a capacidade operacional do seu estúdio.
                                        </p>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-gray-500 uppercase">Nome do Estúdio</label>
                                            <Input
                                                value={studioName}
                                                onChange={(e) => setStudioName(e.target.value)}
                                                className="bg-black/50 border-white/10"
                                                placeholder="KRONØS STUDIO"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[10px] font-mono text-gray-500 uppercase">Capacidade (Macas)</label>
                                            <Input
                                                type="number"
                                                min={1}
                                                max={20}
                                                value={studioCapacity}
                                                onChange={(e) => setStudioCapacity(parseInt(e.target.value))}
                                                className="bg-black/50 border-white/10"
                                            />
                                            <p className="text-[9px] text-gray-600">Quantos atendimentos simultâneos o estúdio suporta.</p>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-gray-500 uppercase">Cor Primária do Workspace</label>
                                        <div className="flex gap-4 items-center">
                                            <input
                                                type="color"
                                                value={studioColor}
                                                onChange={(e) => setStudioColor(e.target.value)}
                                                className="w-16 h-16 rounded-xl border-2 border-white/10 cursor-pointer bg-transparent"
                                            />
                                            <div className="flex-1 space-y-1">
                                                <code className="text-xs text-purple-400 font-mono">{studioColor}</code>
                                                <p className="text-[10px] text-gray-500">Esta cor será aplicada globalmente no HUD de todos os membros do workspace.</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Google Calendar Integration */}
                                    <div className="space-y-2 border-t border-white/5 pt-6">
                                        <div className="flex items-center gap-2 mb-3">
                                            <Calendar className="text-blue-400" size={16} />
                                            <label className="text-[10px] font-mono text-blue-400 uppercase tracking-widest">Integração Google Calendar</label>
                                        </div>
                                        <p className="text-[10px] text-gray-500 mb-3">
                                            Cole o ID do calendário compartilhado do Google para sincronizar todos os agendamentos automaticamente.
                                        </p>
                                        <Input
                                            placeholder="abc123@group.calendar.google.com"
                                            value={googleCalendarId}
                                            onChange={(e) => setGoogleCalendarId(e.target.value)}
                                            className="bg-black/50 border-white/10 font-mono text-xs"
                                        />
                                        <p className="text-[9px] text-gray-600">Encontre o ID em: Google Agenda → Configurações do Calendário → Integrar calendário</p>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            onClick={handleStudioSave}
                                            disabled={loading}
                                            className="bg-primary hover:opacity-80 text-background font-bold px-8 h-10 rounded-xl transition-all"
                                        >
                                            {loading ? 'SALVANDO...' : 'SALVAR CONFIGURAÇÕES'}
                                        </Button>
                                    </div>
                                </div>
                            </section>
                        )}

                        {activeTab === 'appearance' && (
                            <section className="bg-gray-950/60 border border-white/5 p-6 rounded-2xl space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <Palette className="text-primary" size={20} />
                                    <h2 className="font-bold uppercase tracking-wider text-sm pixel-text">Personalização do HUD</h2>
                                </div>

                                <div className="space-y-6">
                                    <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                                        <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-2">Identidade Visual Pessoal</p>
                                        <p className="text-xs text-gray-400 leading-relaxed">
                                            Customize a cor do seu HUD pessoal. Esta configuração afeta apenas a sua visualização e não impacta outros membros do workspace.
                                        </p>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-mono text-gray-500 uppercase">Cor Primária Pessoal</label>
                                        <div className="flex gap-4 items-center">
                                            <input
                                                type="color"
                                                value={personalColor}
                                                onChange={(e) => setPersonalColor(e.target.value)}
                                                className="w-16 h-16 rounded-xl border-2 border-white/10 cursor-pointer bg-transparent"
                                            />
                                            <div className="flex-1 space-y-1">
                                                <code className="text-xs font-mono" style={{ color: personalColor }}>{personalColor}</code>
                                                <p className="text-[10px] text-gray-500">Painéis, botões, brilhos e scanlines se adaptarão à sua assinatura cromática.</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="p-4 bg-white/5 rounded-xl border border-white/10">
                                        <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-3">Preview do HUD</p>
                                        <div
                                            className="h-32 rounded-xl border-2 transition-all duration-300"
                                            style={{
                                                borderColor: personalColor,
                                                background: `linear-gradient(135deg, ${personalColor}10, transparent)`,
                                                boxShadow: `0 0 20px ${personalColor}20`
                                            }}
                                        >
                                            <div className="p-4 flex items-center justify-center h-full">
                                                <span
                                                    className="text-sm font-orbitron font-bold tracking-wider"
                                                    style={{ color: personalColor }}
                                                >
                                                    KRONØS SYNC
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex justify-end">
                                        <Button
                                            onClick={handleSavePersonalTheme}
                                            disabled={loading}
                                            className="bg-primary hover:opacity-80 text-background font-bold px-8 h-10 rounded-xl transition-all shadow-[0_4px_20px_var(--primary-glow)]"
                                        >
                                            {loading ? 'APLICANDO...' : 'APLICAR TEMA'}
                                        </Button>
                                    </div>
                                </div>
                            </section>
                        )}
                    </div>
                </div>
            </div>

        </div>
    )
}

function SidebarLink({ icon, label, active = false, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
    return (
        <button
            onClick={onClick}
            className={`
                w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-mono tracking-widest uppercase transition-all
                ${active ? 'bg-primary/10 text-primary border border-primary/20 shadow-[0_0_15px_var(--primary-glow)]' : 'text-gray-500 hover:bg-white/5 hover:text-white'}
            `}
        >
            {icon}
            <span>{label}</span>
        </button>
    )
}
