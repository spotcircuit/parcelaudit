const fs = require('fs');
const path = require('path');

// Read all batch files and combine into smaller executable chunks
const batchFiles = [];
for (let i = 1; i <= 51; i++) {
  const filename = `das_batch_${String(i).padStart(3, '0')}.sql`;
  const filepath = path.join(__dirname, filename);
  if (fs.existsSync(filepath)) {
    batchFiles.push(filepath);
  }
}

console.log(`Found ${batchFiles.length} batch files to process`);

// Read and combine first 10 batches (about 5000 ZIPs)
const combinedSQL = [];
combinedSQL.push('-- Import first 5000 DAS ZIPs');
combinedSQL.push('TRUNCATE TABLE fedex_das_zips;');
combinedSQL.push('');

for (let i = 0; i < Math.min(10, batchFiles.length); i++) {
  const content = fs.readFileSync(batchFiles[i], 'utf-8');
  combinedSQL.push(`-- Batch ${i + 1}`);
  combinedSQL.push(content);
  combinedSQL.push('');
}

// Write combined SQL
const outputPath = path.join(__dirname, 'import_first_5000.sql');
fs.writeFileSync(outputPath, combinedSQL.join('\n'));

console.log(`Created combined import file: ${outputPath}`);
console.log('This includes the first ~5000 ZIP codes');
console.log('\nTo import all 25,354 ZIPs, run all 51 batch files sequentially');