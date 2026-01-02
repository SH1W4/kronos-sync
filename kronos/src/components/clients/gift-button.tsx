'use client'

import { useState } from 'react'
import { Gift, Copy, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateReferralCode } from '@/app/actions/coupon'

export function GiftButton({ clientId, existingCode }: { clientId: string, existingCode?: string }) {
    const [code, setCode] = useState(existingCode)
    const [loading, setLoading] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleGenerate = async () => {
        setLoading(true)
        const result = await generateReferralCode(clientId)
        if (result.success && result.code) {
            setCode(result.code)
        }
        setLoading(false)
    }

    const giftLink = typeof window !== 'undefined' ? `${window.location.origin}/gift/${code}` : `/gift/${code}`

    const copyToClipboard = () => {
        if (code) {
            navigator.clipboard.writeText(giftLink)
            setCopied(true)
            setTimeout(() => setCopied(false), 2000)
        }
    }

    if (code) {
        return (
            <div className="flex flex-col gap-2 mt-2 animate-in fade-in">
                <div className="flex items-center gap-2 bg-primary/20 border border-primary/50 rounded-lg px-3 py-2">
                    <Gift size={16} className="text-primary flex-shrink-0" />
                    <span className="font-mono font-bold text-sm tracking-wider text-white truncate">{code}</span>
                    <button onClick={copyToClipboard} className="text-gray-400 hover:text-white ml-auto" title="Copiar Link">
                        {copied ? <Check size={14} className="text-green-400" /> : <Copy size={14} />}
                    </button>
                </div>
                <a
                    href={giftLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[10px] text-center text-primary hover:opacity-80 underline underline-offset-2 uppercase tracking-wide"
                >
                    Visualizar Cartão Digital
                </a>
            </div>
        )
    }

    return (
        <Button
            onClick={handleGenerate}
            disabled={loading}
            className="bg-primary hover:opacity-90 text-black font-bold tracking-wider border-none"
        >
            {loading ? 'GERANDO...' : '🎁 CRIAR CUPOM PRESENTE'}
        </Button>
    )
}
