'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCalendarStatus, syncAllBookings } from '@/app/actions/calendar'
import { useUser } from '@clerk/nextjs'
import { updateArtistSettings } from '@/app/actions/settings'
import { toast } from '@/components/ui/use-toast'

export function GoogleSyncStatus() {
    const [status, setStatus] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)
    const [toggling, setToggling] = useState(false)

    useEffect(() => {
        loadStatus()
    }, [])

    const loadStatus = async () => {
        setLoading(true)
        try {
            const result = await getCalendarStatus()
            setStatus(result)
        } catch (error) {
            console.error('Error loading sync status:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSync = async () => {
        setSyncing(true)
        try {
            await syncAllBookings()
            await loadStatus()
            toast({ title: "Sincronização Concluída", description: "Eventos exportados com sucesso." })
        } catch (error) {
            console.error('Error syncing:', error)
            toast({ title: "Erro na Sincronização", description: "Falha ao exportar eventos.", variant: "destructive" })
        } finally {
            setSyncing(false)
        }
    }

    const { user } = useUser()

    const handleConnect = async () => {
         if (!user) return

         try {
             const externalAccount = await user.createExternalAccount({
                 strategy: 'oauth_google',
                 redirectUrl: window.location.href
             })
             
             if (externalAccount.verification?.externalVerificationRedirectUrl) {
                window.location.href = externalAccount.verification.externalVerificationRedirectUrl
             }
         } catch (err) {
             console.error("Link google error:", err)
             toast({ title: "Erro ao conectar", description: "Tente novamente mais tarde.", variant: "destructive" })
         }
    }

    const handleToggleSync = async (checked: boolean) => {
        setToggling(true)
        try {
            const result = await updateArtistSettings({ calendarSyncEnabled: checked })
            if (result.success) {
                setStatus((prev: any) => ({ ...prev, calendarSyncEnabled: checked }))
                toast({
                    title: checked ? "Push Ativado" : "Push Desativado",
                    description: checked
                        ? "Seus agendamentos serão enviados para sua agenda pessoal."
                        : "Sincronização automática pausada."
                })
            } else {
                throw new Error(result.error)
            }
        } catch (error) {
            toast({ title: "Erro ao atualizar", description: "Não foi possível alterar a configuração.", variant: "destructive" })
        } finally {
            setToggling(false)
        }
    }

    if (loading) return <div className="animate-pulse h-20 w-full bg-gray-800/50 rounded-lg" />

    if (!status?.connected) {
        return (
            <Button
                onClick={handleConnect}
                variant="outline"
                size="sm"
                className="gap-2 border-primary/20 text-primary hover:bg-primary/10 text-xs w-full h-12"
            >
                <ExternalLink size={14} />
                Conectar Google Agenda
            </Button>
        )
    }

    return (
        <div className="space-y-4">
            {/* Connected Info */}
            <div className="flex items-center gap-4 bg-gray-900/50 border border-white/10 p-3 rounded-xl">
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        {status.hasRequiredScopes ? (
                            <CheckCircle2 className="text-green-500" size={14} />
                        ) : (
                            <AlertCircle className="text-yellow-500" size={14} />
                        )}
                        <span className="text-xs font-bold text-white uppercase tracking-wider">
                            Conectado
                        </span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-mono truncate max-w-[200px]">
                        {status.email}
                    </p>
                </div>

                <Button
                    onClick={handleSync}
                    disabled={syncing}
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-gray-400 hover:text-white hover:bg-white/10"
                    title="Forçar Sincronização Agora"
                >
                    <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-primary' : ''}`} />
                </Button>
            </div>

            {/* Sync Toggle */}
            <div className="flex items-center justify-between p-3 bg-white/5 rounded-xl border border-white/5">
                <div className="space-y-1">
                    <span className="text-xs font-semibold text-gray-200 block">Push para Pessoal</span>
                    <p className="text-[9px] text-gray-500 leading-tight max-w-[180px]">
                        Enviar agendamentos do KRONØS para sua agenda pessoal Google.
                    </p>
                </div>

                {/* Custom Toggle Switch */}
                <button
                    onClick={() => handleToggleSync(!status.calendarSyncEnabled)}
                    disabled={toggling}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-black ${status.calendarSyncEnabled ? 'bg-primary' : 'bg-gray-700'
                        }`}
                >
                    <span
                        className={`${status.calendarSyncEnabled ? 'translate-x-6' : 'translate-x-1'
                            } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
                    />
                </button>
            </div>
        </div>
    )
}
