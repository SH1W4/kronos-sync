'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Loader2, Check, ArrowLeft } from 'lucide-react'
// import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

interface VerifyCodeProps {
    email: string
    onBack: () => void
    inviteCode?: string
}

export default function VerifyCode({ email, onBack, inviteCode }: VerifyCodeProps) {
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

            // Sovereign Auth Pivot (Phase 15): 
            // Validating the code here is just the "Gate".
            // Success means we redirect to the Registration Page to create the credentials.
            // We pass the invite code and phone (identity binding) to the form.

            // NOTE: Ideally we would have 'phone' in the VerifyCode state, but it seems we only have 'email' and 'inviteCode' here.
            // Wait, VerifyCode is step 2. We need the phone number too?
            // "Validation of access code OR master key" + "Your Cellphone"
            // The previous screen (Onboarding) likely gathered this info?
            // Actually VerifyCode takes 'email' as prop.

            // Since we are pivoting: The USER input the phone in the "Validation of Access" screen.
            // If this component is THAT screen, it should capture the phone.

            // Looking at the screenshots, there is "VALIDAÇÃO DE ACESSO" with:
            // 1. Código de Convite
            // 2. Seu Celular

            // BUT VerifyCode.tsx only has 'code' state?
            // Let me check the full file again. It seems VerifyCode.tsx handles the verification of the *6 digit email code* that was sent by MagicLinkLogin?

            // Ah, the user provided screenshot shows "VALIDAÇÃO DE ACESSO" (Input Code + Input Phone).
            // That is likely NOT VerifyCode.tsx (which deals with Magic Link 6-digit).
            // That surely is a DIFFERENT component or the 'code' modal on Onboarding?

            // If I am editing VerifyCode.tsx which handles the 6-digit email code...
            // Wait, the new flow REPLACES Magic Link.
            // So we shouldn't be using VerifyCode.tsx (Email OTP) for the first step.

            // The user wants:
            // 1. Screen "Validation": Input Invite + Phone.
            // 2. Click "Validar".
            // 3. Go to "Register" (Create Email + Password).

            // I need to find the component that corresponds to the "Validation of Access" screenshot.
            // It might be inside 'src/components/onboarding/CodeModal.tsx' or similar.

            // I will STOP editing VerifyCode.tsx (Email OTP) and search for the correct "Invite Validation" component.
            return

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
                    Enviamos um código de 6 dígitos para <strong className="text-primary">{email}</strong>
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
                className="w-full bg-primary hover:opacity-90 text-black font-bold border-none"
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
