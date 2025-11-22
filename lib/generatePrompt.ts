import { SurveyInput } from '@/components/InputForm';

export type QuestionType = 'SINGLE_CHOICE' | 'MULTI_CHOICE' | 'LIKERT_SCALE' | 'RANK_ORDER' | 'OPEN_TEXT' | 'NUMERIC_INPUT';

export interface SurveyQuestion {
  id: string;
  text: string;
  type: QuestionType;
  options?: string[];
  config?: {
    allow_other?: boolean;
    min_choices?: number;
    max_choices?: number;
    scale_min?: number;
    scale_max?: number;
    scale_labels?: string[] | null;
    rank_mode?: 'all' | 'top_n' | null;
    top_n?: number | null;
    input_size?: 'short' | 'long' | null;
    min?: number | null;
    max?: number | null;
    unit?: string | null;
  };
  rationale: string;
}

export interface SurveySection {
  section_id: string;
  title: string;
  questions: SurveyQuestion[];
}

export interface SurveyOutput {
  sections: SurveySection[];
}

export { type SurveyInput };

export function generatePrompt(input: SurveyInput): string {
  return `You are SurveySmith, an expert market researcher. Generate a professional, unbiased, research-grade SURVEY QUESTION SET for the user.

----------------------------------------
CONTEXT ABOUT THE BRAND (IMPORTANT)
Brand Name: ${input.brandName}
Brand Description: ${input.brandDescription}
Brand Category: ${input.brandCategory}
Brand Market: ${input.brandMarket}

----------------------------------------
SURVEY REQUIREMENTS
Survey Context: ${input.surveyContext}
Primary Goals: ${input.surveyGoals}
Target Audience: ${input.targetAudience}
Number Of Questions: ${input.numberOfQuestions}

----------------------------------------
OPTIONAL SECTIONS
Include Demographics: ${input.includeDemographics ? 'Yes' : 'No'}${input.includeDemographics ? ` (Depth: ${input.demographicsDepth || 'standard'})` : ''}
Include Follow-Up: ${input.includeFollowup ? 'Yes' : 'No'}
Capture Contact: ${input.captureContact ? 'Yes' : 'No'}
Business Type: ${input.b2bOrB2c || 'Not specified'}

----------------------------------------
STRICT RULES
1. Generate EXACTLY ${input.numberOfQuestions} questions for the core survey sections (screeners + core + pricing_or_attitudes).
${input.includeDemographics ? `2. ADDITIONALLY include a "demographics" section with ${input.demographicsDepth === 'light' ? '2-3' : input.demographicsDepth === 'extended' ? '6-9' : '4-6'} questions appropriate for the market (${input.brandMarket}).` : '2. Do NOT include a demographics section.'}
${input.includeFollowup ? `3. ADDITIONALLY include a "followup" section with ${input.captureContact ? '2' : '1'} question(s).${input.captureContact ? ' Include an optional contact information field with consent disclaimer.' : ''}` : '3. Do NOT include a followup section.'}
4. Use a diverse mix of ONLY these types:
   - SINGLE_CHOICE
   - MULTI_CHOICE
   - LIKERT_SCALE
   - RANK_ORDER
   - OPEN_TEXT
   - NUMERIC_INPUT
5. Never repeat the same type more than twice consecutively.
6. Organize questions into SECTIONS:
   - "screeners" (1–2 questions)
   - "core" (majority of questions)
   - "pricing_or_attitudes" (if relevant)
${input.includeDemographics ? '   - "demographics" (if enabled)' : ''}
${input.includeFollowup ? '   - "followup" (if enabled)' : ''}
7. ABSOLUTELY NO:
   - Leading questions
   - Double-barreled questions
   - Assumptive wording
   - Vague prompts
8. Every question MUST include a clear rationale explaining:
   - Why it matters for this survey
   - Why it avoids bias
${input.includeDemographics ? `9. For demographics section:` : ''}
${input.includeDemographics ? `   - Create questions appropriate to the MARKET (${input.brandMarket})` : ''}
${input.includeDemographics && input.b2bOrB2c ? `   - Match ${input.b2bOrB2c.toUpperCase()} context (${input.b2bOrB2c === 'b2b' ? 'include roles, companies, employees' : 'consumer-focused'})` : ''}
${input.includeDemographics ? `   - Use only: SINGLE_CHOICE, MULTI_CHOICE, NUMERIC_INPUT` : ''}
${input.includeDemographics ? `   - Must be neutral, respectful, and culturally appropriate` : ''}
${input.includeFollowup ? `${input.includeDemographics ? '10' : '9'}. For followup section:` : ''}
${input.includeFollowup ? `   - Add 1 OPEN_TEXT question: "Is there anything else you would like to share about this topic?"` : ''}
${input.captureContact ? `   - Add ONE optional OPEN_TEXT field for email or phone` : ''}
${input.captureContact ? `   - The question MUST explicitly state it is optional` : ''}
${input.captureContact ? `   - Add consent disclaimer: "Your contact information will only be used for follow-up regarding this survey."` : ''}

----------------------------------------
QUESTION TYPE RULES
SINGLE_CHOICE → 4–7 balanced options  
MULTI_CHOICE → define min_choices and max_choices  
LIKERT_SCALE → use scale_min:1, scale_max:5 AND labels  
RANK_ORDER → 4–7 items  
NUMERIC_INPUT → define min, max, unit  
OPEN_TEXT → specific, not generic

----------------------------------------
RETURN FORMAT (STRICT JSON ONLY)
{
  "sections": [
    {
      "section_id": "screeners",
      "title": "Screeners",
      "questions": [ SurveyQuestion ]
    },
    {
      "section_id": "core",
      "title": "Core Questions",
      "questions": [ SurveyQuestion ]
    },
    {
      "section_id": "pricing_or_attitudes",
      "title": "Pricing / Attitudes",
      "questions": [ SurveyQuestion ]
    }${input.includeDemographics ? `,
    {
      "section_id": "demographics",
      "title": "Demographics",
      "questions": [ SurveyQuestion ]
    }` : ''}${input.includeFollowup ? `,
    {
      "section_id": "followup",
      "title": "Follow-Up",
      "questions": [ SurveyQuestion ]
    }` : ''}
  ]
}

A SurveyQuestion is:
{
  "id": "q1",
  "text": "...",
  "type": "...",
  "options": [...],
  "config": {
    "allow_other": false,
    "min_choices": null,
    "max_choices": null,
    "scale_min": null,
    "scale_max": null,
    "scale_labels": null,
    "rank_mode": null,
    "top_n": null,
    "input_size": null,
    "min": null,
    "max": null,
    "unit": null
  },
  "rationale": "..."
}

ONLY RETURN VALID JSON. No commentary.`;
}
