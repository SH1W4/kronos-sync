import { auth } from "@clerk/nextjs/server"
import { redirect } from "next/navigation"
import { getGamificationData } from "@/app/actions/gamification"
import { SKIN_CATALOG, SkinSlot, SkinItem } from "@/data/gamification/skins"
import { calculateLevel, getLevelTitle } from "@/data/gamification/levels"
import { Lock, Sparkles, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"

export const dynamic = 'force-dynamic'

export default async function SoulSyncPage() {
    const { userId: clerkUserId } = await auth()
    if (!clerkUserId) {
        redirect('/sign-in')
    }

    const gamification = await getGamificationData()
    if (!gamification) {
        return (
            <div className="p-8 min-h-screen text-center flex items-center justify-center">
                <div className="text-gray-500 font-mono text-xs tracking-widest uppercase animate-pulse">
                    Sincronizando dados neurais...
                </div>
            </div>
        )
    }

    const currentXp = gamification.xp
    const currentLevel = calculateLevel(currentXp)
    const { label: titleLabel } = getLevelTitle(currentLevel)

    // Unlocked achievements codes
    const unlockedAchievements = gamification.achievements.map((a: any) => a.achievement.code)

    // Group catalog
    const groupedSkins = SKIN_CATALOG.reduce((acc: any, skin: SkinItem) => {
        if (!acc[skin.slot]) acc[skin.slot] = []
        acc[skin.slot].push(skin)
        return acc
    }, {} as Record<SkinSlot, SkinItem[]>)

    // Currently equipped
    const equipped = {
        BASE: gamification.baseSkinId,
        AURA: gamification.auraSkinId,
        MASK: gamification.maskSkinId,
        ARTIFACT: gamification.artifactSkinId
    }

    // Function to check if unlocked
    const isUnlocked = (skin: SkinItem) => {
        // If it's common and has no level/achievement requirement, it's unlocked.
        if (!skin.unlockLevel && !skin.unlockAchievement) return true
        
        if (skin.unlockLevel && currentLevel >= skin.unlockLevel) return true
        if (skin.unlockAchievement && unlockedAchievements.includes(skin.unlockAchievement)) return true
        
        return false
    }

    return (
        <div className="space-y-8 min-h-screen p-4 md:p-8 bg-black relative">
            <div className="absolute inset-0 data-pattern-grid opacity-20 pointer-events-none" />
            
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-end gap-4 border-b border-white/5 pb-6 relative z-10">
                <div>
                    <h2 className="text-purple-400 font-mono text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                        <Sparkles size={14} /> Alchemy Avatar Shop
                    </h2>
                    <h1 className="text-3xl font-orbitron font-bold tracking-tight pixel-text uppercase">
                        Soul <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-accent">Sync</span>
                    </h1>
                    <p className="text-gray-500 font-mono text-xs uppercase tracking-widest mt-1">
                        Personalize sua projeção neural no sistema
                    </p>
                </div>
                <div className="text-right bg-purple-900/10 border border-purple-500/20 px-6 py-3 rounded-xl shadow-[0_0_20px_rgba(139,92,246,0.1)]">
                    <p className="text-[10px] text-purple-400 font-mono uppercase tracking-widest">Seu Nível de Consciência</p>
                    <p className="text-2xl font-bold font-orbitron text-white mt-1 uppercase italic">Nvl {currentLevel} <span className="text-sm text-gray-500 not-italic">| {titleLabel}</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
                {/* Categorias (Base, Mask, Artifact) */}
                <div className="md:col-span-2 space-y-12">
                    {Object.entries(groupedSkins).map(([slot, skins]: [string, any]) => (
                        <div key={slot} className="space-y-4">
                            <h3 className="font-orbitron font-bold text-lg text-white border-b border-white/10 pb-2 uppercase tracking-widest flex items-center gap-2">
                                <span className="text-primary">&lt;</span>
                                SLOT: {slot}
                                <span className="text-primary">/&gt;</span>
                            </h3>
                            
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {skins.map((skin: SkinItem) => {
                                    const unlocked = isUnlocked(skin)
                                    const isEquipped = equipped[slot as SkinSlot] === skin.id

                                    const rarityColors: any = {
                                        COMMON: 'border-white/10 text-gray-400 bg-white/5 shadow-none',
                                        RARE: 'border-blue-500/30 text-blue-400 bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.1)]',
                                        EPIC: 'border-purple-500/30 text-purple-400 bg-purple-500/10 shadow-[0_0_20px_rgba(139,92,246,0.15)]',
                                        LEGENDARY: 'border-amber-500/50 text-amber-400 bg-amber-500/10 shadow-[0_0_30px_rgba(245,158,11,0.2)]'
                                    }

                                    return (
                                        <div key={skin.id} className={`relative flex flex-col items-center p-4 rounded-2xl border transition-all ${unlocked ? (isEquipped ? 'ring-2 ring-primary border-primary/50 bg-primary/5 shadow-[0_0_20px_var(--primary-glow)]' : `${rarityColors[skin.rarity]} hover:scale-[1.02]`) : 'border-white/5 bg-black/50 opacity-60 grayscale'}`}>
                                            
                                            {/* Preview Placeholder */}
                                            <div className="w-full aspect-square rounded-xl bg-gray-900/50 border border-white/5 mb-4 flex items-center justify-center overflow-hidden relative">
                                                {/* Fallback image if asset doesn't exist */}
                                                <div className="absolute inset-0 flex items-center justify-center font-orbitron font-black text-gray-700 text-xs text-center opacity-30">
                                                    {skin.visualAsset.split('/').pop()}
                                                </div>
                                                {/* Rarity Glow */}
                                                <div className={`absolute bottom-0 w-full h-1/2 bg-gradient-to-t to-transparent ${unlocked ? rarityColors[skin.rarity].split(' ')[1].replace('text-', 'from-') : 'from-transparent'} opacity-20`} />
                                            </div>

                                            <div className="text-center w-full mb-4 flex-1">
                                                <h4 className="font-orbitron font-bold text-[11px] text-white uppercase tracking-wider truncate" title={skin.name}>{skin.name}</h4>
                                                <p className="font-mono text-[9px] text-gray-500 mt-1 uppercase tracking-widest">{skin.rarity}</p>
                                            </div>

                                            {!unlocked ? (
                                                <div className="w-full bg-black/60 rounded-lg p-2 flex items-center justify-center gap-2 border border-white/5 h-8">
                                                    <Lock size={12} className="text-gray-500" />
                                                    <span className="font-mono text-[9px] text-gray-500 uppercase tracking-tighter">
                                                        {skin.unlockLevel ? `REQ: NVL ${skin.unlockLevel}` : `REQ: CONQUISTA`}
                                                    </span>
                                                </div>
                                            ) : isEquipped ? (
                                                <div className="w-full bg-primary/20 text-primary rounded-lg p-2 flex items-center justify-center gap-2 border border-primary/30 h-8 font-bold">
                                                    <CheckCircle2 size={12} />
                                                    <span className="font-mono text-[9px] uppercase tracking-tighter">EQUIPADO</span>
                                                </div>
                                            ) : (
                                                // TODO: Server Action to Equip
                                                <Button variant="outline" className="w-full h-8 bg-transparent hover:bg-white/10 border-white/20 text-[9px] font-orbitron uppercase tracking-widest font-black rounded-lg">
                                                    EQUIPAR
                                                </Button>
                                            )}
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Painel Lateral: Current Avatar Preview */}
                <div>
                    <div className="sticky top-8 bg-gray-900/30 border border-white/5 rounded-3xl p-6 backdrop-blur-sm">
                        <h3 className="font-orbitron font-bold text-sm text-center mb-6 uppercase tracking-widest text-gray-400">Projeção Atual</h3>
                        
                        <div className="aspect-[3/4] w-full rounded-2xl border border-white/10 bg-black relative overflow-hidden flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(var(--primary-rgb),0.05)]">
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-gray-800/20 via-black to-black" />
                            <div className="text-gray-600 font-mono text-[10px] uppercase tracking-widest animate-pulse z-10">
                                AVATAR RENDER PREVIEW
                            </div>
                            
                            {/* Hologram Scanner Effect */}
                            <div className="absolute inset-0 scanline opacity-30" />
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-[10px] font-mono text-gray-500 uppercase">BASE</span>
                                <span className="text-[10px] font-orbitron font-bold text-white uppercase">{gamification.baseSkinId?.replace('base_', '').replace('_', ' ') || 'NONE'}</span>
                            </div>
                            <div className="flex justify-between items-center border-b border-white/5 pb-2">
                                <span className="text-[10px] font-mono text-gray-500 uppercase">MASK</span>
                                <span className="text-[10px] font-orbitron font-bold text-white uppercase">{gamification.maskSkinId?.replace('mask_', '').replace('_', ' ') || 'NONE'}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2">
                                <span className="text-[10px] font-mono text-gray-500 uppercase">ARTIFACT</span>
                                <span className="text-[10px] font-orbitron font-bold text-white uppercase">{gamification.artifactSkinId?.replace('art_', '').replace('_', ' ') || 'NONE'}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
