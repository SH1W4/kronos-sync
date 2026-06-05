'use client'

import React, { useState } from 'react'
import { FileDown, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface PdfExportButtonProps {
    anamnesisData: any;
    clientName: string;
}

export function PdfExportButton({ anamnesisData, clientName }: PdfExportButtonProps) {
    const [isExporting, setIsExporting] = useState(false)

    const handleExport = async () => {
        setIsExporting(true)
        try {
            // Import html2pdf dynamically to avoid SSR issues
            const html2pdf = (await import('html2pdf.js')).default

            // Create a hidden container for the PDF content
            const element = document.createElement('div')
            element.innerHTML = `
                <div style="padding: 40px; font-family: sans-serif; color: #000; background: #fff;">
                    <div style="text-align: center; border-bottom: 2px solid #000; padding-bottom: 20px; margin-bottom: 30px;">
                        <h1 style="margin: 0; font-size: 24px; text-transform: uppercase;">Ficha de Anamnese e Termo de Responsabilidade</h1>
                        <p style="margin: 5px 0 0 0; color: #666;">KRONØS OS - Registro Oficial</p>
                    </div>

                    <h2 style="font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">1. Dados do Cliente</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr><td style="padding: 5px; width: 30%;"><strong>Nome Completo:</strong></td><td style="padding: 5px;">${anamnesisData.fullName || clientName}</td></tr>
                        <tr><td style="padding: 5px;"><strong>WhatsApp:</strong></td><td style="padding: 5px;">${anamnesisData.whatsapp || 'Não informado'}</td></tr>
                        <tr><td style="padding: 5px;"><strong>Data de Nascimento:</strong></td><td style="padding: 5px;">${anamnesisData.birthDate ? new Date(anamnesisData.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}</td></tr>
                    </table>

                    <h2 style="font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">2. Histórico Clínico</h2>
                    <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
                        <tr><td style="padding: 5px; width: 50%;"><strong>Condições (Tatuagem):</strong></td><td style="padding: 5px;">${anamnesisData.medicalConditionsTattoo || 'Nenhuma'}</td></tr>
                        <tr><td style="padding: 5px;"><strong>Afeta Cicatrização?</strong></td><td style="padding: 5px;">${anamnesisData.medicalConditionsHealing} - ${anamnesisData.medicalConditionsHealingDetails || ''}</td></tr>
                        <tr><td style="padding: 5px;"><strong>Alergias Conhecidas:</strong></td><td style="padding: 5px;">${anamnesisData.knownAllergies || 'Nenhuma'}</td></tr>
                    </table>

                    <h2 style="font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px;">3. Detalhes do Projeto</h2>
                    <p><strong>Artista (@):</strong> ${anamnesisData.artistHandle || 'Não informado'}</p>
                    <p><strong>Descrição da Arte:</strong> ${anamnesisData.artDescription || 'Não informado'}</p>
                    <p><strong>Valor Acertado:</strong> R$ ${anamnesisData.agreedValue || '0,00'}</p>

                    <h2 style="font-size: 16px; border-bottom: 1px solid #ccc; padding-bottom: 5px; margin-top: 30px;">4. Termos e Condições Aceitos</h2>
                    <ul style="margin-bottom: 40px; font-size: 12px; color: #333;">
                        <li>Eu compreendo que a tatuagem é permanente e que os resultados podem variar. <strong>(ACEITO)</strong></li>
                        <li>Eu seguirei todas as instruções de pós-procedimento para garantir a correta cicatrização. <strong>(ACEITO)</strong></li>
                        <li>Autorizo o compartilhamento seguro dos meus dados no estúdio. <strong>(${anamnesisData.allowSharing ? 'ACEITO' : 'RECUSADO'})</strong></li>
                    </ul>

                    <div style="margin-top: 50px; text-align: center;">
                        ${anamnesisData.signatureData 
                            ? `<img src="${anamnesisData.signatureData}" style="max-height: 100px; border-bottom: 1px solid #000; padding: 10px;" />` 
                            : `<div style="height: 100px; border-bottom: 1px solid #000; margin: 0 20%;"></div>`
                        }
                        <p style="margin-top: 10px; font-weight: bold;">Assinatura do Cliente</p>
                        <p style="font-size: 12px; color: #666;">Assinado digitalmente em: ${new Date(anamnesisData.createdAt).toLocaleString('pt-BR')}</p>
                    </div>
                </div>
            `

            const opt: any = {
                margin: 0,
                filename: `anamnese-${clientName.replace(/\s+/g, '-').toLowerCase()}-${new Date().getTime()}.pdf`,
                image: { type: 'jpeg', quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
            }

            await html2pdf().set(opt).from(element).save()
        } catch (error) {
            console.error('Error generating PDF:', error)
            alert('Erro ao gerar o PDF. Verifique o console.')
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <Button 
            onClick={handleExport} 
            disabled={isExporting}
            variant="outline"
            className="w-full mt-4 border-white/10 bg-white/5 hover:bg-white/10 text-xs font-mono uppercase tracking-widest text-zinc-300"
        >
            {isExporting ? <Loader2 className="animate-spin mr-2" size={14} /> : <FileDown className="mr-2" size={14} />}
            {isExporting ? 'Gerando...' : 'Exportar Ficha (PDF)'}
        </Button>
    )
}
