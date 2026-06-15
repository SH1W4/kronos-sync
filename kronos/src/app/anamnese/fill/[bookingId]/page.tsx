'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function AnamneseRedirectPage() {
    const params = useParams()
    const router = useRouter()
    const bookingId = params?.bookingId as string

    useEffect(() => {
        if (bookingId) {
            router.replace(`/fichas/${bookingId}`)
        }
    }, [bookingId, router])

    return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center font-mono text-xs uppercase tracking-widest">
            Redirecionando para a ficha de anamnese...
        </div>
    )
}
