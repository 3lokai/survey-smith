import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { db, schema } from '@/lib/db';
import { auth } from '@/lib/auth';
import { generatePrompt, SurveyInput, SurveyOutput, SurveySection } from '@/lib/generatePrompt';

export const maxDuration = 60;

// Guard GOOGLE_API_KEY environment variable
if (!process.env.GOOGLE_API_KEY) {
    throw new Error('GOOGLE_API_KEY is not defined in environment variables');
}

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

export async function POST(request: Request) {
    try {
        // Check authentication (optional - allow unauthenticated users)
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        const body: SurveyInput = await request.json();
        const { 
            brandName, 
            brandDescription, 
            brandCategory, 
            brandMarket,
            surveyContext, 
            surveyGoals, 
            targetAudience, 
            numberOfQuestions 
        } = body;

        if (!brandName || !brandDescription || !brandCategory || !brandMarket || 
            !surveyContext || !surveyGoals || !targetAudience || !numberOfQuestions) {
            return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
        }

        // 1. Call Google Gemini
        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const prompt = generatePrompt(body);

        const result = await model.generateContent({
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json' }
        });

        const response = result.response;
        const text = response.text();

        if (!text) {
            throw new Error('No content received from Gemini');
        }

        // Parse and validate JSON response with proper error handling
        let parsedData: SurveyOutput;
        try {
            parsedData = JSON.parse(text) as SurveyOutput;
        } catch (parseError) {
            console.error('JSON parse error:', parseError);
            throw new Error('Invalid JSON response from AI model. Please try again.');
        }
        
        // Validate sections structure
        if (!parsedData || typeof parsedData !== 'object') {
            throw new Error('Invalid response format: expected object');
        }
        
        if (!parsedData.sections || !Array.isArray(parsedData.sections)) {
            throw new Error('Invalid response format: expected sections array');
        }

        // Validate each section has required fields
        for (const section of parsedData.sections) {
            if (!section.section_id || !section.title || !Array.isArray(section.questions)) {
                throw new Error('Invalid response format: sections must have section_id, title, and questions array');
            }
        }

        const sections: SurveySection[] = parsedData.sections;

        // 2. Save to Neon DB using Drizzle ORM (only if authenticated)
        let surveyRequestId: string | null = null;
        if (session?.user) {
            try {
                // Insert survey request and get the ID
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
                
                surveyRequestId = requestResult?.id || null;

                // Save all questions to the database with section information
                if (surveyRequestId) {
                    const requestId = surveyRequestId; // Type narrowing for TypeScript
                    let globalOrderIndex = 0;
                    const questionsToInsert = sections.flatMap((section) =>
                        section.questions.map((q) => ({
                            surveyRequestId: requestId,
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
                }
            } catch (dbError) {
                console.error('Neon DB error:', dbError);
                // Don't fail request if DB fails - log and continue
                // This allows the survey generation to succeed even if logging fails
            }
        }

        return NextResponse.json({ 
            sections,
            surveyRequestId, // Include ID if saved to DB (null if not authenticated)
            requiresAuth: !session?.user, // Flag to indicate if auth is needed to save
            inputData: {
                brandName,
                brandDescription,
                brandCategory,
                brandMarket,
                surveyContext,
                surveyGoals,
                targetAudience,
                numberOfQuestions,
            },
        });
    } catch (error: unknown) {
        console.error('API Error:', error);
        return NextResponse.json(
            { error: (error as Error).message || 'Internal Server Error' },
            { status: 500 }
        );
    }
}
