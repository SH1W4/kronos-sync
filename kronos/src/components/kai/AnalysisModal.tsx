'use client'

import React, { useState } from 'react'
import { Sparkles, Check, X, Palette, Type, Hash, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface KaiAnalysisModalProps {
    isOpen: boolean
    isLoading: boolean
    onClose: () => void
    onApply: (data: any) => void
    suggestions?: {
        bio: string
        primaryColor: string
        secondaryColor: string
        styleTags: string[]
        specialty: string
    }
}

export function KaiAnalysisModal({ isOpen, isLoading, onClose, onApply, suggestions }: KaiAnalysisModalProps) {
    const [editableBio, setEditableBio] = useState('')
    const [editableTags, setEditableTags] = useState<string[]>([])

    // Sync local state when suggestions arrive
    React.useEffect(() => {
        if (suggestions) {
            setEditableBio(suggestions.bio)
            setEditableTags(suggestions.styleTags)
        }
    }, [suggestions])

    if (!isOpen) return null

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
            <div className="bg-zinc-950 border border-white/10 w-full max-w-2xl rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(139,92,246,0.15)] animate-in fade-in zoom-in duration-300">

                {/* Header */}
                <div className="bg-purple-600/10 p-6 border-b border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-3 text-purple-400">
                        <Sparkles size={24} className="animate-pulse" />
                        <div>
                            <h2 className="font-orbitron font-bold tracking-tight text-lg uppercase">KAI Intelligence</h2>
                            <p className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Análise de Perfil e Sugestões</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-8 space-y-8">
                    {isLoading ? (
                        <div className="py-20 flex flex-col items-center justify-center text-center space-y-4">
                            <Loader2 size={40} className="text-purple-500 animate-spin" />
                            <div className="space-y-1">
                                <p className="text-sm font-bold font-orbitron text-white uppercase tracking-wider">Aguarde, o KAI está analisando seu feed...</p>
                                <p className="text-[10px] font-mono text-gray-500">Mapeando cores, estilos e bio para sua identidade visual.</p>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Suggestion Info Alert */}
                            <div className="flex items-start gap-3 p-4 bg-blue-500/5 border border-blue-500/20 rounded-xl">
                                <AlertCircle size={18} className="text-blue-400 mt-0.5 shrink-0" />
                                <p className="text-[10px] leading-relaxed text-blue-300 font-medium">
                                    <span className="font-bold uppercase">NOTA:</span> Estas são sugestões automáticas do KAI baseadas no seu Instagram. Você pode editar qualquer campo abaixo antes de aplicar as alterações ao seu perfil.
                                </p>
                            </div>

                            <div className="grid gap-6">
                                {/* BIO SECTION */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Type size={14} className="text-purple-400" />
                                        <label className="text-[10px] font-mono uppercase tracking-widest">Bio Sugerida pela IA (Editável)</label>
                                    </div>
                                    <Textarea
                                        value={editableBio}
                                        onChange={(e) => setEditableBio(e.target.value)}
                                        className="bg-black/40 border-white/10 text-sm leading-relaxed min-h-[100px] focus:border-purple-500/50"
                                    />
                                </div>

                                {/* STYLE TAGS */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Hash size={14} className="text-purple-400" />
                                        <label className="text-[10px] font-mono uppercase tracking-widest">Estilos Identificados</label>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {editableTags.map((tag, i) => (
                                            <div key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg flex items-center gap-2">
                                                <span className="text-xs font-medium text-gray-300">{tag}</span>
                                                <button onClick={() => setEditableTags(prev => prev.filter((_, idx) => idx !== i))}>
                                                    <X size={12} className="text-gray-500 hover:text-red-400" />
                                                </button>
                                            </div>
                                        ))}
                                        <button className="px-3 py-1.5 border border-dashed border-white/20 rounded-lg text-xs text-gray-500 hover:border-purple-500 hover:text-purple-400 transition-all">
                                            + Adicionar estilo
                                        </button>
                                    </div>
                                </div>

                                {/* COLORS SECTION */}
                                <div className="space-y-3">
                                    <div className="flex items-center gap-2 text-gray-400">
                                        <Palette size={14} className="text-purple-400" />
                                        <label className="text-[10px] font-mono uppercase tracking-widest">Paleta de Cores do Feed</label>
                                    </div>
                                    <div className="flex gap-4">
                                        <div className="flex items-center gap-3 p-3 bg-black/40 border border-white/10 rounded-xl flex-1">
                                            <div
                                                className="w-8 h-8 rounded-lg shadow-lg border border-white/20"
                                                style={{ backgroundColor: suggestions?.primaryColor }}
                                            ></div>
                                            <div className="text-[9px] font-mono">
                                                <p className="text-gray-500 uppercase">Primária</p>
                                                <p className="text-white font-bold">{suggestions?.primaryColor}</p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-3 p-3 bg-black/40 border border-white/10 rounded-xl flex-1">
                                            <div
                                                className="w-8 h-8 rounded-lg shadow-lg border border-white/20"
                                                style={{ backgroundColor: suggestions?.secondaryColor }}
                                            ></div>
                                            <div className="text-[9px] font-mono">
                                                <p className="text-gray-500 uppercase">Secundária</p>
                                                <p className="text-white font-bold">{suggestions?.secondaryColor}</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* footer actions */}
                            <div className="pt-6 border-t border-white/5 flex gap-3">
                                <Button
                                    onClick={onClose}
                                    variant="outline"
                                    className="flex-1 border-white/10 text-gray-400 hover:bg-white/5"
                                >
                                    DESCARTAR
                                </Button>
                                <Button
                                    onClick={() => onApply({ bio: editableBio, styleTags: editableTags, primaryColor: suggestions?.primaryColor })}
                                    className="flex-[2] bg-purple-600 hover:bg-purple-500 text-white font-bold tracking-widest gap-2"
                                >
                                    APLICAR AO MEU PERFIL <Check size={18} />
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    )
}
