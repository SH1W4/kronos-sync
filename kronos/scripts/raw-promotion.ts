
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function main() {
    console.log('--- RAW POWER PROMOTION ---')

    // 1. Ensure Workspace
    const workspaceSlug = 'kronos-studio'
    await prisma.$executeRawUnsafe(`
    INSERT INTO "workspaces" ("id", "name", "slug", "primaryColor", "updatedAt") 
    VALUES ('master-ws-id', 'KRONØS STUDIO', '${workspaceSlug}', '#8B5CF6', NOW())
    ON CONFLICT (slug) DO NOTHING;
  `)

    const ws = await prisma.workspace.findFirst({ where: { slug: workspaceSlug } })
    const wsId = ws?.id || 'master-ws-id'

    // 2. Find User (the one you are using)
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
        console.log(`Promoting ${user.email}...`)

        // Raw user update
        await prisma.$executeRawUnsafe(`UPDATE "users" SET "role" = 'ADMIN' WHERE "id" = '${user.id}';`)

        // Raw membership update
        await prisma.$executeRawUnsafe(`
      INSERT INTO "workspace_members" ("id", "workspaceId", "userId", "role") 
      VALUES ('mem-' || gen_random_uuid(), '${wsId}', '${user.id}', 'ADMIN')
      ON CONFLICT ("workspaceId", "userId") DO UPDATE SET "role" = 'ADMIN';
    `)

        // Raw artist update
        await prisma.$executeRawUnsafe(`
      INSERT INTO "artists" ("id", "userId", "workspaceId", "plan", "commissionRate", "updatedAt") 
      VALUES ('art-' || gen_random_uuid(), '${user.id}', '${wsId}', 'RESIDENT', 0.30, NOW())
      ON CONFLICT ("userId") DO UPDATE SET "workspaceId" = '${wsId}', "plan" = 'RESIDENT';
    `)

        console.log(`✅ ${user.email} IS NOW MASTER.`)
    }

    // 3. Invite Code
    const masterKey = 'KRONOS-MASTER-OS-2025'
    await prisma.$executeRawUnsafe(`
    INSERT INTO "InviteCode" ("id", "code", "role", "isActive", "maxUses", "workspaceId", "targetPlan") 
    VALUES ('inv-master', '${masterKey}', 'ADMIN', true, 999, '${wsId}', 'RESIDENT')
    ON CONFLICT (code) DO UPDATE SET "isActive" = true;
  `)

    console.log(`\nMASTER KEY: ${masterKey}`)
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
