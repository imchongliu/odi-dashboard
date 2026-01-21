import { drizzle } from 'drizzle-orm/mysql2';
import mysql from 'mysql2/promise';
import { sql } from 'drizzle-orm';
import * as dotenv from 'dotenv';

dotenv.config();

const connection = await mysql.createConnection(process.env.DATABASE_URL);
const db = drizzle(connection);

const result = await db.execute(sql`SELECT DISTINCT company_industry FROM investments WHERE company_industry IS NOT NULL ORDER BY company_industry`);
console.log('Industries in database:');
result[0].forEach(row => console.log(`- ${row.company_industry}`));

await connection.end();
