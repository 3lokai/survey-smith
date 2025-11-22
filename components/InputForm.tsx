'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { useSession } from '@/lib/auth-client';
import { saveSurveyToLocalStorage } from '@/lib/localStorage';

export interface SurveyInput {
    brandName: string;
    brandDescription: string;
    brandCategory: string;
    brandMarket: string;
    surveyContext: string;
    surveyGoals: string;
    targetAudience: string;
    numberOfQuestions: number;
    includeDemographics?: boolean;
    demographicsDepth?: 'light' | 'standard' | 'extended';
    includeFollowup?: boolean;
    captureContact?: boolean;
    b2bOrB2c?: 'b2b' | 'b2c';
}

export default function InputForm() {
    const router = useRouter();
    const { data: session } = useSession();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [numberOfQuestions, setNumberOfQuestions] = useState('10');
    const [includeDemographics, setIncludeDemographics] = useState(false);
    const [demographicsDepth, setDemographicsDepth] = useState<'light' | 'standard' | 'extended'>('standard');
    const [includeFollowup, setIncludeFollowup] = useState(false);
    const [captureContact, setCaptureContact] = useState(false);
    const [b2bOrB2c, setB2bOrB2c] = useState<'b2b' | 'b2c' | ''>('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const data: SurveyInput = {
            brandName: formData.get('brandName') as string,
            brandDescription: formData.get('brandDescription') as string,
            brandCategory: formData.get('brandCategory') as string,
            brandMarket: formData.get('brandMarket') as string,
            surveyContext: formData.get('surveyContext') as string,
            surveyGoals: formData.get('surveyGoals') as string,
            targetAudience: formData.get('targetAudience') as string,
            numberOfQuestions: Number(numberOfQuestions),
            includeDemographics: includeDemographics || undefined,
            demographicsDepth: includeDemographics ? demographicsDepth : undefined,
            includeFollowup: includeFollowup || undefined,
            captureContact: captureContact || undefined,
            b2bOrB2c: b2bOrB2c || undefined,
        };

        try {
            const res = await fetch('/api/generate-survey', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (!res.ok) {
                const err = await res.json();
                throw new Error(err.error || 'Failed to generate survey');
            }

            const result = await res.json();
            
            // If authenticated, navigate to result page with surveyRequestId
            if (session?.user && result.surveyRequestId) {
                router.push(`/result?id=${result.surveyRequestId}`);
            } else {
                // If not authenticated, save to localStorage and navigate with local ID
                const localId = saveSurveyToLocalStorage(
                    {
                        brandName: data.brandName,
                        brandDescription: data.brandDescription,
                        brandCategory: data.brandCategory,
                        brandMarket: data.brandMarket,
                        context: data.surveyContext,
                        goals: data.surveyGoals,
                        audience: data.targetAudience,
                        questionCount: data.numberOfQuestions,
                        createdAt: new Date().toISOString(),
                    },
                    result.sections,
                    data
                );
                router.push(`/result?id=${localId}`);
            }
        } catch (err: unknown) {
            setError((err as Error).message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Card className="max-w-2xl mx-auto">
            <CardContent className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                    {error && (
                        <Alert variant="destructive">
                            <AlertDescription>{error}</AlertDescription>
                        </Alert>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="brandName">Brand Name</Label>
                        <Input
                            id="brandName"
                            name="brandName"
                            required
                            placeholder="e.g., Acme Corp"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="brandDescription">Brand Description</Label>
                        <Textarea
                            id="brandDescription"
                            name="brandDescription"
                            required
                            rows={3}
                            placeholder="e.g., Premium small-batch Indian roastery focusing on single-origin beans."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="brandCategory">Brand Category</Label>
                        <Input
                            id="brandCategory"
                            name="brandCategory"
                            required
                            placeholder="e.g., Coffee / FMCG"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="brandMarket">Brand Market</Label>
                        <Input
                            id="brandMarket"
                            name="brandMarket"
                            required
                            placeholder="e.g., India"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="surveyContext">Survey Context</Label>
                        <Textarea
                            id="surveyContext"
                            name="surveyContext"
                            required
                            rows={3}
                            placeholder="What is this survey about? e.g., Launching a new coffee subscription service."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="surveyGoals">Survey Goals</Label>
                        <Textarea
                            id="surveyGoals"
                            name="surveyGoals"
                            required
                            rows={3}
                            placeholder="What do you want to learn? e.g., Understand price sensitivity and flavor preferences."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="targetAudience">Target Audience</Label>
                        <Textarea
                            id="targetAudience"
                            name="targetAudience"
                            required
                            rows={2}
                            placeholder="Who are you asking? e.g., Coffee drinkers aged 25-45 in urban areas."
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Number of Questions</Label>
                        <RadioGroup
                            value={numberOfQuestions}
                            onValueChange={setNumberOfQuestions}
                            className="flex items-center gap-4"
                        >
                            {[5, 10, 15, 20].map((num) => (
                                <div key={num} className="flex items-center gap-2">
                                    <RadioGroupItem value={num.toString()} id={`q${num}`} />
                                    <Label htmlFor={`q${num}`} className="cursor-pointer font-normal">
                                        {num}
                                    </Label>
                                </div>
                            ))}
                        </RadioGroup>
                        <input type="hidden" name="numberOfQuestions" value={numberOfQuestions} />
                    </div>

                    <div className="space-y-4 pt-4 border-t border-border">
                        <div className="text-sm font-medium text-foreground">Optional Settings (Phase 1.1)</div>
                        
                        <div className="space-y-3">
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="includeDemographics"
                                    checked={includeDemographics}
                                    onChange={(e) => setIncludeDemographics(e.target.checked)}
                                    className="h-4 w-4 rounded border-input"
                                />
                                <Label htmlFor="includeDemographics" className="cursor-pointer font-normal">
                                    Include Demographics
                                </Label>
                            </div>

                            {includeDemographics && (
                                <div className="space-y-2 pl-6">
                                    <Label htmlFor="demographicsDepth">Demographics Depth</Label>
                                    <select
                                        id="demographicsDepth"
                                        value={demographicsDepth}
                                        onChange={(e) => setDemographicsDepth(e.target.value as 'light' | 'standard' | 'extended')}
                                        className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                    >
                                        <option value="light">Light (2-3 questions)</option>
                                        <option value="standard">Standard (4-6 questions)</option>
                                        <option value="extended">Extended (6-9 questions)</option>
                                    </select>
                                </div>
                            )}

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="includeFollowup"
                                    checked={includeFollowup}
                                    onChange={(e) => setIncludeFollowup(e.target.checked)}
                                    className="h-4 w-4 rounded border-input"
                                />
                                <Label htmlFor="includeFollowup" className="cursor-pointer font-normal">
                                    Include Follow-Up Questions
                                </Label>
                            </div>

                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    id="captureContact"
                                    checked={captureContact}
                                    onChange={(e) => setCaptureContact(e.target.checked)}
                                    className="h-4 w-4 rounded border-input"
                                />
                                <Label htmlFor="captureContact" className="cursor-pointer font-normal">
                                    Capture Contact Information
                                </Label>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="b2bOrB2c">Business Type</Label>
                                <select
                                    id="b2bOrB2c"
                                    value={b2bOrB2c}
                                    onChange={(e) => setB2bOrB2c(e.target.value as 'b2b' | 'b2c' | '')}
                                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                                >
                                    <option value="">Not specified</option>
                                    <option value="b2b">B2B</option>
                                    <option value="b2c">B2C</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        disabled={loading}
                        className="w-full"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="animate-spin -ml-1 mr-2 h-4 w-4" />
                                Generating...
                            </>
                        ) : (
                            'Generate Survey'
                        )}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
