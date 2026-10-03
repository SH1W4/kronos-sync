import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()

async function main() {
    const emails = [
        'ssantos.suiane@gmail.com',
        'helenaklipel01@gmail.com',
        'victoriaandradevcl@gmail.com',
        'azoth.ttt@gmail.com',
        'yank.tattoo@gmail.com'
    ]
    for (const email of emails) {
        const u = await prisma.user.findFirst({
            where: { email: { equals: email, mode: 'insensitive' } },
            include: { artist: true, memberships: { include: { workspace: true } } }
        })
        console.log(`\nEmail: ${email}`)
        if (!u) {
            console.log('  -> NÃO ENCONTRADO NO BANCO!')
        } else {
            console.log(`  -> ID: ${u.id} | Name: ${u.name} | Role: ${u.role} | ClerkId: ${u.clerkId}`)
            console.log(`  -> Artist: ${u.artist ? `ID: ${u.artist.id} (Active: ${u.artist.isActive})` : 'NÃO'}`)
            console.log(`  -> Memberships: ${u.memberships.length}`)
        }
    }
}

main().catch(console.error).finally(() => prisma.$disconnect())
