"use client"

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { formatCurrency } from '@/lib/utils'

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

export default function MarketplacePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [cart, setCart] = useState<CartItem[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const [couponCode, setCouponCode] = useState('')
  const [couponDiscount, setCouponDiscount] = useState(0)

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      // Mock data - in real app, fetch from API
      const mockProducts: Product[] = [
        {
          id: 'prod-1',
          title: 'Flash Tattoo - Caveira',
          description: 'Design exclusivo de caveira estilizada',
          basePrice: 150,
          finalPrice: 180,
          type: 'PRINT',
          imageUrl: '/placeholder-tattoo.jpg',
          artist: { user: { name: 'João Silva' } }
        },
        {
          id: 'prod-2',
          title: 'Arte Digital - Mandala',
          description: 'Mandala complexa para tatuagem grande',
          basePrice: 300,
          finalPrice: 360,
          type: 'DIGITAL',
          artist: { user: { name: 'Maria Santos' } }
        },
        {
          id: 'prod-3',
          title: 'Original - Dragão Oriental',
          description: 'Arte original única de dragão oriental',
          basePrice: 500,
          finalPrice: 600,
          type: 'ORIGINAL',
          artist: { user: { name: 'Pedro Costa' } }
        },
        {
          id: 'prod-4',
          title: 'Stencil - Rosa Geométrica',
          description: 'Stencil físico de rosa com elementos geométricos',
          basePrice: 80,
          finalPrice: 96,
          type: 'PHYSICAL',
          artist: { user: { name: 'João Silva' } }
        }
      ]

      setProducts(mockProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const addToCart = (product: Product) => {
    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id)
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, { productId: product.id, quantity: 1, product }]
    })
  }

  const removeFromCart = (productId: string) => {
    setCart(prev => prev.filter(item => item.productId !== productId))
  }

  const updateQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId)
      return
    }
    setCart(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    )
  }

  const getCartTotal = () => {
    return cart.reduce((total, item) => total + (item.product.finalPrice * item.quantity), 0)
  }

  const getFinalTotal = () => {
    return getCartTotal() - couponDiscount
  }

  const validateCoupon = async () => {
    if (!couponCode) return

    try {
      // Mock coupon validation
      if (couponCode === 'DESCONTO10') {
        setCouponDiscount(getCartTotal() * 0.1)
      } else if (couponCode === 'SAVE50') {
        setCouponDiscount(50)
      } else {
        setCouponDiscount(0)
        alert('Cupom inválido')
      }
    } catch (error) {
      console.error('Error validating coupon:', error)
    }
  }

  const handleCheckout = async () => {
    if (cart.length === 0) return

    try {
      const response = await fetch('/api/store/cart/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientId: 'client-1', // Mock client ID
          items: cart.map(item => ({
            productId: item.productId,
            quantity: item.quantity
          })),
          couponCode: couponCode || undefined
        })
      })

      if (response.ok) {
        alert('Pedido realizado com sucesso!')
        setCart([])
        setCouponCode('')
        setCouponDiscount(0)
      } else {
        alert('Erro ao processar pedido')
      }
    } catch (error) {
      console.error('Error during checkout:', error)
      alert('Erro ao processar pedido')
    }
  }

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.title.toLowerCase().includes(filter.toLowerCase()) ||
                         product.artist.user.name.toLowerCase().includes(filter.toLowerCase())
    const matchesType = !typeFilter || product.type === typeFilter
    return matchesSearch && matchesType
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-muted/50">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-primary">KRONOS SYNC</h1>
              <p className="text-muted-foreground">Marketplace de Arte</p>
            </div>
            <nav className="flex gap-4">
              <a href="/" className="text-foreground hover:text-primary transition-colors">
                Agenda
              </a>
              <a href="/marketplace" className="text-primary font-medium">
                Marketplace
              </a>
              <a href="/kiosk" className="text-foreground hover:text-primary transition-colors">
                Kiosk
              </a>
              <a href="/dashboard" className="text-foreground hover:text-primary transition-colors">
                Dashboard
              </a>
            </nav>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Products Section */}
          <div className="lg:col-span-3">
            {/* Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex gap-4">
                <Input
                  placeholder="Buscar produtos ou artistas..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  className="flex-1"
                />
                <Select
                  value={typeFilter}
                  onChange={(e) => setTypeFilter(e.target.value)}
                >
                  <option value="">Todos os tipos</option>
                  <option value="PRINT">Print</option>
                  <option value="DIGITAL">Digital</option>
                  <option value="ORIGINAL">Original</option>
                  <option value="PHYSICAL">Físico</option>
                </Select>
              </div>
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredProducts.map(product => (
                <div key={product.id} className="card hover:shadow-xl transition-shadow">
                  <div className="aspect-square bg-accent rounded-lg mb-4 flex items-center justify-center">
                    {product.imageUrl ? (
                      <img 
                        src={product.imageUrl} 
                        alt={product.title}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    ) : (
                      <div className="text-muted-foreground text-4xl">🎨</div>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <h3 className="font-semibold text-foreground">{product.title}</h3>
                    <p className="text-sm text-muted-foreground">{product.description}</p>
                    <p className="text-xs text-secondary">Por {product.artist.user.name}</p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-lg font-bold text-primary">
                          {formatCurrency(product.finalPrice)}
                        </span>
                        {product.basePrice !== product.finalPrice && (
                          <span className="text-sm text-muted-foreground line-through ml-2">
                            {formatCurrency(product.basePrice)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs bg-accent px-2 py-1 rounded">
                        {product.type}
                      </span>
                    </div>
                    
                    <Button 
                      onClick={() => addToCart(product)}
                      className="w-full"
                    >
                      Adicionar ao Carrinho
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Nenhum produto encontrado</p>
              </div>
            )}
          </div>

          {/* Cart Sidebar */}
          <div className="lg:col-span-1">
            <div className="card sticky top-4">
              <h3 className="font-semibold text-foreground mb-4">
                Carrinho ({cart.length})
              </h3>

              {cart.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  Carrinho vazio
                </p>
              ) : (
                <div className="space-y-4">
                  {cart.map(item => (
                    <div key={item.productId} className="flex items-center gap-3 p-3 bg-accent rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium text-sm">{item.product.title}</h4>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(item.product.finalPrice)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.productId, item.quantity - 1)}
                        >
                          -
                        </Button>
                        <span className="text-sm w-8 text-center">{item.quantity}</span>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => updateQuantity(item.productId, item.quantity + 1)}
                        >
                          +
                        </Button>
                      </div>
                    </div>
                  ))}

                  <div className="border-t border-border pt-4 space-y-3">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Cupom de desconto"
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                      />
                      <Button variant="outline" onClick={validateCoupon}>
                        Aplicar
                      </Button>
                    </div>

                    {couponDiscount > 0 && (
                      <p className="text-sm text-green-400">
                        Desconto: {formatCurrency(couponDiscount)}
                      </p>
                    )}

                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Subtotal:</span>
                        <span>{formatCurrency(getCartTotal())}</span>
                      </div>
                      {couponDiscount > 0 && (
                        <div className="flex justify-between text-sm text-green-400">
                          <span>Desconto:</span>
                          <span>-{formatCurrency(couponDiscount)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-semibold">
                        <span>Total:</span>
                        <span>{formatCurrency(getFinalTotal())}</span>
                      </div>
                    </div>

                    <Button onClick={handleCheckout} className="w-full">
                      Finalizar Compra
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

