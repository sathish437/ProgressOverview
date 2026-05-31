import dotenv from 'dotenv';
import path from 'path';
import { Client } from 'pg';

dotenv.config({ path: path.join(process.cwd(), 'server', '.env') });
const client = new Client({ connectionString: process.env.DATABASE_URL });
(async () => {
  try {
    await client.connect();
    await client.query('BEGIN');
    try {
      await client.query('UPDATE "Milestones" SET value = $1 WHERE id = $2', ['33.33', 10]);
    } catch (err) {
      console.error('CODE:', err.code);
      console.error('MESSAGE:', err.message);
    }
    await client.query('ROLLBACK');
  } finally {
    await client.end();
  }
})();
