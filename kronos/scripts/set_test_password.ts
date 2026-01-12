import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
    const email = 'neo.sh1w4@gmail.com'
    const hashedPassword = await bcrypt.hash('password123', 10)

    await prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
    })

    console.log('✅ Password set for neo.sh1w4@gmail.com: password123')
}

main()
    .catch(e => console.error(e))
    .finally(() => prisma.$disconnect())
