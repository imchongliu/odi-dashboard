import { drizzle } from 'drizzle-orm/mysql2';
import { investments } from '../drizzle/schema.ts';
import { sql } from 'drizzle-orm';
import 'dotenv/config';

const db = drizzle(process.env.DATABASE_URL);

// Query distinct announcement_stage values with counts
const result = await db
  .select({
    stage: investments.announcementStage,
    count: sql`COUNT(*)`.as('count')
  })
  .from(investments)
  .groupBy(investments.announcementStage);

console.log('Announcement Stage Distribution:');
console.log(JSON.stringify(result, null, 2));

// Also show a few sample records
const samples = await db
  .select({
    id: investments.id,
    companyName: investments.companyName,
    announcementStage: investments.announcementStage,
  })
  .from(investments)
  .limit(10);

console.log('\nSample Records:');
console.log(JSON.stringify(samples, null, 2));

process.exit(0);
