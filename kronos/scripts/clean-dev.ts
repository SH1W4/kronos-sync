import { prisma } from '@/lib/prisma'

async function cleanDevUser() {
    console.log('🧹 Limpando usuário Dev anterior...')

    // Deleta usuário dev (cascade vai deletar artist também)
    const deleted = await prisma.user.deleteMany({
        where: {
            email: 'dev@kronos.com'
        }
    })

    console.log(`✅ Deletados ${deleted.count} usuários Dev`)
}

cleanDevUser()
    .then(() => {
        console.log('✨ Pronto! Agora você pode usar o Modo Dev.')
        process.exit(0)
    })
    .catch((error) => {
        console.error('❌ Erro:', error)
        process.exit(1)
    })
