'use client'

import { useState } from 'react'
import { Check, Copy, MessageCircle, RefreshCw, MoreHorizontal } from 'lucide-react'
import Link from 'next/link'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { reuseAnamnesis } from '@/app/actions/anamnesis'
import { PdfExportButton } from '@/components/anamnese/PdfExportButton'
import { useToast } from '@/components/ui/use-toast'

interface AnamnesisStatusProps {
    bookingId: string
    status: 'PENDING' | 'COMPLETED'
    anamnesisId?: string
    clientName: string
    clientPhone?: string | null
    lastValidAnamnesisId?: string
    lastValidAnamnesisDate?: string
}

export function AnamnesisStatus({
    bookingId,
    status,
    anamnesisId,
    clientName,
    clientPhone,
    lastValidAnamnesisId,
    lastValidAnamnesisDate,
    anamnesisData
}: AnamnesisStatusProps & { anamnesisData?: any }) {
    const { toast } = useToast()
    const [isReusing, setIsReusing] = useState(false)

    // Se já está completa, mostra o badge verde com Link
    if (status === 'COMPLETED' && anamnesisId) {
        return (
            <div className="p-4 rounded-xl border border-primary/20 bg-primary/5 flex flex-col gap-3">
                <div className="flex items-center gap-3">
                    <ShieldCheck className="text-primary" />
                    <div>
                        <h4 className="text-sm font-bold text-white uppercase font-orbitron tracking-widest">Prontuário Assinado</h4>
                        <p className="text-[10px] text-zinc-400 font-mono uppercase tracking-widest mt-1">Todos os termos foram aceitos pelo cliente.</p>
                    </div>
                </div>
                {anamnesisData && <PdfExportButton anamnesisData={anamnesisData} clientName={clientName} />}
            </div>
        )
    }

    // Ações para Pendente
    const anamnesisLink = `${window.location.origin}/anamnese/fill/${bookingId}`

    const handleCopyLink = () => {
        navigator.clipboard.writeText(anamnesisLink)
        toast({ title: 'Link copiado!', description: 'URL da ficha copiada para a área de transferência.' })
    }

    const handleWhatsApp = () => {
        const message = `Olá ${clientName.split(' ')[0]}! Aqui está o link para preencher sua ficha de anamnese para nossa sessão: ${anamnesisLink}`
        const url = `https://wa.me/${clientPhone?.replace(/\D/g, '')}?text=${encodeURIComponent(message)}`
        window.open(url, '_blank')
    }

    const handleReuse = async () => {
        if (!lastValidAnamnesisId) return

        const confirm = window.confirm(`Deseja reutilizar os dados da ficha de ${new Date(lastValidAnamnesisDate!).toLocaleDateString()}? Isso criará uma nova ficha para hoje automaticamente.`)
        if (!confirm) return

        setIsReusing(true)
        try {
            const result = await reuseAnamnesis(bookingId, lastValidAnamnesisId)
            if (result.success) {
                toast({ title: 'Ficha atualizada!', description: 'Dados reutilizados com sucesso.' })
                // Refresh é automático via Server Action revalidatePath, 
                // mas podemos forçar reload se necessário ou confiar no Next.js
            } else {
                toast({ title: 'Erro', description: result.error, variant: 'destructive' })
            }
        } catch (e) {
            toast({ title: 'Erro', description: 'Falha na conexão.', variant: 'destructive' })
        } finally {
            setIsReusing(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button disabled={isReusing} className="flex items-center gap-1 px-3 py-1 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 rounded text-xs uppercase font-bold hover:bg-yellow-500/20 transition-colors cursor-pointer">
                    {isReusing ? <RefreshCw className="animate-spin" size={12} /> : <div className='w-2 h-2 rounded-full bg-yellow-500 animate-pulse' />}
                    {isReusing ? 'Gerando...' : 'Pendente'}
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-900 border-white/10 text-white">
                <DropdownMenuLabel>Ações da Ficha</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-white/10" />

                <DropdownMenuItem onClick={handleCopyLink} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                    <Copy className="mr-2 h-4 w-4" />
                    <span>Copiar Link</span>
                </DropdownMenuItem>

                {clientPhone && (
                    <DropdownMenuItem onClick={handleWhatsApp} className="cursor-pointer hover:bg-white/10 focus:bg-white/10">
                        <MessageCircle className="mr-2 h-4 w-4" />
                        <span>Enviar WhatsApp</span>
                    </DropdownMenuItem>
                )}

                {lastValidAnamnesisId && (
                    <>
                        <DropdownMenuSeparator className="bg-white/10" />
                        <DropdownMenuItem onClick={handleReuse} className="cursor-pointer bg-primary/10 hover:bg-primary/20 focus:bg-primary/20 text-primary-foreground focus:text-primary-foreground">
                            <RefreshCw className="mr-2 h-4 w-4" />
                            <span>Usar Ficha de {new Date(lastValidAnamnesisDate!).toLocaleDateString()}</span>
                        </DropdownMenuItem>
                    </>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
