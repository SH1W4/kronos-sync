'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { SKIN_CATALOG } from '@/data/gamification/skins'
import Image from 'next/image'

interface AvatarVisualizerProps {
    baseId?: string
    maskId?: string
    artifactId?: string
    auraId?: string
    size?: number
    className?: string
}

export function AvatarVisualizer({
    baseId = 'base_gen_0',
    maskId,
    artifactId,
    auraId,
    size = 300,
    className = ''
}: AvatarVisualizerProps) {

    const getSkin = (id?: string) => SKIN_CATALOG.find(s => s.id === id)

    const skins = {
        base: getSkin(baseId),
        mask: getSkin(maskId),
        artifact: getSkin(artifactId),
        aura: getSkin(auraId)
    }

    // Layering order: Aura -> Base -> Mask -> Artifact
    return (
        <div
            className={`relative rounded-2xl bg-zinc-950/50 overflow-hidden border border-zinc-800 shadow-2xl ${className}`}
            style={{ width: size, height: size }}
        >
            {/* Background Grid / HUD Effect */}
            <div className="absolute inset-0 opacity-10 pointer-events-none">
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#888_1px,transparent_1px),linear-gradient(to_bottom,#888_1px,transparent_1px)] bg-[size:20px_20px]" />
            </div>

            <div className="relative w-full h-full flex items-center justify-center p-4">
                <AnimatePresence mode="popLayout">
                    {/* AURA LAYER */}
                    {skins.aura && (
                        <motion.div
                            key={skins.aura.id}
                            initial={{ opacity: 0, scale: 1.2 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0 }}
                            className={`absolute inset-0 z-0 ${skins.aura.visualAsset}`}
                        />
                    )}

                    {/* BASE LAYER */}
                    {skins.base && (
                        <motion.div
                            key={skins.base.id}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="absolute inset-0 z-10 flex items-center justify-center"
                        >
                            <Image
                                src={skins.base.visualAsset}
                                alt={skins.base.name}
                                width={size}
                                height={size}
                                className="object-contain"
                                priority
                            />
                        </motion.div>
                    )}

                    {/* MASK LAYER */}
                    {skins.mask && (
                        <motion.div
                            key={skins.mask.id}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="absolute inset-0 z-20 flex items-center justify-center"
                        >
                            <Image
                                src={skins.mask.visualAsset}
                                alt={skins.mask.name}
                                width={size}
                                height={size}
                                className="object-contain"
                                priority
                            />
                        </motion.div>
                    )}

                    {/* ARTIFACT LAYER */}
                    {skins.artifact && (
                        <motion.div
                            key={skins.artifact.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="absolute inset-0 z-30 flex items-center justify-center"
                        >
                            <Image
                                src={skins.artifact.visualAsset}
                                alt={skins.artifact.name}
                                width={size}
                                height={size}
                                className="object-contain"
                                priority
                            />
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>

            {/* Rarity Glow Effect */}
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent blur-sm" />

            {/* Corner HUD Marks */}
            <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-primary/40" />
            <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-primary/40" />
            <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-primary/40" />
            <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-primary/40" />
        </div>
    )
}
