import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })
const prisma = new PrismaClient()

async function main() {
    console.log("🚀 Iniciando Promoção a Head Artist...")

    const targetEmail = "dev@kronos.com"

    // 1. Encontrar ou criar o usuário dev
    let user = await prisma.user.findUnique({
        where: { email: targetEmail }
    })

    if (!user) {
        console.log("❌ Usuário dev@kronos.com não encontrado. Verifique se você já logou com ele.")
        return
    }

    // 2. Encontrar o workspace principal
    const workspace = await prisma.workspace.findFirst({
        where: { slug: "kronos-studio" }
    }) || await prisma.workspace.findFirst()

    if (!workspace) {
        console.log("❌ Nenhum workspace encontrado para vincular.")
        return
    }

    console.log(`🎯 Alvo: ${user.name} (${user.email})`)
    console.log(`🏢 Workspace: ${workspace.name} (${workspace.slug})`)

    // 3. Update User role
    await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' }
    })

    // 4. Update/Create Membership
    await prisma.workspaceMember.upsert({
        where: {
            workspaceId_userId: {
                workspaceId: workspace.id,
                userId: user.id
            }
        },
        create: {
            workspaceId: workspace.id,
            userId: user.id,
            role: 'ADMIN'
        },
        update: {
            role: 'ADMIN'
        }
    })

    // 5. Update/Create Artist Profile
    await prisma.artist.upsert({
        where: { userId: user.id },
        create: {
            userId: user.id,
            workspaceId: workspace.id,
            plan: 'RESIDENT',
            commissionRate: 0.70 // 70/30 split default
        },
        update: {
            workspaceId: workspace.id,
            plan: 'RESIDENT'
        }
    })

    console.log("✅ STATUS: HEAD ARTIST ATIVADO.")
    console.log("💡 DICA: Reinicie a sessão (Logout/Login) para propagar as permissões HUD.")
}

main()
    .catch((e) => {
        console.error(e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
