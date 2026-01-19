/**
 * Seed script to import sample investment data into the database
 * Run with: node scripts/seed-investments.mjs
 */

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();

const investments = [
  {
    announcement_date: '2024-01-15',
    investor_name: 'CATL (Contemporary Amperex Technology)',
    investor_stock_code: '300750.SZ',
    target_country: 'Germany',
    target_company_name: 'Varta AG Battery Division',
    target_industry: 'Automotive & EV',
    investment_type: 'M&A',
    deal_size_usd: 1500000000,
    status: 'Completed',
    deal_specifics: {
      type: 'ma',
      transaction_type: 'Share Deal',
      payment_structure: { cash: 1200000000, stock: 300000000, description: 'Cash paid in two tranches, stock locked for 12 months' },
      premium_percentage: 18.5,
      earnout: { exists: true, description: 'Up to $200M additional based on 2025 EBITDA targets' },
      conditions: ['MOFCOM approval', 'EU antitrust clearance', 'Shareholder approval'],
      target_details: { public_status: 'Public', stock_code: 'VAR1', exchange: 'Frankfurt' }
    }
  },
  {
    announcement_date: '2024-02-20',
    investor_name: 'BYD Company Limited',
    investor_stock_code: '002594.SZ',
    target_country: 'Hungary',
    target_company_name: null,
    target_industry: 'Automotive & EV',
    investment_type: 'Greenfield',
    deal_size_usd: 800000000,
    status: 'Pending',
    deal_specifics: { type: 'greenfield', project_description: 'New EV manufacturing plant with 150,000 annual capacity', investment_phase: 'Construction' }
  },
  {
    announcement_date: '2024-03-05',
    investor_name: 'Tencent Holdings',
    investor_stock_code: '0700.HK',
    target_country: 'United States',
    target_company_name: 'Epic Games',
    target_industry: 'Technology & Gaming',
    investment_type: 'M&A',
    deal_size_usd: 2000000000,
    status: 'Completed',
    deal_specifics: {
      type: 'ma',
      transaction_type: 'Share Deal',
      payment_structure: { cash: 2000000000, description: 'All-cash transaction' },
      premium_percentage: 25.0,
      earnout: { exists: false },
      conditions: ['CFIUS review'],
      target_details: { public_status: 'Private' }
    }
  },
  {
    announcement_date: '2024-03-18',
    investor_name: 'LONGi Green Energy',
    investor_stock_code: '601012.SH',
    target_country: 'Malaysia',
    target_company_name: null,
    target_industry: 'Renewable Energy',
    investment_type: 'Greenfield',
    deal_size_usd: 450000000,
    status: 'Completed',
    deal_specifics: { type: 'greenfield', project_description: 'Solar cell manufacturing facility with 10GW capacity', investment_phase: 'Operational' }
  },
  {
    announcement_date: '2024-04-02',
    investor_name: 'Alibaba Group',
    investor_stock_code: 'BABA',
    target_country: 'Singapore',
    target_company_name: 'Lazada Group',
    target_industry: 'E-commerce',
    investment_type: 'M&A',
    deal_size_usd: 1200000000,
    status: 'Completed',
    deal_specifics: {
      type: 'ma',
      transaction_type: 'Share Deal',
      payment_structure: { cash: 800000000, stock: 400000000, description: 'Mixed consideration with performance-based stock vesting' },
      premium_percentage: 12.0,
      earnout: { exists: true, description: 'Additional $150M based on GMV growth targets' },
      conditions: ['Singapore MAS approval'],
      target_details: { public_status: 'Private' }
    }
  },
  {
    announcement_date: '2024-04-15',
    investor_name: 'Ganfeng Lithium',
    investor_stock_code: '002460.SZ',
    target_country: 'Argentina',
    target_company_name: 'Lithea Inc.',
    target_industry: 'Mining & Resources',
    investment_type: 'M&A',
    deal_size_usd: 962000000,
    status: 'Completed',
    deal_specifics: {
      type: 'ma',
      transaction_type: 'Asset Deal',
      payment_structure: { cash: 962000000, description: 'Full cash acquisition of lithium brine assets' },
      premium_percentage: 35.0,
      earnout: { exists: false },
      conditions: ['Argentina regulatory approval', 'Environmental clearance'],
      target_details: { public_status: 'Private' }
    }
  },
  {
    announcement_date: '2024-05-08',
    investor_name: 'SAIC Motor',
    investor_stock_code: '600104.SH',
    target_country: 'Thailand',
    target_company_name: null,
    target_industry: 'Automotive & EV',
    investment_type: 'Greenfield',
    deal_size_usd: 550000000,
    status: 'Pending',
    deal_specifics: { type: 'greenfield', project_description: 'MG EV production facility targeting ASEAN market', investment_phase: 'Construction' }
  },
  {
    announcement_date: '2024-05-22',
    investor_name: 'Midea Group',
    investor_stock_code: '000333.SZ',
    target_country: 'Italy',
    target_company_name: 'Clivet S.p.A.',
    target_industry: 'Manufacturing',
    investment_type: 'M&A',
    deal_size_usd: 380000000,
    status: 'Completed',
    deal_specifics: {
      type: 'ma',
      transaction_type: 'Share Deal',
      payment_structure: { cash: 380000000, description: 'All-cash acquisition' },
      premium_percentage: 22.0,
      earnout: { exists: false },
      conditions: ['EU merger control clearance'],
      target_details: { public_status: 'Private' },
      other_terms: 'Management retention agreement for 3 years'
    }
  },
  {
    announcement_date: '2024-06-10',
    investor_name: 'JA Solar',
    investor_stock_code: '002459.SZ',
    target_country: 'Vietnam',
    target_company_name: null,
    target_industry: 'Renewable Energy',
    investment_type: 'Greenfield',
    deal_size_usd: 320000000,
    status: 'Completed',
    deal_specifics: { type: 'greenfield', project_description: 'Solar module manufacturing plant with 5GW annual capacity', investment_phase: 'Operational' }
  },
  {
    announcement_date: '2024-06-25',
    investor_name: 'ByteDance',
    investor_stock_code: null,
    target_country: 'United Kingdom',
    target_company_name: 'Moonton Games',
    target_industry: 'Technology & Gaming',
    investment_type: 'M&A',
    deal_size_usd: 4000000000,
    status: 'Completed',
    deal_specifics: {
      type: 'ma',
      transaction_type: 'Share Deal',
      payment_structure: { cash: 3500000000, stock: 500000000, description: 'Primarily cash with equity rollover for founders' },
      premium_percentage: 40.0,
      earnout: { exists: true, description: 'Up to $500M based on user growth and revenue milestones' },
      conditions: ['UK CMA review', 'Singapore regulatory approval'],
      target_details: { public_status: 'Private' }
    }
  },
  {
    announcement_date: '2024-07-12',
    investor_name: 'Huawei Technologies',
    investor_stock_code: null,
    target_country: 'Brazil',
    target_company_name: null,
    target_industry: 'Technology & Telecom',
    investment_type: 'Greenfield',
    deal_size_usd: 600000000,
    status: 'Pending',
    deal_specifics: { type: 'greenfield', project_description: 'Cloud data center and 5G infrastructure hub for Latin America', investment_phase: 'Planning' }
  },
  {
    announcement_date: '2024-07-28',
    investor_name: 'China National Chemical Corporation',
    investor_stock_code: null,
    target_country: 'Saudi Arabia',
    target_company_name: 'SABIC Specialty Chemicals',
    target_industry: 'Chemicals',
    investment_type: 'M&A',
    deal_size_usd: 2800000000,
    status: 'Pending',
    deal_specifics: {
      type: 'ma',
      transaction_type: 'JV',
      payment_structure: { cash: 1400000000, description: '50-50 joint venture with capital contribution' },
      earnout: { exists: false },
      conditions: ['Saudi Arabia regulatory approval', 'MOFCOM approval'],
      target_details: { public_status: 'Private' },
      other_terms: 'Technology sharing agreement included'
    }
  },
  {
    announcement_date: '2024-08-05',
    investor_name: 'Great Wall Motor',
    investor_stock_code: '601633.SH',
    target_country: 'Mexico',
    target_company_name: null,
    target_industry: 'Automotive & EV',
    investment_type: 'Greenfield',
    deal_size_usd: 700000000,
    status: 'Pending',
    deal_specifics: { type: 'greenfield', project_description: 'Pick-up truck and SUV manufacturing plant for North American market', investment_phase: 'Planning' }
  },
  {
    announcement_date: '2024-08-20',
    investor_name: 'Fosun International',
    investor_stock_code: '0656.HK',
    target_country: 'Portugal',
    target_company_name: 'Luz Saúde',
    target_industry: 'Healthcare',
    investment_type: 'M&A',
    deal_size_usd: 1100000000,
    status: 'Completed',
    deal_specifics: {
      type: 'ma',
      transaction_type: 'Share Deal',
      payment_structure: { cash: 850000000, debt: 250000000, description: 'Cash plus assumption of existing debt' },
      premium_percentage: 15.0,
      earnout: { exists: false },
      conditions: ['Portugal competition authority approval', 'Healthcare regulatory clearance'],
      target_details: { public_status: 'Private' }
    }
  },
  {
    announcement_date: '2024-09-03',
    investor_name: 'Zijin Mining Group',
    investor_stock_code: '601899.SH',
    target_country: 'Serbia',
    target_company_name: 'RTB Bor Copper Complex',
    target_industry: 'Mining & Resources',
    investment_type: 'M&A',
    deal_size_usd: 1260000000,
    status: 'Completed',
    deal_specifics: {
      type: 'ma',
      transaction_type: 'Asset Deal',
      payment_structure: { cash: 1260000000, description: 'Full cash acquisition with commitment to invest additional $800M in expansion' },
      premium_percentage: 28.0,
      earnout: { exists: false },
      conditions: ['Serbia government approval', 'Environmental impact assessment'],
      target_details: { public_status: 'Private' },
      other_terms: 'Employment guarantee for existing workforce'
    }
  },
  {
    announcement_date: '2024-09-18',
    investor_name: 'Envision Energy',
    investor_stock_code: null,
    target_country: 'Spain',
    target_company_name: null,
    target_industry: 'Renewable Energy',
    investment_type: 'Greenfield',
    deal_size_usd: 420000000,
    status: 'Pending',
    deal_specifics: { type: 'greenfield', project_description: 'Wind turbine manufacturing and R&D center', investment_phase: 'Construction' }
  },
  {
    announcement_date: '2024-10-02',
    investor_name: 'Wuxi Biologics',
    investor_stock_code: '2269.HK',
    target_country: 'Ireland',
    target_company_name: null,
    target_industry: 'Healthcare',
    investment_type: 'Greenfield',
    deal_size_usd: 500000000,
    status: 'Completed',
    deal_specifics: { type: 'greenfield', project_description: 'Biologics manufacturing facility for European market', investment_phase: 'Operational' }
  },
  {
    announcement_date: '2024-10-15',
    investor_name: 'Xiaomi Corporation',
    investor_stock_code: '1810.HK',
    target_country: 'India',
    target_company_name: 'Micromax Informatics',
    target_industry: 'Consumer Electronics',
    investment_type: 'M&A',
    deal_size_usd: 280000000,
    status: 'Terminated',
    deal_specifics: {
      type: 'ma',
      transaction_type: 'Share Deal',
      payment_structure: { cash: 280000000, description: 'All-cash offer' },
      premium_percentage: 30.0,
      earnout: { exists: false },
      conditions: ['India CCI approval', 'FIPB clearance'],
      target_details: { public_status: 'Private' },
      other_terms: 'Deal terminated due to regulatory concerns'
    }
  },
  {
    announcement_date: '2024-11-01',
    investor_name: 'CRRC Corporation',
    investor_stock_code: '601766.SH',
    target_country: 'Indonesia',
    target_company_name: null,
    target_industry: 'Transportation',
    investment_type: 'Greenfield',
    deal_size_usd: 850000000,
    status: 'Pending',
    deal_specifics: { type: 'greenfield', project_description: 'High-speed rail component manufacturing and maintenance facility', investment_phase: 'Planning' }
  },
  {
    announcement_date: '2024-11-18',
    investor_name: 'Haier Smart Home',
    investor_stock_code: '600690.SH',
    target_country: 'Turkey',
    target_company_name: 'Arçelik Appliances',
    target_industry: 'Consumer Electronics',
    investment_type: 'M&A',
    deal_size_usd: 1800000000,
    status: 'Pending',
    deal_specifics: {
      type: 'ma',
      transaction_type: 'Share Deal',
      payment_structure: { cash: 1200000000, stock: 600000000, description: 'Mixed consideration with stock component for strategic alignment' },
      premium_percentage: 20.0,
      earnout: { exists: true, description: 'Up to $200M based on synergy realization' },
      conditions: ['Turkey competition authority approval', 'MOFCOM approval', 'Shareholder approval'],
      target_details: { public_status: 'Public', stock_code: 'ARCLK', exchange: 'Istanbul' }
    }
  },
  {
    announcement_date: '2024-12-05',
    investor_name: 'Tianqi Lithium',
    investor_stock_code: '002466.SZ',
    target_country: 'Chile',
    target_company_name: 'SQM Lithium Operations',
    target_industry: 'Mining & Resources',
    investment_type: 'M&A',
    deal_size_usd: 4200000000,
    status: 'Completed',
    deal_specifics: {
      type: 'ma',
      transaction_type: 'Share Deal',
      payment_structure: { cash: 4200000000, description: 'All-cash acquisition of 24% stake' },
      premium_percentage: 15.0,
      earnout: { exists: false },
      conditions: ['Chile antitrust approval', 'MOFCOM approval'],
      target_details: { public_status: 'Public', stock_code: 'SQM', exchange: 'NYSE' }
    }
  },
  {
    announcement_date: '2024-12-20',
    investor_name: 'Geely Automobile',
    investor_stock_code: '0175.HK',
    target_country: 'Poland',
    target_company_name: null,
    target_industry: 'Automotive & EV',
    investment_type: 'Greenfield',
    deal_size_usd: 650000000,
    status: 'Pending',
    deal_specifics: { type: 'greenfield', project_description: 'EV battery pack assembly and vehicle manufacturing plant', investment_phase: 'Planning' }
  }
];

async function seed() {
  const connection = await mysql.createConnection(process.env.DATABASE_URL);
  
  console.log('Connected to database');
  console.log(`Seeding ${investments.length} investments...`);
  
  for (const inv of investments) {
    const sql = `
      INSERT INTO investments (
        announcement_date, investor_name, investor_stock_code,
        target_country, target_company_name, target_industry,
        investment_type, deal_size_usd, status, deal_specifics
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    await connection.execute(sql, [
      inv.announcement_date,
      inv.investor_name,
      inv.investor_stock_code,
      inv.target_country,
      inv.target_company_name,
      inv.target_industry,
      inv.investment_type,
      inv.deal_size_usd,
      inv.status,
      JSON.stringify(inv.deal_specifics)
    ]);
  }
  
  console.log('Seeding completed successfully!');
  await connection.end();
}

seed().catch(console.error);
