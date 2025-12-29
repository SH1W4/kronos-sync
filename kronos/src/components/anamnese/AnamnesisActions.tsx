'use client'

import React, { useState } from 'react'
import { Copy, Check, ExternalLink, MessageCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface AnamnesisActionsProps {
    link: string
    clientPhone?: string
    clientName?: string
}

export function AnamnesisActions({ link, clientPhone, clientName }: AnamnesisActionsProps) {
    const [copied, setCopied] = useState(false)

    const copyToClipboard = () => {
        navigator.clipboard.writeText(link)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }

    const openWhatsApp = () => {
        const message = encodeURIComponent(
            `Olá, ${clientName || 'tudo bem'}! Aqui é do estúdio. Percebi que sua ficha de anamnese ainda não foi preenchida. Para agilizarmos seu atendimento, poderia preencher neste link? \n\n${link}`
        )
        const phone = clientPhone?.replace(/\D/g, '') || ''
        window.open(`https://wa.me/${phone}?text=${message}`, '_blank')
    }

    return (
        <div className="space-y-4 w-full">
            <div className="p-4 bg-white/5 border border-white/10 rounded-2xl space-y-3">
                <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest text-center">Link de Acesso Direto</p>
                <div className="flex items-center gap-2 p-3 bg-black/50 border border-white/5 rounded-xl">
                    <input
                        readOnly
                        value={link}
                        className="bg-transparent text-[10px] font-mono text-purple-400 flex-1 outline-none truncate"
                    />
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-gray-400 hover:text-white"
                        onClick={copyToClipboard}
                    >
                        {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
                <Button
                    onClick={openWhatsApp}
                    className="w-full bg-green-600 hover:bg-green-500 text-white font-bold uppercase tracking-widest text-[10px] h-12 rounded-xl flex items-center justify-center gap-2"
                >
                    <MessageCircle size={16} />
                    Enviar por WhatsApp
                </Button>
            </div>
        </div>
    )
}
