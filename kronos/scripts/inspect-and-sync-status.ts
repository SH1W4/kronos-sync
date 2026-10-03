import { PrismaClient } from '@prisma/client'
import { createClerkClient } from '@clerk/backend'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

async function main() {
    console.log('=== VERIFICANDO METADATA NO CLERK ===')
    const userList = await clerk.users.getUserList({ limit: 50 })
    for (const u of userList.data) {
        const email = u.emailAddresses[0]?.emailAddress
        console.log(`Clerk User: ${email} | ID: ${u.id}`)
        console.log(`  publicMetadata: ${JSON.stringify(u.publicMetadata)}`)
    }
}

main().catch(console.error).finally(() => prisma.$disconnect())
