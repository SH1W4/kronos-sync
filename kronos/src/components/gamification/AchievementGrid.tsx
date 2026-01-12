'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { LucideIcon, Trophy, Star, Lock } from 'lucide-react'
import * as LucideIcons from 'lucide-react'

interface Achievement {
    id: string
    code: string
    title: string
    description: string
    icon: string
    xpReward: number
    rarity: string
}

interface AchievementGridProps {
    allAchievements: Achievement[]
    unlockedCodes: string[]
}

export function AchievementGrid({ allAchievements, unlockedCodes }: AchievementGridProps) {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {allAchievements.map((ach, index) => {
                const isUnlocked = unlockedCodes.includes(ach.code)
                // Dynamically get Lucide icon if it exists, otherwise fallback to Trophy
                const IconComponent = (LucideIcons as any)[ach.icon] || Trophy

                return (
                    <motion.div
                        key={ach.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className={`relative p-4 rounded-xl border transition-all group overflow-hidden ${isUnlocked
                                ? 'bg-zinc-900/50 border-primary/30 shadow-[0_0_15px_rgba(139,92,246,0.1)]'
                                : 'bg-black/20 border-zinc-800 grayscale opacity-60'
                            }`}
                    >
                        {/* Background Glow */}
                        {isUnlocked && (
                            <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 blur-3xl rounded-full" />
                        )}

                        <div className="flex items-start gap-4">
                            <div className={`p-3 rounded-lg ${isUnlocked ? 'bg-primary/20 text-primary' : 'bg-zinc-800 text-zinc-500'}`}>
                                <IconComponent className="w-6 h-6" />
                            </div>

                            <div className="flex-1">
                                <h5 className={`text-sm font-bold ${isUnlocked ? 'text-zinc-100' : 'text-zinc-500'}`}>
                                    {ach.title}
                                </h5>
                                <p className="text-[10px] text-zinc-500 mt-1 leading-tight">
                                    {ach.description}
                                </p>
                                {isUnlocked && (
                                    <div className="mt-2 text-[9px] font-black text-primary uppercase tracking-widest">
                                        +{ach.xpReward} XP REWARD
                                    </div>
                                )}
                            </div>

                            {!isUnlocked && (
                                <Lock className="w-3 h-3 text-zinc-600 mt-1" />
                            )}
                        </div>

                        {/* Rarity Indicator */}
                        <div className={`absolute top-0 right-0 px-2 py-0.5 text-[8px] font-black uppercase ${ach.rarity === 'LEGENDARY' ? 'bg-yellow-500 text-black' :
                                ach.rarity === 'EPIC' ? 'bg-purple-600 text-white' :
                                    ach.rarity === 'RARE' ? 'bg-blue-500 text-white' : 'bg-zinc-700 text-white'
                            }`}>
                            {ach.rarity}
                        </div>
                    </motion.div>
                )
            })}
        </div>
    )
}
