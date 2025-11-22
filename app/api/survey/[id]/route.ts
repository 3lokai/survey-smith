import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db, schema } from '@/lib/db';
import { auth } from '@/lib/auth';
import { SurveyQuestion, SurveySection, SurveyOutput } from '@/lib/generatePrompt';
import { eq, asc, and } from 'drizzle-orm';

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
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

        const { id } = await params;
        
        if (!id) {
            return NextResponse.json({ error: 'Survey ID is required' }, { status: 400 });
        }

        // Fetch survey request data (inputs) from database, filtered by userId
        const surveyRequest = await db
            .select({
                id: schema.surveyRequests.id,
                userId: schema.surveyRequests.userId,
                brandName: schema.surveyRequests.brandName,
                brandDescription: schema.surveyRequests.brandDescription,
                brandCategory: schema.surveyRequests.brandCategory,
                brandMarket: schema.surveyRequests.brandMarket,
                context: schema.surveyRequests.context,
                goals: schema.surveyRequests.goals,
                audience: schema.surveyRequests.audience,
                questionCount: schema.surveyRequests.questionCount,
                createdAt: schema.surveyRequests.createdAt,
            })
            .from(schema.surveyRequests)
            .where(
                and(
                    eq(schema.surveyRequests.id, id),
                    eq(schema.surveyRequests.userId, session.user.id)
                )
            )
            .limit(1);

        if (surveyRequest.length === 0) {
            // Return 404 to not reveal existence of other users' surveys
            return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
        }

        // Fetch questions from database using Drizzle ORM
        const questionsResult = await db
            .select({
                sectionId: schema.surveyQuestions.sectionId,
                questionId: schema.surveyQuestions.questionId,
                text: schema.surveyQuestions.text,
                type: schema.surveyQuestions.type,
                options: schema.surveyQuestions.options,
                config: schema.surveyQuestions.config,
                rationale: schema.surveyQuestions.rationale,
                orderIndex: schema.surveyQuestions.orderIndex,
            })
            .from(schema.surveyQuestions)
            .where(eq(schema.surveyQuestions.surveyRequestId, id))
            .orderBy(asc(schema.surveyQuestions.orderIndex));

        if (questionsResult.length === 0) {
            return NextResponse.json({ error: 'Survey not found' }, { status: 404 });
        }

        // Transform database rows to SurveyQuestion format
        // Drizzle automatically handles JSONB parsing, so options and config are already objects
        const questionsWithSections = questionsResult.map((row) => ({
            sectionId: row.sectionId,
            question: {
                id: row.questionId,
                text: row.text,
                type: row.type as SurveyQuestion['type'],
                options: row.options as string[] | undefined,
                config: row.config as SurveyQuestion['config'],
                rationale: row.rationale,
            } as SurveyQuestion,
        }));

        // Group questions by section
        const sectionsMap = new Map<string, { sectionId: string; questions: SurveyQuestion[] }>();
        
        // Section title mapping
        const sectionTitleMap: Record<string, string> = {
            'screeners': 'Screeners',
            'core': 'Core Questions',
            'pricing_or_attitudes': 'Pricing / Attitudes',
            'demographics': 'Demographics',
            'followup': 'Follow-Up',
        };

        questionsWithSections.forEach(({ sectionId, question }) => {
            if (!sectionsMap.has(sectionId)) {
                sectionsMap.set(sectionId, {
                    sectionId,
                    questions: [],
                });
            }
            sectionsMap.get(sectionId)!.questions.push(question);
        });

        // Convert to sections array
        const sections: SurveySection[] = Array.from(sectionsMap.values()).map(({ sectionId, questions }) => ({
            section_id: sectionId,
            title: sectionTitleMap[sectionId] || sectionId.charAt(0).toUpperCase() + sectionId.slice(1),
            questions,
        }));

        return NextResponse.json({ 
            sections, 
            surveyRequestId: id,
            surveyRequest: surveyRequest[0]
        });
    } catch (error: unknown) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

