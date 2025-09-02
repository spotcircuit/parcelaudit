const fs = require('fs');
const path = require('path');

// Read the complete data
const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'das_zips_processed.json'), 'utf-8'));

console.log(`Generating INSERT statements for ${data.total} ZIP codes...`);

// Generate INSERT statements in batches of 1000
const batchSize = 1000;
const statements = [];

for (let i = 0; i < data.zips.length; i += batchSize) {
  const batch = data.zips.slice(i, Math.min(i + batchSize, data.zips.length));
  
  const values = batch.map(z => `('${z.zip}', '${z.type}')`).join(', ');
  const sql = `INSERT INTO fedex_das_zips (zip_code, das_type) VALUES ${values} ON CONFLICT (zip_code) DO UPDATE SET das_type = EXCLUDED.das_type`;
  
  statements.push(sql);
}

console.log(`Generated ${statements.length} INSERT statements`);

// Save statements to file
const outputPath = path.join(__dirname, 'all_das_inserts.json');
fs.writeFileSync(outputPath, JSON.stringify(statements, null, 2));

console.log(`Saved to ${outputPath}`);
console.log(`\nFirst statement preview:`);
console.log(statements[0].substring(0, 200) + '...');