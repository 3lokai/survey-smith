import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db, schema } from '@/lib/db';
import { auth } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';

export async function GET() {
    try {
        // Require authentication
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please sign in to view surveys.' },
                { status: 401 }
            );
        }

        // Fetch only surveys belonging to the authenticated user
        const surveys = await db
            .select({
                id: schema.surveyRequests.id,
                brandName: schema.surveyRequests.brandName,
            })
            .from(schema.surveyRequests)
            .where(eq(schema.surveyRequests.userId, session.user.id))
            .orderBy(desc(schema.surveyRequests.createdAt));

        return NextResponse.json({ surveys });
    } catch (error: unknown) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

