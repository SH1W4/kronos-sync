import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url)
    const error = searchParams.get('error')

    console.error('🔴 AUTH ERROR CAUGHT:', error)

    return NextResponse.json({
        error: error || 'Unknown auth error',
        message: 'Verifique os logs do servidor',
        timestamp: new Date().toISOString()
    }, { status: 500 })
}
