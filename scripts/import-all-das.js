const fs = require('fs');
const path = require('path');

// Read the processed JSON file
const jsonPath = path.join(__dirname, '..', 'data', 'das_zips_processed.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log(`Total ZIPs to import: ${data.total}`);
console.log('Summary:', data.summary);

// Generate SQL for direct execution
const batchSize = 500;
const batches = [];

for (let i = 0; i < data.zips.length; i += batchSize) {
  const batch = data.zips.slice(i, Math.min(i + batchSize, data.zips.length));
  const values = batch.map(z => `('${z.zip}', '${z.type}')`).join(', ');
  const sql = `INSERT INTO fedex_das_zips (zip_code, das_type) VALUES ${values} ON CONFLICT (zip_code) DO UPDATE SET das_type = EXCLUDED.das_type`;
  batches.push(sql);
}

console.log(`\nCreated ${batches.length} SQL batches`);

// Export for manual execution via API
module.exports = { batches, totalZips: data.total };

// Also save first few batches for testing
const testBatches = batches.slice(0, 3);
fs.writeFileSync(
  path.join(__dirname, 'test_das_import.sql'),
  testBatches.join(';\n\n') + ';'
);

console.log('Test SQL saved to: scripts/test_das_import.sql');
console.log('\nTo import all data, execute the batches via the API');