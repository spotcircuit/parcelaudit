const fs = require('fs');
const path = require('path');

// Read the processed JSON file
const jsonPath = path.join(__dirname, '..', 'data', 'das_zips_processed.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log(`Total ZIPs: ${data.total}`);
console.log('Creating SQL import statements...');

// Take first 1000 ZIPs as a test batch
const testBatch = data.zips.slice(0, 1000);

// Also ensure we have our test ZIPs
const importantZips = [
  { zip: '76531', type: 'DAS_EXTENDED' },
  { zip: '65244', type: 'DAS_EXTENDED' },
  { zip: '98223', type: 'DAS' },
  { zip: '28726', type: 'NONE' },
  { zip: '10001', type: 'NONE' },
  { zip: '90210', type: 'NONE' }
];

// Merge important ZIPs
importantZips.forEach(imp => {
  if (!testBatch.find(z => z.zip === imp.zip)) {
    testBatch.push(imp);
  }
});

// Generate SQL
const values = testBatch.map(z => `('${z.zip}', '${z.type}')`).join(',\n  ');
const sql = `-- Import batch of ${testBatch.length} DAS ZIPs
TRUNCATE TABLE fedex_das_zips;

INSERT INTO fedex_das_zips (zip_code, das_type) VALUES
  ${values}
ON CONFLICT (zip_code) DO UPDATE SET das_type = EXCLUDED.das_type;

-- Verify specific ZIPs
SELECT * FROM fedex_das_zips 
WHERE zip_code IN ('76531', '65244', '98223', '28726')
ORDER BY zip_code;`;

// Save SQL file
const sqlPath = path.join(__dirname, 'import_das_batch.sql');
fs.writeFileSync(sqlPath, sql);

console.log(`\nSQL file created: ${sqlPath}`);
console.log(`Contains ${testBatch.length} ZIP codes including test cases`);

// Also output the test cases
console.log('\nTest ZIP codes included:');
console.log('  76531 -> DAS_EXTENDED');
console.log('  65244 -> DAS_EXTENDED');
console.log('  98223 -> DAS');
console.log('  28726 -> NONE (no DAS)');