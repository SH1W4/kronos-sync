'use client'

import React from 'react'

export default function DashboardPage() {
    return (
        <div className="min-h-screen bg-background p-8">
            <header className="mb-8 flex justify-between items-center">
                <div>
                    <h1 className="cyber-title text-4xl mb-2">DASHBOARD</h1>
                    <p className="text-muted-foreground font-mono">Visão Geral do Estúdio</p>
                </div>
                <div className="flex gap-4">
                    <div className="cyber-card px-6 py-2">
                        <span className="text-secondary font-bold">MANAGER MODE</span>
                    </div>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {[
                    { label: 'Faturamento Hoje', value: 'R$ 3.450', color: 'text-primary' },
                    { label: 'Sessões Ativas', value: '3', color: 'text-accent' },
                    { label: 'Novos Leads', value: '+12', color: 'text-secondary' },
                    { label: 'Taxa de Ocupação', value: '85%', color: 'text-white' },
                ].map((stat, i) => (
                    <div key={i} className="cyber-card p-6">
                        <h3 className="text-muted-foreground font-mono text-sm mb-2 uppercase">{stat.label}</h3>
                        <p className={`text-3xl font-bold font-orbitron ${stat.color}`}>{stat.value}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 cyber-card p-6 h-96 flex items-center justify-center border-dashed border-2 border-muted">
                    <p className="text-muted-foreground font-mono">GRÁFICO DE RENDIMENTO MENSAL (Em Breve)</p>
                </div>
                <div className="cyber-card p-6 h-96 flex items-center justify-center border-dashed border-2 border-muted">
                    <p className="text-muted-foreground font-mono">TOP ARTISTAS (Em Breve)</p>
                </div>
            </div>
        </div>
    )
}
