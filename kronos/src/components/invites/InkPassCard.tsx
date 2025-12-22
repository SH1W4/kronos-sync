'use client'

import React from 'react'
import { QRCodeSVG } from 'qrcode.react'
import { Sparkles, Shield, Cpu, Zap } from 'lucide-react'

interface InkPassCardProps {
    code: string
    type?: 'RESIDENT' | 'GUEST' | 'ASSOCIATED'
    studioName?: string
    primaryColor?: string
}

export function InkPassCard({
    code,
    type = 'RESIDENT',
    studioName = 'KRONØS',
    primaryColor: initialColor = '#8B5CF6'
}: InkPassCardProps) {
    // Determine color based on type
    const primaryColor = type === 'ASSOCIATED' ? '#00FF88' : initialColor // Emerald for Associated
    const inviteUrl = `${typeof window !== 'undefined' ? window.location.origin : ''}/invite/${code}`

    return (
        <div className="relative w-full max-w-md aspect-[1.6/1] group">
            {/* Outer Glow / Aura */}
            <div
                className="absolute -inset-1 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-1000"
                style={{ backgroundColor: primaryColor }}
            />

            {/* Main Card Body */}
            <div className="relative h-full w-full bg-black/40 backdrop-blur-3xl border border-white/10 rounded-3xl overflow-hidden flex flex-col p-6 shadow-2xl glitch-border">

                {/* HUD Elements / Decorative Grid */}
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-white/10 to-transparent clip-path-poly" />
                    <div className="absolute bottom-4 left-4 font-mono text-[8px] text-gray-500 uppercase tracking-[0.2em]">
                        Digital Soul Clearance // Access Granted
                    </div>
                </div>

                {/* Header: Studio Name & Pass Type */}
                <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                            <Cpu size={14} className="text-white/40" />
                            <h2 className="text-2xl font-orbitron font-black tracking-tighter text-white uppercase italic">
                                {studioName}
                            </h2>
                        </div>
                        <div className="flex items-center gap-2">
                            <span
                                className="text-[9px] font-mono font-bold tracking-[0.3em] uppercase px-2 py-0.5 rounded border"
                                style={{
                                    borderColor: `${primaryColor}44`,
                                    backgroundColor: `${primaryColor}11`,
                                    color: primaryColor,
                                    boxShadow: `0 0 10px ${primaryColor}22`
                                }}
                            >
                                {type} PASS
                            </span>
                        </div>
                    </div>
                    <div className="p-2 bg-white/5 rounded-xl border border-white/10">
                        <Shield size={20} className="text-white/20" />
                    </div>
                </div>

                {/* Center Content: QR Code & Code */}
                <div className="flex-1 flex items-center gap-6 relative z-10">
                    {/* QR Code Segment */}
                    <div className="p-3 bg-white/5 rounded-2xl border border-white/10 relative overflow-hidden group/qr">
                        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-transparent -translate-x-full group-hover/qr:translate-x-full transition-transform duration-1000" />
                        <QRCodeSVG
                            value={inviteUrl}
                            size={100}
                            bgColor="transparent"
                            fgColor="white"
                            level="H"
                            includeMargin={false}
                        />
                    </div>

                    {/* Meta Data Segment */}
                    <div className="flex-1 space-y-4">
                        <div className="space-y-1">
                            <label className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Credencial do Artista</label>
                            <div className="font-mono text-xl font-black text-white tracking-widest bg-white/5 border border-white/10 px-3 py-1 rounded-lg">
                                {code}
                            </div>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex-1 h-[1px] bg-white/10" />
                            <Zap size={12} className="text-yellow-400 opacity-50" />
                            <div className="flex-1 h-[1px] bg-white/10" />
                        </div>

                        <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-0.5">
                                <span className="text-[7px] font-mono text-gray-600 uppercase">Status</span>
                                <span className="block text-[8px] font-bold text-green-400 uppercase tracking-tighter">Verified</span>
                            </div>
                            <div className="space-y-0.5">
                                <span className="text-[7px] font-mono text-gray-600 uppercase">Silo</span>
                                <span className="block text-[8px] font-bold text-purple-400 uppercase tracking-tighter">Active</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer: Tech Pattern */}
                <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center relative z-10">
                    <div className="flex gap-1">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-1 h-3 bg-white/10 rounded-full" />
                        ))}
                    </div>
                    <div className="flex items-center gap-2">
                        <Sparkles size={10} className="text-purple-400" />
                        <span className="text-[8px] font-mono text-gray-500 uppercase tracking-widest">Quantum Link Secured</span>
                    </div>
                </div>

                {/* Reflection effect */}
                <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/5 to-transparent pointer-events-none" />
            </div>

            {/* Holographic Scanline */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-3xl">
                <div className="absolute top-0 left-0 w-full h-20 bg-gradient-to-b from-transparent via-white/5 to-transparent -translate-y-full animate-scanline-fast" />
            </div>
        </div>
    )
}
