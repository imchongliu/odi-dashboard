#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function importData() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  try {
    // Read the JSON data file
    const dataPath = path.join(process.cwd(), 'upload', 'pasted_file_YqX3So_investments.json');
    
    if (!fs.existsSync(dataPath)) {
      console.error(`Data file not found at ${dataPath}`);
      process.exit(1);
    }
    
    const rawData = fs.readFileSync(dataPath, 'utf-8');
    const investments = JSON.parse(rawData);
    
    console.log(`Found ${investments.length} investment records to import...`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const inv of investments) {
      try {
        // Map the data fields to the database schema
        const announcementDate = inv.announcement_date || new Date().toISOString().split('T')[0];
        const companyName = inv.company_name || 'Unknown';
        const targetCountryName = inv.target_country_name || 'Unknown';
        const investmentType = inv.investment_type || 'Other';
        const dealSizeUsd = inv.deal_size_usd || 0;
        
        const query = `
          INSERT INTO investments (
            source_file,
            extraction_model,
            extraction_tokens,
            confidence_score,
            validated_at,
            data_completeness,
            announcement_date,
            announcement_title,
            announcement_stage,
            stock_code,
            company_name,
            exchange,
            company_province,
            company_industry,
            investment_type,
            investment_rationale,
            target_name,
            target_industry,
            target_country_code,
            target_country_name,
            target_region,
            deal_size_original,
            original_currency,
            deal_size_usd
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        
        const values = [
          inv.source_file || null,
          inv.extraction_model || null,
          inv.extraction_tokens || null,
          inv.confidence_score || null,
          inv.validated_at ? new Date(inv.validated_at) : null,
          inv.data_completeness || 'high',
          announcementDate,
          inv.announcement_title || null,
          inv.announcement_stage || '筹划',
          inv.stock_code || null,
          companyName,
          inv.exchange || null,
          inv.company_province || null,
          inv.company_industry || null,
          investmentType,
          inv.investment_rationale || null,
          inv.target_name || null,
          inv.target_industry || null,
          inv.target_country_code || null,
          targetCountryName,
          inv.target_region || null,
          inv.deal_size_original || null,
          inv.original_currency || null,
          dealSizeUsd
        ];
        
        await connection.execute(query, values);
        successCount++;
        
        if (successCount % 10 === 0) {
          console.log(`  Imported ${successCount} records...`);
        }
      } catch (error) {
        errorCount++;
        console.error(`  Error importing record: ${error.message}`);
      }
    }
    
    console.log(`\nImport complete!`);
    console.log(`  ✓ Successfully imported: ${successCount}`);
    console.log(`  ✗ Failed: ${errorCount}`);
    console.log(`  Total: ${investments.length}`);
    
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

importData();
