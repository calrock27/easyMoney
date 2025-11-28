import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'
import { getRequestContext } from '@cloudflare/next-on-pages'

export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export async function GET() {
    try {
        const prisma = getPrisma()

        const state = await prisma.systemState.findUnique({
            where: { key: 'lastReset' }
        })

        return NextResponse.json({
            lastReset: state?.value || null,
        })
    } catch (error) {
        console.error('Failed to fetch system status:', error)
        return NextResponse.json({ error: String(error), stack: (error as Error).stack }, { status: 500 })
    }
}
