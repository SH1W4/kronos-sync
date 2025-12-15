'use client'

import React from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'

export default function FichaAnamnesePage() {
    const params = useParams()
    const bookingId = params.bookingId

    return (
        <div className="min-h-screen bg-background py-12 px-4">
            <div className="max-w-3xl mx-auto space-y-8">
                <header className="text-center space-y-4">
                    <h1 className="cyber-title text-3xl md:text-4xl">FICHA DE ANAMNESE</h1>
                    <p className="text-muted-foreground font-mono">
                        Protocolo de Segurança e Consentimento
                    </p>
                    <div className="inline-block bg-accent/10 px-4 py-1 rounded border border-accent/20">
                        <span className="text-accent text-sm font-mono">Ref: {bookingId}</span>
                    </div>
                </header>

                <form className="cyber-card p-8 space-y-8">
                    <section className="space-y-4">
                        <h2 className="text-xl font-orbitron text-primary border-b border-primary/20 pb-2">
                            1. Dados Pessoais
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-mono">Nome Completo</label>
                                <Input placeholder="Seu nome" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-mono">Data de Nascimento</label>
                                <Input type="date" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-mono">CPF</label>
                                <Input placeholder="000.000.000-00" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-mono">Telefone</label>
                                <Input placeholder="(00) 00000-0000" />
                            </div>
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-orbitron text-secondary border-b border-secondary/20 pb-2">
                            2. Questionário de Saúde
                        </h2>
                        <div className="space-y-3">
                            {[
                                'Possui alguma alergia?',
                                'Tem problemas de coagulação ou cicatrização?',
                                'Possui diabetes ou hipertensão?',
                                'Está tomando algum medicamento?',
                                'Possui doenças de pele (psoríase, vitiligo)?',
                                'Está gestante ou amamentando?',
                            ].map((question, i) => (
                                <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded hover:bg-muted/50 transition-colors">
                                    <span className="text-sm">{question}</span>
                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name={`q${i}`} className="accent-primary" />
                                            <span className="text-sm font-mono">Sim</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="radio" name={`q${i}`} className="accent-primary" defaultChecked />
                                            <span className="text-sm font-mono">Não</span>
                                        </label>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="space-y-4">
                        <h2 className="text-xl font-orbitron text-accent border-b border-accent/20 pb-2">
                            3. Termo de Consentimento
                        </h2>
                        <div className="bg-muted p-4 text-xs font-mono text-muted-foreground h-32 overflow-y-auto border border-border">
                            <p className="mb-2">
                                Eu declaro que as informações acima são verdadeiras e assumo total responsabilidade por qualquer omissão.
                            </p>
                            <p className="mb-2">
                                Estou ciente de que o procedimento de tatuagem é irreversível e envolve riscos de infecção se não forem seguidos os cuidados pós-procedimento.
                            </p>
                            <p>
                                Autorizo o uso de imagem da minha tatuagem para fins de portfólio e divulgação do artista e do estúdio.
                            </p>
                        </div>
                        <div className="flex items-center gap-3 pt-4">
                            <input type="checkbox" className="w-5 h-5 accent-primary" id="consent" />
                            <label htmlFor="consent" className="text-sm cursor-pointer select-none">
                                Li e concordo com os termos acima
                            </label>
                        </div>
                    </section>

                    <div className="pt-4">
                        <Button className="w-full h-12 text-lg font-orbitron" type="button">
                            ASSINAR E ENVIAR
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    )
}
