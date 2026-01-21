import mysql from 'mysql2/promise';
import { readFileSync } from 'fs';
import dotenv from 'dotenv';

dotenv.config();

const validInvestmentTypes = ['M&A', 'Greenfield', 'Other'];
const validAnnouncementStages = ['筹划', '进展', '完成', '终止'];

function normalizeInvestmentType(type) {
  if (!type || type.trim() === '') return 'Other';
  const normalized = type.trim();
  if (validInvestmentTypes.includes(normalized)) return normalized;
  // Map common variations
  if (normalized.includes('并购') || normalized.includes('收购')) return 'M&A';
  if (normalized.includes('绿地') || normalized.includes('新建')) return 'Greenfield';
  return 'Other';
}

function normalizeAnnouncementStage(stage) {
  if (!stage || stage.trim() === '') return '进展';
  const normalized = stage.trim();
  if (validAnnouncementStages.includes(normalized)) return normalized;
  // Map common variations
  if (normalized.includes('筹划') || normalized.includes('拟')) return '筹划';
  if (normalized.includes('完成') || normalized.includes('完工')) return '完成';
  if (normalized.includes('终止') || normalized.includes('取消')) return '终止';
  return '进展';
}

async function importRemainingRecords() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Read the original JSON file
    const jsonData = JSON.parse(
      readFileSync('/home/ubuntu/odi-dashboard/upload/pasted_file_YqX3So_investments.json', 'utf-8')
    );
    
    // Get existing records to avoid duplicates
    const [existing] = await connection.execute(
      'SELECT company_name, announcement_date FROM investments'
    );
    const existingKeys = new Set(
      existing.map(r => `${r.company_name}_${r.announcement_date}`)
    );
    
    let imported = 0;
    let skipped = 0;
    const errors = [];
    
    for (const record of jsonData) {
      const key = `${record.company_name}_${record.announcement_date}`;
      
      // Skip if already exists
      if (existingKeys.has(key)) {
        skipped++;
        continue;
      }
      
      // Skip if missing required fields
      if (!record.company_name || !record.announcement_date) {
        skipped++;
        errors.push(`Missing required fields: ${record.source_file}`);
        continue;
      }
      
      try {
        // Normalize enum fields
        const investmentType = normalizeInvestmentType(record.investment_type);
        const announcementStage = normalizeAnnouncementStage(record.announcement_stage);
        
        await connection.execute(
          `INSERT INTO investments (
            announcement_date, company_name, company_stock_code, company_industry,
            target_company_name, target_country_name, target_country_code, target_region,
            target_industry, investment_type, deal_size_usd, deal_size_cny,
            announcement_stage, status, source_file, confidence_score
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            record.announcement_date || null,
            record.company_name || null,
            record.company_stock_code || null,
            record.company_industry || null,
            record.target_company_name || null,
            record.target_country_name || null,
            record.target_country_code || null,
            record.target_region || null,
            record.target_industry || null,
            investmentType,
            record.deal_size_usd || null,
            record.deal_size_cny || null,
            announcementStage,
            record.status || null,
            record.source_file || null,
            record.confidence_score || null
          ]
        );
        imported++;
      } catch (err) {
        skipped++;
        errors.push(`${record.source_file}: ${err.message}`);
      }
    }
    
    console.log(`\n=== Import Summary ===`);
    console.log(`Successfully imported: ${imported} records`);
    console.log(`Skipped: ${skipped} records`);
    
    if (errors.length > 0 && errors.length <= 10) {
      console.log(`\nErrors:`);
      errors.forEach(err => console.log(`  - ${err}`));
    }
    
    // Check total count
    const [result] = await connection.execute('SELECT COUNT(*) as count FROM investments');
    console.log(`Total records in database: ${result[0].count}`);
    
  } finally {
    await connection.end();
  }
}

importRemainingRecords().catch(console.error);
