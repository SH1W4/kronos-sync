'use client'

import React, { useEffect, useState } from 'react'
import { getGamificationData, equipSkinAction, getTeamGamificationData } from '@/app/actions/gamification'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { AchievementGrid } from '@/components/gamification/AchievementGrid'
import { SkinInventory } from '@/components/gamification/SkinInventory'
import { motion } from 'framer-motion'
import { Trophy, User as UserIcon, Palette, Users } from 'lucide-react'
import { ACHIEVEMENTS } from '@/data/gamification/achievements'

export default function ProfilePage() {
    const [data, setData] = useState<any>(null)
    const [teamData, setTeamData] = useState<any>(null)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        const teamRes = await getTeamGamificationData()
        if (teamRes?.isAdmin) {
            setIsAdmin(true)
            setTeamData(teamRes.teamGamification)
        }
        
        const res = await getGamificationData()
        setData(res)
        setLoading(false)
    }

    const handleEquip = async (slot: any, code: string) => {
        const res = await equipSkinAction(slot, code)
        if (res.success) {
            await fetchData()
        }
    }

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[60vh]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
        )
    }

    // Se for Admin, renderiza o Dashboard do Time primeiro
    if (isAdmin && teamData) {
        return (
            <div className="p-8 max-w-7xl mx-auto space-y-12 pb-24">
                <header className="flex flex-col md:flex-row justify-between items-center gap-8 bg-zinc-900/40 p-8 rounded-3xl border border-zinc-800 backdrop-blur-sm relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                        <div className="w-24 h-24 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700 overflow-hidden">
                            <Users className="w-10 h-10 text-primary" />
                        </div>
                        <div className="text-center md:text-left space-y-2">
                            <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-100">Painel do Time</h1>
                            <p className="text-zinc-500 text-sm max-w-md">Gamificação da Equipe do Estúdio. Visualize o ranking e as conquistas dos artistas.</p>
                        </div>
                    </div>
                </header>

                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                        <Trophy className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-black uppercase tracking-widest text-zinc-100">Leaderboard</h2>
                    </div>

                    <div className="grid gap-4">
                        {teamData.map((member: any, index: number) => {
                            const userImg = member.artist?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.artist?.name || 'A')}&background=random`
                            return (
                                <div key={member.id} className="flex flex-col md:flex-row items-center gap-6 bg-zinc-900/40 p-6 rounded-2xl border border-zinc-800 relative overflow-hidden">
                                    <div className="text-2xl font-black text-zinc-600 w-8 text-center hidden md:block">#{index + 1}</div>
                                    <img src={userImg} alt={member.artist?.name} className="w-16 h-16 rounded-xl object-cover border border-zinc-700 z-10" />
                                    <div className="flex-1 text-center md:text-left z-10">
                                        <h3 className="text-lg font-black uppercase text-zinc-100">{member.artist?.name || 'Artista'}</h3>
                                        <p className="text-xs text-zinc-500 font-mono">{member.xp} XP acumulados</p>
                                    </div>
                                    <div className="flex gap-2 z-10 mb-4 md:mb-0">
                                        {member.achievements?.slice(0, 3).map((a: any) => (
                                            <div key={a.id} className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-xs" title={a.achievement?.title}>
                                                🏆
                                            </div>
                                        ))}
                                    </div>
                                    <div className="z-10">
                                        <LevelBadge xp={member.xp} level={member.level} size="sm" />
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </section>
            </div>
        )
    }

    if (!data) return <div>Erro ao carregar perfil.</div>

    const unlockedSkinCodes = data.skins?.map((s: any) => s.skinCode) || []
    const unlockedAchievementCodes = data.achievements?.map((a: any) => a.achievement.code) || []
    const userImg = data.artist?.user?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(data.artist?.name || 'A')}&background=random`

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 pb-24">
            <header className="flex flex-col md:flex-row justify-between items-center gap-8 bg-zinc-900/40 p-8 rounded-3xl border border-zinc-800 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />
                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <img src={userImg} alt="Profile" className="w-32 h-32 md:w-48 md:h-48 rounded-[2rem] object-cover border-2 border-primary/20 shadow-[0_0_50px_rgba(139,92,246,0.15)]" />
                    <div className="text-center md:text-left space-y-2">
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                            <UserIcon className="w-5 h-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Neural Link Active</span>
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-100">
                            {data.artist?.name || 'Artista'}
                        </h1>
                        <p className="text-zinc-500 text-sm max-w-md">
                            Sincronizando alma e tecnologia no Kairøs OS.
                            Sua evolução é o combustível da nossa rede.
                        </p>
                    </div>
                </div>
                <div className="relative z-10">
                    <LevelBadge xp={data.xp} level={data.level} size="lg" />
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <section className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                        <Trophy className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-black uppercase tracking-widest text-zinc-100">Conquistas Desbloqueadas</h2>
                    </div>
                    <AchievementGrid unlockedCodes={unlockedAchievementCodes} allAchievements={ACHIEVEMENTS} />
                </section>

                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                        <Palette className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-black uppercase tracking-widest text-zinc-100">Alquimia Visual (Skins)</h2>
                    </div>
                    <div className="bg-zinc-900/30 p-6 rounded-2xl border border-zinc-800">
                        <SkinInventory
                            unlockedCodes={unlockedSkinCodes}
                            equipped={{
                                baseSkinId: data.baseSkinId,
                                maskSkinId: data.maskSkinId,
                                artifactSkinId: data.artifactSkinId,
                                auraSkinId: data.auraSkinId
                            }}
                            onEquip={handleEquip}
                        />
                    </div>
                </section>
            </div>
        </div>
    )
}
