import { db } from '@/lib/db';
import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';

export async function GET() {
    try {
        const result = await db.execute(sql`SELECT version()`);
        return NextResponse.json(result.rows[0]);
    } catch (error: unknown) {
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}
