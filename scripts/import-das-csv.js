const fs = require('fs');
const path = require('path');

// Read and parse CSV
const csvPath = path.join(__dirname, '..', 'data', 'fedex_das_zips_2025_tagged.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Skip header and parse data
const zips = [];
for (let i = 1; i < lines.length; i++) {
  const [zip, service, tier, region] = lines[i].split(',');
  if (zip && tier) {
    // Map tier to das_type
    let dasType = 'NONE';
    if (tier.includes('DAS Remote')) dasType = 'DAS_REMOTE';
    else if (tier.includes('DAS Extended')) dasType = 'DAS_EXTENDED';
    else if (tier.includes('DAS')) dasType = 'DAS';
    
    zips.push({ zip: zip.trim(), type: dasType });
  }
}

console.log(`Parsed ${zips.length} ZIP codes from CSV`);

// Generate SQL statements in batches of 1000
const batchSize = 1000;
const statements = [];

for (let i = 0; i < zips.length; i += batchSize) {
  const batch = zips.slice(i, Math.min(i + batchSize, zips.length));
  
  const values = batch.map(z => `('${z.zip}', '${z.type}')`).join(',\n    ');
  const sql = `INSERT INTO fedex_das_zips (zip_code, das_type) 
  VALUES 
    ${values} 
  ON CONFLICT (zip_code) 
  DO UPDATE SET das_type = EXCLUDED.das_type;`;
  
  statements.push({
    batchNumber: Math.floor(i / batchSize) + 1,
    zipCount: batch.length,
    sql: sql
  });
}

console.log(`Generated ${statements.length} SQL batches`);

// Save to JSON for execution
const outputPath = path.join(__dirname, 'das_import_batches.json');
fs.writeFileSync(outputPath, JSON.stringify(statements, null, 2));

console.log(`\nSaved ${statements.length} batches to ${outputPath}`);
console.log(`Each batch contains up to ${batchSize} ZIP codes`);
console.log(`\nReady to execute via Neon SQL tool`);

// Show summary
statements.forEach(batch => {
  console.log(`  Batch ${batch.batchNumber}: ${batch.zipCount} ZIPs`);
});