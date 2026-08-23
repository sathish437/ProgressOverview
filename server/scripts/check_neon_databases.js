import pg from 'pg';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const { Client } = pg;

async function checkDatabases() {
    const rawUrl = process.env.DATABASE_URL;
    if (!rawUrl) {
        console.error('No DATABASE_URL in .env');
        return;
    }

    // Connect to current URL
    const client = new Client({
        connectionString: rawUrl,
        ssl: { rejectUnauthorized: false }
    });

    try {
        await client.connect();
        console.log('Connected to Neon successfully.');

        const dbRes = await client.query('SELECT current_database(), current_user;');
        console.log('Current Database:', dbRes.rows[0].current_database);
        console.log('Current User:', dbRes.rows[0].current_user);

        const allDbs = await client.query('SELECT datname FROM pg_database WHERE datistemplate = false;');
        console.log('All non-template databases in this Neon cluster:', allDbs.rows.map(r => r.datname));

        // Check tables in current database
        const tablesRes = await client.query(`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `);
        console.log(`Tables in public schema of "${dbRes.rows[0].current_database}":`, tablesRes.rows.map(r => r.table_name));

        await client.end();

        // Also test connecting to neondb if it exists
        if (allDbs.rows.some(r => r.datname === 'neondb') && dbRes.rows[0].current_database !== 'neondb') {
            console.log('\n--- Checking default "neondb" database ---');
            const neonDbUrl = rawUrl.replace('/proverview', '/neondb');
            const neonClient = new Client({
                connectionString: neonDbUrl,
                ssl: { rejectUnauthorized: false }
            });
            await neonClient.connect();
            const neonTables = await neonClient.query(`
                SELECT table_schema, table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public' 
                ORDER BY table_name;
            `);
            console.log(`Tables in public schema of "neondb":`, neonTables.rows.map(r => r.table_name));
            await neonClient.end();
        }

    } catch (err) {
        console.error('Database query error:', err);
    } finally {
        process.exit();
    }
}

checkDatabases();
