'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, Loader2, ArrowRight } from 'lucide-react'

interface MagicLinkLoginProps {
    onSuccess: (email: string) => void
}

export default function MagicLinkLogin({ onSuccess }: MagicLinkLoginProps) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleSendCode = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/send-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Erro ao enviar código')
                setLoading(false)
                return
            }

            onSuccess(email)
        } catch (err) {
            setError('Erro de conexão. Tente novamente.')
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSendCode} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">Email</label>
                <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                    <Input
                        type="email"
                        placeholder="seu@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="pl-10 bg-black/40 border-white/10 text-white"
                        required
                        disabled={loading}
                    />
                </div>
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold"
                disabled={loading}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Enviando código...
                    </>
                ) : (
                    <>
                        Continuar
                        <ArrowRight className="w-4 h-4 ml-2" />
                    </>
                )}
            </Button>

            <p className="text-xs text-gray-500 text-center">
                Enviaremos um código de 6 dígitos para seu email
            </p>
        </form>
    )
}
