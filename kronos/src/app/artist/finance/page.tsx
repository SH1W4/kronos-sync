'use client'

import React, { useState, useEffect } from 'react'
import { DollarSign, TrendingDown, TrendingUp, AlertCircle, Plus, Wallet, FileText, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getExpenses, saveExpense, deleteExpense } from '@/app/actions/finance'
import { getAdminDashboardStats } from '@/app/actions/admin-stats'
import { formatCurrency } from '@/lib/utils'

export default function FinancePage() {
    const [stats, setStats] = useState<any>(null)
    const [expenses, setExpenses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [formData, setFormData] = useState({
        title: '',
        amount: 0,
        category: 'RENT',
        isPaid: true
    })

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        setLoading(true)
        try {
            const [statsRes, expensesRes] = await Promise.all([
                getAdminDashboardStats(),
                getExpenses()
            ])
            
            if (statsRes) {
                setStats({
                    studioRevenue: statsRes.kpis.monthlyStudioRevenue,
                    totalCommissions: statsRes.kpis.monthlyArtistCommissions
                })
            }
            if (expensesRes.success) setExpenses(expensesRes.expenses || [])
        } catch (error) {
            console.error('Error loading finance data', error)
        }
        setLoading(false)
    }

    const handleAddExpense = async (e: React.FormEvent) => {
        e.preventDefault()
        await saveExpense({
            title: formData.title,
            amount: formData.amount,
            category: formData.category,
            date: new Date(),
            isPaid: formData.isPaid
        })
        setIsModalOpen(false)
        loadData()
    }

    const handleDelete = async (id: string) => {
        if (confirm('Deletar essa despesa permanentemente?')) {
            await deleteExpense(id)
            loadData()
        }
    }

    if (loading) return <div className="p-10 animate-pulse font-mono text-xs text-center text-gray-500 uppercase tracking-widest">Acessando Cofre do Estúdio...</div>

    const totalExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0)
    // A Receita do Estúdio já exclui as comissões dos artistas.
    const studioRevenue = stats?.studioRevenue || 0
    // Lucro Líquido Real = O que sobrou pro Estúdio - Despesas Fixas
    const netProfit = studioRevenue - totalExpenses

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8 relative min-h-screen">
            <div className="absolute inset-0 data-pattern-grid opacity-20 pointer-events-none" />
            <div className="scanline" />
            
            <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-primary to-white uppercase italic tracking-tighter">Financeiro</h1>
                    <p className="text-xs font-mono text-primary/70 uppercase tracking-[0.3em]">Gestão de Capital Soberano</p>
                </div>
                <Button 
                    onClick={() => setIsModalOpen(true)}
                    className="bg-primary text-black font-black font-orbitron uppercase tracking-widest rounded-xl hover:bg-primary/80 transition-all h-12 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)]"
                >
                    <Plus className="mr-2" size={18} /> Lançar Despesa
                </Button>
            </div>

            {/* KPIs */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="glass-card p-6 rounded-[2rem] border border-white/5 space-y-2 bg-gray-900/40">
                    <div className="flex items-center text-gray-400 font-mono text-[10px] uppercase tracking-widest">
                        <TrendingUp size={14} className="mr-2 text-green-500" /> Receita Estúdio (Líquida)
                    </div>
                    <div className="text-2xl font-orbitron font-bold text-white">
                        {formatCurrency(studioRevenue)}
                    </div>
                    <p className="text-[8px] text-gray-600 font-mono uppercase">Já descontadas as comissões.</p>
                </div>

                <div className="glass-card p-6 rounded-[2rem] border border-white/5 space-y-2 bg-gray-900/40">
                    <div className="flex items-center text-gray-400 font-mono text-[10px] uppercase tracking-widest">
                        <Wallet size={14} className="mr-2 text-yellow-500" /> Comissões a Pagar
                    </div>
                    <div className="text-2xl font-orbitron font-bold text-gray-300">
                        {formatCurrency(stats?.totalCommissions || 0)}
                    </div>
                    <p className="text-[8px] text-gray-600 font-mono uppercase">Parte dos Artistas.</p>
                </div>

                <div className="glass-card p-6 rounded-[2rem] border border-red-500/20 bg-red-500/5 space-y-2">
                    <div className="flex items-center text-red-400 font-mono text-[10px] uppercase tracking-widest">
                        <TrendingDown size={14} className="mr-2" /> Despesas Fixas
                    </div>
                    <div className="text-2xl font-orbitron font-bold text-red-500">
                        {formatCurrency(totalExpenses)}
                    </div>
                    <p className="text-[8px] text-red-500/50 font-mono uppercase">Custos da Operação.</p>
                </div>

                <div className={`glass-card p-6 rounded-[2rem] border ${netProfit >= 0 ? 'border-primary/50 bg-primary/10 shadow-[0_0_30px_rgba(var(--primary-rgb),0.15)]' : 'border-red-500/50 bg-red-500/10'} space-y-2`}>
                    <div className="flex items-center text-gray-400 font-mono text-[10px] uppercase tracking-widest">
                        <DollarSign size={14} className={`mr-2 ${netProfit >= 0 ? 'text-primary' : 'text-red-500'}`} /> Lucro Líquido (Real)
                    </div>
                    <div className={`text-3xl font-orbitron font-black ${netProfit >= 0 ? 'text-primary' : 'text-red-500'}`}>
                        {formatCurrency(netProfit)}
                    </div>
                    <p className={`text-[8px] font-mono uppercase ${netProfit >= 0 ? 'text-primary/50' : 'text-red-500/50'}`}>Dinheiro no Caixa do Estúdio.</p>
                </div>
            </div>

            {/* Lista de Despesas */}
            <div className="relative z-10 glass-card p-6 md:p-8 rounded-[2.5rem] border border-white/5 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/10 pb-4">
                    <FileText className="text-primary" />
                    <h2 className="font-orbitron font-bold text-xl uppercase tracking-widest text-white">Extrato de Custos</h2>
                </div>

                {expenses.length === 0 ? (
                    <div className="text-center py-10 text-gray-500 font-mono text-[10px] uppercase tracking-widest border border-dashed border-white/10 rounded-[2rem]">
                        Nenhuma despesa lançada neste mês.
                    </div>
                ) : (
                    <div className="space-y-3">
                        {expenses.map(expense => (
                            <div key={expense.id} className="flex flex-col md:flex-row md:items-center justify-between p-5 bg-black/40 rounded-2xl border border-white/5 hover:border-white/20 transition-all gap-4 group">
                                <div>
                                    <h4 className="font-orbitron font-bold text-white uppercase text-sm tracking-widest">{expense.title}</h4>
                                    <div className="flex gap-2 items-center mt-2">
                                        <span className="text-[9px] font-mono bg-white/10 px-2 py-0.5 rounded text-gray-400 uppercase tracking-wider">{expense.category}</span>
                                        <span className="text-[9px] font-mono text-gray-500">{new Date(expense.date).toLocaleDateString('pt-BR')}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-6">
                                    <div className="text-right">
                                        <p className="font-mono text-red-400 font-bold tracking-tighter">{formatCurrency(expense.amount)}</p>
                                        <p className={`text-[9px] font-mono uppercase tracking-widest ${expense.isPaid ? 'text-green-500' : 'text-yellow-500'}`}>
                                            {expense.isPaid ? 'Liquidado' : 'Aberto'}
                                        </p>
                                    </div>
                                    <button onClick={() => handleDelete(expense.id)} className="p-3 bg-white/5 hover:bg-red-500/20 text-gray-500 hover:text-red-500 rounded-xl transition-colors md:opacity-0 group-hover:opacity-100">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Modal de Nova Despesa */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
                    <div className="bg-gray-950 border border-white/10 rounded-[3rem] p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,0.5)]">
                        <h3 className="text-xl font-orbitron font-black text-white uppercase italic tracking-widest mb-8">Lançar Despesa</h3>
                        <form onSubmit={handleAddExpense} className="space-y-6">
                            <div>
                                <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 block">Título da Despesa</label>
                                <Input 
                                    className="bg-white/5 border-white/10 h-14 rounded-2xl" 
                                    placeholder="Ex: Aluguel do Estúdio"
                                    value={formData.title}
                                    onChange={e => setFormData({...formData, title: e.target.value})}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 block">Valor (R$)</label>
                                    <Input 
                                        type="number"
                                        step="0.01"
                                        className="bg-white/5 border-white/10 h-14 rounded-2xl font-mono" 
                                        value={formData.amount}
                                        onChange={e => setFormData({...formData, amount: parseFloat(e.target.value)})}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 block">Categoria</label>
                                    <select 
                                        className="w-full bg-white/5 border border-white/10 h-14 rounded-2xl px-4 text-sm text-gray-300 outline-none"
                                        value={formData.category}
                                        onChange={e => setFormData({...formData, category: e.target.value})}
                                    >
                                        <option value="RENT" className="bg-gray-900">Aluguel</option>
                                        <option value="SUPPLIES" className="bg-gray-900">Materiais</option>
                                        <option value="SOFTWARE" className="bg-gray-900">Softwares</option>
                                        <option value="MARKETING" className="bg-gray-900">Marketing</option>
                                        <option value="MAINTENANCE" className="bg-gray-900">Manutenção</option>
                                        <option value="TAXES" className="bg-gray-900">Impostos</option>
                                        <option value="OTHER" className="bg-gray-900">Outros</option>
                                    </select>
                                </div>
                            </div>
                            <div className="flex gap-3 pt-4">
                                <Button type="button" variant="ghost" className="flex-1 h-14 rounded-2xl text-[10px] font-mono uppercase tracking-widest" onClick={() => setIsModalOpen(false)}>Cancelar</Button>
                                <Button type="submit" className="flex-1 bg-primary hover:bg-primary/80 text-black font-orbitron font-black tracking-widest h-14 rounded-2xl">Registrar</Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
