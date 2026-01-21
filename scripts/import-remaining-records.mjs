import fs from 'fs';
import { drizzle } from 'drizzle-orm/mysql2';
import { investments } from '../drizzle/schema.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const db = drizzle(process.env.DATABASE_URL);

async function importRemainingRecords() {
  try {
    // Read the original JSON file
    const jsonData = JSON.parse(
      fs.readFileSync('./upload/pasted_file_YqX3So_investments.json', 'utf-8')
    );
    
    console.log(`Total records in JSON: ${jsonData.length}`);
    
    // Get existing company names and announcement dates to identify duplicates
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
    const newRecords = jsonData.filter(record => {
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
      
      return {
        sourceFile: record.source_file || null,
        extractionModel: record.extraction_model || null,
        extractionTokens: record.extraction_tokens || null,
        confidenceScore: record.confidence_score || null,
        validatedAt: record.validated_at ? new Date(record.validated_at) : null,
        dataCompleteness: record.data_completeness || null,
        
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
        dealSizeUsd: record.deal_size_usd,
        
        dealSpecifics: record.deal_specifics || null,
      };
    });
    
    // Insert in batches of 50 to avoid overwhelming the database
    const batchSize = 50;
    let imported = 0;
    let failed = 0;
    
    for (let i = 0; i < recordsToInsert.length; i += batchSize) {
      const batch = recordsToInsert.slice(i, i + batchSize);
      try {
        await db.insert(investments).values(batch);
        imported += batch.length;
        console.log(`Imported batch ${Math.floor(i / batchSize) + 1}: ${batch.length} records`);
      } catch (error) {
        console.error(`Failed to import batch ${Math.floor(i / batchSize) + 1}:`, error.message);
        failed += batch.length;
        
        // Try inserting one by one for this batch to identify problematic records
        for (const record of batch) {
          try {
            await db.insert(investments).values([record]);
            imported++;
            console.log(`  ✓ Imported: ${record.companyName}`);
          } catch (err) {
            failed++;
            console.error(`  ✗ Failed: ${record.companyName} - ${err.message}`);
          }
        }
      }
    }
    
    console.log(`\n=== Import Summary ===`);
    console.log(`Successfully imported: ${imported} records`);
    console.log(`Failed: ${failed} records`);
    console.log(`Total in database now: ${existingRecords.length + imported} records`);
    
  } catch (error) {
    console.error('Import failed:', error);
    process.exit(1);
  }
}

importRemainingRecords();
