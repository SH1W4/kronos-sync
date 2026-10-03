/**
 * sync-clerk-metadata.ts
 * Sincroniza o publicMetadata do Clerk com o estado real do banco.
 * Execute sempre que um artista não conseguir logar corretamente.
 */

import { PrismaClient } from '@prisma/client'
import { createClerkClient } from '@clerk/backend'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

async function main() {
    console.log('🔄 SINCRONIZANDO CLERK METADATA COM BANCO DE DADOS...\n')

    // Buscar todos os usuários com clerkId que são ARTIST ou ADMIN
    const users = await prisma.user.findMany({
        where: {
            clerkId: { not: null },
            role: { in: ['ARTIST', 'ADMIN'] }
        },
        include: {
            memberships: { include: { workspace: true } },
            artist: true
        }
    })

    let fixed = 0
    let alreadyOk = 0
    let errors = 0

    for (const user of users) {
        try {
            const membership = user.memberships[0]
            const workspace = membership?.workspace
            const resolvedRole = membership?.role || user.role

            const newMetadata: any = {
                role: resolvedRole
            }

            if (workspace) {
                newMetadata.workspace = {
                    id: workspace.id,
                    name: workspace.name,
                    primaryColor: workspace.primaryColor,
                    logoUrl: workspace.logoUrl || '',
                    capacity: workspace.capacity,
                    googleCalendarId: workspace.googleCalendarId
                }
            }

            // Buscar metadata atual do Clerk
            const clerkUser = await clerk.users.getUser(user.clerkId!)
            const currentMetadata = clerkUser.publicMetadata as any
            const currentRole = currentMetadata?.role
            const currentWorkspace = currentMetadata?.workspace

            const needsUpdate =
                currentRole !== resolvedRole ||
                JSON.stringify(currentWorkspace) !== JSON.stringify(newMetadata.workspace)

            if (needsUpdate) {
                await clerk.users.updateUserMetadata(user.clerkId!, {
                    publicMetadata: newMetadata
                })
                console.log(`✅ CORRIGIDO: ${user.email}`)
                console.log(`   Role: ${currentRole || 'VAZIO'} → ${resolvedRole}`)
                console.log(`   Workspace: ${currentWorkspace?.name || 'VAZIO'} → ${workspace?.name || 'nenhum'}\n`)
                fixed++
            } else {
                console.log(`🟢 OK: ${user.email} (${resolvedRole} @ ${workspace?.name || 'sem workspace'})`)
                alreadyOk++
            }
        } catch (err: any) {
            console.error(`❌ ERRO para ${user.email}: ${err.message}`)
            errors++
        }
    }

    console.log('\n=== RESULTADO ===')
    console.log(`✅ Corrigidos: ${fixed}`)
    console.log(`🟢 Já OK: ${alreadyOk}`)
    console.log(`❌ Erros: ${errors}`)

    if (fixed > 0) {
        console.log('\n⚠️  Os artistas corrigidos precisam fazer logout e login novamente para aplicar as mudanças.')
    }
}

main().catch(console.error).finally(() => prisma.$disconnect())
