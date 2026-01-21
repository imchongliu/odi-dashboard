#!/usr/bin/env node

import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function importRemaining() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    const rawData = fs.readFileSync('upload/pasted_file_YqX3So_investments.json', 'utf-8');
    const investments = JSON.parse(rawData);
    
    // Get already imported source_files
    const [rows] = await conn.execute('SELECT source_file FROM investments');
    const importedSourceFiles = new Set(rows.map(r => r.source_file));
    
    console.log(`Total records in JSON: ${investments.length}`);
    console.log(`Already imported: ${importedSourceFiles.size}`);
    
    let imported = 0;
    let failed = 0;
    const errors = [];
    
    for (const inv of investments) {
      // Skip already imported
      if (importedSourceFiles.has(inv.source_file)) {
        continue;
      }
      
      // Skip if missing required fields
      if (!inv.company_name || !inv.announcement_date) {
        failed++;
        errors.push({ source: inv.source_file, reason: 'Missing required fields' });
        continue;
      }
      
      try {
        const query = `
          INSERT INTO investments (
            source_file, extraction_model, extraction_tokens, confidence_score,
            validated_at, data_completeness, announcement_date, announcement_title,
            announcement_stage, stock_code, company_name, exchange, company_province,
            company_industry, investment_type, investment_rationale, target_name,
            target_industry, target_country_code, target_country_name, target_region,
            deal_size_original, original_currency, deal_size_usd
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
          inv.source_file || null,
          inv.extraction_model || null,
          inv.extraction_tokens || null,
          inv.confidence_score || null,
          inv.validated_at ? new Date(inv.validated_at) : null,
          inv.data_completeness || 'high',
          inv.announcement_date,
          inv.announcement_title || null,
          inv.announcement_stage || '筹划',
          inv.stock_code || null,
          inv.company_name,
          inv.exchange || null,
          inv.company_province || null,
          inv.company_industry || null,
          inv.investment_type,
          inv.investment_rationale || null,
          inv.target_name || null,
          inv.target_industry || null,
          inv.target_country_code || null,
          inv.target_country_name,
          inv.target_region || null,
          inv.deal_size_original || null,
          inv.original_currency || null,
          inv.deal_size_usd
        ];
        
        await conn.execute(query, values);
        imported++;
        console.log(`Imported: ${inv.stock_code} ${inv.company_name}`);
      } catch (error) {
        failed++;
        errors.push({ source: inv.source_file, reason: error.message });
        console.log(`Failed: ${inv.stock_code} - ${error.message}`);
      }
    }
    
    console.log(`\n========== IMPORT COMPLETE ==========`);
    console.log(`Successfully imported: ${imported}`);
    console.log(`Failed: ${failed}`);
    
    if (errors.length > 0) {
      console.log(`\nErrors:`);
      errors.forEach(e => console.log(`  - ${e.source}: ${e.reason}`));
    }
    
    // Verify total count
    const [countResult] = await conn.execute('SELECT COUNT(*) as total FROM investments');
    console.log(`\nTotal records in database: ${countResult[0].total}`);
    
  } catch (error) {
    console.error('Import failed:', error);
  } finally {
    await conn.end();
  }
}

importRemaining();
