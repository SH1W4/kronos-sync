'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"
import { slugify } from "@/lib/utils"
import { revalidatePath } from "next/cache"

/**
 * Criação direta de Workspace.
 * Mantida para uso administrativo ou chaves mestras.
 */
export async function createWorkspace(data: { name: string, primaryColor: string }) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return { error: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return { error: 'Usuário não encontrado' }
        }

        const slug = slugify(data.name)

        const existing = await prisma.workspace.findUnique({
            where: { slug }
        })

        const finalSlug = existing ? `${slug}-${Math.floor(Math.random() * 1000)}` : slug

        const result = await prisma.$transaction(async (tx) => {
            const workspace = await tx.workspace.create({
                data: {
                    name: data.name,
                    slug: finalSlug,
                    primaryColor: data.primaryColor || '#8B5CF6',
                    ownerId: user.id
                }
            })

            await tx.workspaceMember.create({
                data: {
                    workspaceId: workspace.id,
                    userId: user.id,
                    role: 'ADMIN'
                }
            })

            await tx.user.update({
                where: { id: user.id },
                data: { role: 'ADMIN' }
            })

            await tx.artist.upsert({
                where: { userId: user.id },
                create: {
                    userId: user.id,
                    workspaceId: workspace.id,
                    plan: 'RESIDENT',
                    commissionRate: 0.85,
                },
                update: {
                    workspaceId: workspace.id,
                    plan: 'RESIDENT'
                }
            })

            return workspace
        })

        revalidatePath('/artist/dashboard')
        return { success: true, workspace: result }

    } catch (error) {
        console.error('Error creating workspace:', error)
        return { error: 'Erro ao criar estúdio. Tente outro nome.' }
    }
}

/**
 * Solicitação de Acesso ao Ecossistema KRONØS.
 * Permite que novos estúdios sejam avaliados antes da criação da infraestrutura.
 */
export async function submitWorkspaceRequest(data: {
    studioName: string,
    teamDetails: string,
    motivation: string
}) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return { error: 'Não autorizado' }
        }

        const user = await prisma.user.findUnique({
            where: { id: (session.user as any).id || '' }
        }) || await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return { error: 'Usuário não encontrado' }
        }

        const existingRequest = await prisma.workspaceRequest.findFirst({
            where: {
                userId: user.id,
                status: 'PENDING'
            }
        })

        if (existingRequest) {
            return { error: 'Você já possui uma solicitação em análise. Entraremos em contato em breve.' }
        }

        await prisma.workspaceRequest.create({
            data: {
                userId: user.id,
                studioName: data.studioName,
                teamDetails: data.teamDetails,
                motivation: data.motivation
            }
        })

        return { success: true, message: 'Solicitação enviada com sucesso! Analisaremos sua equipe e entraremos em contato para construir esse alicerce juntos.' }

    } catch (error) {
        console.error('Error submitting workspace request:', error)
        return { error: 'Erro ao enviar solicitação. Tente novamente mais tarde.' }
    }
}

/**
 * Atualiza os dados financeiros do Workspace.
 * Apenas ADMINs do workspace podem modificar a chave PIX.
 */
export async function updateWorkspaceFinance(data: {
    pixKey?: string,
    pixRecipient?: string
}) {
    try {
        const session = await getServerSession(authOptions)
        const activeWorkspaceId = (session as any)?.activeWorkspaceId || (session?.user as any)?.activeWorkspaceId

        if (!session?.user || !activeWorkspaceId) {
            return { error: 'Não autorizado ou nenhum estúdio ativo.' }
        }

        // Verificar permissão
        const member = await prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: activeWorkspaceId,
                    userId: (session.user as any).id
                }
            }
        })

        if (!member || member.role !== 'ADMIN') {
            return { error: 'Apenas administradores podem configurar o financeiro do estúdio.' }
        }

        await prisma.workspace.update({
            where: { id: activeWorkspaceId },
            data: {
                pixKey: data.pixKey,
                pixRecipient: data.pixRecipient
            }
        })

        revalidatePath('/artist/settings')
        revalidatePath('/artist/finance')

        return { success: true, message: 'Configurações financeiras atualizadas.' }

    } catch (error) {
        console.error('Error updating workspace finance:', error)
        return { error: 'Erro ao salvar configurações de PIX.' }
    }
}

/**
 * Atualiza o branding visual do Workspace.
 * Apenas ADMINs do workspace podem modificar.
 */
export async function updateWorkspaceBranding(data: {
    name?: string,
    primaryColor?: string,
    logoUrl?: string
}) {
    try {
        const session = await getServerSession(authOptions)
        const activeWorkspaceId = (session as any)?.activeWorkspaceId || (session?.user as any)?.activeWorkspaceId

        if (!session?.user || !activeWorkspaceId) {
            return { error: 'Não autorizado ou nenhum estúdio ativo.' }
        }

        // Verificar permissão
        const member = await prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: activeWorkspaceId,
                    userId: (session.user as any).id
                }
            }
        })

        if (!member || member.role !== 'ADMIN') {
            return { error: 'Apenas administradores podem configurar o branding do estúdio.' }
        }

        const workspace = await prisma.workspace.update({
            where: { id: activeWorkspaceId },
            data: {
                name: data.name,
                primaryColor: data.primaryColor,
                logoUrl: data.logoUrl
            }
        })

        revalidatePath('/artist/settings')
        revalidatePath('/kiosk')

        return { success: true, message: 'Branding do estúdio atualizado.', workspace }

    } catch (error) {
        console.error('Error updating workspace branding:', error)
        return { error: 'Erro ao salvar branding.' }
    }
}
