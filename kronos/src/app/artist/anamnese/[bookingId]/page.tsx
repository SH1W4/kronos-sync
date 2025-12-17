'use client'

import { useState, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { saveAnamnesis } from '@/app/actions/anamnesis'

export default function AnamnesePage({ params }: { params: Promise<{ bookingId: string }> }) {
    const { bookingId } = use(params)
    const router = useRouter()
    const [saving, setSaving] = useState(false)

    // Mock initial data
    const [formData, setFormData] = useState({
        medications: '',
        allergies: '',
        hepatitis: false,
        hiv: false,
        diabetes: false,
        pregnant: false,
        bleeding: false,
        fainting: false,
        notes: ''
    })

    const handleSave = async () => {
        setSaving(true)
        try {
            const result = await saveAnamnesis(bookingId, formData)

            if (result.success) {
                // Poderíamos mostrar um toast aqui
                console.log('Salvo com sucesso!')
                router.back()
            } else {
                alert('Erro ao salvar: ' + result.error)
            }
        } catch (e) {
            alert('Erro inesperado ao conectar com servidor.')
        } finally {
            setSaving(false)
        }
    }

    return (
        <div className="min-h-screen bg-black text-white p-6 md:p-12 relative">
            <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 pointer-events-none fixed"></div>

            <div className="max-w-4xl mx-auto space-y-8 relative z-10">

                {/* Header */}
                <div className="flex items-center justify-between border-b border-white/10 pb-6">
                    <div className="flex items-center gap-4">
                        <Link href="/artist/dashboard">
                            <Button variant="ghost" className="text-gray-400 hover:text-white">
                                <ArrowLeft size={20} />
                            </Button>
                        </Link>
                        <div>
                            <h1 className="text-2xl font-orbitron font-bold text-white tracking-wide">FICHA DE ANAMNESE</h1>
                            <p className="text-xs font-mono text-gray-500 uppercase">Sessão ID: {bookingId}</p>
                        </div>
                    </div>
                </div>

                {/* Warning Banner */}
                <div className="bg-yellow-500/10 border border-yellow-500/30 p-4 rounded-lg flex items-start gap-4">
                    <AlertTriangle className="text-yellow-500 flex-shrink-0" size={24} />
                    <div>
                        <h3 className="font-bold text-yellow-500 text-sm font-mono uppercase mb-1">Atenção Crítica</h3>
                        <p className="text-xs text-gray-400 leading-relaxed">
                            Verifique rigorosamente as condições de saúde do cliente. Documento legal.
                        </p>
                    </div>
                </div>

                {/* Form Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">

                    <div className="space-y-6">
                        <h2 className="text-purple-400 font-mono text-xs font-bold uppercase tracking-widest border-b border-purple-500/20 pb-2">Condições Clínicas</h2>

                        <div className="space-y-4">
                            <ToggleField label="Hepatite / Icterícia" checked={formData.hepatitis} onChange={(v) => setFormData({ ...formData, hepatitis: v })} />
                            <ToggleField label="HIV / AIDS" checked={formData.hiv} onChange={(v) => setFormData({ ...formData, hiv: v })} />
                            <ToggleField label="Diabetes" checked={formData.diabetes} onChange={(v) => setFormData({ ...formData, diabetes: v })} />
                            <ToggleField label="Gravidez / Amamentação" checked={formData.pregnant} onChange={(v) => setFormData({ ...formData, pregnant: v })} />
                            <ToggleField label="Distúrbios de Coagulação" checked={formData.bleeding} onChange={(v) => setFormData({ ...formData, bleeding: v })} />
                            <ToggleField label="Histórico de Desmaios" checked={formData.fainting} onChange={(v) => setFormData({ ...formData, fainting: v })} />
                        </div>
                    </div>

                    <div className="space-y-6">
                        <h2 className="text-blue-400 font-mono text-xs font-bold uppercase tracking-widest border-b border-blue-500/20 pb-2">Detalhes Específicos</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Medicamentos em Uso</label>
                                <textarea
                                    className="w-full bg-gray-900/50 border border-white/10 rounded p-3 text-sm text-gray-300 focus:border-purple-500 focus:outline-none transition-colors"
                                    rows={3}
                                    placeholder="..."
                                    value={formData.medications}
                                    onChange={(e) => setFormData({ ...formData, medications: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-xs font-mono text-gray-500 uppercase mb-2">Alergias Conhecidas</label>
                                <textarea
                                    className="w-full bg-gray-900/50 border border-white/10 rounded p-3 text-sm text-gray-300 focus:border-purple-500 focus:outline-none transition-colors"
                                    rows={3}
                                    placeholder="..."
                                    value={formData.allergies}
                                    onChange={(e) => setFormData({ ...formData, allergies: e.target.value })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end pt-8 border-t border-white/10 gap-4">
                    <Button variant="outline" onClick={() => router.back()} className="border-white/10 text-gray-400 hover:text-white hover:bg-white/5">
                        Cancelar
                    </Button>
                    <Button
                        onClick={handleSave}
                        className="bg-purple-600 hover:bg-purple-700 text-white min-w-[150px]"
                        disabled={saving}
                    >
                        {saving ? 'Salvando...' : 'Salvar Ficha'}
                    </Button>
                </div>

            </div>
        </div>
    )
}

function ToggleField({ label, checked, onChange }: { label: string, checked: boolean, onChange: (v: boolean) => void }) {
    return (
        <div
            onClick={() => onChange(!checked)}
            className={`
                flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all
                ${checked ? 'bg-red-900/20 border-red-500/50' : 'bg-gray-900/30 border-white/5 hover:border-white/20'}
            `}
        >
            <span className={`text-sm font-medium ${checked ? 'text-red-400' : 'text-gray-400'}`}>{label}</span>
            <div className={`
                w-10 h-6 rounded-full relative transition-colors duration-300
                ${checked ? 'bg-red-500' : 'bg-gray-700'}
            `}>
                <div className={`
                    absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform duration-300
                    ${checked ? 'translate-x-4' : 'translate-x-0'}
                `}></div>
            </div>
        </div>
    )
}
