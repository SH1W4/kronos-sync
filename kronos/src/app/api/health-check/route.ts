import { NextResponse } from 'next/server'

export async function GET() {
    return NextResponse.json({
        status: 'online',
        timestamp: new Date().toISOString(),
        service: 'kronos-sync-core'
    }, { status: 200 })
}
