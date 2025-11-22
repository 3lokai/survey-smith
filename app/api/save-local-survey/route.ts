import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { db, schema } from '@/lib/db';
import { auth } from '@/lib/auth';
import { SurveyInput, SurveyOutput, SurveySection } from '@/lib/generatePrompt';

export async function POST(request: Request) {
    try {
        // Require authentication
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return NextResponse.json(
                { error: 'Unauthorized. Please sign in to save surveys.' },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { localSurveyId, inputData, sections } = body as {
            localSurveyId: string;
            inputData: SurveyInput;
            sections: SurveySection[];
        };

        if (!inputData || !sections || !Array.isArray(sections)) {
            return NextResponse.json(
                { error: 'Invalid survey data' },
                { status: 400 }
            );
        }

        const {
            brandName,
            brandDescription,
            brandCategory,
            brandMarket,
            surveyContext,
            surveyGoals,
            targetAudience,
            numberOfQuestions,
        } = inputData;

        // Save to database
        const [requestResult] = await db
            .insert(schema.surveyRequests)
            .values({
                userId: session.user.id,
                brandName,
                brandDescription,
                brandCategory,
                brandMarket,
                context: surveyContext,
                goals: surveyGoals,
                audience: targetAudience,
                questionCount: numberOfQuestions,
            })
            .returning({ id: schema.surveyRequests.id });

        const surveyRequestId = requestResult?.id;

        if (!surveyRequestId) {
            return NextResponse.json(
                { error: 'Failed to save survey' },
                { status: 500 }
            );
        }

        // Save all questions to the database
        let globalOrderIndex = 0;
        const questionsToInsert = sections.flatMap((section) =>
            section.questions.map((q) => ({
                surveyRequestId,
                sectionId: section.section_id,
                questionId: q.id,
                text: q.text,
                type: q.type,
                options: q.options || null,
                config: q.config || null,
                rationale: q.rationale,
                orderIndex: globalOrderIndex++,
            }))
        );

        if (questionsToInsert.length > 0) {
            await db.insert(schema.surveyQuestions).values(questionsToInsert);
        }

        return NextResponse.json({
            surveyRequestId,
            message: 'Survey saved successfully',
        });
    } catch (error: unknown) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}

