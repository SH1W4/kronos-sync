'use client'

import { useState, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { InkPassCard } from '@/components/invites/InkPassCard'
import { getInvites, revokeInvite } from '@/app/actions/invites'
import { revokeArtistAccess, updateArtistCommission } from '@/app/actions/workspaces'
import {
    Shield,
    Plus,
    Users,
    Trash2,
    Save,
    X,
    Edit2,
    Clock,
    Key,
    Ticket,
    Copy,
    Check
} from 'lucide-react'

export default function TeamPage() {
    const { user } = useUser()
    const [members, setMembers] = useState<any[]>([])
    const [invites, setInvites] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [copiedId, setCopiedId] = useState<string | null>(null)
    const [selectedInvite, setSelectedInvite] = useState<any>(null)
    const [editingMember, setEditingMember] = useState<string | null>(null)
    const [newCommission, setNewCommission] = useState<string>('')

    async function fetchData() {
        const workspaceId = user?.publicMetadata?.workspace ? (user.publicMetadata.workspace as any).id : null
        if (!workspaceId) return
        setIsLoading(true)
        try {
            // Membros ativos
            const teamRes = await fetch(`/api/workspace/team`)
            const teamData = await teamRes.json()
            setMembers(teamData)

            // Chaves/Convites
            const invitesData = await getInvites()
            setInvites(invitesData)
        } catch (error) {
            console.error("Erro ao carregar dados da equipe:", error)
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        fetchData()
    }, [user?.publicMetadata])

    const handleRevokeMember = async (artistId: string, name: string) => {
        if (!confirm(`Tem certeza que deseja revogar o acesso de ${name}? Ela(e) perderá acesso ao estúdio imediatamente.`)) return

        try {
            const res = await revokeArtistAccess(artistId)
            if (res.success) {
                alert(res.message)
                fetchData()
            } else {
                alert(res.error)
            }
        } catch (e) {
            alert("Erro ao processar revogação.")
        }
    }

    const handleUpdateCommission = async (artistId: string) => {
        const rate = parseFloat(newCommission)
        if (isNaN(rate) || rate < 0 || rate > 100) {
            alert("Porcentagem inválida.")
            return
        }

        try {
            const res = await updateArtistCommission(artistId, rate)
            if (res.success) {
                setEditingMember(null)
                fetchData()
            } else {
                alert(res.message)
            }
        } catch (e) {
            alert("Erro ao atualizar comissão.")
        }
    }

    const handleRevokeInvite = async (id: string) => {
        if (!confirm('Deseja realmente invalidar esta chave?')) return
        const res = await revokeInvite(id)
        if (res.success) fetchData()
    }

    const copyInviteLink = (code: string, id: string) => {
        const link = `${window.location.origin}/invite/${code}`
        navigator.clipboard.writeText(link)
        setCopiedId(id)
        setTimeout(() => setCopiedId(null), 2000)
    }

    if (user?.publicMetadata?.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <Shield className="w-16 h-16 text-red-500/50 mb-4" />
                <h2 className="text-2xl font-bold text-white">Acesso Restrito</h2>
                <p className="text-gray-400 mt-2">Apenas mestres do estúdio podem gerenciar a equipe.</p>
            </div>
        )
    }

    return (
        <div className="p-6 md:p-12 space-y-12 max-w-7xl mx-auto pb-32">
            {/* Header Operacional */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-white/5 pb-8">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-2 h-2 rounded-full bg-primary animate-pulse shadow-[0_0_10px_rgba(var(--primary-rgb),0.5)]" />
                        <span className="text-[10px] font-mono text-primary uppercase tracking-[0.3em] font-black">Silo Management System</span>
                    </div>
                    <h1 className="text-5xl font-black text-white tracking-tighter uppercase mb-1">Equipe</h1>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest">
                        Gerenciamento de Residentes, Convidados & Protocolos de Acesso
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/artist/invites">
                        <Button className="bg-primary text-black font-black px-8 h-12 rounded-xl hover:scale-105 transition-all gap-2 shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]">
                            <Plus size={18} /> NOVO RECRUTAMENTO
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Seção 1: Membros Ativos */}
            <div className="space-y-6">
                <div className="flex items-center gap-2">
                    <Users className="text-primary/60" size={18} />
                    <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Membros Conectados ao Workspace</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {isLoading ? (
                        Array(3).fill(0).map((_, i) => (
                            <Card key={i} className="h-48 bg-white/5 border-white/10 animate-pulse rounded-2xl" />
                        ))
                    ) : members.length === 0 ? (
                        <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                            <Users className="w-12 h-12 text-gray-700 mx-auto mb-4" />
                            <p className="text-gray-500 font-mono uppercase text-xs">Aguardando novos integrantes...</p>
                        </div>
                    ) : (
                        members.map((member) => (
                            <Card key={member.id} className="p-6 bg-gray-900/40 border-white/5 hover:border-primary/50 transition-all group overflow-hidden relative min-h-[160px] rounded-3xl backdrop-blur-sm">
                                {/* Botão de Revogar (Reforçado) */}
                                <div className="absolute top-0 right-0 p-1 z-[70]">
                                    {member.user.id !== user?.id && (
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                handleRevokeMember(member.id, member.user.name);
                                            }}
                                            className="p-4 text-gray-600 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-all opacity-40 group-hover:opacity-100 cursor-pointer pointer-events-auto"
                                            title="REMOVER DO ESTÚDIO"
                                        >
                                            <Trash2 size={20} />
                                        </button>
                                    )}
                                </div>

                                <div className="flex justify-between items-start">
                                    <div className="space-y-5 w-full">
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-primary font-bold text-2xl uppercase group-hover:border-primary/30 transition-all">
                                                {member.user.name?.charAt(0) || '?'}
                                            </div>
                                            <div className="overflow-hidden">
                                                <h3 className="font-bold text-white group-hover:text-primary transition-colors uppercase truncate pr-10 text-lg tracking-tight">
                                                    {member.user.name}
                                                </h3>
                                                <p className="text-[10px] text-gray-500 font-mono truncate">{member.user.email}</p>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2">
                                            <Badge variant={member.plan === 'RESIDENT' ? 'primary' : 'outline'} className="tracking-tighter font-black text-[9px] px-2 py-0.5">
                                                {member.plan}
                                            </Badge>

                                            {editingMember === member.id ? (
                                                <div className="flex items-center gap-1 animate-in slide-in-from-left-2">
                                                    <Input
                                                        type="number"
                                                        value={newCommission}
                                                        onChange={(e) => setNewCommission(e.target.value)}
                                                        className="w-16 h-7 text-[10px] bg-black/50 border-primary/30 p-1 font-mono"
                                                        autoFocus
                                                    />
                                                    <button
                                                        onClick={() => handleUpdateCommission(member.id)}
                                                        className="p-1 bg-primary text-black rounded hover:bg-primary/80 transition-all"
                                                    >
                                                        <Save size={14} />
                                                    </button>
                                                    <button
                                                        onClick={() => setEditingMember(null)}
                                                        className="p-1 bg-white/5 text-gray-500 rounded hover:text-white"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <Badge
                                                    variant="secondary"
                                                    className="bg-white/5 border-white/10 text-gray-500 font-mono text-[9px] flex items-center gap-2 cursor-pointer hover:border-primary/30 transition-all group/fee"
                                                    onClick={() => {
                                                        setEditingMember(member.id)
                                                        setNewCommission(Math.round(member.commissionRate * 100).toString())
                                                    }}
                                                >
                                                    {Math.round(member.commissionRate * 100)}% FEE
                                                    <Edit2 size={10} className="opacity-0 group-hover/fee:opacity-100" />
                                                </Badge>
                                            )}
                                        </div>

                                        {member.plan === 'GUEST' && member.validUntil && (
                                            <div className="flex items-center gap-2 text-[9px] text-orange-400 font-mono bg-orange-400/5 p-2 rounded-xl border border-orange-400/10">
                                                <Clock size={12} className="animate-spin-slow" />
                                                <span className="uppercase tracking-tighter">Temporário até {new Date(member.validUntil).toLocaleDateString()}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </Card>
                        ))
                    )}
                </div>
            </div>

            {/* Seção 2: Chaves de Acesso / Convites */}
            <div className="space-y-6 pt-12 border-t border-white/5">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Key className="text-secondary/60" size={18} />
                        <h2 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Protocolos de Recrutamento Ativos</h2>
                    </div>
                </div>

                <div className="bg-gray-900/20 border border-white/5 rounded-3xl overflow-hidden backdrop-blur-sm">
                    <table className="w-full text-left">
                        <thead className="bg-white/5 text-[10px] font-mono uppercase text-gray-500 tracking-[0.2em]">
                            <tr>
                                <th className="p-6">Protocolo / Código</th>
                                <th className="p-6">Plano Destino</th>
                                <th className="p-6 text-center">Acessos</th>
                                <th className="p-6 text-center">Usos</th>
                                <th className="p-6 text-right">Ações de Comando</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-white/5 font-mono text-xs">
                            {invites.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="p-16 text-center text-gray-700 italic uppercase text-[10px] tracking-[0.3em]">
                                        Nenhuma chave de recrutamento ativa.
                                    </td>
                                </tr>
                            ) : (
                                invites.map((invite) => (
                                    <tr
                                        key={invite.id}
                                        className={`hover:bg-white/[0.02] transition-colors group cursor-pointer ${selectedInvite?.id === invite.id ? 'bg-white/5' : ''}`}
                                        onClick={() => setSelectedInvite(invite)}
                                    >
                                        <td className="p-6">
                                            <div className="flex items-center gap-4">
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${invite.isActive ? 'bg-secondary/10 text-secondary' : 'bg-gray-800 text-gray-600'}`}>
                                                    <Ticket size={16} />
                                                </div>
                                                <span className={`${invite.isActive ? 'text-white' : 'text-gray-600 line-through'} font-bold tracking-tight text-sm`}>
                                                    {invite.code}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-6">
                                            <Badge variant="outline" className={`text-[9px] font-black ${invite.targetPlan === 'RESIDENT' ? 'border-primary/20 text-primary' : 'border-secondary/20 text-secondary'}`}>
                                                {invite.targetPlan}
                                            </Badge>
                                        </td>
                                        <td className="p-6 text-center text-gray-500">
                                            <span className="text-white font-bold">{invite.viewCount || 0}</span>
                                        </td>
                                        <td className="p-6 text-center text-gray-500">
                                            {invite.currentUses} <span className="text-gray-700">/</span> {invite.maxUses}
                                        </td>
                                        <td className="p-6 text-right">
                                            <div className="flex justify-end gap-3 opacity-40 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => copyInviteLink(invite.code, invite.id)}
                                                    className="p-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition-all"
                                                    title="COPIAR LINK DE RESGATE"
                                                >
                                                    {copiedId === invite.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                                </button>
                                                <button
                                                    onClick={() => handleRevokeInvite(invite.id)}
                                                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                                    title="ABORTAR PROTOCOLO"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
                <p className="text-[9px] text-gray-600 font-mono uppercase tracking-[0.2em] text-center">
                    CUIDADO: Chaves de acesso dão permissão imediata ao silo de dados do estúdio.
                </p>
            </div>

            {/* Modal de Pré-visualização da Credencial */}
            {selectedInvite && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
                    <div className="relative w-full max-w-lg animate-in zoom-in-95 duration-300">
                        <button
                            onClick={() => setSelectedInvite(null)}
                            className="absolute -top-12 right-0 text-white/50 hover:text-white flex items-center gap-2 font-mono text-[10px] uppercase tracking-widest transition-colors"
                        >
                            FECHAR <X size={20} />
                        </button>

                        <div className="space-y-8">
                            <InkPassCard
                                code={selectedInvite.code}
                                type={selectedInvite.targetPlan}
                                studioName={(user?.publicMetadata?.workspace as any)?.name || 'KRONØS'}
                                primaryColor={(user?.publicMetadata?.workspace as any)?.primaryColor || '#8B5CF6'}
                            />

                            <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4">
                                <h4 className="text-[10px] font-mono text-gray-400 uppercase tracking-widest text-center">Ações de Compartilhamento</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <Button
                                        onClick={() => copyInviteLink(selectedInvite.code, selectedInvite.id)}
                                        variant="outline"
                                        className="border-white/10 text-white hover:bg-white/5 h-12 rounded-2xl gap-2 font-bold"
                                    >
                                        {copiedId === selectedInvite.id ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                                        COPIAR LINK
                                    </Button>
                                    <Button
                                        onClick={() => handleRevokeInvite(selectedInvite.id)}
                                        variant="ghost"
                                        className="text-red-500 hover:bg-red-500/10 h-12 rounded-2xl gap-2 font-bold"
                                    >
                                        <Trash2 size={18} />
                                        ABORTAR
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
