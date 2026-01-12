'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { SKIN_CATALOG, SkinSlot } from '@/data/gamification/skins'
import { Check, Lock, Sparkles } from 'lucide-react'
import Image from 'next/image'

interface SkinInventoryProps {
    unlockedCodes: string[]
    equipped: {
        baseSkinId?: string | null
        maskSkinId?: string | null
        artifactSkinId?: string | null
        auraSkinId?: string | null
    }
    onEquip: (slot: SkinSlot, code: string) => Promise<any>
}

export function SkinInventory({ unlockedCodes, equipped, onEquip }: SkinInventoryProps) {
    const [activeSlot, setActiveSlot] = useState<SkinSlot>('BASE')
    const [isEquipping, setIsEquipping] = useState<string | null>(null)

    const slots: { id: SkinSlot; label: string }[] = [
        { id: 'BASE', label: 'Base' },
        { id: 'MASK', label: 'Máscara' },
        { id: 'ARTIFACT', label: 'Artefato' },
    ]

    const filteredSkins = SKIN_CATALOG.filter(s => s.slot === activeSlot)

    const handleEquip = async (code: string) => {
        setIsEquipping(code)
        await onEquip(activeSlot, code)
        setIsEquipping(null)
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Slot Selection Tabs */}
            <div className="flex gap-2 p-1 bg-zinc-900/80 rounded-lg border border-zinc-800 self-start">
                {slots.map(slot => (
                    <button
                        key={slot.id}
                        onClick={() => setActiveSlot(slot.id)}
                        className={`px-4 py-2 rounded-md text-xs font-black uppercase tracking-widest transition-all ${activeSlot === slot.id
                                ? 'bg-primary text-primary-foreground shadow-[0_0_10px_rgba(139,92,246,0.3)]'
                                : 'text-zinc-500 hover:text-zinc-300'
                            }`}
                    >
                        {slot.label}
                    </button>
                ))}
            </div>

            {/* Skins Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
                {filteredSkins.map((skin, index) => {
                    // A skin is unlocked if it's in the DB list OR if it's COMMON (default access)
                    const isUnlocked = unlockedCodes.includes(skin.id) || skin.rarity === 'COMMON'
                    const isEquipped = (
                        (activeSlot === 'BASE' && equipped.baseSkinId === skin.id) ||
                        (activeSlot === 'MASK' && equipped.maskSkinId === skin.id) ||
                        (activeSlot === 'ARTIFACT' && equipped.artifactSkinId === skin.id)
                    )

                    return (
                        <motion.div
                            key={skin.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: index * 0.03 }}
                            className={`relative aspect-square rounded-xl border p-2 flex flex-col items-center justify-center transition-all group ${isUnlocked
                                    ? 'bg-zinc-900 border-zinc-800 cursor-pointer hover:border-primary/50'
                                    : 'bg-black/40 border-zinc-900 grayscale opacity-40'
                                } ${isEquipped ? 'ring-2 ring-primary ring-offset-2 ring-offset-black border-primary' : ''}`}
                            onClick={() => isUnlocked && !isEquipped && handleEquip(skin.id)}
                        >
                            {/* Preview Image */}
                            <div className="relative w-full h-full">
                                <Image
                                    src={skin.visualAsset}
                                    alt={skin.name}
                                    fill
                                    className="object-contain p-1"
                                />
                            </div>

                            {/* Status Indicators */}
                            <div className="absolute top-2 right-2 flex gap-1">
                                {isEquipped && (
                                    <div className="bg-primary p-1 rounded-full text-primary-foreground">
                                        <Check className="w-3 h-3" />
                                    </div>
                                )}
                                {!isUnlocked && (
                                    <div className="bg-zinc-800 p-1 rounded-full text-zinc-500">
                                        <Lock className="w-3 h-3" />
                                    </div>
                                )}
                            </div>

                            {/* Hover Info HUD */}
                            <div className="absolute inset-0 bg-black/90 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-3 text-center rounded-xl">
                                <h6 className="text-[10px] font-black uppercase text-zinc-100">{skin.name}</h6>
                                <p className="text-[8px] text-zinc-500 mt-1">{skin.description}</p>

                                {!isUnlocked && (
                                    <div className="mt-2 text-[8px] font-bold text-red-500 uppercase">
                                        {skin.unlockLevel ? `Nível ${skin.unlockLevel}` : 'Bloqueado'}
                                    </div>
                                )}

                                {isUnlocked && !isEquipped && (
                                    <div className="mt-2 text-[8px] font-black text-primary uppercase">
                                        {isEquipping === skin.id ? 'Equipando...' : 'Clique para Equipar'}
                                    </div>
                                )}
                            </div>

                            {/* Rarity Label */}
                            <div className={`absolute -bottom-1 text-[8px] font-black uppercase px-1.5 py-0.5 rounded ${skin.rarity === 'LEGENDARY' ? 'bg-yellow-500 text-black' :
                                    skin.rarity === 'EPIC' ? 'bg-purple-600 text-white' :
                                        skin.rarity === 'RARE' ? 'bg-blue-500 text-white' : 'bg-zinc-700 text-white'
                                }`}>
                                {skin.rarity}
                            </div>
                        </motion.div>
                    )
                })}
            </div>
        </div>
    )
}
