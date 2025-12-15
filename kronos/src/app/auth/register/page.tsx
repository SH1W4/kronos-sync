'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input' // Supondo que você tenha este componente
import Image from 'next/image'
import Link from 'next/link'

export default function RegisterPage() {
    const [isLoading, setIsLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        // Simulação de delay de API
        await new Promise(resolve => setTimeout(resolve, 2000))
        alert('Cadastro realizado! (Simulação)')
        setIsLoading(false)
        // Aqui redirecionaria para /dashboard
    }

    return (
        <div className="min-h-screen bg-black flex flex-col md:flex-row">
            {/* Side Visual (Esquerda) - Destaque Visual */}
            <div className="hidden md:flex flex-1 bg-black items-center justify-center relative overflow-hidden border-r border-white/5">
                <div className="absolute inset-0 cyber-grid opacity-20"></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/10 blur-[100px] rounded-full"></div>

                <div className="relative z-10 flex flex-col items-center">
                    <Image
                        src="/brand/logo-neon.png"
                        alt="Kronos"
                        width={400}
                        height={400}
                        className="drop-shadow-[0_0_50px_rgba(0,255,136,0.3)] animate-pulse-cyber"
                        style={{ animationDuration: '4s' }}
                    />
                    <h2 className="text-3xl font-orbitron font-bold text-white mt-8 tracking-widest text-center">
                        JOIN THE <br /> REVOLUTION
                    </h2>
                </div>
            </div>

            {/* Form Area (Direita) */}
            <div className="flex-1 flex items-center justify-center p-8 bg-black">
                <div className="w-full max-w-md space-y-8">

                    <div className="md:hidden flex justify-center mb-8">
                        <Image src="/brand/logo-neon.png" alt="Kronos" width={120} height={120} />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-3xl font-bold tracking-tight text-white font-orbitron">Criar Conta</h1>
                        <p className="text-gray-400 font-mono text-sm">Entre com seus dados para configurar seu estúdio.</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase text-gray-500">Nome</label>
                                    <Input placeholder="Seu nome" className="bg-white/5 border-white/10 text-white h-12 focus:border-primary/50" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-mono uppercase text-gray-500">Sobrenome</label>
                                    <Input placeholder="Sobrenome" className="bg-white/5 border-white/10 text-white h-12 focus:border-primary/50" />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase text-gray-500">Nome do Estúdio</label>
                                <Input placeholder="Ex: Black Ink Studio" className="bg-white/5 border-white/10 text-white h-12 focus:border-primary/50" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase text-gray-500">Email Profissional</label>
                                <Input type="email" placeholder="contato@estudio.com" className="bg-white/5 border-white/10 text-white h-12 focus:border-primary/50" />
                            </div>

                            <div className="space-y-2">
                                <label className="text-xs font-mono uppercase text-gray-500">Senha</label>
                                <Input type="password" placeholder="••••••••" className="bg-white/5 border-white/10 text-white h-12 focus:border-primary/50" />
                            </div>
                        </div>

                        <Button
                            type="submit"
                            className="w-full h-14 bg-white hover:bg-gray-200 text-black font-bold font-orbitron tracking-wider text-lg transition-all"
                            disabled={isLoading}
                        >
                            {isLoading ? 'CRIANDO CONTA...' : 'FINALIZAR CADASTRO'}
                        </Button>

                        <p className="text-center text-xs text-gray-500 font-mono">
                            Já tem uma conta? <Link href="/auth/signin" className="text-primary hover:underline">Faça Login</Link>
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
