'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { revalidatePath } from "next/cache"
import { BUSINESS_RULES, calculateProductPrice } from "@/lib/business-rules"

export async function getProducts(typeFilter?: string) {
    try {
        const products = await prisma.product.findMany({
            where: {
                isActive: true,
                ...(typeFilter ? { type: typeFilter as any } : {})
            },
            include: {
                artist: {
                    include: {
                        user: {
                            select: { name: true }
                        }
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        })
        return { success: true, products }
    } catch (error) {
        console.error("Error fetching products:", error)
        return { success: false, products: [] }
    }
}

export async function getArtistInventory() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) return { success: false, message: 'Não autorizado' }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                artist: true,
                ownedWorkspaces: { take: 1 }
            }
        }) as any

        if (!user || (!user.artist && user.role !== 'ADMIN')) {
            return { success: false, message: 'Perfil não encontrado' }
        }

        const products = await prisma.product.findMany({
            where: user.role === 'ADMIN' ? { workspaceId: user.ownedWorkspaces[0]?.id } : { artistId: user.artist?.id },
            orderBy: { createdAt: 'desc' }
        }) as any

        return { success: true, products }
    } catch (error) {
        return { success: false, message: 'Erro ao buscar inventário' }
    }
}

export async function saveProduct(data: {
    id?: string,
    title: string,
    description?: string,
    basePrice: number,
    type: 'PHYSICAL' | 'DIGITAL',
    imageUrl?: string,
    isSold?: boolean
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) return { success: false, message: 'Não autorizado' }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: { artist: true, ownedWorkspaces: true }
        })

        if (!user?.artist && user?.role !== 'ADMIN') return { success: false, message: 'Apenas artistas podem postar produtos' }

        const productData = {
            title: data.title,
            description: data.description,
            basePrice: data.basePrice,
            finalPrice: calculateProductPrice(data.basePrice, BUSINESS_RULES.DEFAULT_MARKUP), // Auto-markup for BETA
            type: data.type,
            imageUrl: data.imageUrl,
            isSold: data.isSold ?? false,
            artistId: user.artist?.id || '',
            workspaceId: user.artist?.workspaceId || (user.ownedWorkspaces[0]?.id || null)
        }

        if (data.id) {
            await (prisma.product as any).update({
                where: { id: data.id },
                data: productData
            })
        } else {
            await (prisma.product as any).create({
                data: productData
            })
        }

        revalidatePath('/marketplace')
        revalidatePath('/artist/inventory')
        return { success: true }
    } catch (error) {
        console.error(error)
        return { success: false, message: 'Erro ao salvar produto' }
    }
}

export async function toggleProductStatus(id: string, currentStatus: boolean) {
    try {
        await prisma.product.update({
            where: { id },
            data: { isActive: !currentStatus }
        })
        revalidatePath('/artist/inventory')
        revalidatePath('/marketplace')
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

export async function toggleProductSold(id: string, currentStatus: boolean) {
    try {
        await (prisma.product as any).update({
            where: { id },
            data: { isSold: !currentStatus }
        })
        revalidatePath('/artist/inventory')
        revalidatePath('/marketplace')
        return { success: true }
    } catch (error) {
        return { success: false }
    }
}

export async function createOrder(data: {
    items: { productId: string; quantity: number }[],
    total: number,
    discountValue: number,
    finalTotal: number,
    couponCode?: string
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return { error: 'Faça login para finalizar a compra.' }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email },
            include: {
                artist: true,
                ownedWorkspaces: { take: 1 }
            }
        })

        if (!user) return { success: false, message: 'Usuário não encontrado.' }

        // Resolve Coupon ID if exists
        let couponId = undefined
        if (data.couponCode) {
            const coupon = await prisma.coupon.findUnique({
                where: { code: data.couponCode }
            })
            if (coupon) couponId = coupon.id
        }

        // Calculate shares based on Product Base Prices
        const productDetails = await prisma.product.findMany({
            where: { id: { in: data.items.map(i => i.productId) } }
        })

        let artistShare = 0
        data.items.forEach(item => {
            const p = productDetails.find(p => p.id === item.productId)
            if (p) {
                artistShare += (p.basePrice * item.quantity)
            }
        })

        // Studio takes the markup. If there's a discount, it's subtracted from the studio's share for now.
        const studioShare = data.finalTotal - artistShare

        const order = await (prisma.order as any).create({
            data: {
                clientId: user.id,
                total: data.total,
                discountValue: data.discountValue,
                finalTotal: data.finalTotal,
                artistShare,
                studioShare: Math.max(0, studioShare), // Prevent negative studio share
                couponId: couponId,
                status: 'PENDING', // Waiting for Payment Gateway
                items: {
                    create: data.items.map(item => {
                        const p = productDetails.find(prod => prod.id === item.productId)
                        return {
                            productId: item.productId,
                            quantity: item.quantity,
                            price: p?.finalPrice || 0
                        }
                    })
                }
            }
        })

        return { success: true, orderId: order.id }

    } catch (error) {
        console.error("Error creating order:", error)
        return { error: 'Erro ao criar pedido.' }
    }
}
