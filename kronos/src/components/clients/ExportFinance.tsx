'use client'

import React, { useState } from 'react'
import { Download, FileSpreadsheet, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { exportFinanceCSV } from '@/app/actions/reports'
import { useToast } from '@/components/ui/use-toast'

export function ExportFinance() {
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

    const handleExport = async () => {
        setLoading(true)
        try {
            const result = await exportFinanceCSV()

            if (result.error) {
                toast({
                    title: "Erro na exportação",
                    description: result.error,
                    variant: "destructive"
                })
                return
            }

            if (result.csv) {
                const filename = `relatorio_financeiro_${new Date().toISOString().split('T')[0]}.csv`
                downloadFile(result.csv, filename, 'text/csv;charset=utf-8;')

                toast({
                    title: "Exportação concluída",
                    description: "O histórico financeiro foi exportado com sucesso."
                })
            }
        } catch (error) {
            toast({
                title: "Falha técnica",
                description: "Ocorreu um erro ao processar o arquivo financeiro.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Button
            onClick={handleExport}
            disabled={loading}
            variant="outline"
            className="gap-2 bg-black/40 border-white/10 hover:bg-white/5"
        >
            {loading ? <Loader2 className="animate-spin" size={16} /> : <FileSpreadsheet size={16} />}
            Exportar Auditoria (CSV)
        </Button>
    )
}
