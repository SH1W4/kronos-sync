
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function main() {
    console.log('--- GENERATING ACCESS KEY ---')

    const workspace = await prisma.workspace.findFirst()
    if (!workspace) {
        console.error('No workspace found. Please create a workspace first.')
        return
    }

    const code = 'KRONOS-2025-HUD'

    // Try to create the invite code using raw query if the model property is acting up, 
    // but first try normally with better error handling.
    try {
        const invite = await (prisma as any).inviteCode.upsert({
            where: { code: code },
            update: { isActive: true, maxUses: 99 },
            create: {
                code: code,
                role: 'ARTIST',
                isActive: true,
                maxUses: 99,
                workspaceId: workspace.id,
                creatorId: (await prisma.user.findFirst())?.id || '',
                targetPlan: 'RESIDENT'
            }
        })
        console.log(`\nSUCCESS! ACCESS KEY GENERATED: ${invite.code}`)
    } catch (err: any) {
        console.error('Error with standard prisma call:', err.message)
        console.log('Trying raw query...')

        // Fallback to raw if property missing
        const rawResult = await prisma.$executeRawUnsafe(
            `INSERT INTO "InviteCode" ("id", "code", "role", "isActive", "maxUses", "workspaceId") 
       VALUES ('test-id', '${code}', 'ARTIST', true, 99, '${workspace.id}') 
       ON CONFLICT (code) DO UPDATE SET "isActive" = true;`
        )
        console.log('Raw result:', rawResult)
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
