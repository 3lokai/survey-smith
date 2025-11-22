import { Pool } from '@neondatabase/serverless';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is not defined in .env.local or .env');
    process.exit(1);
}

const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 1,
});

async function addMissingColumns() {
    try {
        console.log('Adding missing columns to survey_requests table...');
        
        // Add missing columns if they don't exist
        const alterStatements = [
            `ALTER TABLE "survey_requests" ADD COLUMN IF NOT EXISTS "brand_description" text;`,
            `ALTER TABLE "survey_requests" ADD COLUMN IF NOT EXISTS "brand_category" text;`,
            `ALTER TABLE "survey_requests" ADD COLUMN IF NOT EXISTS "brand_market" text;`,
            // Check if section_id exists, if not add it (nullable first, then we can make it NOT NULL if needed)
            `DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name = 'survey_questions' AND column_name = 'section_id'
                ) THEN
                    ALTER TABLE "survey_questions" ADD COLUMN "section_id" text;
                END IF;
            END $$;`,
        ];

        for (const statement of alterStatements) {
            try {
                await pool.query(statement);
                console.log(`✅ Executed: ${statement}`);
            } catch (error) {
                if (error instanceof Error && error.message.includes('already exists')) {
                    console.log(`⚠️  Column already exists, skipping...`);
                } else {
                    throw error;
                }
            }
        }

        console.log('✅ Missing columns added successfully!');
    } catch (error) {
        console.error('❌ Failed to add columns:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        }
        process.exit(1);
    } finally {
        await pool.end();
        console.log('Database connection closed.');
    }
}

addMissingColumns();

