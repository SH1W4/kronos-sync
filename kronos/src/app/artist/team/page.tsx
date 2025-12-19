'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Users, Shield, Clock, Plus } from 'lucide-react'
import Link from 'next/link'

export default function TeamPage() {
    const { data: session } = useSession() as any
    const [members, setMembers] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function loadTeam() {
            if (!session?.activeWorkspaceId) return
            try {
                const res = await fetch(`/api/workspace/team`)
                const data = await res.json()
                setMembers(data)
            } catch (error) {
                console.error("Erro ao carregar equipe:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadTeam()
    }, [session?.activeWorkspaceId])

    if (session?.user?.role !== 'ADMIN') {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-6">
                <Shield className="w-16 h-16 text-red-500/50 mb-4" />
                <h2 className="text-2xl font-bold text-white">Acesso Restrito</h2>
                <p className="text-gray-400 mt-2">Apenas mestres do estúdio podem gerenciar a equipe.</p>
            </div>
        )
    }

    return (
        <div className="p-6 space-y-8 max-w-6xl mx-auto">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tighter">EQUIPE</h1>
                    <p className="text-gray-400 font-mono text-xs uppercase tracking-widest mt-1">
                        Gerenciamento de Residentes & convidados
                    </p>
                </div>
                <Link href="/artist/invites">
                    <Button variant="primary" className="gap-2">
                        <Plus size={18} /> NOVO CONVITE
                    </Button>
                </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    Array(3).fill(0).map((_, i) => (
                        <Card key={i} className="h-48 bg-white/5 border-white/10 animate-pulse" />
                    ))
                ) : members.length === 0 ? (
                    <div className="col-span-full py-20 text-center border-2 border-dashed border-white/10 rounded-3xl">
                        <Users className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400">Nenhum membro na equipe ainda.</p>
                    </div>
                ) : (
                    members.map((member) => (
                        <Card key={member.id} className="p-6 bg-black/40 border-white/10 hover:border-purple-500/50 transition-all group">
                            <div className="flex justify-between items-start">
                                <div className="space-y-4 w-full">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl uppercase">
                                            {member.user.name?.charAt(0) || '?'}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-white group-hover:text-purple-400 transition-colors uppercase">
                                                {member.user.name}
                                            </h3>
                                            <p className="text-xs text-gray-500 font-mono">{member.user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-2">
                                        <Badge variant={member.plan === 'RESIDENT' ? 'primary' : 'outline'} className="tracking-tighter font-black">
                                            {member.plan}
                                        </Badge>
                                        <Badge variant="secondary" className="bg-white/5 border-white/10 text-gray-400">
                                            {Math.round(member.commissionRate * 100)}% COMISSÃO
                                        </Badge>
                                    </div>

                                    {member.plan === 'GUEST' && member.validUntil && (
                                        <div className="flex items-center gap-2 text-[10px] text-orange-400 font-mono bg-orange-400/10 p-2 rounded border border-orange-400/20">
                                            <Clock size={12} />
                                            <span>PROVISÓRIO ATÉ {new Date(member.validUntil).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </Card>
                    ))
                )}
            </div>
        </div>
    )
}
