'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { calculateProgress, getLevelTitle, xpForNextLevel } from '@/data/gamification/levels'
import { Trophy } from 'lucide-react'
import Image from 'next/image'

interface LevelBadgeProps {
    xp: number
    level: number
    showProgress?: boolean
    size?: 'sm' | 'md' | 'lg'
}

export function LevelBadge({ xp, level, showProgress = true, size = 'md' }: LevelBadgeProps) {
    const { label, badge } = getLevelTitle(level)
    const progress = calculateProgress(xp)
    const nextXp = xpForNextLevel(level)

    const containerSizes = {
        sm: 'w-20 h-20',
        md: 'w-32 h-32',
        lg: 'w-48 h-48'
    }

    return (
        <div className="flex flex-col items-center gap-3">
            <div className={`relative ${containerSizes[size]} flex items-center justify-center`}>
                {/* Progress Ring Background */}
                <svg className="absolute inset-0 w-full h-full transform -rotate-90 drop-shadow-[0_0_8px_rgba(0,0,0,0.5)]">
                    <circle
                        cx="50%"
                        cy="50%"
                        r="42%"
                        className="stroke-zinc-800/50 fill-none"
                        strokeWidth="3"
                    />
                    <motion.circle
                        cx="50%"
                        cy="50%"
                        r="42%"
                        className="stroke-primary fill-none"
                        strokeWidth="4"
                        strokeLinecap="round"
                        style={{ pathLength: progress / 100 }}
                        initial={{ pathLength: 0 }}
                        animate={{ pathLength: progress / 100 }}
                        transition={{ duration: 1.5, ease: "easeOut" }}
                    />
                </svg>

                {/* Hextech Frame Simulation */}
                <div className="absolute inset-0 border-[1px] border-primary/20 rounded-full scale-110 pointer-events-none" />

                {/* Badge Icon */}
                <div className="relative z-10 p-4">
                    {badge.startsWith('/') ? (
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1, y: [0, -4, 0] }}
                            transition={{
                                opacity: { duration: 0.5 },
                                scale: { duration: 0.6 },
                                y: { duration: 4, repeat: Infinity, ease: "easeInOut" }
                            }}
                        >
                            <Image
                                src={badge}
                                alt={label}
                                width={size === 'lg' ? 140 : size === 'md' ? 80 : 40}
                                height={size === 'lg' ? 140 : size === 'md' ? 80 : 40}
                                className="object-contain transition-all"
                                priority
                            />
                        </motion.div>
                    ) : (
                        <Trophy className="w-10 h-10 text-primary animate-pulse" />
                    )}
                </div>

                {/* Level Number HUD */}
                <div className="absolute -bottom-1 bg-black/80 backdrop-blur-md border border-primary/50 text-primary text-[10px] font-black rounded px-2 py-0.5 tracking-tighter uppercase shadow-[0_0_15px_rgba(139,92,246,0.3)]">
                    LVL {level}
                </div>
            </div>

            <div className="text-center">
                <h4 className="text-xs font-black uppercase tracking-[0.2em] text-zinc-100 drop-shadow-md">
                    {label}
                </h4>
                {showProgress && (
                    <div className="mt-1 flex flex-col items-center">
                        <div className="text-[9px] text-primary/70 font-bold uppercase tracking-widest">
                            {xp} / {nextXp} XPBLOOD
                        </div>
                        {/* Micro-bar below */}
                        <div className="w-24 h-1 bg-zinc-900 rounded-full overflow-hidden mt-1 border border-zinc-800">
                            <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                className="h-full bg-primary shadow-[0_0_10px_#8b5cf6]"
                            />
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
