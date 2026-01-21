#!/usr/bin/env node

import mysql from 'mysql2/promise';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

async function testImport() {
  const conn = await mysql.createConnection(process.env.DATABASE_URL);
  
  const rawData = fs.readFileSync('upload/pasted_file_YqX3So_investments.json', 'utf-8');
  const investments = JSON.parse(rawData);
  
  // Find the 000680 record
  const inv = investments.find(i => i.stock_code === '000680');
  
  if (!inv) {
    console.log('Record not found');
    return;
  }
  
  console.log('Testing import for:', inv.stock_code, inv.company_name);
  console.log('target_country_name:', inv.target_country_name);
  console.log('target_country_code:', inv.target_country_code);
  console.log('target_country_code length:', inv.target_country_code?.length);
  
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
    
    console.log('Values length:', values.length);
    console.log('target_country_code value:', values[18]);
    console.log('target_country_name value:', values[19]);
    
    await conn.execute(query, values);
    console.log('SUCCESS: Record imported!');
  } catch (error) {
    console.log('ERROR:', error.message);
    console.log('Error code:', error.code);
  }
  
  await conn.end();
}

testImport();
