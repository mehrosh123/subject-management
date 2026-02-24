import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './app.js'; // Aapki schema file ka reference
import 'dotenv/config';

// 1. Neon connection setup (process.env.DATABASE_URL lazmi hona chahiye)
const sql = neon(process.env.DATABASE_URL!);

// 2. Database instance create karein aur export karein
export const db = drizzle(sql, { schema });

// Default export bhi add kar dein taake import mein masla na ho
export default db;