'use client'

import React, { useState, useEffect } from 'react'
import { Plus, Package, Edit, Trash2, Check, X, AlertCircle, ShoppingBag } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { getArtistInventory, saveProduct, toggleProductStatus, toggleProductSold } from '@/app/actions/store'
import { formatCurrency } from '@/lib/utils'

export default function InventoryPage() {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [editingProduct, setEditingProduct] = useState<any>(null)
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        basePrice: 0,
        type: 'PHYSICAL' as 'PHYSICAL' | 'DIGITAL',
        imageUrl: '',
        isSold: false
    })

    useEffect(() => {
        fetchInventory()
    }, [])

    const fetchInventory = async () => {
        setLoading(true)
        const res = await getArtistInventory()
        if (res.success) {
            setProducts(res.products || [])
        }
        setLoading(false)
    }

    const handleOpenModal = (product: any = null) => {
        if (product) {
            setEditingProduct(product)
            setFormData({
                title: product.title,
                description: product.description || '',
                basePrice: product.basePrice,
                type: product.type,
                imageUrl: product.imageUrl || '',
                isSold: product.isSold || false
            })
        } else {
            setEditingProduct(null)
            setFormData({
                title: '',
                description: '',
                basePrice: 0,
                type: 'PHYSICAL',
                imageUrl: '',
                isSold: false
            })
        }
        setIsModalOpen(true)
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        const res = await saveProduct({
            id: editingProduct?.id,
            ...formData
        })
        if (res.success) {
            setIsModalOpen(false)
            fetchInventory()
        } else {
            alert(res.message)
        }
    }

    if (loading) return <div className="p-10 animate-pulse font-mono text-xs">SYNCHRONIZING INVENTORY...</div>

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-1">
                    <h1 className="text-3xl font-orbitron font-black tracking-tighter text-white uppercase italic">Inventário</h1>
                    <p className="text-[10px] font-mono text-gray-500 uppercase tracking-[0.4em]">Gerencie seu estoque de elite</p>
                </div>
                <Button
                    onClick={() => handleOpenModal()}
                    className="h-14 bg-primary hover:bg-primary/80 text-black font-black font-orbitron tracking-widest px-8 rounded-2xl shadow-[0_0_30px_rgba(var(--primary-rgb),0.2)]"
                >
                    <Plus className="w-5 h-5 mr-2" /> NOVO PRODUTO
                </Button>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length === 0 ? (
                    <div className="col-span-full py-20 border border-dashed border-white/5 rounded-[2.5rem] flex flex-col items-center justify-center text-gray-600 space-y-4">
                        <Package className="w-12 h-12 opacity-20" />
                        <p className="font-mono text-[10px] uppercase tracking-widest">Nenhum item em exibição ainda.</p>
                    </div>
                ) : (
                    products.map(product => (
                        <div key={product.id} className={`group relative bg-gray-900/40 border ${product.isSold ? 'border-secondary/20' : 'border-white/5'} rounded-[2.5rem] p-6 transition-all hover:bg-gray-900/60 flex flex-col`}>
                            {product.isSold && (
                                <div className="absolute top-4 right-4 bg-secondary text-white text-[8px] font-black px-3 py-1 rounded-full animate-pulse z-10">
                                    VENDIDO
                                </div>
                            )}

                            <div className="aspect-square bg-black/40 rounded-[2rem] overflow-hidden mb-6 border border-white/5 relative">
                                {product.imageUrl ? (
                                    <img src={product.imageUrl} alt={product.title} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-4xl opacity-10">
                                        {product.type === 'PHYSICAL' ? '📦' : '💾'}
                                    </div>
                                )}
                            </div>

                            <div className="flex-1 space-y-2">
                                <div className="flex items-center justify-between">
                                    <span className="text-[8px] font-mono text-primary font-black uppercase tracking-widest">{product.type}</span>
                                    <span className="text-[10px] font-mono text-gray-500">{formatCurrency(product.finalPrice)}</span>
                                </div>
                                <h3 className="text-lg font-orbitron font-bold text-white uppercase">{product.title}</h3>
                                <p className="text-xs text-gray-500 line-clamp-2">{product.description || "Sem descrição."}</p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-white/5 grid grid-cols-3 gap-2">
                                <button
                                    onClick={() => handleOpenModal(product)}
                                    className="p-3 bg-white/5 hover:bg-white/10 rounded-xl flex items-center justify-center text-gray-400 hover:text-white transition-all"
                                    title="Editar"
                                >
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={async () => {
                                        if (confirm('Marcar como vendido?')) {
                                            await toggleProductSold(product.id, product.isSold)
                                            fetchInventory()
                                        }
                                    }}
                                    className={`p-3 rounded-xl flex items-center justify-center transition-all ${product.isSold ? 'bg-secondary/10 text-secondary' : 'bg-white/5 text-gray-400 hover:bg-secondary/10 hover:text-secondary'}`}
                                    title={product.isSold ? 'Marcar como Disponível' : 'Marcar como Vendido'}
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                                <button
                                    onClick={async () => {
                                        await toggleProductStatus(product.id, product.isActive)
                                        fetchInventory()
                                    }}
                                    className={`p-3 rounded-xl flex items-center justify-center transition-all ${product.isActive ? 'bg-primary/10 text-primary' : 'bg-red-500/10 text-red-500'}`}
                                    title={product.isActive ? 'Desativar (Esconder)' : 'Ativar (Mostrar)'}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Modal de Cadastro/Edição */}
            {isModalOpen && (
                <div className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-3xl flex items-center justify-center p-4">
                    <div className="bg-gray-950 border border-white/10 w-full max-w-lg rounded-[3.5rem] p-10 shadow-2xl space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-orbitron font-black text-white italic uppercase tracking-widest">
                                {editingProduct ? 'EDITAR ITEM' : 'NOVO ITEM'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white"><X className="w-6 h-6" /></button>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-4">
                                <div>
                                    <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 block">Título do Produto</label>
                                    <Input
                                        className="bg-white/5 border-white/10 h-14 rounded-2xl"
                                        value={formData.title}
                                        onChange={e => setFormData({ ...formData, title: e.target.value.toUpperCase() })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 block">Descrição</label>
                                    <textarea
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm font-sans min-h-[100px] outline-none focus:border-primary transition-all"
                                        value={formData.description}
                                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 block">Preço Base (R$)</label>
                                        <Input
                                            type="number"
                                            className="bg-white/5 border-white/10 h-14 rounded-2xl"
                                            value={formData.basePrice}
                                            onChange={e => setFormData({ ...formData, basePrice: parseFloat(e.target.value) })}
                                            required
                                        />
                                        <p className="text-[8px] font-mono text-gray-600 mt-1 uppercase tracking-tighter">Markup de 20% será aplicado automaticamente.</p>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-mono text-gray-500 uppercase tracking-widest mb-2 block">Tipo</label>
                                        <select
                                            className="w-full bg-white/5 border border-white/10 h-14 rounded-2xl px-4 text-sm outline-none focus:border-primary transition-all"
                                            value={formData.type}
                                            onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                                        >
                                            <option value="PHYSICAL" className="bg-gray-950">FÍSICO (PRINT/MERCH)</option>
                                            <option value="DIGITAL" className="bg-gray-950">DIGITAL (FLASH/ASSETS)</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <Button
                                type="submit"
                                className="w-full h-16 bg-primary hover:bg-primary/80 text-black font-black font-orbitron tracking-[0.2em] rounded-[1.8rem] shadow-xl"
                            >
                                SALVAR NA BOUTIQUE
                            </Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}
