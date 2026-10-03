import { PrismaClient } from '@prisma/client'
import { createClerkClient } from '@clerk/backend'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env') })

const prisma = new PrismaClient()
const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY })

const WORKSPACE_ID = 'cmjzxpj4n00024uoj9w0jfsob'

const ARTISTS_TO_PROVISION = [
    {
        email: 'ssantos.suiane@gmail.com',
        clerkId: 'user_3IVTca63ZAjbhNJASjqnn9BORB0',
        name: 'Suiane Santos',
        inviteCode: 'SUIANE'
    },
    {
        email: 'helenaklipel01@gmail.com',
        clerkId: 'user_3GxCf0EuuJjqq40b39C437rdzEH',
        name: 'Helena Klipel',
        inviteCode: 'HELENA'
    },
    {
        email: 'victoriaandradevcl@gmail.com',
        clerkId: 'user_3GujipVLlzbe0Wz0nBi0WfQhl5s',
        name: 'Victoria Andrade',
        inviteCode: 'VICTORIA'
    }
]

async function main() {
    console.log('=== VINCULANDO ARTISTAS PENDENTES AO KRONOS HQ ===\n')

    const workspace = await prisma.workspace.findUnique({
        where: { id: WORKSPACE_ID }
    })

    if (!workspace) {
        throw new Error(`Workspace ${WORKSPACE_ID} não encontrado!`)
    }

    console.log(`Workspace encontrado: ${workspace.name} (${workspace.id})`)

    for (const a of ARTISTS_TO_PROVISION) {
        console.log(`\nProcessando: ${a.name} (${a.email})...`)

        // 1. Criar ou Atualizar Usuário no Prisma
        const user = await prisma.user.upsert({
            where: { email: a.email },
            update: {
                clerkId: a.clerkId,
                name: a.name,
                role: 'ARTIST'
            },
            create: {
                email: a.email,
                clerkId: a.clerkId,
                name: a.name,
                role: 'ARTIST'
            }
        })

        console.log(`  -> User Prisma ID: ${user.id} (Role: ${user.role})`)

        // 2. Criar ou Atualizar Registro de Artist
        const artist = await prisma.artist.upsert({
            where: { userId: user.id },
            update: {
                workspaceId: workspace.id,
                isActive: true,
                plan: 'RESIDENT'
            },
            create: {
                userId: user.id,
                workspaceId: workspace.id,
                isActive: true,
                plan: 'RESIDENT'
            }
        })

        console.log(`  -> Artist ID: ${artist.id} (Active: ${artist.isActive})`)

        // 3. Vincular Membership
        const membership = await prisma.workspaceMember.upsert({
            where: {
                workspaceId_userId: {
                    userId: user.id,
                    workspaceId: workspace.id
                }
            },
            update: {
                role: 'ARTIST'
            },
            create: {
                userId: user.id,
                workspaceId: workspace.id,
                role: 'ARTIST'
            }
        })

        console.log(`  -> Membership ID: ${membership.id}`)

        // 4. Marcar InviteCode como utilizado se existir
        if (a.inviteCode) {
            await prisma.inviteCode.updateMany({
                where: { code: a.inviteCode },
                data: { currentUses: 1 }
            })
            console.log(`  -> InviteCode ${a.inviteCode} marcado como utilizado`)
        }

        // 5. Atualizar Clerk publicMetadata
        const newMetadata = {
            role: 'ARTIST',
            workspace: {
                id: workspace.id,
                name: workspace.name,
                primaryColor: workspace.primaryColor,
                logoUrl: workspace.logoUrl || '',
                capacity: workspace.capacity,
                googleCalendarId: workspace.googleCalendarId
            }
        }

        await clerk.users.updateUserMetadata(a.clerkId, {
            publicMetadata: newMetadata
        })

        console.log(`  -> Clerk publicMetadata atualizado com sucesso: role=ARTIST, workspace=${workspace.name}`)
    }

    console.log('\n=== TODOS OS ARTISTAS FORAM VINCULADOS COM SUCESSO! ===')
}

main().catch(console.error).finally(() => prisma.$disconnect())
