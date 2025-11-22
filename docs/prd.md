

# 🧩 **SURVEYSMITH — PRODUCT REQUIREMENTS DOCUMENT (PRD v1.0 / MVP)**

## 📌 **1. Product Summary**

SurveySmith is a SaaS tool that helps marketers generate **unbiased, research-grade surveys** using AI.
Users enter basic information about their survey (brand, context, goals, target audience, question count), and the system generates a structured, logically ordered questionnaire with rationale, question types, and export formats.

The MVP produces **survey questionnaires only** (no templates, no user accounts, no response collection).

---

# 🎯 **2. High-Level Goals**

1. Let a marketer generate a complete, usable, research-grade questionnaire in < 60 seconds.
2. Ensure the questions are:

   * Unbiased
   * Non-leading
   * Logically ordered
   * Balanced in question types
3. Provide clean export formats:

   * Markdown
   * Google Forms JSON
4. Log all generation activity for analytics and debugging.

---

# 🎛️ **3. Inputs (User → System)**

## Required fields

* **Brand Name**
* **Survey Context**
* **Survey Goals**
* **Target Audience**
* **Number of Questions** (5, 10, 15, 20)

## Optional flags (phase 1.1)

Not implemented yet, but we design for future:

* includeDemographics
* includeFollowup
* captureContact
* demographicsDepth (‘light’ | ‘standard’ | ‘extended’)
* b2bOrB2c (‘b2b’ | ‘b2c’)

---

# 🧠 **4. Outputs (System → User)**

### A JSON structure:

```
{
  sections: [
    {
      section_id: "screeners",
      title: "Screeners",
      questions: SurveyQuestion[]
    },
    {
      section_id: "main",
      title: "Core Questions",
      questions: SurveyQuestion[]
    },
    {
      section_id: "followup",
      title: "Follow-Up",
      questions: SurveyQuestion[]
    }
  ]
}
```

### Each `SurveyQuestion`:

* id
* text
* type (enum)
* options (if needed)
* config (per type)
* rationale

### Rendered UI version:

* question cards
* question numbering
* rationale field
* export buttons

---

# ⚙️ **5. System Workflow — Detailed Process Flow**

## **Step 1 — User visits landing page**

* Sees description + CTA: “Generate Survey”
* No auth needed.

---

## **Step 2 — Navigate to `/generate`**

* User fills:

  1. brandName
  2. surveyContext
  3. surveyGoals
  4. targetAudience
  5. numberOfQuestions
* Press **Generate Survey**.

---

## **Step 3 — Client → `/api/generate-survey`**

Payload:

```json
{
  "brandName": "...",
  "surveyContext": "...",
  "surveyGoals": "...",
  "targetAudience": "...",
  "numberOfQuestions": 10
}
```

---

## **Step 4 — API Backend Workflow**

1. **Validate input**

   * Required fields
   * Max size limits

2. **Insert a row into `survey_requests`**
   (brand, context, goals, audience, q count, timestamp)

3. **Generate Prompt**

   * Assemble the strict JSON-output prompt
   * Insert input variables
   * Include question-type rules
   * Include section structure
   * Force valid JSON

4. **Call Google Gemini 2.0 Flash**

   * Use `generate_content`
   * Temperature ~0.2-0.4 (consistency)
   * Output expected: JSON-only

5. **Validate LLM Output**

   * Try JSON.parse
   * Use Zod validator (optional v1.1)
   * If invalid → retry model with correction prompt

6. **Return structured JSON to client**

   * Should include sections + questions

---

## **Step 5 — Frontend renders `/result` page**

* Takes JSON from localStorage / state
* Renders:

  * Section headings
  * Question cards
  * Types + options
  * Rationales
  * Export buttons:

    * Markdown
    * Google Forms JSON

---

# 🛠 **6. System Architecture — MVP**

### Frontend

* Next.js App Router
* React server components where possible
* Client components for input form, copy buttons

### Backend

* Next.js API routes (serverless)
* Neon DB (Postgres)
* SQL migration run via `npm run migrate`

### AI

* Google Gemini 2.0 Flash
* Prompt-linter logic baked in generatePrompt()

### Storage

* No user accounts
* No saved surveys
* Only store survey requests in DB

---

# 🗄️ **7. Database Schema (Neon)**

## `survey_requests`

| column         | type        | description     |
| -------------- | ----------- | --------------- |
| id             | uuid pk     | request id      |
| brand_name     | text        | brand           |
| context        | text        | survey context  |
| goals          | text        | survey goals    |
| audience       | text        | target audience |
| question_count | int         | 5/10/15/20      |
| created_at     | timestamptz | default now()   |

RLS not required for MVP (anonymous access allowed).

---

# 🧩 **8. Detailed Process Flow (Visual)**

1. **Landing Page** → user clicks CTA
2. **Generate Page**
   ↓
3. **Submit inputs**
   ↓
4. **API validates + logs request**
   ↓
5. **Prompt creation**
   ↓
6. **LLM call → Gemini**
   ↓
7. **Validate JSON**
   ↓
8. **Return survey object**
   ↓
9. **Store in localStorage**
   ↓
10. **Navigate to /result page**
    ↓
11. **Render UI, allow exports**

---

# 🚀 **9. MVP Success Criteria**

### Functional

* Every generation request returns a valid survey 95% of time.
* JSON output is always valid or retry-successful.
* User can easily copy export formats.

### UX

* User completes input → survey appears in under 10 seconds.
* Question ordering always follows required structure.
* No leading or biased questions appear.

### Tech

* No API failures causing broken pages.
* Neon connection stable via pooled connection.

---

# 🔮 **10. Future Version (v2.0): Agent-Based Conversational Survey Builder**

## 🎙️ Vision

The marketer chats with an AI “survey strategist” that asks them directed questions to extract the information needed to create a perfect survey.

Not: “Fill this form.”
Instead:
**“Tell me about your product — I’ll ask follow-up questions.”**

---

## 🔄 Conversational Flow

### Phase A — Context Gathering

AI asks:

* “What is the survey about?”
* “Who are you targeting?”
* “What decisions will this survey inform?”
* “What do you already know?”
* “Are you testing concepts, pricing, or attitudes?”

### Phase B — Clarification

AI identifies unclarified areas:

* Use-case missing?
* Target audience vague?
* Need screener logic?

### Phase C — Structured Extraction

AI asks specific, directed questions like:

* “Do you want to include demographic questions?”
* “Should we measure familiarity, usage, or intent?”
* “Are price points important?”
* “Any concept descriptions to test?”

### Phase D — Questionnaire Assembly

AI transforms structured extracted data →
question blueprint →
JSON →
final survey →
UI.

### Phase E — Optional Add-ons

* Contact opt-in logic
* Follow-up blocks
* Brand tone adaptation
* Template style definitions

---
