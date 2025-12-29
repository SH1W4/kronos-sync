// Script para gerar código de convite de teste
// Execute: node scripts/create-master-key.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createMasterKey() {
    try {
        // Busca o primeiro workspace disponível
        const workspace = await prisma.workspace.findFirst()

        if (!workspace) {
            console.error('❌ Nenhum workspace encontrado. Execute o seed primeiro.')
            process.exit(1)
        }

        // Busca um usuário admin/artist para ser o criador
        const creator = await prisma.user.findFirst({
            where: {
                OR: [
                    { role: 'ADMIN' },
                    { role: 'ARTIST' }
                ]
            }
        })

        if (!creator) {
            console.error('❌ Nenhum usuário admin/artist encontrado.')
            process.exit(1)
        }

        // Cria um código de convite permanente
        const invite = await prisma.inviteCode.create({
            data: {
                code: 'MASTER-2025',
                role: 'ARTIST',
                workspaceId: workspace.id,
                creatorId: creator.id,
                maxUses: 999, // Quase ilimitado
                expiresAt: new Date('2099-12-31'), // Nunca expira
                isActive: true
            }
        })

        console.log('✅ Chave Mestra criada com sucesso!')
        console.log('━'.repeat(50))
        console.log(`📋 CÓDIGO: ${invite.code}`)
        console.log(`👤 ROLE: ${invite.role}`)
        console.log(`🏢 WORKSPACE: ${workspace.name}`)
        console.log(`📅 EXPIRA EM: ${invite.expiresAt.toLocaleDateString()}`)
        console.log(`🔢 USOS MÁXIMOS: ${invite.maxUses}`)
        console.log('━'.repeat(50))
        console.log('\n💡 Use este código na tela de onboarding para acessar o sistema!')

    } catch (error) {
        console.error('❌ Erro ao criar chave mestra:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createMasterKey()
