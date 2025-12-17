'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { Check, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { saveAnamnesis } from '@/app/actions/anamnesis'
import SignatureCanvas from 'react-signature-canvas'

export default function PublicAnamnesisPage({ params }: { params: Promise<{ bookingId: string }> }) {
    const { bookingId } = use(params)
    const [step, setStep] = useState(1)
    const [saving, setSaving] = useState(false)
    const [success, setSuccess] = useState(false)

    const [formData, setFormData] = useState({
        medications: '',
        allergies: '',
        hepatitis: false,
        hiv: false,
        diabetes: false,
        pregnant: false,
        bleeding: false,
        fainting: false,
        notes: '',
        agreedValue: '', // Valor Acertado
        projectDescription: '', // Descrição da Arte
        acceptedTerms: false,
        hasSignature: false
    })

    const [sigPad, setSigPad] = useState<SignatureCanvas | null>(null)

    const handleSave = async () => {
        setSaving(true)
        try {
            // Conversão de tipos para o Server Action
            const dataToSave = {
                ...formData,
                signatureData: sigPad?.getTrimmedCanvas().toDataURL('image/png')
            }

            // NOTA: 'saveAnamnesis' precisa aceitar signatureData e acceptedTerms
            const result = await saveAnamnesis(bookingId, dataToSave)

            if (result.success) {
                setSuccess(true)
            } else {
                alert('Erro: ' + result.error)
            }
        } catch (e) {
            alert('Erro de conexão.')
        } finally {
            setSaving(false)
        }
    }

    if (success) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
                <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6 animate-in zoom-in">
                    <Check size={40} className="text-black" />
                </div>
                <h1 className="text-2xl font-orbitron font-bold mb-2">Ficha Recebida!</h1>
                <p className="text-gray-400">Tudo pronto para sua sessão. Aguarde o artista chamar.</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-zinc-950 text-white p-6 pb-20">
            {/* Header Clean */}
            <div className="mb-8 text-center">
                <h1 className="text-xl font-orbitron font-bold text-white tracking-widest">KRONOS <span className="text-purple-500">CONSENT</span></h1>
                <p className="text-xs text-gray-500 font-mono mt-2">ID: {bookingId.slice(0, 8)}</p>
            </div>

            <div className="max-w-md mx-auto space-y-8">

                {/* Etapa 1: Acordo Comercial (Valor e Arte) */}
                <section className="space-y-4 bg-gray-900/50 p-6 rounded-xl border border-white/5">
                    <h2 className="text-purple-400 font-mono text-xs font-bold uppercase tracking-widest mb-4">1. Detalhes da Sessão</h2>

                    <div>
                        <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Descrição da Arte</label>
                        <input
                            type="text"
                            className="w-full bg-black/50 border border-white/10 rounded p-3 text-sm focus:border-purple-500 outline-none"
                            placeholder="Ex: Leão no antebraço..."
                            value={formData.projectDescription}
                            onChange={(e) => setFormData({ ...formData, projectDescription: e.target.value })}
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Valor Acertado (R$)</label>
                        <input
                            type="number"
                            className="w-full bg-black/50 border border-white/10 rounded p-3 text-lg font-bold text-white focus:border-purple-500 outline-none"
                            placeholder="0,00"
                            value={formData.agreedValue}
                            onChange={(e) => setFormData({ ...formData, agreedValue: e.target.value })}
                        />
                        <p className="text-[10px] text-gray-600 mt-2">*Confirme o valor combinado com o artista.</p>
                    </div>
                </section>

                {/* Etapa 2: Saúde */}
                <section className="space-y-4">
                    <h2 className="text-blue-400 font-mono text-xs font-bold uppercase tracking-widest mb-4 border-b border-blue-500/20 pb-2">2. Declaração de Saúde</h2>

                    <div className="space-y-3">
                        <ToggleField label="Tenho Hepatite ou Icterícia" checked={formData.hepatitis} onChange={(v) => setFormData({ ...formData, hepatitis: v })} />
                        <ToggleField label="Sou portador de HIV/AIDS" checked={formData.hiv} onChange={(v) => setFormData({ ...formData, hiv: v })} />
                        <ToggleField label="Tenho Diabetes" checked={formData.diabetes} onChange={(v) => setFormData({ ...formData, diabetes: v })} />
                        <ToggleField label="Estou Grávida / Amamentando" checked={formData.pregnant} onChange={(v) => setFormData({ ...formData, pregnant: v })} />
                        <ToggleField label="Tenho problemas de Coagulação" checked={formData.bleeding} onChange={(v) => setFormData({ ...formData, bleeding: v })} />
                        <ToggleField label="Histórico de Desmaios" checked={formData.fainting} onChange={(v) => setFormData({ ...formData, fainting: v })} />
                    </div>

                    <div className="pt-4">
                        <label className="block text-xs font-mono text-gray-400 uppercase mb-2">Alergias / Medicamentos</label>
                        <textarea
                            className="w-full bg-gray-900/50 border border-white/10 rounded p-3 text-sm focus:border-purple-500 outline-none"
                            rows={3}
                            placeholder="Liste quaisquer alergias ou remédios em uso..."
                            value={formData.notes}
                            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        />
                    </div>
                </section>

                {/* Etapa 3: Consentimento e Assinatura */}
                <section className="space-y-4 pt-4 border-t border-white/10">
                    <h2 className="text-gray-400 font-mono text-xs font-bold uppercase tracking-widest mb-4">3. Termo de Responsabilidade</h2>

                    <div className="bg-gray-900/30 p-4 rounded border border-white/5 text-xs text-gray-400 leading-relaxed h-32 overflow-y-auto mb-4">
                        <p>Declaro serem verdadeiras as informações acima. Estou ciente de que o procedimento de tatuagem é irreversível e exige cuidados posteriores específicos. Isento o estúdio e o artista de responsabilidade por reações alérgicas não informadas ou má cicatrização decorrente de descuido.</p>
                        <br />
                        <p>Autorizo o uso de imagem (fotos/vídeos) do procedimento para fins de portfólio e divulgação.</p>
                    </div>

                    <div
                        onClick={() => setFormData({ ...formData, acceptedTerms: !formData.acceptedTerms })}
                        className="flex items-center gap-3 cursor-pointer select-none"
                    >
                        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${formData.acceptedTerms ? 'bg-purple-600 border-purple-600' : 'border-gray-600'}`}>
                            {formData.acceptedTerms && <Check size={14} />}
                        </div>
                        <span className="text-sm text-gray-300">Li e concordo com os termos acima.</span>
                    </div>

                    <div className="space-y-2">
                        <label className="block text-xs font-mono text-gray-400 uppercase">Assinatura Digital</label>
                        <div className="border border-white/10 rounded-lg overflow-hidden bg-white/5 relative">
                            <SignatureCanvas
                                ref={(ref) => setSigPad(ref)}
                                penColor='white'
                                canvasProps={{ width: 350, height: 150, className: 'sigCanvas w-full h-full cursor-crosshair' }}
                                onEnd={() => setFormData({ ...formData, hasSignature: true })}
                            />
                            <button
                                onClick={() => sigPad?.clear()}
                                className="absolute top-2 right-2 text-[10px] text-gray-500 hover:text-white bg-black/50 px-2 py-1 rounded"
                            >
                                LIMPAR
                            </button>
                        </div>
                        <p className="text-[10px] text-gray-600">*Assine na área acima com o dedo ou mouse.</p>
                    </div>
                </section>

                {/* Footer */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-black/90 border-t border-white/10 backdrop-blur z-50">
                    <Button
                        onClick={handleSave}
                        className="w-full h-14 bg-gradient-to-r from-purple-600 to-blue-600 font-bold text-lg font-orbitron tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={saving || !formData.acceptedTerms || !formData.hasSignature}
                    >
                        {saving ? 'ENVIANDO...' : 'ASSINAR E ENVIAR'}
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
                flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all active:scale-[0.98]
                ${checked ? 'bg-red-900/20 border-red-500/50' : 'bg-gray-900/30 border-white/5'}
            `}
        >
            <span className={`text-sm ${checked ? 'text-red-400 font-bold' : 'text-gray-400'}`}>{label}</span>
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
