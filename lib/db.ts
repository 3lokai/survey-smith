import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './db/schema';

if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL is not defined in environment variables');
}

// Initialize Neon serverless client
const sql = neon(process.env.DATABASE_URL);

// Initialize Drizzle ORM with schema
export const db = drizzle({ client: sql, schema });

// Export schema for use in queries
export { schema };

// Re-export types for convenience
export type { SurveyRequest, InsertSurveyRequest, SurveyQuestion, InsertSurveyQuestion } from './db/schema';
