#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

async function analyzeFailedRecords() {
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
    
    console.log(`Total records in JSON file: ${investments.length}`);
    
    // Get all imported records from database
    const [rows] = await connection.execute('SELECT source_file, stock_code, company_name FROM investments');
    const importedSourceFiles = new Set(rows.map(r => r.source_file));
    
    console.log(`Records in database: ${rows.length}`);
    console.log(`\n========== FAILED RECORDS ANALYSIS ==========\n`);
    
    const failedRecords = [];
    const issueCategories = {
      missingCompanyName: [],
      missingDate: [],
      invalidDate: [],
      missingDealSize: [],
      duplicateRecord: [],
      otherIssues: []
    };
    
    for (const inv of investments) {
      // Check if this record was imported
      if (importedSourceFiles.has(inv.source_file)) {
        continue; // Already imported
      }
      
      // Analyze why it might have failed
      const issues = [];
      
      // Check for missing company name
      if (!inv.company_name || inv.company_name.trim() === '') {
        issues.push('Missing company_name');
        issueCategories.missingCompanyName.push(inv);
      }
      
      // Check for missing or invalid date
      if (!inv.announcement_date) {
        issues.push('Missing announcement_date');
        issueCategories.missingDate.push(inv);
      } else {
        const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
        if (!dateRegex.test(inv.announcement_date)) {
          issues.push(`Invalid date format: ${inv.announcement_date}`);
          issueCategories.invalidDate.push(inv);
        }
      }
      
      // Check for missing deal size
      if (inv.deal_size_usd === null || inv.deal_size_usd === undefined) {
        issues.push('Missing deal_size_usd');
        issueCategories.missingDealSize.push(inv);
      }
      
      if (issues.length === 0) {
        issues.push('Unknown issue (may be duplicate or DB error)');
        issueCategories.otherIssues.push(inv);
      }
      
      failedRecords.push({
        source_file: inv.source_file,
        stock_code: inv.stock_code,
        company_name: inv.company_name,
        announcement_date: inv.announcement_date,
        target_country_name: inv.target_country_name,
        deal_size_usd: inv.deal_size_usd,
        issues: issues
      });
    }
    
    console.log(`Failed records: ${failedRecords.length}\n`);
    
    // Print summary by issue category
    console.log('--- Issue Summary ---');
    console.log(`Missing company_name: ${issueCategories.missingCompanyName.length}`);
    console.log(`Missing announcement_date: ${issueCategories.missingDate.length}`);
    console.log(`Invalid date format: ${issueCategories.invalidDate.length}`);
    console.log(`Missing deal_size_usd: ${issueCategories.missingDealSize.length}`);
    console.log(`Other issues: ${issueCategories.otherIssues.length}`);
    
    console.log('\n--- Failed Records Details ---\n');
    
    for (const record of failedRecords) {
      console.log(`Stock: ${record.stock_code || 'N/A'}`);
      console.log(`Company: ${record.company_name || 'N/A'}`);
      console.log(`Date: ${record.announcement_date || 'N/A'}`);
      console.log(`Country: ${record.target_country_name || 'N/A'}`);
      console.log(`Deal Size: ${record.deal_size_usd || 'N/A'}`);
      console.log(`Issues: ${record.issues.join(', ')}`);
      console.log(`Source: ${record.source_file}`);
      console.log('---');
    }
    
    // Save failed records to a JSON file for review
    const outputPath = path.join(process.cwd(), 'failed_records.json');
    fs.writeFileSync(outputPath, JSON.stringify(failedRecords, null, 2));
    console.log(`\nFailed records saved to: ${outputPath}`);
    
  } catch (error) {
    console.error('Analysis failed:', error);
    process.exit(1);
  } finally {
    await connection.end();
  }
}

analyzeFailedRecords();
