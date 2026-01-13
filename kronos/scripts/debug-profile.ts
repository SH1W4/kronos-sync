
import { PrismaClient } from '@prisma/client'
import * as dotenv from 'dotenv'
import path from 'path'

dotenv.config({ path: path.resolve(__dirname, '../.env.local') })

const prisma = new PrismaClient()

async function main() {
    const emails = ['admin@kronos.com', 'galeria.kronos@gmail.com']
    
    for (const email of emails) {
        console.log(`\n--- Checking: ${email} ---`)
        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                artist: {
                    include: {
                        ArtistGamification: true
                    }
                }
            }
        })

        if (!user) {
            console.log('User not found.')
            continue
        }

        console.log(`User found: ${user.name} (Role: ${user.role})`)
        if (user.artist) {
            console.log(`Artist record found: ${user.artist.id}`)
            if (user.artist.ArtistGamification) {
                console.log(`Gamification record found: ${user.artist.ArtistGamification.id}`)
            } else {
                console.log('Gamification record MISSING.')
            }
        } else {
            console.log('Artist record MISSING.')
        }
    }
}

main()
    .catch(e => console.error(e))
    .finally(async () => await prisma.$disconnect())
