import { PrismaClient } from '@prisma/client'
import dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })
const prisma = new PrismaClient()

async function main() {
    try {
        console.log('--- USERS & ARTISTS ---')
        const users = await prisma.user.findMany({
            include: { artist: true }
        })
        users.forEach(u => {
            console.log(`User: ${u.name} | Role: ${u.role} | Clerk ID: ${u.clerkId} | Email: ${u.email} | Artist ID: ${u.artist?.id} | Plan: ${u.artist?.plan}`)
        })

        console.log('\n--- AGENT FEEDBACKS ---')
        const feedbacks = await prisma.agentFeedback.findMany({
            include: { user: true }
        })
        feedbacks.forEach(f => {
            console.log(`User: ${f.user.name} | Type: ${f.type} | Message: ${f.message} | Status: ${f.status} | Created: ${f.createdAt}`)
        })
    } catch (e) {
        console.error(e)
    } finally {
        await prisma.$disconnect()
    }
}
main()
