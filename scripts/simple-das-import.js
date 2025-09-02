const fs = require('fs');
const path = require('path');

// Read CSV directly
const csvPath = path.join(__dirname, '..', 'data', 'fedex_das_zips_2025_tagged.csv');
const csvContent = fs.readFileSync(csvPath, 'utf-8');
const lines = csvContent.split('\n').filter(line => line.trim());

// Parse all ZIPs
const zips = [];
for (let i = 1; i < lines.length; i++) {
  const [zip, service, tier, region] = lines[i].split(',');
  if (zip && tier) {
    let dasType = 'NONE';
    if (tier.includes('DAS Remote')) dasType = 'DAS_REMOTE';
    else if (tier.includes('DAS Extended')) dasType = 'DAS_EXTENDED';
    else if (tier.includes('DAS')) dasType = 'DAS';
    
    zips.push({ zip: zip.trim(), type: dasType });
  }
}

console.log(`Parsed ${zips.length} ZIP codes`);

// Execute in batches of 1000
const BATCH_SIZE = 1000;
let batchNum = 1;

for (let i = 0; i < zips.length; i += BATCH_SIZE) {
  const batch = zips.slice(i, Math.min(i + BATCH_SIZE, zips.length));
  
  // Create VALUES string
  const values = batch.map(z => `('${z.zip}', '${z.type}')`).join(',');
  
  // Create SQL
  const sql = `INSERT INTO fedex_das_zips (zip_code, das_type) VALUES ${values} ON CONFLICT (zip_code) DO UPDATE SET das_type = EXCLUDED.das_type;`;
  
  console.log(`\nBatch ${batchNum}: ${batch.length} ZIPs (${i+1} to ${Math.min(i+BATCH_SIZE, zips.length)})`);
  console.log(`Execute this SQL via Neon tool:`);
  console.log(`[SQL for batch ${batchNum} - ${batch.length} ZIPs]`);
  
  // Save to file
  const filename = `batch_${String(batchNum).padStart(2, '0')}.sql`;
  fs.writeFileSync(path.join(__dirname, filename), sql);
  console.log(`Saved to scripts/${filename}`);
  
  batchNum++;
}

console.log(`\nAll ${batchNum-1} batch SQL files created`);
console.log('Execute each batch via Neon SQL tool');