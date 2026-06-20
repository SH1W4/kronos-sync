import { PrismaClient } from '@prisma/client'
import { config } from 'dotenv'

// Carregar variáveis de ambiente
config({ path: '.env.local' })

const prisma = new PrismaClient()

async function checkGabriella() {
    console.log('🔍 Verificando status da artista Gabriella...\n')

    // 1. Buscar usuário pelo nome
    const usersByName = await prisma.user.findMany({
        where: {
            name: {
                contains: 'gabriella',
                mode: 'insensitive'
            }
        },
        include: {
            memberships: {
                include: {
                    workspace: true
                }
            },
            artist: true
        }
    })

    console.log(`👤 Usuários encontrados com nome "Gabriella": ${usersByName.length}`)

    if (usersByName.length === 0) {
        console.log('❌ Nenhum usuário encontrado com o nome Gabriella')
        
        // Buscar todos os usuários recentes
        const recentUsers = await prisma.user.findMany({
            where: {
                createdAt: {
                    gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Últimos 7 dias
                }
            },
            include: {
                memberships: {
                    include: {
                        workspace: true
                    }
                },
                artist: true
            },
            orderBy: {
                createdAt: 'desc'
            },
            take: 10
        })

        console.log('\n📋 Usuários criados nos últimos 7 dias:')
        recentUsers.forEach(user => {
            console.log(`  - ${user.name} (${user.email})`)
            console.log(`    Role: ${user.role}`)
            console.log(`    Clerk ID: ${user.clerkId}`)
            console.log(`    Memberships: ${user.memberships.length}`)
            console.log(`    Artist: ${user.artist ? 'Sim' : 'Não'}`)
            console.log('')
        })
    } else {
        usersByName.forEach(user => {
            console.log(`\n👤 Usuário: ${user.name}`)
            console.log(`   Email: ${user.email}`)
            console.log(`   Role: ${user.role}`)
            console.log(`   Clerk ID: ${user.clerkId}`)
            console.log(`   Artist: ${user.artist ? 'Sim' : 'Não'}`)
            
            if (user.artist) {
                console.log(`   Artist ID: ${user.artist.id}`)
                console.log(`   Plan: ${user.artist.plan}`)
                console.log(`   Valid Until: ${user.artist.validUntil}`)
                console.log(`   Calendar Sync: ${user.artist.calendarSyncEnabled}`)
            }
            
            console.log(`   Memberships: ${user.memberships.length}`)
            
            if (user.memberships.length > 0) {
                user.memberships.forEach(membership => {
                    console.log(`     - Workspace: ${membership.workspace.name}`)
                    console.log(`       Role: ${membership.role}`)
                    console.log(`       Workspace ID: ${membership.workspaceId}`)
                })
            } else {
                console.log('   ⚠️ SEM MEMBERSHIPS - Este é o problema!')
            }
        })
    }

    // 2. Verificar convites recentes
    console.log('\n🎟️ Convites criados nos últimos 7 dias:')
    const recentInvites = await prisma.inviteCode.findMany({
        where: {
            createdAt: {
                gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
            }
        },
        include: {
            workspace: true
        },
        orderBy: {
            createdAt: 'desc'
        },
        take: 10
    })

    recentInvites.forEach(invite => {
        console.log(`  - Código: ${invite.code}`)
        console.log(`    Role: ${invite.role}`)
        console.log(`    Target Plan: ${invite.targetPlan}`)
        console.log(`    Workspace: ${invite.workspace.name}`)
        console.log(`    Current Uses: ${invite.currentUses}/${invite.maxUses}`)
        console.log(`    Expires At: ${invite.expiresAt}`)
        console.log('')
    })

    // 3. Verificar workspaces
    console.log('\n🏢 Workspaces disponíveis:')
    const workspaces = await prisma.workspace.findMany({
        include: {
            members: {
                include: {
                    user: true
                }
            }
        }
    })

    workspaces.forEach(workspace => {
        console.log(`  - ${workspace.name}`)
        console.log(`    Members: ${workspace.members.length}`)
        workspace.members.forEach(member => {
            console.log(`      - ${member.user.name} (${member.role})`)
        })
    })

    await prisma.$disconnect()
}

checkGabriella()
    .catch(console.error)
    .finally(() => process.exit(0))
