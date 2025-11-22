# SurveySmith MVP

SurveySmith is a SaaS tool that helps marketers generate unbiased, research-grade surveys using AI.

## Tech Stack
- **Framework:** Next.js 16 (App Router)
- **Language:** TypeScript
- **UI Library:** React 19
- **Styling:** Tailwind CSS 4
- **Database:** Neon DB (PostgreSQL)
- **AI:** Google Gemini 2.0 Flash
- **Icons:** Lucide React

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
GOOGLE_API_KEY=your_google_gemini_api_key_here
DATABASE_URL=postgresql://user:password@ep-xxxxx-pooler.region.aws.neon.tech/dbname?sslmode=require&channel_binding=require

# Better Auth Configuration
BETTER_AUTH_SECRET=your_secure_random_string_here
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

# Google OAuth (for social login)
GOOGLE_CLIENT_ID=your_google_oauth_client_id
GOOGLE_CLIENT_SECRET=your_google_oauth_client_secret
```

**Required Variables:**
- `GOOGLE_API_KEY`: Your Google Gemini API key (get it from [Google AI Studio](https://makersuite.google.com/app/apikey))
- `DATABASE_URL`: Your Neon DB connection string (see setup instructions below)
- `BETTER_AUTH_SECRET`: A secure random string for session encryption (generate with `openssl rand -base64 32` or similar)
- `BETTER_AUTH_URL`: The base URL of your application (e.g., `http://localhost:3000` for dev, your production URL for prod)
- `NEXT_PUBLIC_BETTER_AUTH_URL`: Same as `BETTER_AUTH_URL` but with `NEXT_PUBLIC_` prefix for client-side access
- `GOOGLE_CLIENT_ID`: Google OAuth 2.0 Client ID (from [Google Cloud Console](https://console.cloud.google.com/))
- `GOOGLE_CLIENT_SECRET`: Google OAuth 2.0 Client Secret (from Google Cloud Console)

### 2. Database Setup (Neon DB)

#### Step 1: Create a Neon Project

1. Sign up or log in at [Neon](https://neon.tech)
2. Create a new project
3. Choose your region (preferably close to your deployment region)
4. Select PostgreSQL version (recommended: latest stable)

#### Step 2: Get Your Connection String

1. In the Neon dashboard, go to your project
2. Navigate to the **Connection Details** section
3. Copy the **Pooled connection** string (recommended for serverless)
   - Format: `postgresql://user:password@ep-xxxxx-pooler.region.aws.neon.tech/dbname?sslmode=require&channel_binding=require`
   - The pooled connection is optimized for serverless environments like Next.js

#### Step 3: Configure Environment Variables

Add the connection string to your `.env.local` file:

```env
DATABASE_URL=postgresql://user:password@ep-xxxxx-pooler.region.aws.neon.tech/dbname?sslmode=require&channel_binding=require
```

**Important Notes:**
- Use the **pooled connection** string (contains `-pooler` in the hostname) for serverless environments
- The connection string should include `sslmode=require` and `channel_binding=require` for security
- Never commit `.env.local` to version control (it's already in `.gitignore`)

#### Step 4: Run Database Migration

Run the migration script to create the necessary tables:

```bash
npm run migrate
```

This will:
- Create the `survey_requests` table
- Enable Row Level Security (RLS)
- Set up policies for anonymous access (required for MVP)

**Migration Output:**
- The script will show progress for each SQL statement
- If tables already exist, it will skip them (idempotent)
- On success, you'll see: `✅ Migration completed successfully!`

#### Troubleshooting

**Connection Issues:**
- Verify your `DATABASE_URL` is correct and includes SSL parameters
- Check that your Neon project is active (not paused)
- Ensure your IP is not blocked (Neon allows all IPs by default)

**Migration Errors:**
- Make sure you've run `npm install` first
- Verify the `supabase/schema.sql` file exists
- Check that your connection string has proper permissions

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
survey-tool/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── generate-survey/  # Survey generation endpoint
│   │   └── survey/[id]/      # Survey retrieval endpoint
│   ├── generate/          # Survey input form page
│   ├── result/            # Results display page
│   └── page.tsx           # Landing page
├── components/            # React components
│   ├── InputForm.tsx      # Survey input form
│   ├── QuestionCard.tsx   # Question display component
│   ├── CopyButton.tsx     # Copy to clipboard component
│   └── ui/                # shadcn/ui components
├── lib/                   # Utility functions
│   ├── db/                # Database utilities
│   │   ├── schema.ts      # Drizzle ORM schema
│   │   └── db.ts          # Database connection
│   ├── generatePrompt.ts  # AI prompt generation (prompts_pack format)
│   ├── formatMarkdown.ts  # Markdown export formatter
│   └── formatGoogleForms.ts # Google Forms JSON formatter
├── scripts/               # Utility scripts
│   └── migrate.ts         # Database migration script
├── drizzle/               # Drizzle migration files
└── docs/                  # Documentation
    ├── prd.md             # Product Requirements Document
    └── prompts_pack.md    # Prompt specifications
```

## Features

### Landing Page
- Clean, modern introduction to SurveySmith
- Call-to-action to start generating surveys

### Survey Generator (`/generate`)
- Input form for survey requirements:
  - **Brand Name:** Your company/brand name
  - **Brand Description:** Detailed description of your brand
  - **Brand Category:** Industry/category (e.g., "Coffee / FMCG")
  - **Brand Market:** Target market/region (e.g., "India", "US")
  - **Survey Context:** What the survey is about
  - **Survey Goals:** What you want to learn
  - **Target Audience:** Who you're surveying
  - **Number of Questions:** Choose 5, 10, 15, or 20 questions
  - **Optional Settings (Phase 1.1):**
    - Include Demographics (with depth: light/standard/extended)
    - Include Follow-Up Questions
    - Capture Contact Information
    - Business Type (B2B/B2C)

### AI-Powered Generation
- Uses Google Gemini 2.0 Flash to generate unbiased, research-grade questions
- Prompt follows the SurveySmith prompts_pack specification for consistent, high-quality output
- Supports multiple question types:
  - Single Choice (Radio/Dropdown)
  - Multi Choice (Checkboxes)
  - Likert Scale (1-5 rating scales with labels)
  - Rank Order (Ranking options)
  - Open Text (Free text responses)
  - Numeric Input (Number entry with units)
- Each question includes a rationale explaining why it's included and how it avoids bias
- Questions are organized into sections:
  - **Screeners:** 1-2 qualifying questions
  - **Core Questions:** Main survey content
  - **Pricing / Attitudes:** If relevant to survey goals
  - **Demographics:** Optional, if enabled
  - **Follow-Up:** Optional, if enabled

### Results Page (`/result`)
- Displays all generated questions organized by sections with section headings
- Shows rationale for each question
- Questions are numbered sequentially across all sections
- Export options:
  - **Copy as Markdown:** Formatted markdown with section headings for documentation
  - **Copy as Google Forms JSON:** Ready-to-import JSON for Google Forms API with section page breaks
- Requires survey ID in URL (no localStorage - database-only approach)

### Database Logging
- All survey requests are logged to Neon DB for analytics
- Stores brand name, description, category, market, context, goals, audience, and question count
- Questions are stored with section information for proper organization
- Includes timestamp for each request

## API Endpoints

### POST `/api/generate-survey`
Generates survey questions using Google Gemini AI.

**Request Body:**
```json
{
  "brandName": "Acme Coffee Co",
  "brandDescription": "Premium small-batch Indian roastery focusing on single-origin beans",
  "brandCategory": "Coffee / FMCG",
  "brandMarket": "India",
  "surveyContext": "Exploring willingness to try a new cold brew subscription",
  "surveyGoals": "Understand consumption habits, preferences, pricing acceptance",
  "targetAudience": "Urban coffee drinkers aged 22–45",
  "numberOfQuestions": 10,
  "includeDemographics": true,
  "demographicsDepth": "standard",
  "includeFollowup": false,
  "captureContact": false,
  "b2bOrB2c": "b2c"
}
```

**Response:**
```json
{
  "sections": [
    {
      "section_id": "screeners",
      "title": "Screeners",
      "questions": [
        {
          "id": "q1",
          "text": "Question text here",
          "type": "SINGLE_CHOICE",
          "options": ["Option 1", "Option 2"],
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
          "rationale": "Why this question is included..."
        }
      ]
    },
    {
      "section_id": "core",
      "title": "Core Questions",
      "questions": [...]
    }
  ],
  "surveyRequestId": "uuid-here"
}
```

### GET `/api/survey/[id]`
Retrieves a previously generated survey by ID.

**Response:**
Same structure as POST response with sections array.

## Development Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run migrate` - Run database migration

## Notes

### Application Behavior
- The app uses database-only storage (no localStorage) - survey results are fetched via API using survey ID
- Database errors during survey generation are logged but don't fail the request
- The migration script automatically creates tables if they don't exist (idempotent)
- Row Level Security (RLS) is enabled on the database for anonymous access

### Prompt System
- Follows the SurveySmith prompts_pack specification (see `docs/prompts_pack.md`)
- Uses structured prompt format with brand context, survey requirements, and strict rules
- Generates sections-based output: screeners, core, pricing_or_attitudes, demographics (optional), followup (optional)
- Each question includes rationale explaining bias avoidance and relevance

### Neon Database Configuration
- **Connection Pooling:** Uses Neon's `Pool` for optimal serverless performance
- **Connection Limit:** Set to `max: 1` for serverless environments (each request gets its own connection)
- **Optimizations:** Pipeline connections and coalesce writes for better performance
- **WebSocket Support:** 
  - Node.js 22+ has built-in WebSocket support (no configuration needed)
  - For Node.js v21 and earlier, uncomment the WebSocket configuration in `lib/db.ts`:
    ```typescript
    import ws from 'ws';
    neonConfig.webSocketConstructor = ws;
    ```
    Then install: `npm install ws @types/ws`

### Database Schema
- The `survey_requests` table stores all survey generation requests with brand information
- The `survey_questions` table stores individual questions with section information
- Schema is defined using Drizzle ORM in `lib/db/schema.ts`
- Migration files are in `drizzle/` directory
- Migration is idempotent - safe to run multiple times

**Schema Fields:**
- `survey_requests`: id, brandName, brandDescription, brandCategory, brandMarket, context, goals, audience, questionCount, createdAt
- `survey_questions`: id, surveyRequestId, sectionId, questionId, text, type, options, config, rationale, orderIndex, createdAt
