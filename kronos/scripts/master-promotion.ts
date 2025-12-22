
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function main() {
    console.log('--- AUDIT AND PROMOTE TO MASTER ---')

    // 1. Get the main workspace
    let workspace = await prisma.workspace.findFirst({
        where: { slug: 'kronos-studio' }
    })

    if (!workspace) {
        console.log('Creating Master Workspace: kronos-studio...')
        workspace = await prisma.workspace.create({
            data: {
                name: 'KRONØS STUDIO',
                slug: 'kronos-studio',
                primaryColor: '#8B5CF6'
            }
        })
    } else {
        console.log(`Master Workspace Found: ${workspace.id}`)
    }

    // 2. Find the user (likely the one testing)
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { email: 'dev@kronos.com' },
                { role: 'ARTIST' }
            ]
        },
        orderBy: { createdAt: 'desc' }
    })

    if (user) {
        console.log(`Promoting User: ${user.email} to MASTER (ADMIN) status...`)

        // Update role
        await prisma.user.update({
            where: { id: user.id },
            data: { role: 'ADMIN' }
        })

        // Upsert membership
        await prisma.workspaceMember.upsert({
            where: { workspaceId_userId: { workspaceId: workspace.id, userId: user.id } },
            create: { workspaceId: workspace.id, userId: user.id, role: 'ADMIN' },
            update: { role: 'ADMIN' }
        })

        // Upsert artist profile if needed (so he can see both sides)
        await prisma.artist.upsert({
            where: { userId: user.id },
            create: {
                userId: user.id,
                workspaceId: workspace.id,
                plan: 'RESIDENT',
                commissionRate: 0.30
            },
            update: {
                workspaceId: workspace.id,
                plan: 'RESIDENT'
            }
        })

        console.log(`✅ SUCCESS: ${user.email} is now MASTER of KRONØS STUDIO.`)
    }

    // 3. Generate a Permanent Master Token
    const masterKey = 'KRONOS-MASTER-OS-2025'
    await (prisma as any).inviteCode.upsert({
        where: { code: masterKey },
        update: { isActive: true, maxUses: 999 },
        create: {
            code: masterKey,
            role: 'ADMIN',
            isActive: true,
            maxUses: 999,
            workspaceId: workspace.id,
            targetPlan: 'RESIDENT'
        }
    })

    console.log(`\nMASTER KEY GENERATED: ${masterKey}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
