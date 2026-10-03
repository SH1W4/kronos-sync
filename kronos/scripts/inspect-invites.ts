import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function main() {
    const invites = await prisma.inviteCode.findMany({
        include: { creator: true, workspace: true }
    })
    console.log('=== INVITE CODES ===')
    for (const inv of invites) {
        console.log(`Code: ${inv.code} | Role: ${inv.role} | Plan: ${inv.targetPlan} | Uses: ${inv.currentUses}/${inv.maxUses} | Active: ${inv.isActive} | Workspace: ${inv.workspace?.name}`)
    }
}

main().catch(console.error).finally(() => prisma.$disconnect())
