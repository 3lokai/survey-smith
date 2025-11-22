import { Pool } from '@neondatabase/serverless';
import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.local' });
dotenv.config({ path: '.env' });

if (!process.env.DATABASE_URL) {
    console.error('Error: DATABASE_URL is not defined in .env.local or .env');
    console.error('Please create a .env.local file with your DATABASE_URL from Neon.');
    process.exit(1);
}

// Create a pool for migration (direct connection, not pooled)
const pool = new Pool({ 
    connectionString: process.env.DATABASE_URL,
    max: 1, // Single connection for migration
});

async function migrate() {
    try {
        console.log('Starting database migration...');
        console.log('Connecting to Neon database...');

        const schemaPath = path.join(process.cwd(), 'supabase', 'schema.sql');
        
        if (!fs.existsSync(schemaPath)) {
            throw new Error(`Schema file not found at: ${schemaPath}`);
        }

        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        // Split the SQL file into individual statements
        // This handles basic SQL statements separated by semicolons
        const statements = schemaSql
            .split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0 && !s.startsWith('--')); // Remove empty statements and comments

        console.log(`Found ${statements.length} SQL statements to execute...`);

        for (let i = 0; i < statements.length; i++) {
            const statement = statements[i];
            if (!statement) continue;

            try {
                console.log(`Executing statement ${i + 1}/${statements.length}...`);
                await pool.query(statement);
            } catch (error) {
                // Some statements might fail if they already exist (e.g., CREATE TABLE IF NOT EXISTS)
                // Log but continue for idempotent operations
                if (error instanceof Error && error.message.includes('already exists')) {
                    console.log(`  ⚠️  Statement ${i + 1} skipped (already exists): ${error.message}`);
                } else {
                    throw error;
                }
            }
        }

        console.log('✅ Migration completed successfully!');
        console.log('Database schema is now up to date.');
    } catch (error) {
        console.error('❌ Migration failed:', error);
        if (error instanceof Error) {
            console.error('Error details:', error.message);
        }
        process.exit(1);
    } finally {
        await pool.end();
        console.log('Database connection closed.');
    }
}

migrate();
