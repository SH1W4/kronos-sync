import { PrismaClient } from '@prisma/client'
import fs from 'fs'

const prisma = new PrismaClient()

async function main() {
    const logFile = 'db_inspection.json'
    console.log('🔍 Inspecionando colunas e salvando em:', logFile)
    try {
        const columns = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'artists';
    `)
        fs.writeFileSync(logFile, JSON.stringify(columns, null, 2))
        console.log('✅ Inspeção concluída.')
    } catch (error) {
        console.error('❌ Erro na inspeção:', error)
        fs.writeFileSync(logFile, JSON.stringify({ error: String(error) }, null, 2))
    } finally {
        await prisma.$disconnect()
    }
}

main()
