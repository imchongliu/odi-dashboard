import fs from 'fs';
import { drizzle } from 'drizzle-orm/mysql2';
import { investments } from '../drizzle/schema.ts';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

// Simple CSV parser
function parseCSV(csvText) {
  const lines = csvText.split('\n').filter(line => line.trim());
  const headers = lines[0].split(',');
  
  return lines.slice(1).map(line => {
    // Handle quoted fields with commas
    const values = [];
    let currentValue = '';
    let insideQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      
      if (char === '"') {
        insideQuotes = !insideQuotes;
      } else if (char === ',' && !insideQuotes) {
        values.push(currentValue.trim());
        currentValue = '';
      } else {
        currentValue += char;
      }
    }
    values.push(currentValue.trim());
    
    const record = {};
    headers.forEach((header, index) => {
      record[header.trim()] = values[index] || null;
    });
    
    return record;
  });
}

async function importFinal() {
  try {
    // Read the CSV file
    const csvText = fs.readFileSync('/home/ubuntu/upload/investments_supabase_ready(1).csv', 'utf-8');
    const records = parseCSV(csvText);
    
    console.log(`Total records in CSV: ${records.length}`);
    
    // Deduplicate records within CSV itself
    const uniqueRecords = [];
    const seenKeys = new Set();
    let csvDuplicates = 0;
    
    for (const record of records) {
      const key = `${record.company_name}|${record.announcement_date}|${record.target_country_name}|${record.target_name}|${record.deal_size_usd}`;
      
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueRecords.push(record);
      } else {
        csvDuplicates++;
      }
    }
    
    console.log(`Duplicates found in CSV: ${csvDuplicates}`);
    console.log(`Unique records after CSV deduplication: ${uniqueRecords.length}`);
    
    // Process and normalize the data
    const recordsToInsert = [];
    let invalidTypeCount = 0;
    let invalidStageCount = 0;
    
    for (const record of uniqueRecords) {
      // Normalize investment_type - set to "Other" if not valid
      let investmentType = record.investment_type;
      if (!['M&A', 'Greenfield', 'Other'].includes(investmentType)) {
        invalidTypeCount++;
        investmentType = 'Other';
      }
      
      // Normalize announcement_stage - set to "筹划" if not valid
      let announcementStage = record.announcement_stage;
      if (!['筹划', '进展', '完成'].includes(announcementStage)) {
        invalidStageCount++;
        announcementStage = '筹划';
      }
      
      // Standardize country codes
      let countryCode = record.target_country_code;
      let countryName = record.target_country_name;
      
      // Handle Hong Kong variants
      if (countryName && countryName.includes('香港')) {
        countryCode = 'HK';
        countryName = '香港';
      }
      
      // Handle UAE variants
      if (countryName === '阿拉伯联合酋长国' || countryName === '阿联酋') {
        countryCode = 'AE';
        countryName = '阿联酋';
      }
      
      // Handle Congo variants
      if (countryName && countryName.includes('刚果民主共和国')) {
        countryCode = 'CD';
        countryName = '刚果民主共和国';
      }
      
      // Handle multi-country investments
      if (countryName && (countryName.includes(',') || countryName.includes('，') || countryName.includes('、'))) {
        countryCode = 'MULTI';
      }
      
      // Parse numeric values
      const dealSizeUsd = record.deal_size_usd ? parseFloat(record.deal_size_usd) : 0;
      
      recordsToInsert.push({
        sourceFile: record.source_file || null,
        extractionModel: null,
        extractionTokens: null,
        confidenceScore: null,
        validatedAt: null,
        dataCompleteness: null,
        
        announcementDate: new Date(record.announcement_date),
        announcementTitle: record.announcement_title || null,
        announcementStage: announcementStage,
        
        stockCode: record.stock_code || null,
        companyName: record.company_name,
        exchange: record.exchange || null,
        companyProvince: record.company_province || null,
        companyIndustry: record.company_industry || null,
        
        investmentType: investmentType,
        investmentRationale: record.investment_rationale || null,
        
        targetName: record.target_name || null,
        targetIndustry: record.target_industry || null,
        targetCountryCode: countryCode || null,
        targetCountryName: countryName,
        targetRegion: record.target_region || null,
        
        dealSizeOriginal: record.deal_size_original || null,
        originalCurrency: record.original_currency || null,
        dealSizeUsd: dealSizeUsd.toString(),
        
        dealSpecifics: null,
      });
    }
    
    console.log(`Records with invalid investment_type (converted to Other): ${invalidTypeCount}`);
    console.log(`Records with invalid announcement_stage (converted to 筹划): ${invalidStageCount}`);
    
    // Insert in batches of 50
    const batchSize = 50;
    let imported = 0;
    let failed = 0;
    
    for (let i = 0; i < recordsToInsert.length; i += batchSize) {
      const batch = recordsToInsert.slice(i, i + batchSize);
      try {
        await db.insert(investments).values(batch);
        imported += batch.length;
        console.log(`✓ Batch ${Math.floor(i / batchSize) + 1}: ${batch.length} records`);
      } catch (error) {
        console.error(`✗ Batch ${Math.floor(i / batchSize) + 1} failed:`, error.message);
        
        // Try inserting one by one for this batch
        for (const record of batch) {
          try {
            await db.insert(investments).values([record]);
            imported++;
          } catch (err) {
            failed++;
            console.error(`  ✗ ${record.companyName}: ${err.message}`);
          }
        }
      }
    }
    
    console.log(`\n=== Final Import Summary ===`);
    console.log(`CSV total records: ${records.length}`);
    console.log(`CSV duplicates removed: ${csvDuplicates}`);
    console.log(`Unique records: ${uniqueRecords.length}`);
    console.log(`Successfully imported: ${imported}`);
    console.log(`Failed: ${failed}`);
    
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importFinal();
