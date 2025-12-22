
import * as dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

const envPath = path.resolve(__dirname, '../.env.local')
if (fs.existsSync(envPath)) {
    const envConfig = dotenv.parse(fs.readFileSync(envPath))
    console.log(`REAL_KEY_VALUE: ${envConfig.KRONOS_TEAM_KEY || 'NOT_FOUND'}`)
} else {
    console.log('.env.local not found')
}
