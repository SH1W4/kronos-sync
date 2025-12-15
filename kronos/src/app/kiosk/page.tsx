'use client'

import React from 'react'
import { Button } from '@/components/ui/button'
import { BrandLogo } from '@/components/ui/brand-logo'

export default function KioskPage() {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-8 relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute inset-0 cyber-grid opacity-20 animate-pulse-cyber" style={{ animationDuration: '4s' }}></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black pointer-events-none"></div>

            {/* Content */}
            <div className="relative z-10 w-full max-w-4xl text-center space-y-16 flex flex-col items-center">

                {/* Logo Section with Scale Animation */}
                <div className="transform hover:scale-105 transition-transform duration-700 cursor-default">
                    <BrandLogo size={120} animated={true} />
                </div>

                <p className="text-xl text-muted-foreground font-mono uppercase tracking-[0.3em] opacity-80 animate-pulse">
                    Toque na tela para iniciar
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full mt-8">
                    <Button
                        className="h-40 text-2xl font-orbitron border-2 border-primary hover:bg-primary/20 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(0,255,136,0.2)] hover:shadow-[0_0_40px_rgba(0,255,136,0.4)] group overflow-hidden relative"
                        variant="outline"
                    >
                        <div className="absolute inset-0 bg-primary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative z-10">SOU CLIENTE</span>
                    </Button>

                    <Button
                        className="h-40 text-2xl font-orbitron border-2 border-secondary hover:bg-secondary/20 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(139,92,246,0.2)] hover:shadow-[0_0_40px_rgba(139,92,246,0.4)] group overflow-hidden relative"
                        variant="outline"
                    >
                        <div className="absolute inset-0 bg-secondary/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative z-10">ACOMPANHANTE</span>
                    </Button>

                    <Button
                        className="h-40 text-2xl font-orbitron border-2 border-accent hover:bg-accent/20 hover:scale-105 transition-all duration-300 shadow-[0_0_20px_rgba(0,191,255,0.2)] hover:shadow-[0_0_40px_rgba(0,191,255,0.4)] group overflow-hidden relative"
                        variant="outline"
                    >
                        <div className="absolute inset-0 bg-accent/10 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                        <span className="relative z-10">CHECK-IN</span>
                    </Button>
                </div>

                <div className="pt-12">
                    <div className="flex gap-2 justify-center">
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                        <div className="w-2 h-2 rounded-full bg-primary animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                </div>
            </div>
        </div>
    )
}
