import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            role: true,
            clerkId: true,
            artist: {
                select: { plan: true, isActive: true }
            }
        },
        orderBy: { role: 'asc' }
    })

    console.log('\n====== USUÁRIOS NO BANCO ======\n')
    for (const u of users) {
        console.log(`➤ ${u.role.padEnd(6)} | ${(u.name || 'Sem nome').padEnd(20)} | ${u.email} ${u.clerkId ? '(Clerk ✅)' : '(sem Clerk ⚠️)'}${u.artist ? ` | Plano: ${u.artist.plan}` : ''}`)
    }
    console.log(`\nTotal: ${users.length} usuário(s)\n`)
}

main().catch(console.error).finally(() => prisma.$disconnect())
