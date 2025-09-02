const fs = require('fs');
const path = require('path');

// Read the complete DAS data
const jsonPath = path.join(__dirname, '..', 'data', 'das_zips_processed.json');
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

console.log(`Preparing to import ALL ${data.total} DAS ZIP codes`);

// Split into manageable batches for SQL
const batchSize = 500;
const batches = [];

for (let i = 0; i < data.zips.length; i += batchSize) {
  const batch = data.zips.slice(i, Math.min(i + batchSize, data.zips.length));
  batches.push(batch);
}

console.log(`Created ${batches.length} batches of ~${batchSize} ZIPs each`);

// Generate SQL files for each batch
batches.forEach((batch, index) => {
  const values = batch.map(z => `('${z.zip}', '${z.type}')`).join(',\n  ');
  const sql = `-- Batch ${index + 1} of ${batches.length} (${batch.length} ZIPs)
INSERT INTO fedex_das_zips (zip_code, das_type) VALUES
  ${values}
ON CONFLICT (zip_code) DO UPDATE SET das_type = EXCLUDED.das_type;`;
  
  const filename = `das_batch_${String(index + 1).padStart(3, '0')}.sql`;
  fs.writeFileSync(path.join(__dirname, filename), sql);
});

// Create master import script
const masterSql = `-- Complete FedEx DAS ZIP Import
-- Total: ${data.total} ZIP codes
-- DAS: ${data.summary.DAS} ZIPs  
-- DAS_EXTENDED: ${data.summary.DAS_EXTENDED} ZIPs

TRUNCATE TABLE fedex_das_zips;

${batches.map((batch, i) => `-- Batch ${i + 1}
${batch.slice(0, 5).map(z => `-- ${z.zip}: ${z.type}`).join('\n')}
-- ... ${batch.length} total in this batch`).join('\n\n')}

-- Run all ${batches.length} batch files to import complete data`;

fs.writeFileSync(path.join(__dirname, 'import_all_das_master.sql'), masterSql);

console.log(`\nGenerated ${batches.length} SQL batch files`);
console.log('Master file: scripts/import_all_das_master.sql');
console.log('\nBreakdown:');
console.log(`  DAS: ${data.summary.DAS} ZIPs`);
console.log(`  DAS_EXTENDED: ${data.summary.DAS_EXTENDED} ZIPs`);
console.log(`  Total: ${data.total} ZIPs`);