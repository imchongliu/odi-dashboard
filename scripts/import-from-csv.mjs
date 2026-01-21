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

async function importFromCSV() {
  try {
    // Read the CSV file
    const csvText = fs.readFileSync('/home/ubuntu/upload/investments_supabase_ready(1).csv', 'utf-8');
    const records = parseCSV(csvText);
    
    console.log(`Total records in CSV: ${records.length}`);
    
    // Get existing records to avoid duplicates
    const existingRecords = await db.select({
      companyName: investments.companyName,
      announcementDate: investments.announcementDate,
      targetCountryName: investments.targetCountryName
    }).from(investments);
    
    console.log(`Existing records in database: ${existingRecords.length}`);
    
    // Create a Set of unique identifiers for existing records
    const existingKeys = new Set(
      existingRecords.map(r => 
        `${r.companyName}|${r.announcementDate.toISOString().split('T')[0]}|${r.targetCountryName}`
      )
    );
    
    // Filter out already imported records
    const newRecords = records.filter(record => {
      const key = `${record.company_name}|${record.announcement_date}|${record.target_country_name}`;
      return !existingKeys.has(key);
    });
    
    console.log(`New records to import: ${newRecords.length}`);
    
    if (newRecords.length === 0) {
      console.log('No new records to import.');
      return;
    }
    
    // Process and normalize the data
    const recordsToInsert = newRecords.map(record => {
      // Normalize investment_type - set to "Other" if not valid
      let investmentType = record.investment_type;
      if (!['M&A', 'Greenfield', 'Other'].includes(investmentType)) {
        console.log(`Invalid investment_type "${investmentType}" for ${record.company_name}, setting to "Other"`);
        investmentType = 'Other';
      }
      
      // Parse numeric values
      const dealSizeUsd = record.deal_size_usd ? parseFloat(record.deal_size_usd) : 0;
      
      return {
        sourceFile: record.source_file || null,
        extractionModel: null,
        extractionTokens: null,
        confidenceScore: null,
        validatedAt: null,
        dataCompleteness: null,
        
        announcementDate: new Date(record.announcement_date),
        announcementTitle: record.announcement_title || null,
        announcementStage: record.announcement_stage || null,
        
        stockCode: record.stock_code || null,
        companyName: record.company_name,
        exchange: record.exchange || null,
        companyProvince: record.company_province || null,
        companyIndustry: record.company_industry || null,
        
        investmentType: investmentType,
        investmentRationale: record.investment_rationale || null,
        
        targetName: record.target_name || null,
        targetIndustry: record.target_industry || null,
        targetCountryCode: record.target_country_code || null,
        targetCountryName: record.target_country_name,
        targetRegion: record.target_region || null,
        
        dealSizeOriginal: record.deal_size_original || null,
        originalCurrency: record.original_currency || null,
        dealSizeUsd: dealSizeUsd.toString(),
        
        dealSpecifics: null,
      };
    });
    
    // Insert in batches of 20 to avoid overwhelming the database
    const batchSize = 20;
    let imported = 0;
    let failed = 0;
    
    for (let i = 0; i < recordsToInsert.length; i += batchSize) {
      const batch = recordsToInsert.slice(i, i + batchSize);
      try {
        await db.insert(investments).values(batch);
        imported += batch.length;
        console.log(`✓ Imported batch ${Math.floor(i / batchSize) + 1}: ${batch.length} records`);
      } catch (error) {
        console.error(`✗ Failed batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        
        // Try inserting one by one for this batch
        for (const record of batch) {
          try {
            await db.insert(investments).values([record]);
            imported++;
            console.log(`  ✓ ${record.companyName} - ${record.targetCountryName}`);
          } catch (err) {
            failed++;
            console.error(`  ✗ ${record.companyName}: ${err.message}`);
          }
        }
      }
    }
    
    console.log(`\n=== Import Summary ===`);
    console.log(`Successfully imported: ${imported} records`);
    console.log(`Failed: ${failed} records`);
    console.log(`Total in database: ${existingRecords.length + imported} records`);
    
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importFromCSV();
