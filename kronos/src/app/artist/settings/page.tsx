'use client'

import React, { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Settings, User, Shield, Calendar, CreditCard, Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { GoogleSyncStatus } from '@/components/agenda/GoogleSyncStatus'
import { updateArtistSettings } from '@/app/actions/settings'

export default function SettingsPage() {
    const { data: session, update: updateSession } = useSession()
    const [loading, setLoading] = useState(false)

    // Form state
    const [name, setName] = useState('')
    const [commission, setCommission] = useState('')

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

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12">
            <div className="max-w-4xl mx-auto space-y-12 pb-20">
                {/* Header */}
                <div className="flex items-center gap-4 border-b border-white/5 pb-8">
                    <div className="p-3 bg-purple-500/10 rounded-2xl border border-purple-500/20">
                        <Settings className="text-purple-400" size={32} />
                    </div>
                    <div>
                        <h1 className="text-3xl font-orbitron font-black tracking-tighter uppercase">Configurações</h1>
                        <p className="text-sm text-gray-500 font-mono uppercase tracking-widest">Painel de Controle do Sistema</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Navigation Sidebar */}
                    <aside className="space-y-2">
                        <SidebarLink icon={<User size={18} />} label="Perfil do Artista" active />
                        <SidebarLink icon={<Calendar size={18} />} label="Sincronização" />
                        <SidebarLink icon={<CreditCard size={18} />} label="Assinatura & Plano" />
                        <SidebarLink icon={<Bell size={18} />} label="Notificações" />
                        <SidebarLink icon={<Shield size={18} />} label="Segurança" />
                    </aside>

                    {/* Content */}
                    <div className="md:col-span-2 space-y-8">
                        {/* Profile Section */}
                        <section className="bg-gray-900/40 border border-white/5 p-6 rounded-2xl space-y-6">
                            <div className="flex items-center gap-2 mb-4">
                                <User className="text-purple-400" size={20} />
                                <h2 className="font-bold uppercase tracking-wider text-sm">Informações Pessoais</h2>
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
