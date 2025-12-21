'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Check, ArrowLeft } from 'lucide-react'
import { signIn } from 'next-auth/react'

interface VerifyCodeProps {
    email: string
    onBack: () => void
}

export default function VerifyCode({ email, onBack }: VerifyCodeProps) {
    const [code, setCode] = useState('')
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setLoading(true)

        try {
            const res = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, code })
            })

            const data = await res.json()

            if (!res.ok) {
                setError(data.error || 'Código inválido')
                setLoading(false)
                return
            }

            // Sign in with NextAuth using magic-link provider
            const result = await signIn('magic-link', {
                email,
                code,
                redirect: false
            })

            if (result?.error) {
                setError('Erro ao fazer login')
                setLoading(false)
                return
            }

            // Redirect to onboarding or dashboard
            window.location.href = '/onboarding'
        } catch (err) {
            setError('Erro de conexão. Tente novamente.')
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleVerify} className="space-y-4">
            <div className="space-y-2">
                <label className="text-sm font-medium text-gray-300">
                    Código de Verificação
                </label>
                <p className="text-xs text-gray-500">
                    Enviamos um código de 6 dígitos para <strong className="text-purple-400">{email}</strong>
                </p>
                <Input
                    type="text"
                    placeholder="000000"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl font-bold tracking-widest bg-black/40 border-white/10 text-white"
                    maxLength={6}
                    required
                    disabled={loading}
                    autoFocus
                />
            </div>

            {error && (
                <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3 text-sm text-red-400">
                    {error}
                </div>
            )}

            <Button
                type="submit"
                className="w-full bg-purple-600 hover:bg-purple-500 text-white font-bold"
                disabled={loading || code.length !== 6}
            >
                {loading ? (
                    <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verificando...
                    </>
                ) : (
                    <>
                        <Check className="w-4 h-4 mr-2" />
                        Verificar Código
                    </>
                )}
            </Button>

            <Button
                type="button"
                variant="ghost"
                className="w-full text-gray-400 hover:text-white"
                onClick={onBack}
                disabled={loading}
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Voltar
            </Button>
        </form>
    )
}
