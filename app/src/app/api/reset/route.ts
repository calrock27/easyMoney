import { NextResponse } from 'next/server'
import { getPrisma } from '@/lib/prisma'

export const runtime = 'edge'

export async function GET(request: Request) {
    const authHeader = request.headers.get('Authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return new NextResponse('Unauthorized', { status: 401 })
    }

    try {
        const prisma = getPrisma();
        // Get all tables except system tables and migrations
        const tables = await prisma.$queryRaw<{ name: string }[]>`
      SELECT name FROM sqlite_schema 
      WHERE type='table' 
      AND name NOT LIKE 'sqlite_%' 
      AND name NOT LIKE '_prisma_migrations'
      AND name NOT LIKE '_cf_KV'
      AND name NOT LIKE 'SystemState';
    `

        // Delete all data from each table
        for (const table of tables) {
            if (table.name === 'SystemState') continue; // Don't wipe the state table
            await prisma.$executeRawUnsafe(`DELETE FROM "${table.name}";`)
            console.log(`Wiped table: ${table.name}`)
        }

        // Update last reset time
        const now = Date.now().toString()
        await prisma.systemState.upsert({
            where: { key: 'lastReset' },
            create: { key: 'lastReset', value: now },
            update: { value: now }
        })

        return NextResponse.json({ success: true, message: 'Database reset successfully' })
    } catch (error) {
        console.error('Reset failed:', error)
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
