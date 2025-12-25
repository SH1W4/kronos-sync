
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function main() {
    console.log('--- AUDIT AND PROMOTE TO MASTER ---')

    // 1. Ensure a user exists to be the owner/creator
    let user = await prisma.user.findUnique({
        where: { email: 'dev@kronos.com' }
    })

    if (!user) {
        console.log('Creating Root User: dev@kronos.com...')
        user = await prisma.user.create({
            data: {
                email: 'dev@kronos.com',
                name: 'KRONØS DEV',
                role: 'ADMIN'
            }
        })
    }

    // 2. Get or Create the main workspace
    let workspace = await prisma.workspace.findFirst({
        where: { slug: 'kronos-studio' }
    })

    if (!workspace) {
        console.log('Creating Master Workspace: kronos-studio...')
        workspace = await prisma.workspace.create({
            data: {
                name: 'KRONØS STUDIO',
                slug: 'kronos-studio',
                primaryColor: '#8B5CF6',
                ownerId: user.id
            }
        })
    } else {
        console.log(`Master Workspace Found: ${workspace.id}`)
    }

    // 3. Promote the user
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

    // Upsert artist profile
    await prisma.artist.upsert({
        where: { userId: user.id },
        create: {
            userId: user.id,
            workspaceId: workspace.id,
            plan: 'RESIDENT',
            commissionRate: 0.30,
            instagram: '@kronos'
        },
        update: {
            workspaceId: workspace.id,
            plan: 'RESIDENT'
        }
    })

    // 4. Generate a Permanent Master Token
    const masterKey = 'KRONOS-MASTER-OS-2025'
    await prisma.inviteCode.upsert({
        where: { code: masterKey },
        update: { isActive: true, maxUses: 999 },
        create: {
            code: masterKey,
            role: 'ADMIN',
            isActive: true,
            maxUses: 999,
            workspaceId: workspace.id,
            targetPlan: 'RESIDENT',
            creatorId: user.id
        }
    })

    console.log(`\n✅ SUCCESS: ${user.email} is now MASTER of KRONØS STUDIO.`)
    console.log(`MASTER KEY GENERATED: ${masterKey}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
