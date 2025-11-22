import { SurveyQuestion } from '@/lib/generatePrompt';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

export default function QuestionCard({ question, index }: { question: SurveyQuestion; index: number }) {
    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-4">
                <div className="flex items-start justify-between gap-4">
                    <CardTitle className="text-lg font-semibold leading-tight flex-1">
                        <span className="text-primary mr-2 font-bold">{index + 1}.</span>
                        {question.text}
                    </CardTitle>
                    <Badge variant="secondary" className="shrink-0 text-xs font-medium tracking-wide">
                        {question.type.replace('_', ' ').toLowerCase()}
                    </Badge>
                </div>
            </CardHeader>

            <CardContent className="pt-0">
                <div className="mb-4 pl-6">
                    {(question.type === 'SINGLE_CHOICE' || question.type === 'MULTI_CHOICE') && (
                        <ul className="space-y-2.5">
                            {question.options?.map((opt, i) => (
                                <li key={i} className="flex items-center text-muted-foreground">
                                    <div className={`w-4 h-4 border-2 border-input mr-3 shrink-0 ${question.type === 'SINGLE_CHOICE' ? 'rounded-full' : 'rounded-sm'}`} />
                                    <span className="text-sm">{opt}</span>
                                </li>
                            ))}
                            {question.config?.allow_other && (
                                <li className="flex items-center text-muted-foreground italic">
                                    <div className={`w-4 h-4 border-2 border-input mr-3 shrink-0 ${question.type === 'SINGLE_CHOICE' ? 'rounded-full' : 'rounded-sm'}`} />
                                    <span className="text-sm">Other...</span>
                                </li>
                            )}
                        </ul>
                    )}

                    {question.type === 'LIKERT_SCALE' && (() => {
                        const labels = Array.isArray(question.config?.scale_labels) && question.config.scale_labels.length >= 2
                            ? question.config.scale_labels
                            : ['Strongly Disagree', 'Strongly Agree'];
                        
                        return (
                        <div className="flex flex-col gap-2">
                            <div className="flex justify-between items-center max-w-md text-sm text-muted-foreground">
                                <span>{labels[0]}</span>
                                <span>{labels[labels.length - 1]}</span>
                            </div>
                            <div className="flex justify-between items-center max-w-md">
                                {Array.from({ length: (question.config?.scale_max || 5) - (question.config?.scale_min || 1) + 1 }, (_, i) => (question.config?.scale_min || 1) + i).map((n) => (
                                    <div key={n} className="w-8 h-8 flex items-center justify-center border border-input rounded-full text-sm text-muted-foreground">
                                        {n}
                                    </div>
                                ))}
                            </div>
                        </div>
                        );
                    })()}

                    {question.type === 'RANK_ORDER' && (
                        <div className="space-y-2">
                            {question.options?.map((opt, i) => (
                                <div key={i} className="flex items-center p-2 bg-muted rounded border border-input">
                                    <span className="text-muted-foreground mr-3 font-mono">{i + 1}</span>
                                    {opt}
                                </div>
                            ))}
                        </div>
                    )}

                    {question.type === 'OPEN_TEXT' && (
                        <div className={`w-full border border-input rounded-lg bg-muted ${question.config?.input_size === 'short' ? 'h-10' : 'h-24'}`} />
                    )}

                    {question.type === 'NUMERIC_INPUT' && (
                        <div className="flex items-center gap-2">
                            <div className="w-24 h-10 border border-input rounded-lg bg-muted" />
                            {question.config?.unit && <span className="text-muted-foreground text-sm">{question.config.unit}</span>}
                        </div>
                    )}
                </div>

                <div className="pl-6 pt-4 border-t border-border">
                    <p className="text-sm text-muted-foreground italic">
                        <span className="font-medium text-foreground not-italic">Rationale: </span>
                        {question.rationale}
                    </p>
                </div>
            </CardContent>
        </Card>
    );
}
