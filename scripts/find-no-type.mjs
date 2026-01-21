import { readFileSync } from 'fs';

const data = JSON.parse(
  readFileSync('/home/ubuntu/odi-dashboard/upload/pasted_file_YqX3So_investments.json', 'utf-8')
);

const noType = data.filter(r => !r.investment_type || r.investment_type.trim() === '');
console.log('Records without investment_type:', noType.length);

if (noType.length > 0) {
  console.log('\nFirst 3 examples:');
  noType.slice(0, 3).forEach((r, i) => {
    console.log(`\n${i + 1}. ${r.source_file}`);
    console.log(`   company: ${r.company_name}`);
    console.log(`   date: ${r.announcement_date}`);
    console.log(`   investment_type: "${r.investment_type}"`);
  });
}
