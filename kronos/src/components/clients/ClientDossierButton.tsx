'use client'

import React, { useState } from 'react'
import { FileText, Loader2, ClipboardCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { generateClientDossier } from '@/app/actions/reports'
import { useToast } from '@/components/ui/use-toast'

interface ClientDossierButtonProps {
    clientId: string
    clientName: string
}

export function ClientDossierButton({ clientId, clientName }: ClientDossierButtonProps) {
    const [loading, setLoading] = useState(false)
    const { toast } = useToast()

    const downloadFile = (content: string, filename: string, type: string) => {
        const blob = new Blob([content], { type })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        a.click()
        window.URL.revokeObjectURL(url)
    }

    const handleGenerate = async () => {
        setLoading(true)
        try {
            const result = await generateClientDossier(clientId)

            if (result.error) {
                toast({
                    title: "Erro ao gerar dossiê",
                    description: result.error,
                    variant: "destructive"
                })
                return
            }

            if (result.markdown) {
                downloadFile(result.markdown, result.filename || `dossie_${clientName}.md`, 'text/markdown;charset=utf-8;')

                toast({
                    title: "Dossiê Gerado",
                    description: "O documento foi preparado para o Docling e o download iniciou.",
                })
            }
        } catch (error) {
            toast({
                title: "Falha técnica",
                description: "Não foi possível gerar o dossiê no momento.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleGenerate}
            disabled={loading}
            className="gap-2 bg-primary/20 hover:bg-primary/30 text-primary-foreground border border-primary/30"
            variant="outline"
        >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <FileText size={16} />}
            Gerar Dossiê (Docling-Ready)
        </Button>
    )
}
