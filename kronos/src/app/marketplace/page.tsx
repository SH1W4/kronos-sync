"use client"

import React, { useState, useEffect, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ShoppingCart, Search, Filter, Tag, ArrowLeft, Heart, ShoppingBag, X } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'
import Link from 'next/link'
import { BrandLogo } from '@/components/ui/brand-logo'

interface Product {
  id: string
  title: string
  description: string
  basePrice: number
  finalPrice: number
  type: 'PRINT' | 'DIGITAL' | 'ORIGINAL' | 'PHYSICAL'
  imageUrl?: string
  artist: {
    user: {
      name: string
    }
  }
}

interface CartItem {
  productId: string
  quantity: number
  product: Product
}

function MarketplaceContent() {
  const searchParams = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)
  const [isCartOpen, setIsCartOpen] = useState(false)

  useEffect(() => {
    fetchProducts()

    // Auto-apply coupon from URL
    const urlCoupon = searchParams.get('coupon')
    if (urlCoupon) {
      setCouponCode(urlCoupon)
      handleApplyCoupon(urlCoupon)
    }
  }, [searchParams])

  /*
  // MOCK DATA REMOVED - CONNECTED TO DB
  */

  const fetchProducts = async () => {
    try {
      const { getProducts } = await import('@/app/actions/store')
      const res = await getProducts(typeFilter || undefined)
      if (res.success) {
        setProducts(res.products as any)
      }
    } finally {
      setLoading(false)
    }
  }

  // Reload when filter changes
  useEffect(() => {
    fetchProducts()
  }, [typeFilter])

  const handleApplyCoupon = async (code: string) => {
    const { validateCoupon } = await import('@/app/actions/coupons')
    const res = await validateCoupon(code)
    if (res.valid) {
      setCouponDiscount(res.discountPercent || 0)
    } else {
      if (code && !searchParams.get('coupon')) alert(res.message)
      setCouponDiscount(0)
    }
  }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id)
      if (existing) return prev.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item)
      return [...prev, { productId: product.id, quantity: 1, product }]
    })
    setIsCartOpen(true)
  }

  const getCartTotal = () => cart.reduce((total, item) => total + (item.product.finalPrice * item.quantity), 0)
  const getDiscountValue = () => (getCartTotal() * couponDiscount) / 100
  const getFinalTotal = () => getCartTotal() - getDiscountValue()

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-primary selection:text-black relative overflow-hidden data-pattern-grid">
      {/* Cyber Y2K Effects */}
      <div className="scanline" />
      <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-xl border-b border-white/5">
        <div className="container mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/kiosk" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 border border-white/10 rounded-full flex items-center justify-center group-hover:border-primary/50 transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-400 group-hover:text-primary" />
            </div>
            <span className="hidden md:block text-[10px] font-mono text-gray-500 uppercase tracking-widest">Retornar</span>
          </Link>

          <div className="flex flex-col items-center">
            <h1 className="text-xl font-orbitron font-black tracking-tighter">
              KRONØS <span className="text-primary italic">LOJA</span>
            </h1>
            <p className="text-[8px] font-mono text-gray-500 uppercase tracking-[0.4em]">Official Boutique</p>
          </div>

          <button
            onClick={() => setIsCartOpen(!isCartOpen)}
            className="p-3 border border-white/10 rounded-xl relative hover:bg-white/5 transition-all"
          >
            <ShoppingBag className="w-6 h-6 text-primary" />
            {cart.length > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-[10px] font-bold rounded-full flex items-center justify-center text-white ring-2 ring-black">
                {cart.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-12">
        {/* Search & Filters */}
        <div className="mb-12 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1 group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-primary transition-colors" />
            <Input
              placeholder="Pesquisar itens ou coleções..."
              className="pl-12 bg-gray-900/50 border-white/5 h-14 rounded-2xl focus:border-primary transition-all text-white"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            {['PRINT', 'PHYSICAL', 'ORIGINAL'].map(type => (
              <button
                key={type}
                onClick={() => setTypeFilter(typeFilter === type ? '' : type)}
                className={`px-6 rounded-2xl border text-[10px] font-mono uppercase tracking-widest transition-all ${typeFilter === type ? 'bg-primary border-primary text-black font-bold' : 'border-white/5 bg-gray-900/50 text-gray-400 hover:border-white/20'
                  }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Dynamic Coupon Banner */}
        {couponDiscount > 0 && (
          <div className="mb-12 p-4 bg-primary/10 border border-primary/20 rounded-2xl flex items-center justify-between animate-in fade-in slide-in-from-top-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Tag className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-mono uppercase tracking-widest text-primary font-bold">Cupom Ativado</p>
                <p className="text-[10px] text-gray-400">Você está economizando <span className="text-white font-bold">{couponDiscount}%</span> nesta compra.</p>
              </div>
            </div>
            <button onClick={() => setCouponDiscount(0)} className="text-[10px] font-mono text-gray-500 hover:text-white uppercase transition-colors">Remover</button>
          </div>
        )}

        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.filter(p => !typeFilter || p.type === typeFilter).map(product => (
            <div key={product.id} className="group glass-card border border-white/5 rounded-[2.5rem] p-4 hover:border-primary/40 transition-all duration-500 hover:shadow-[0_0_50px_rgba(0,255,136,0.1)] flex flex-col relative overflow-hidden">
              {/* Hover Glow Background */}
              <div className="absolute inset-0 bg-primary/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>

              <div className="aspect-[4/5] bg-black/40 rounded-[2rem] overflow-hidden relative mb-6 border border-white/5 group-hover:border-primary/20 transition-colors">
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                {/* Image placeholder */}
                <div className="w-full h-full flex items-center justify-center text-6xl opacity-20 filter grayscale group-hover:grayscale-0 group-hover:opacity-60 transition-all duration-700">
                  {product.type === 'PRINT' ? '🖼️' : product.type === 'PHYSICAL' ? '🧴' : '🎨'}
                </div>
                <div className="absolute top-4 left-4 glass-card px-3 py-1 rounded-full border border-white/10">
                  <span className="text-[8px] font-mono text-primary font-black uppercase tracking-widest">{product.type}</span>
                </div>
              </div>

              <div className="flex-1 px-2">
                <p className="text-[10px] font-mono text-primary uppercase tracking-widest mb-1 italic">{product.artist.user.name}</p>
                <h3 className="text-xl font-orbitron font-bold text-white mb-2 leading-tight group-hover:text-primary transition-colors">{product.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2 mb-6 h-10">{product.description}</p>
              </div>

              <div className="px-2 pb-2">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col">
                    <span className="text-2xl font-orbitron font-black text-white">{formatCurrency(product.finalPrice)}</span>
                    <span className="text-[8px] font-mono text-gray-500 uppercase">Preço Final</span>
                  </div>
                  <button className="p-3 text-gray-500 hover:text-secondary transition-colors">
                    <Heart className="w-5 h-5" />
                  </button>
                </div>
                <Button
                  onClick={() => addToCart(product)}
                  className="w-full h-14 bg-white/5 hover:bg-primary hover:text-black border border-white/10 hover:border-primary rounded-2xl transition-all font-orbitron font-black tracking-widest text-xs active:scale-95 shadow-sm hover:shadow-[0_0_20px_rgba(0,255,136,0.2)]"
                >
                  ADICIONAR
                </Button>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Cart Sidebar */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setIsCartOpen(false)}></div>
          <div className="relative w-full max-w-md bg-gray-950 border-l border-white/10 p-8 flex flex-col h-full animate-in slide-in-from-right duration-500">
            <div className="flex items-center justify-between mb-10">
              <h3 className="text-2xl font-orbitron font-bold text-white">CARRINHO</h3>
              <button onClick={() => setIsCartOpen(false)} className="text-gray-500 hover:text-white"><X className="w-8 h-8" /></button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
              {cart.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center opacity-20">
                  <ShoppingBag className="w-16 h-16 mb-4" />
                  <p className="font-orbitron tracking-widest">Carrinho Vazio</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.productId} className="flex gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                    <div className="w-20 h-20 bg-black rounded-2xl flex items-center justify-center text-2xl">
                      {item.product.type === 'PRINT' ? '🖼️' : '🧴'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-bold text-white mb-1">{item.product.title}</h4>
                      <p className="text-xs text-gray-500 mb-2">{item.product.artist.user.name}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-primary font-bold">{formatCurrency(item.product.finalPrice)}</span>
                        <div className="flex items-center space-x-3 bg-black/40 rounded-full px-2 py-1 border border-white/5">
                          <button onClick={() => addToCart({ ...item.product, finalPrice: -1 } as any)} className="w-6 h-6 flex items-center justify-center text-gray-500">-</button>
                          <span className="text-xs font-mono">{item.quantity}</span>
                          <button onClick={() => addToCart(item.product)} className="w-6 h-6 flex items-center justify-center text-primary">+</button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {cart.length > 0 && (
              <div className="mt-8 border-t border-white/10 pt-8 space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Subtotal</span>
                    <span className="text-white font-mono">{formatCurrency(getCartTotal())}</span>
                  </div>
                  {couponDiscount > 0 && (
                    <div className="flex justify-between text-sm text-primary">
                      <span>Desconto ({couponDiscount}%)</span>
                      <span className="font-mono">-{formatCurrency(getDiscountValue())}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-2xl font-orbitron font-black pt-2 border-t border-white/5">
                    <span className="text-white">TOTAL</span>
                    <span className="text-primary">{formatCurrency(getFinalTotal())}</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-2">
                    <Input
                      placeholder="CUPOM"
                      value={couponCode}
                      onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      className="bg-black/50 border-white/10 text-center font-orbitron tracking-widest"
                    />
                    <Button variant="outline" onClick={() => handleApplyCoupon(couponCode)}>APLICAR</Button>
                  </div>
                  <Button
                    onClick={async () => {
                      const { createOrder } = await import('@/app/actions/store')
                      const res = await createOrder({
                        items: cart.map(i => ({ productId: i.productId, quantity: i.quantity })),
                        total: getCartTotal(),
                        discountValue: getDiscountValue(),
                        finalTotal: getFinalTotal(),
                        couponCode: couponCode || undefined
                      })
                      if (res.success) {
                        alert(`Pedido #${res.orderId} criado com sucesso! Aguarde o contato do Staff.`)
                        setCart([])
                        setIsCartOpen(false)
                      } else {
                        alert('Erro: ' + res.error)
                      }
                    }}
                    className="w-full h-16 bg-primary hover:bg-primary-dark text-black font-black font-orbitron text-base rounded-2xl shadow-[0_0_30px_rgba(0,255,136,0.2)]"
                  >
                    FINALIZAR PEDIDO
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div>Carregando...</div>}>
      <MarketplaceContent />
    </Suspense>
  )
}

