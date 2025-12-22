'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

/**
 * Search for clients by name or phone
 */
export async function searchClients(query: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return { error: 'Não autorizado' }
        }

        const workspaceId = (session.user as any).activeWorkspaceId

        if (!workspaceId) {
            return { error: 'Workspace não encontrado' }
        }

        // Search for users with role CLIENT who have bookings in this workspace
        const clients = await prisma.user.findMany({
            where: {
                role: 'CLIENT',
                OR: [
                    { name: { contains: query, mode: 'insensitive' } },
                    { phone: { contains: query } },
                    { email: { contains: query, mode: 'insensitive' } }
                ],
                bookings: {
                    some: {
                        workspaceId
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true
            },
            take: 10
        })

        return { success: true, clients }

    } catch (error) {
        console.error('Error searching clients:', error)
        return { error: 'Erro ao buscar clientes' }
    }
}

/**
 * Create a new client quickly
 */
export async function createQuickClient(data: {
    name: string
    phone: string
    email?: string
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return { error: 'Não autorizado' }
        }

        const email = data.email?.trim() === "" ? undefined : data.email?.trim()

        // Check if client already exists
        const existing = await prisma.user.findFirst({
            where: {
                OR: [
                    { phone: data.phone },
                    ...(email ? [{ email }] : [])
                ]
            }
        })

        if (existing) {
            const field = existing.phone === data.phone ? 'telefone' : 'email'
            return { error: `Cliente já cadastrado com este ${field}` }
        }

        // Create new client
        const client = await prisma.user.create({
            data: {
                name: data.name,
                phone: data.phone,
                email: email || null,
                role: 'CLIENT'
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true
            }
        })

        console.log("✅ Cliente criado com sucesso:", client.name)
        return { success: true, client }

    } catch (error) {
        console.error('Error creating client:', error)
        return { error: 'Erro ao criar cliente. Verifique se os dados são válidos.' }
    }
}

/**
 * Get all clients for the workspace
 */
export async function getWorkspaceClients() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return { error: 'Não autorizado' }
        }

        const workspaceId = (session.user as any).activeWorkspaceId

        if (!workspaceId) {
            return { error: 'Workspace não encontrado' }
        }

        // Get all unique clients who have bookings in this workspace
        const clients = await prisma.user.findMany({
            where: {
                role: 'CLIENT',
                bookings: {
                    some: {
                        workspaceId
                    }
                }
            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                image: true,
                _count: {
                    select: {
                        bookings: {
                            where: {
                                workspaceId
                            }
                        }
                    }
                }
            },
            orderBy: {
                name: 'asc'
            }
        })

        return { success: true, clients }

    } catch (error) {
        console.error('Error fetching clients:', error)
        return { error: 'Erro ao buscar clientes' }
    }
}
