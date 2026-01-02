'use client'

import { useEffect, useState } from 'react'
import { X, Download } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function InstallPWABanner() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [showBanner, setShowBanner] = useState(false)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            return // Already installed
        }

        // Check if user dismissed before
        const dismissed = localStorage.getItem('pwa-banner-dismissed')
        if (dismissed) return

        // Listen for install prompt
        const handler = (e: Event) => {
            e.preventDefault()
            setDeferredPrompt(e)
            setShowBanner(true)
        }

        window.addEventListener('beforeinstallprompt', handler)

        // For iOS (no beforeinstallprompt)
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
        const isStandalone = (window.navigator as any).standalone

        if (isIOS && !isStandalone && !dismissed) {
            setShowBanner(true)
        }

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) {
            // iOS instructions
            alert('Para instalar no iOS:\n1. Toque no botão Compartilhar\n2. Role para baixo\n3. Toque em "Adicionar à Tela de Início"')
            return
        }

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setShowBanner(false)
        }

        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setShowBanner(false)
        localStorage.setItem('pwa-banner-dismissed', 'true')
    }

    if (!showBanner) return null

    return (
        <div className="fixed top-0 left-0 right-0 z-50 bg-primary text-black shadow-lg animate-in slide-in-from-top duration-500">
            <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                    <Download className="w-5 h-5 shrink-0" />
                    <div className="flex-1">
                        <p className="text-sm font-bold">Instale o KRONOS SYNC</p>
                        <p className="text-xs opacity-90">Acesso rápido e funciona offline</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        onClick={handleInstall}
                        size="sm"
                        className="bg-black text-white hover:bg-black/90 font-bold border-none"
                    >
                        Instalar
                    </Button>
                    <button
                        onClick={handleDismiss}
                        className="p-1 hover:bg-white/20 rounded transition-colors"
                        aria-label="Fechar"
                    >
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}
