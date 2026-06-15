import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
const prisma = new PrismaClient()

async function main() {
    try {
        console.log('--- ALL AGENT FEEDBACKS ---')
        const feedbacks = await prisma.agentFeedback.findMany({
            include: { user: true }
        })
        console.log(`Total feedbacks: ${feedbacks.length}`)
        feedbacks.forEach(f => {
            console.log(`[${f.id}] User: ${f.user.name} | Type: ${f.type} | Message: ${f.message} | Status: ${f.status} | Created: ${f.createdAt}`)
        })

        console.log('\n--- LAST 20 AGENT LOGS ---')
        const logs = await prisma.agentLog.findMany({
            take: 20,
            orderBy: { createdAt: 'desc' },
            include: { user: true }
        })
        logs.forEach(l => {
            console.log(`User: ${l.user?.name} | Query: ${l.query} | Response: ${l.response.substring(0, 100)}... | Created: ${l.createdAt}`)
        })
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}
main()
