'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

export default function SignInPage() {
    const router = useRouter()
    
    useEffect(() => {
        router.push('/sign-in')
    }, [router])

    return (
        <div className="min-h-screen bg-black flex items-center justify-center">
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-8 h-8 text-primary animate-spin" />
                <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest">
                    Redirecionando para Identificação Soberana...
                </p>
            </div>
        </div>
    )
}
