
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function main() {
    const codes = await prisma.inviteCode.findMany({
        where: {
            used: false,
            expiresAt: { gt: new Date() }
        },
        take: 5
    })

    if (codes.length === 0) {
        console.log('Nenhum código disponível. Criando um código mestre de teste...')
        const newCode = await prisma.inviteCode.create({
            data: {
                code: 'TEST-Y2K2-HUD',
                role: 'ARTIST',
                expiresAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 7), // 7 days
                workspaceId: (await prisma.workspace.findFirst())?.id || '',
            }
        })
        console.log(`CÓDIGO GERADO: ${newCode.code}`)
    } else {
        console.log('CÓDIGOS DISPONÍVEIS:')
        codes.forEach(c => console.log(`- ${c.code} (${c.role})`))
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
