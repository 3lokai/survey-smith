'use client';

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import QuestionCard from '@/components/QuestionCard';
import CopyButton from '@/components/CopyButton';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { formatMarkdown } from '@/lib/formatMarkdown';
import { formatGoogleForms } from '@/lib/formatGoogleForms';
import { SurveySection } from '@/lib/generatePrompt';
import { useSession, signIn } from '@/lib/auth-client';
import { getSurveysFromLocalStorage, getSurveyFromLocalStorage, deleteSurveyFromLocalStorage } from '@/lib/localStorage';

interface Survey {
    id: string;
    brandName: string;
    isLocal?: boolean;
}

interface SurveyRequest {
    id: string;
    brandName: string;
    brandDescription: string | null;
    brandCategory: string | null;
    brandMarket: string | null;
    context: string;
    goals: string;
    audience: string;
    questionCount: number;
    createdAt: Date | string;
}

export default function ViewPage() {
    const router = useRouter();
    const { data: session, isPending: sessionLoading } = useSession();
    const [surveys, setSurveys] = useState<Survey[]>([]);
    const [selectedSurveyId, setSelectedSurveyId] = useState<string>('');
    const [surveyRequest, setSurveyRequest] = useState<SurveyRequest | null>(null);
    const [sections, setSections] = useState<SurveySection[]>([]);
    const [loading, setLoading] = useState(true);
    const [loadingSurvey, setLoadingSurvey] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const isInitialMount = useRef(true);

    // Function to load survey details
    const loadSurveyDetails = async (surveyId: string) => {
        setLoadingSurvey(true);
        setError(null);
        try {
            // Check if it's a localStorage survey
            if (surveyId.startsWith('local_')) {
                const localSurvey = getSurveyFromLocalStorage(surveyId);
                if (localSurvey) {
                    setSections(localSurvey.sections);
                    setSurveyRequest({ ...localSurvey.surveyRequest, id: localSurvey.id });
                    setLoadingSurvey(false);
                    return;
                } else {
                    setError('Survey not found in local storage');
                    setLoadingSurvey(false);
                    return;
                }
            }

            // Fetch from database
            const res = await fetch(`/api/survey/${surveyId}`);
            if (!res.ok) {
                if (res.status === 401) {
                    setError('Please sign in to view surveys');
                    return;
                } else if (res.status === 404) {
                    setError('Survey not found');
                } else {
                    setError('Failed to load survey');
                }
                setLoadingSurvey(false);
                return;
            }

            const data = await res.json();
            if (data.sections && Array.isArray(data.sections) && data.sections.length > 0) {
                setSections(data.sections);
            } else {
                setError('Invalid survey data');
            }
            if (data.surveyRequest) {
                setSurveyRequest(data.surveyRequest);
            }
        } catch (err) {
            console.error('Error loading survey:', err);
            setError('Failed to load survey questions');
        } finally {
            setLoadingSurvey(false);
        }
    };

    // Fetch list of surveys on mount and auto-select first one
    useEffect(() => {
        if (sessionLoading) {
            return;
        }

        async function loadSurveys() {
            try {
                // If not authenticated, load from localStorage
                if (!session?.user) {
                    const localSurveys = getSurveysFromLocalStorage();
                    const formattedSurveys = localSurveys.map(s => ({
                        id: s.id,
                        brandName: s.surveyRequest.brandName,
                        isLocal: true,
                    }));
                    setSurveys(formattedSurveys);
                    
                    if (formattedSurveys.length > 0) {
                        const firstSurveyId = formattedSurveys[0].id;
                        setSelectedSurveyId(firstSurveyId);
                        // Load from localStorage
                        const localSurvey = getSurveyFromLocalStorage(firstSurveyId);
                        if (localSurvey) {
                            setSections(localSurvey.sections);
                            setSurveyRequest({ ...localSurvey.surveyRequest, id: localSurvey.id });
                        }
                    }
                    setLoading(false);
                    isInitialMount.current = false;
                    return;
                }

                // If authenticated, load from database
                const res = await fetch('/api/surveys');
                if (!res.ok) {
                    if (res.status === 401) {
                        setError('Please sign in to view surveys');
                        setLoading(false);
                        isInitialMount.current = false;
                        return;
                    }
                    throw new Error('Failed to load surveys');
                }
                const data = await res.json();
                if (data.surveys && Array.isArray(data.surveys)) {
                    setSurveys(data.surveys.map((s: Survey) => ({ ...s, isLocal: false })));
                    // Auto-select and load first survey if available
                    if (data.surveys.length > 0) {
                        const firstSurveyId = data.surveys[0].id;
                        setSelectedSurveyId(firstSurveyId);
                        // Immediately load the first survey
                        await loadSurveyDetails(firstSurveyId);
                    }
                }
            } catch (err) {
                console.error('Error loading surveys:', err);
                setError('Failed to load surveys');
            } finally {
                setLoading(false);
                isInitialMount.current = false;
            }
        }

        loadSurveys();
    }, [session, sessionLoading]);

    // Fetch selected survey details when selection changes (but skip initial mount)
    useEffect(() => {
        if (!selectedSurveyId || isInitialMount.current) return;

        loadSurveyDetails(selectedSurveyId);
    }, [selectedSurveyId]);

    const formatDate = (date: Date | string) => {
        const d = typeof date === 'string' ? new Date(date) : date;
        return d.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    // Show loading while checking session
    if (sessionLoading || loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center">
                    <div className="animate-pulse text-primary font-medium">Loading...</div>
                </main>
                <Footer />
            </div>
        );
    }

    // Show sign-in prompt if not authenticated and no local surveys
    if (!session?.user && surveys.length === 0 && !loading) {
        return (
            <div className="min-h-screen bg-background flex flex-col">
                <Header />
                <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
                    <Card className="max-w-md w-full">
                        <CardHeader>
                            <CardTitle>Sign In to View Saved Surveys</CardTitle>
                            <CardDescription>
                                Sign in to save and access your surveys from any device. You can also create surveys without signing in.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <Link href="/auth/sign-in">
                                <Button className="w-full">
                                    Sign In
                                </Button>
                            </Link>
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <span className="w-full border-t" />
                                </div>
                                <div className="relative flex justify-center text-xs uppercase">
                                    <span className="bg-background px-2 text-muted-foreground">
                                        Or
                                    </span>
                                </div>
                            </div>
                            <Link href="/generate" className="block">
                                <Button variant="outline" className="w-full">
                                    Create New Survey
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>
                </main>
                <Footer />
            </div>
        );
    }

    // Show error state if there's an error and no surveys
    if (error && surveys.length === 0 && !loading) {
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

    const markdown = sections.length > 0 ? formatMarkdown(sections) : '';
    const googleForms = sections.length > 0 ? formatGoogleForms(sections) : '';

    // Calculate global question index for numbering
    let globalQuestionIndex = 0;

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />
            <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">

                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-foreground mb-2">View Survey</h1>
                    <p className="text-muted-foreground">Select a survey to view inputs and outputs</p>
                </div>

                {surveys.length === 0 ? (
                    <Card className="mb-6">
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground mb-4">
                                {session?.user 
                                    ? "You don't have any surveys yet." 
                                    : "You don't have any local surveys yet."}
                            </p>
                            <Link href="/generate">
                                <Button>Create Your First Survey</Button>
                            </Link>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="mb-6 space-y-4">
                        {!session?.user && (
                            <Card className="border-primary/20 bg-primary/5">
                                <CardContent className="p-4">
                                    <p className="text-sm text-muted-foreground mb-2">
                                        These surveys are stored locally. Sign in to save them to your account.
                                    </p>
                                    <Link href="/auth/sign-in">
                                        <Button 
                                            size="sm"
                                            variant="outline"
                                        >
                                            Sign in to Save
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        )}
                        <div>
                            <Label htmlFor="survey-select" className="mb-2 block">
                                Select Survey {!session?.user && <span className="text-xs text-muted-foreground">(Local)</span>}
                            </Label>
                            <Select value={selectedSurveyId} onValueChange={setSelectedSurveyId}>
                                <SelectTrigger id="survey-select" className="w-full">
                                    <SelectValue placeholder="Select a survey" />
                                </SelectTrigger>
                                <SelectContent>
                                    {surveys.map((survey) => (
                                        <SelectItem key={survey.id} value={survey.id}>
                                            {survey.brandName} {survey.isLocal && <span className="text-xs text-muted-foreground">(Local)</span>}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                )}

                {error && selectedSurveyId && (
                    <div className="mb-6 p-4 bg-destructive/10 border border-destructive/20 rounded-md">
                        <p className="text-destructive text-sm">{error}</p>
                    </div>
                )}

                {selectedSurveyId && selectedSurveyId.startsWith('local_') && session?.user && (
                    <Card className="mb-6 border-primary/20 bg-primary/5">
                        <CardHeader>
                            <CardTitle>Save to Your Account</CardTitle>
                            <CardDescription>
                                This survey is stored locally. Save it to your account to access it from any device.
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button 
                                onClick={async () => {
                                    const localSurvey = getSurveyFromLocalStorage(selectedSurveyId);
                                    if (!localSurvey) return;

                                    try {
                                        const res = await fetch('/api/save-local-survey', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({
                                                localSurveyId: selectedSurveyId,
                                                inputData: localSurvey.inputData,
                                                sections: localSurvey.sections,
                                            }),
                                        });

                                        if (!res.ok) {
                                            throw new Error('Failed to save survey');
                                        }

                                        const data = await res.json();
                                        // Remove from localStorage and reload
                                        deleteSurveyFromLocalStorage(selectedSurveyId);
                                        // Reload surveys
                                        window.location.reload();
                                    } catch (err) {
                                        console.error('Error saving survey:', err);
                                        setError('Failed to save survey to account');
                                    }
                                }}
                                className="w-full"
                            >
                                Save to Account
                            </Button>
                        </CardContent>
                    </Card>
                )}

                {loadingSurvey && selectedSurveyId ? (
                    <div className="flex items-center justify-center py-12">
                        <div className="animate-pulse text-primary font-medium">Loading survey...</div>
                    </div>
                ) : selectedSurveyId && surveyRequest && sections.length > 0 ? (
                    <Tabs defaultValue="inputs" className="w-full">
                        <TabsList className="grid w-full grid-cols-2">
                            <TabsTrigger value="inputs">Input Values</TabsTrigger>
                            <TabsTrigger value="questionnaire">Questionnaire</TabsTrigger>
                        </TabsList>

                        <TabsContent value="inputs" className="mt-6 space-y-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Brand Information</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Brand Name</Label>
                                        <p className="mt-1 text-foreground">{surveyRequest.brandName}</p>
                                    </div>
                                    {surveyRequest.brandDescription && (
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Brand Description</Label>
                                            <p className="mt-1 text-foreground">{surveyRequest.brandDescription}</p>
                                        </div>
                                    )}
                                    {surveyRequest.brandCategory && (
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Brand Category</Label>
                                            <p className="mt-1 text-foreground">{surveyRequest.brandCategory}</p>
                                        </div>
                                    )}
                                    {surveyRequest.brandMarket && (
                                        <div>
                                            <Label className="text-sm font-medium text-muted-foreground">Brand Market</Label>
                                            <p className="mt-1 text-foreground">{surveyRequest.brandMarket}</p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Survey Requirements</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Survey Context</Label>
                                        <p className="mt-1 text-foreground">{surveyRequest.context}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Survey Goals</Label>
                                        <p className="mt-1 text-foreground">{surveyRequest.goals}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Target Audience</Label>
                                        <p className="mt-1 text-foreground">{surveyRequest.audience}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Number of Questions</Label>
                                        <p className="mt-1 text-foreground">{surveyRequest.questionCount}</p>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card>
                                <CardHeader>
                                    <CardTitle>Metadata</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Created At</Label>
                                        <p className="mt-1 text-foreground">{formatDate(surveyRequest.createdAt)}</p>
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-muted-foreground">Survey ID</Label>
                                        <p className="mt-1 text-sm font-mono text-muted-foreground break-all">{surveyRequest.id}</p>
                                    </div>
                                </CardContent>
                            </Card>
                        </TabsContent>

                        <TabsContent value="questionnaire" className="mt-6">
                            <div className="mb-6 flex justify-end gap-3">
                                <CopyButton
                                    text={markdown}
                                    label="Copy Markdown"
                                />
                                <CopyButton
                                    text={googleForms}
                                    label="Copy Google Forms JSON"
                                />
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
                        </TabsContent>
                    </Tabs>
                ) : selectedSurveyId && !loadingSurvey ? (
                    <div className="text-center py-12">
                        <p className="text-muted-foreground">No survey data available</p>
                    </div>
                ) : null}
                </div>
            </main>
            <Footer />
        </div>
    );
}

