'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { createInvite, getInvites, revokeInvite } from '@/app/actions/invites'

export default function InvitesPage() {
    const [invites, setInvites] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [isCreating, setIsCreating] = useState(false)

    useEffect(() => {
        loadInvites()
    }, [])

    async function loadInvites() {
        const data = await getInvites()
        setInvites(data)
        setIsLoading(false)
    }



    async function handleRevoke(id: string) {
        if (!confirm("Tem certeza que deseja inativar este código?")) return;
        await revokeInvite(id)
        loadInvites()
    }

    return (
        <div className="min-h-screen bg-black text-white p-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Header */}
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
                            Gestão de Convites
                        </h1>
                        <p className="text-gray-400 mt-2">Gere códigos para novos artistas e staff.</p>
                    </div>
                    <Link href="/artist/dashboard" className="text-sm text-gray-500 hover:text-white transition-colors">
                        ← Voltar ao Dashboard
                    </Link>
                </div>

                {/* Actions */}
                <div className="bg-gray-900/50 p-8 rounded-2xl border border-white/10 backdrop-blur-sm space-y-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="space-y-1">
                            <h3 className="text-xl font-semibold text-white font-orbitron">GERAR CONVITE</h3>
                            <p className="text-sm text-gray-400 font-mono">Convide novos membros para o workspace.</p>
                        </div>

                        <div className="flex flex-wrap gap-4 items-end">
                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Tipo de Plano</label>
                                <select
                                    className="bg-black border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:border-purple-500 outline-none"
                                    id="planSelect"
                                >
                                    <option value="RESIDENT">RESIDENTE (Fixo)</option>
                                    <option value="GUEST">GUEST (Temporário)</option>
                                </select>
                            </div>

                            <div className="space-y-2" id="durationContainer">
                                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Duração (Dias)</label>
                                <input
                                    type="number"
                                    defaultValue={30}
                                    className="w-20 bg-black border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:border-purple-500 outline-none"
                                    id="durationInput"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest">Código Custom (Opcional)</label>
                                <input
                                    type="text"
                                    placeholder="EX: GUEST-ART"
                                    className="w-32 bg-black border border-white/10 rounded px-3 py-2 text-sm text-gray-300 focus:border-purple-500 outline-none uppercase font-mono"
                                    id="customCodeInput"
                                />
                            </div>

                            <button
                                onClick={async () => {
                                    const planSelect = document.getElementById('planSelect') as HTMLSelectElement;
                                    const durationInput = document.getElementById('durationInput') as HTMLInputElement;
                                    const customCodeInput = document.getElementById('customCodeInput') as HTMLInputElement;

                                    setIsCreating(true)
                                    const res = await createInvite({
                                        role: "ARTIST",
                                        targetPlan: planSelect.value as any,
                                        durationDays: planSelect.value === 'GUEST' ? Number(durationInput.value) : undefined,
                                        customCode: customCodeInput.value || undefined,
                                        maxUses: 1
                                    })
                                    if (res.success) {
                                        customCodeInput.value = '';
                                        await loadInvites()
                                    } else {
                                        alert(res.error || "Erro ao criar convite")
                                    }
                                    setIsCreating(false)
                                }}
                                disabled={isCreating}
                                className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-2 rounded-lg font-bold transition-all transform hover:scale-105 active:scale-95 disabled:opacity-50 flex items-center gap-2"
                            >
                                {isCreating ? "GERANDO..." : "✨ GERAR"}
                            </button>
                        </div>
                    </div>
                </div>

                {/* List */}
                <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-300">Histórico de Códigos</h3>

                    {isLoading ? (
                        <div className="text-center py-10 text-gray-500">Carregando...</div>
                    ) : invites.length === 0 ? (
                        <div className="text-center py-10 text-gray-600 border border-dashed border-gray-800 rounded-xl">
                            Nenhum convite gerado ainda.
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {invites.map((invite) => (
                                <motion.div
                                    key={invite.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className={`p-4 rounded-xl border flex items-center justify-between ${invite.isActive
                                        ? 'bg-gray-900/30 border-white/5'
                                        : 'bg-red-900/10 border-red-500/10 opacity-60'
                                        }`}
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`text-2xl font-mono font-bold ${invite.isActive ? 'text-purple-400' : 'text-gray-500 line-through'}`}>
                                            {invite.code}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex gap-2">
                                                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                                                    {invite.role}
                                                </span>
                                                {invite.targetPlan && (
                                                    <span className={`text-xs px-2 py-0.5 rounded-full border ${invite.targetPlan === 'RESIDENT' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' : 'bg-orange-500/10 text-orange-400 border-orange-500/20'}`}>
                                                        {invite.targetPlan} {invite.targetPlan === 'GUEST' && invite.durationDays ? `(${invite.durationDays} dias)` : ''}
                                                    </span>
                                                )}
                                                <span className={`text-xs px-2 py-0.5 rounded-full border ${invite.currentUses < invite.maxUses
                                                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                                                    }`}>
                                                    {invite.currentUses} / {invite.maxUses} Usos
                                                </span>
                                            </div>
                                            <p className="text-xs text-gray-500">
                                                Criado em {new Date(invite.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    {invite.isActive && (
                                        <button
                                            onClick={() => handleRevoke(invite.id)}
                                            className="text-xs text-red-500 hover:text-red-400 hover:underline px-3 py-1"
                                        >
                                            Revogar
                                        </button>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
