import dotenv from 'dotenv'
dotenv.config({ path: '.env.local', override: true })
dotenv.config()
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

/**
 * Script to promote a user to ADMIN role securely.
 * Usage: npx tsx scripts/promote-admin.ts <email>
 */
async function promote() {
    const email = process.argv[2]

    if (!email) {
        console.error('❌ Por favor, forneça o email: npx tsx scripts/promote-admin.ts user@example.com')
        process.exit(1)
    }

    try {
        const user = await prisma.user.upsert({
            where: { email: email.toLowerCase() },
            update: { role: 'ADMIN' },
            create: {
                email: email.toLowerCase(),
                name: email.split('@')[0],
                role: 'ADMIN'
            }
        })

        console.log(`✅ Usuário ${user.email} promovido a ADMIN com sucesso!`)

        // Ensure they are part of the demo-studio (or your main studio)
        const workspace = await prisma.workspace.findUnique({ where: { slug: 'demo-studio' } })

        if (workspace) {
            await prisma.workspaceMember.upsert({
                where: {
                    workspaceId_userId: {
                        workspaceId: workspace.id,
                        userId: user.id
                    }
                },
                update: { role: 'ADMIN' },
                create: {
                    workspaceId: workspace.id,
                    userId: user.id,
                    role: 'ADMIN'
                }
            })
            console.log(`✅ Vínculo administrativo com o Workspace "${workspace.name}" garantido.`)
        }

    } catch (error) {
        console.error('❌ Erro ao promover usuário:', error)
    } finally {
        await prisma.$disconnect()
    }
}

promote()
