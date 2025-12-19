'use client'

import React, { useState, useEffect } from 'react'
import { CheckCircle2, AlertCircle, RefreshCw, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getCalendarStatus, syncAllBookings } from '@/app/actions/calendar'
import { signIn } from 'next-auth/react'

export function GoogleSyncStatus() {
    const [status, setStatus] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [syncing, setSyncing] = useState(false)

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
        } catch (error) {
            console.error('Error syncing:', error)
        } finally {
            setSyncing(false)
        }
    }

    const handleConnect = () => {
        signIn('google', { callbackUrl: window.location.href })
    }

    if (loading) return <div className="animate-pulse h-8 w-32 bg-gray-800 rounded-lg" />

    if (!status?.connected) {
        return (
            <Button
                onClick={handleConnect}
                variant="outline"
                size="sm"
                className="gap-2 border-purple-500/20 text-purple-400 hover:bg-purple-500/10 text-xs"
            >
                <ExternalLink size={14} />
                Conectar Google Agenda
            </Button>
        )
    }

    return (
        <div className="flex items-center gap-4 bg-gray-900/50 border border-white/10 p-1 px-3 rounded-lg">
            <div className="flex items-center gap-2">
                {status.hasRequiredScopes ? (
                    <CheckCircle2 className="text-green-500" size={14} />
                ) : (
                    <AlertCircle className="text-yellow-500" size={14} />
                )}
                <span className="text-xs font-medium text-gray-300">
                    {status.hasRequiredScopes ? 'Google Sync Ativo' : 'Permissões Pendentes'}
                </span>
            </div>

            <Button
                onClick={handleSync}
                disabled={syncing}
                variant="ghost"
                size="sm"
                className="h-7 px-2 gap-1.5 text-xs text-gray-400 hover:text-white"
            >
                <RefreshCw className={`w-3 h-3 ${syncing ? 'animate-spin text-purple-400' : ''}`} />
                Sincronizar
            </Button>
        </div>
    )
}
