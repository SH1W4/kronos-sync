/**
 * PATCH SCRIPT: Atualiza o nome do usuário admin no banco Neon
 * Execute com: npx tsx scripts/patch-name.ts
 */
import { PrismaClient } from '@prisma/client'

// Força a conexão com o banco Neon (não o local)
process.env.DATABASE_URL = 'postgresql://neondb_owner:npg_K5pzLT0MQYWq@ep-long-rain-a498adc9.us-east-1.aws.neon.tech/neondb?sslmode=require'

const prisma = new PrismaClient()

async function main() {
    // Buscar o usuário admin (role ADMIN)
    const user = await prisma.user.findFirst({
        where: { role: 'ADMIN' },
        select: { id: true, name: true, email: true, clerkId: true }
    })

    if (!user) {
        console.log('❌ Nenhum usuário ADMIN encontrado.')
        return
    }

    console.log(`🔍 Usuário encontrado: ${user.name} (${user.email})`)

    // Atualizar o nome
    await prisma.user.update({
        where: { id: user.id },
        data: { name: 'KRS ADM' }
    })

    console.log(`✅ Nome atualizado com sucesso para: KRS ADM`)
}

main()
    .catch(console.error)
    .finally(() => prisma.$disconnect())
