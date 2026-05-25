// Script para criar admin de teste
// Rodar com: node scripts/seed-admin.mjs

import { PrismaClient } from '@prisma/client'
import { createHash } from 'crypto'

const prisma = new PrismaClient()

// Credenciais do admin de teste
const ADMIN_EMAIL = 'admin@kronos.test'
const ADMIN_PASSWORD = 'Admin@Kronos123'
const ADMIN_NAME = 'Admin Teste'

// Hash simples com SHA256 (sem bcrypt para simplicidade)
// Em produção usa bcrypt, mas para teste local funciona
function hashPassword(password) {
    return createHash('sha256').update(password + '_kronos_salt').digest('hex')
}

async function main() {
    console.log('🔧 Criando admin de teste...\n')

    // Verificar se já existe
    const existing = await prisma.user.findUnique({
        where: { email: ADMIN_EMAIL }
    })

    if (existing) {
        console.log(`⚠️  Usuário já existe! Email: ${ADMIN_EMAIL}`)
        console.log('   Atualizando para garantir role ADMIN...')
        await prisma.user.update({
            where: { email: ADMIN_EMAIL },
            data: {
                role: 'ADMIN',
                name: ADMIN_NAME,
                password: hashPassword(ADMIN_PASSWORD)
            }
        })
    } else {
        await prisma.user.create({
            data: {
                email: ADMIN_EMAIL,
                name: ADMIN_NAME,
                role: 'ADMIN',
                password: hashPassword(ADMIN_PASSWORD)
            }
        })
    }

    console.log('✅ Admin de teste criado com sucesso!\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📧 Email:  ${ADMIN_EMAIL}`)
    console.log(`🔑 Senha:  ${ADMIN_PASSWORD}`)
    console.log(`👑 Role:   ADMIN`)
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n⚠️  Use apenas em ambiente de TESTE!')
}

main().catch(console.error).finally(() => prisma.$disconnect())
