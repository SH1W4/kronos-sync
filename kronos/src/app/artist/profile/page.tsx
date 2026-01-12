'use client'

import React, { useEffect, useState } from 'react'
import { getGamificationData, equipSkinAction } from '@/app/actions/gamification'
import { LevelBadge } from '@/components/gamification/LevelBadge'
import { AvatarVisualizer } from '@/components/gamification/AvatarVisualizer'
import { AchievementGrid } from '@/components/gamification/AchievementGrid'
import { SkinInventory } from '@/components/gamification/SkinInventory'
import { motion } from 'framer-motion'
import { Sparkles, Trophy, User as UserIcon, Palette, Zap } from 'lucide-react'
import { ACHIEVEMENTS } from '@/data/gamification/achievements'

export default function ProfilePage() {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
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

    if (!data) return <div>Erro ao carregar perfil.</div>

    const unlockedSkinCodes = data.skins.map((s: any) => s.skinCode)
    const unlockedAchievementCodes = data.achievements.map((a: any) => a.achievement.code)

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-12 pb-24">
            {/* Header HUD */}
            <header className="flex flex-col md:flex-row justify-between items-center gap-8 bg-zinc-900/40 p-8 rounded-3xl border border-zinc-800 backdrop-blur-sm relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent opacity-50" />

                <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
                    <AvatarVisualizer
                        size={220}
                        baseId={data.baseSkinId}
                        maskId={data.maskSkinId}
                        artifactId={data.artifactSkinId}
                        auraId={data.auraSkinId}
                        className="shadow-[0_0_50px_rgba(139,92,246,0.15)]"
                    />

                    <div className="text-center md:text-left space-y-2">
                        <div className="flex items-center gap-2 justify-center md:justify-start">
                            <UserIcon className="w-5 h-5 text-primary" />
                            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-primary/80">Neural Link Active</span>
                        </div>
                        <h1 className="text-4xl font-black uppercase tracking-tighter text-zinc-100">
                            {data.artist.name || 'Artista'}
                        </h1>
                        <p className="text-zinc-500 text-sm max-w-md">
                            Sincronizando alma e tecnologia no Kronos OS.
                            Sua evolução é o combustível da nossa rede.
                        </p>
                    </div>
                </div>

                <div className="relative z-10">
                    <LevelBadge
                        xp={data.xp}
                        level={data.level}
                        size="lg"
                    />
                </div>
            </header>

            {/* Main Content Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                {/* Achievements Section */}
                <section className="lg:col-span-2 space-y-6">
                    <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                        <Trophy className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-black uppercase tracking-widest text-zinc-100">Conquistas Desbloqueadas</h2>
                    </div>

                    <AchievementGrid
                        unlockedCodes={unlockedAchievementCodes}
                        allAchievements={ACHIEVEMENTS} // We'll need to define this correctly
                    />
                </section>

                {/* Customization Section */}
                <section className="space-y-6">
                    <div className="flex items-center gap-3 border-l-4 border-primary pl-4">
                        <Palette className="w-5 h-5 text-primary" />
                        <h2 className="text-xl font-black uppercase tracking-widest text-zinc-100">Alquimia Visual</h2>
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
