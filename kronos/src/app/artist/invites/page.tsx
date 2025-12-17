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

    async function handleCreate() {
        setIsCreating(true)
        const res = await createInvite("ARTIST", 1) // Default: Artista, 1 uso
        if (res.success) {
            await loadInvites()
        } else {
            alert("Erro ao criar convite")
        }
        setIsCreating(false)
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
                <div className="bg-gray-900/50 p-6 rounded-2xl border border-white/10 backdrop-blur-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="text-xl font-semibold text-white">Novo Convite</h3>
                            <p className="text-sm text-gray-400">Gera um código de uso único para acesso de Artista.</p>
                        </div>
                        <button
                            onClick={handleCreate}
                            disabled={isCreating}
                            className="bg-purple-600 hover:bg-purple-500 text-white px-6 py-2 rounded-lg font-medium transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                        >
                            {isCreating ? "Gerando..." : "✨ Gerar Código"}
                        </button>
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
