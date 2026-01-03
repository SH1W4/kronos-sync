'use server'

import { prisma } from "@/lib/prisma"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth-options"

/**
 * UTILS: CSV Escaping
 */
function escapeCSV(value: any) {
    if (value === null || value === undefined) return ""
    const str = String(value)
    if (str.includes(",") || str.includes("\"") || str.includes("\n")) {
        return `"${str.replace(/"/g, '""')}"`
    }
    return str
}

/**
 * EXPORT: Carteira de Clientes (CSV)
 */
export async function exportClientsCSV() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) return { error: 'Não autorizado' }

        const workspaceId = (session.user as any).activeWorkspaceId
        const isAdmin = session.user.role === 'ADMIN'
        const artist = await prisma.artist.findUnique({ where: { userId: session.user.id } })

        if (!workspaceId) return { error: 'Workspace não encontrado' }

        const clients = await prisma.user.findMany({
            where: {
                role: 'CLIENT',
                bookings: {
                    some: {
                        workspaceId,
                        ...(isAdmin ? {} : { artistId: artist?.id })
                    }
                }
            },
            include: {
                bookings: {
                    where: {
                        workspaceId,
                        ...(isAdmin ? {} : { artistId: artist?.id })
                    },
                    select: { value: true, createdAt: true }
                }
            }
        })

        const header = ["Nome", "Email", "Telefone", "Total Investido", "Sessões", "Última Visita", "Data de Cadastro"]
        const rows = clients.map(client => {
            const totalSpent = client.bookings.reduce((acc, b) => acc + (b.value || 0), 0)
            const lastVisit = client.bookings.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())[0]?.createdAt

            return [
                escapeCSV(client.name),
                escapeCSV(client.email),
                escapeCSV(client.phone),
                totalSpent.toFixed(2),
                client.bookings.length,
                lastVisit ? lastVisit.toLocaleDateString('pt-BR') : "N/A",
                client.createdAt.toLocaleDateString('pt-BR')
            ]
        })

        const csvContent = [header, ...rows].map(r => r.join(",")).join("\n")
        return { success: true, csv: csvContent }

    } catch (error) {
        console.error('Error exporting clients CSV:', error)
        return { error: 'Falha ao gerar CSV' }
    }
}

/**
 * EXPORT: Fichas de Anamnese Consolidadas (CSV)
 */
export async function exportAnamnesisCSV() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) return { error: 'Não autorizado' }

        const workspaceId = (session.user as any).activeWorkspaceId
        const isAdmin = session.user.role === 'ADMIN'
        const artist = await prisma.artist.findUnique({ where: { userId: session.user.id } })

        if (!workspaceId) return { error: 'Workspace não encontrado' }

        const anamnesis = await prisma.anamnesis.findMany({
            where: {
                booking: {
                    workspaceId,
                    ...(isAdmin ? {} : { artistId: artist?.id })
                }
            },
            include: {
                booking: {
                    include: { client: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const header = ["Data", "Cliente", "Telefone", "Condições Médicas", "Alergias", "Problemas Cicatrização", "Descrição da Arte", "Autoriza Compartilhamento"]
        const rows = anamnesis.map(a => [
            a.createdAt.toLocaleDateString('pt-BR'),
            escapeCSV(a.booking?.client?.name),
            escapeCSV(a.booking?.client?.phone),
            escapeCSV(a.medicalConditionsTattoo),
            escapeCSV(a.knownAllergies),
            escapeCSV(a.medicalConditionsHealing === "SIM" ? a.medicalConditionsHealingDetails : "NÃO"),
            escapeCSV(a.artDescription),
            (a as any).allowSharing ? "SIM" : "NÃO"
        ])

        const csvContent = [header, ...rows].map(r => r.join(",")).join("\n")
        return { success: true, csv: csvContent }

    } catch (error) {
        console.error('Error exporting anamnesis CSV:', error)
        return { error: 'Falha ao gerar CSV de anamnese' }
    }
}

/**
 * EXPORT: Inteligência Financeira (CSV)
 */
export async function exportFinanceCSV() {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) return { error: 'Não autorizado' }

        const workspaceId = (session.user as any).activeWorkspaceId
        const isAdmin = session.user.role === 'ADMIN'
        const artist = await prisma.artist.findUnique({ where: { userId: session.user.id } })

        if (!workspaceId) return { error: 'Workspace não encontrado' }

        const bookings = await prisma.booking.findMany({
            where: {
                workspaceId,
                status: 'COMPLETED',
                ...(isAdmin ? {} : { artistId: artist?.id })
            },
            include: {
                client: true,
                artist: {
                    include: { user: true }
                }
            },
            orderBy: { createdAt: 'desc' }
        })

        const header = ["Data", "Cliente", "Artista", "Valor Bruto", "Status", "Tipo"]
        const rows = bookings.map(b => [
            b.createdAt.toLocaleDateString('pt-BR'),
            escapeCSV(b.client.name),
            escapeCSV(b.artist.user.name),
            b.value.toFixed(2),
            b.status,
            escapeCSV(b.type)
        ])

        const csvContent = [header, ...rows].map(r => r.join(",")).join("\n")
        return { success: true, csv: csvContent }

    } catch (error) {
        console.error('Error exporting finance CSV:', error)
        return { error: 'Falha ao gerar CSV financeiro' }
    }
}

/**
 * REPORT: Dossiê do Cliente (Markdown / Docling-Ready)
 */
export async function generateClientDossier(clientId: string) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) return { error: 'Não autorizado' }

        const workspaceId = (session.user as any).activeWorkspaceId
        const artist = await prisma.artist.findUnique({ where: { userId: session.user.id } })
        const isAdmin = session.user.role === 'ADMIN'

        const client = await prisma.user.findUnique({
            where: { id: clientId },
            include: {
                bookings: {
                    where: { workspaceId },
                    orderBy: { createdAt: 'desc' },
                    include: {
                        anamnesis: true,
                        artist: {
                            include: { user: true }
                        },
                        slot: true
                    }
                }
            }
        })

        if (!client) return { error: 'Cliente não encontrado' }

        const totalSpent = client.bookings.reduce((acc, b) => acc + (b.value || 0), 0)

        let md = `# DOSSIÊ ESTRATÉGICO: ${client.name?.toUpperCase()}\n`
        md += `> Gerado em: ${new Date().toLocaleString('pt-BR')}\n`
        md += `> Workspace ID: ${workspaceId}\n\n`

        md += `## 👤 PERFIL DO CLIENTE\n`
        md += `- **Nome:** ${client.name}\n`
        md += `- **Email:** ${client.email || 'Não informado'}\n`
        md += `- **Telefone:** ${client.phone || 'Não informado'}\n`
        md += `- **Cadastro em:** ${client.createdAt.toLocaleDateString('pt-BR')}\n`
        md += `- **Total de Sessões:** ${client.bookings.length}\n`
        md += `- **Ticket Médio:** R$ ${(totalSpent / (client.bookings.length || 1)).toFixed(2)}\n`
        md += `- **LTV (Life Time Value):** R$ ${totalSpent.toFixed(2)}\n\n`

        md += `## 🩺 HISTÓRICO DE SAÚDE (ANAMNESE)\n`
        const allAnamnesis = client.bookings.map(b => b.anamnesis).filter(Boolean)

        if (allAnamnesis.length === 0) {
            md += `*Nenhuma ficha de anamnese registrada.*\n\n`
        } else {
            allAnamnesis.forEach((a: any, idx) => {
                // Check privacy
                const canSee = isAdmin || a.booking.artistId === artist?.id || a.allowSharing
                if (!canSee) {
                    md += `### Ficha #${allAnamnesis.length - idx} (${a.createdAt.toLocaleDateString('pt-BR')})\n`
                    md += `> [DADOS PROTEGIDOS - OUTRO ARTISTA]\n\n`
                    return
                }

                md += `### Ficha #${allAnamnesis.length - idx} (${a.createdAt.toLocaleDateString('pt-BR')})\n`
                md += `- **Condições Tattoo:** ${a.medicalConditionsTattoo}\n`
                md += `- **Condições Cicatrização:** ${a.medicalConditionsHealing === "SIM" ? a.medicalConditionsHealingDetails : 'Nenhuma'}\n`
                md += `- **Alergias:** ${a.knownAllergies}\n`
                md += `- **Descrição da Arte:** ${a.artDescription}\n`
                md += `- **Autoriza Compartilhamento:** ${a.allowSharing ? 'SIM' : 'NÃO'}\n\n`
            })
        }

        md += `## 📅 HISTÓRICO DE SESSÕES\n`
        client.bookings.forEach(b => {
            md += `### ${new Date(b.slot.startTime).toLocaleDateString('pt-BR')} - ${b.type}\n`
            md += `- **Artista:** ${b.artist.user.name}\n`
            md += `- **Valor:** R$ ${b.value.toFixed(2)}\n`
            md += `- **Status:** ${b.status}\n\n`
        })

        md += `---\n`
        md += `*KRONØS SYNC // Strategic Intelligence Engine*\n`

        return { success: true, markdown: md, filename: `dossie_${client.name?.toLowerCase().replace(/\s+/g, '_')}.md` }

    } catch (error) {
        console.error('Error generating client dossier:', error)
        return { error: 'Falha ao gerar dossiê' }
    }
}
