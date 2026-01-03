'use client'

import React, { useState } from 'react'
import { Download, FileSpreadsheet, FileText, ChevronDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { exportClientsCSV, exportAnamnesisCSV } from '@/app/actions/reports'
import { useToast } from '@/components/ui/use-toast'

export function ExportIntelligence() {
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

    const handleExport = async (type: 'clients' | 'anamnesis') => {
        setLoading(true)
        try {
            const result = type === 'clients' ? await exportClientsCSV() : await exportAnamnesisCSV()

            if (result.error) {
                toast({
                    title: "Erro na exportação",
                    description: result.error,
                    variant: "destructive"
                })
                return
            }

            if (result.csv) {
                const filename = type === 'clients' ? `carteira_clientes_${new Date().toISOString().split('T')[0]}.csv` : `anamneses_consolidadas_${new Date().toISOString().split('T')[0]}.csv`
                downloadFile(result.csv, filename, 'text/csv;charset=utf-8;')

                toast({
                    title: "Exportação concluída",
                    description: "O download do arquivo CSV iniciou."
                })
            }
        } catch (error) {
            toast({
                title: "Falha crítica",
                description: "Ocorreu um erro ao processar a exportação.",
                variant: "destructive"
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" className="gap-2 bg-black/40 border-white/10 hover:bg-white/5" disabled={loading}>
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Download size={16} />}
                    <span className="hidden md:inline">Exportar Inteligência</span>
                    <ChevronDown size={14} className="opacity-50" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-gray-950 border-white/10 text-white">
                <DropdownMenuItem
                    onClick={() => handleExport('clients')}
                    className="gap-2 cursor-pointer hover:bg-primary/20 focus:bg-primary/20"
                >
                    <FileSpreadsheet size={14} className="text-green-400" />
                    <span>Carteira de Clientes (CSV)</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() => handleExport('anamnesis')}
                    className="gap-2 cursor-pointer hover:bg-primary/20 focus:bg-primary/20"
                >
                    <FileText size={14} className="text-blue-400" />
                    <span>Anamneses Consolidadas (CSV)</span>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
