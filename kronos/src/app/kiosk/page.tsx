'use client'

import React from 'react'
import { Button } from '@/components/ui/button'

export default function KioskPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 cyber-grid opacity-20"></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none"></div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-4xl text-center space-y-12">
                <div>
                    <h1 className="cyber-title text-6xl md:text-8xl mb-4 font-black tracking-tighter">
                        KRONOS
                        <span className="block text-4xl md:text-5xl text-primary font-light tracking-widest mt-2 opacity-80">
                            STUDIO
                        </span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-mono mt-8 uppercase tracking-widest">
                        Toque na tela para iniciar
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full">
                    <Button
                        className="h-32 text-2xl font-orbitron border-2 border-primary hover:bg-primary/20 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:shadow-[0_0_40px_rgba(0,255,136,0.4)]"
                        variant="outline"
                    >
                        SOU CLIENTE
                    </Button>

                    <Button
                        className="h-32 text-2xl font-orbitron border-2 border-secondary hover:bg-secondary/20 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)]"
                        variant="outline"
                    >
                        ACOMPANHANTE
                    </Button>

                    <Button
                        className="h-32 text-2xl font-orbitron border-2 border-accent hover:bg-accent/20 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(0,191,255,0.2)] hover:shadow-[0_0_40px_rgba(0,191,255,0.4)]"
                        variant="outline"
                    >
                        CHECK-IN
                    </Button>
                </div>

                <div className="pt-12">
                    <div className="w-24 h-1 bg-primary/50 mx-auto rounded-full animate-pulse"></div>
                </div>
            </div>
        </div>
    )
}
