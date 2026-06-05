'use server'

import { prisma } from "@/lib/prisma"
import { auth } from "@clerk/nextjs/server"
import { revalidatePath } from "next/cache"

/**
 * Retorna as despesas (Expenses) de um Workspace
 */
export async function getExpenses(month?: number, year?: number) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) return { success: false, message: 'Não autorizado' }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { memberships: true }
        })

        const workspaceId = user?.memberships.find(m => m.role === 'ADMIN')?.workspaceId
        if (!workspaceId) return { success: false, message: 'Apenas admins podem visualizar o financeiro' }

        const now = new Date()
        const targetMonth = month !== undefined ? month : now.getMonth()
        const targetYear = year !== undefined ? year : now.getFullYear()

        const startDate = new Date(targetYear, targetMonth, 1)
        const endDate = new Date(targetYear, targetMonth + 1, 0, 23, 59, 59)

        const expenses = await (prisma as any).expense.findMany({
            where: {
                workspaceId,
                date: {
                    gte: startDate,
                    lte: endDate
                }
            },
            orderBy: { date: 'desc' }
        })

        return { success: true, expenses }
    } catch (error) {
        console.error("Error fetching expenses:", error)
        return { success: false, message: 'Erro ao buscar despesas' }
    }
}

/**
 * Cria ou atualiza uma Despesa
 */
export async function saveExpense(data: {
    id?: string,
    title: string,
    description?: string,
    amount: number,
    category: any, // ExpenseCategory
    date: Date,
    isPaid: boolean
}) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) return { success: false, message: 'Não autorizado' }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { memberships: true }
        })

        const workspaceId = user?.memberships.find(m => m.role === 'ADMIN')?.workspaceId
        if (!workspaceId) return { success: false, message: 'Acesso negado' }

        if (data.id) {
            await (prisma as any).expense.update({
                where: { id: data.id },
                data: {
                    title: data.title,
                    description: data.description,
                    amount: data.amount,
                    category: data.category,
                    date: data.date,
                    isPaid: data.isPaid
                }
            })
        } else {
            await (prisma as any).expense.create({
                data: {
                    workspaceId,
                    title: data.title,
                    description: data.description,
                    amount: data.amount,
                    category: data.category,
                    date: data.date,
                    isPaid: data.isPaid
                }
            })
        }

        revalidatePath('/artist/dashboard')
        return { success: true }
    } catch (error) {
        console.error("Error saving expense:", error)
        return { success: false, message: 'Erro ao salvar despesa' }
    }
}

/**
 * Exclui uma Despesa
 */
export async function deleteExpense(id: string) {
    try {
        const { userId: clerkUserId } = await auth()
        if (!clerkUserId) return { success: false, message: 'Não autorizado' }

        const user = await prisma.user.findUnique({
            where: { clerkId: clerkUserId },
            include: { memberships: true }
        })

        const workspaceId = user?.memberships.find(m => m.role === 'ADMIN')?.workspaceId
        if (!workspaceId) return { success: false, message: 'Acesso negado' }

        // Verifica se a despesa pertence ao workspace
        const expense = await (prisma as any).expense.findUnique({ where: { id } })
        if (!expense || expense.workspaceId !== workspaceId) {
            return { success: false, message: 'Despesa não encontrada' }
        }

        await (prisma as any).expense.delete({ where: { id } })

        revalidatePath('/artist/dashboard')
        return { success: true }
    } catch (error) {
        console.error("Error deleting expense:", error)
        return { success: false, message: 'Erro ao excluir despesa' }
    }
}
