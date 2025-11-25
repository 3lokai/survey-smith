'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import QuestionCard from '@/components/QuestionCard';
import CopyButton from '@/components/CopyButton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { formatMarkdown } from '@/lib/formatMarkdown';
import { formatGoogleForms } from '@/lib/formatGoogleForms';
import { SurveySection } from '@/lib/generatePrompt';
import { getSurveyFromLocalStorage } from '@/lib/localStorage';
import { useSession } from '@/lib/auth-client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

function ResultContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { data: session } = useSession();
    const [sections, setSections] = useState<SurveySection[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isLocalSurvey, setIsLocalSurvey] = useState(false);
    const [surveyId, setSurveyId] = useState<string | null>(null);

    useEffect(() => {
        async function loadSurvey() {
            try {
                // Require surveyRequestId from URL params
                const id = searchParams.get('id');
                
                if (!id) {
                    router.push('/generate');
                    return;
                }

                setSurveyId(id);

                // Check if it's a localStorage survey (starts with "local_")
                if (id.startsWith('local_')) {
                    const localSurvey = getSurveyFromLocalStorage(id);
                    if (localSurvey) {
                        setSections(localSurvey.sections);
                        setIsLocalSurvey(true);
                        setLoading(false);
                        return;
                    } else {
                        setError('Survey not found in local storage');
                        setLoading(false);
                        return;
                    }
                }

                // Fetch from database
                const res = await fetch(`/api/survey/${id}`);
                if (!res.ok) {
                    if (res.status === 404) {
                        setError('Survey not found');
                    } else if (res.status === 401) {
                        setError('Please sign in to view this survey');
                    } else {
                        setError('Failed to load survey');
                    }
                    setLoading(false);
                    return;
                }

                const data = await res.json();
                if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
                    setSections(data.sections);
                    setIsLocalSurvey(false);
                } else {
                    setError('Invalid survey data');
                }
            } catch (err) {
                console.error('Error loading survey:', err);
                setError('Failed to load survey questions');
            } finally {
                setLoading(false);
            }
        }

        loadSurvey();
    }, [router, searchParams]);

    if (loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse text-primary font-medium">Loading results...</div>
                </main>
                <Footer />
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="text-center">
                        <p className="text-destructive mb-4">{error}</p>
                        <Link href="/generate">
                            <Button>Create New Survey</Button>
                        </Link>
                    </div>
                </main>
                <Footer />
            </div>
        );
    }

    const markdown = formatMarkdown(sections);
    const googleForms = formatGoogleForms(sections);

    // Calculate global question index for numbering
    let globalQuestionIndex = 0;

    const handleSaveToAccount = async () => {
        if (!surveyId || !surveyId.startsWith('local_')) return;
        
        const localSurvey = getSurveyFromLocalStorage(surveyId);
        if (!localSurvey) return;

        try {
            const res = await fetch('/api/save-local-survey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    localSurveyId: surveyId,
                    inputData: localSurvey.inputData,
                    sections: localSurvey.sections,
                }),
            });

            if (!res.ok) {
                throw new Error('Failed to save survey');
            }

            const data = await res.json();
            // Redirect to the saved survey
            router.push(`/result?id=${data.surveyRequestId}`);
        } catch (err) {
            console.error('Error saving survey:', err);
            setError('Failed to save survey to account');
        }
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    {isLocalSurvey && !session?.user && (
                        <Card className="mb-6 border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle>Save to Your Account</CardTitle>
                                <CardDescription>
                                    This survey is stored locally. Sign in to save it to your account and access it from any device.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Link href="/auth/sign-in">
                                    <Button className="w-full">
                                        Sign In to Save
                                    </Button>
                                </Link>
                            </CardContent>
                        </Card>
                    )}

                    {isLocalSurvey && session?.user && (
                        <Card className="mb-6 border-primary/20 bg-primary/5">
                            <CardHeader>
                                <CardTitle>Save to Your Account</CardTitle>
                                <CardDescription>
                                    This survey is stored locally. Save it to your account to access it from any device.
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button 
                                    onClick={handleSaveToAccount}
                                    className="w-full"
                                >
                                    Save to Account
                                </Button>
                            </CardContent>
                        </Card>
                    )}

                    <div className="mb-8 flex items-center justify-end">
                    <div className="flex gap-3">
                        <CopyButton
                            text={markdown}
                            label="Copy Markdown"
                        />
                        <CopyButton
                            text={googleForms}
                            label="Copy Google Forms JSON"
                        />
                    </div>
                </div>

                <div className="text-center mb-10">
                    <h1 className="text-3xl font-bold text-foreground">Your Generated Survey</h1>
                    <p className="mt-2 text-muted-foreground">Review your unbiased, research-grade questions below.</p>
                </div>

                <div className="space-y-8">
                    {sections.map((section) => {
                        return (
                            <div key={section.section_id} className="space-y-6">
                                <div className="border-b border-border pb-2">
                                    <h2 className="text-2xl font-semibold text-foreground">{section.title}</h2>
                                </div>
                                {section.questions.map((question) => {
                                    const currentIndex = globalQuestionIndex++;
                                    return (
                                        <QuestionCard 
                                            key={question.id || currentIndex} 
                                            question={question} 
                                            index={currentIndex} 
                                        />
                                    );
                                })}
                            </div>
                        );
                    })}
                </div>
                </div>
            </main>
            <Footer />
        </div>
    );
}

export default function ResultPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-background flex flex-col">
                    <Header />
                    <main className="flex-1 flex items-center justify-center">
                        <div className="animate-pulse text-primary font-medium">Loading results...</div>
                    </main>
                    <Footer />
                </div>
            }
        >
            <ResultContent />
        </Suspense>
    );
}
