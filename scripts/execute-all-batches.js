const fs = require('fs');
const path = require('path');

// Get all batch files
const batchFiles = [];
for (let i = 1; i <= 26; i++) {
  const filename = `batch_${String(i).padStart(2, '0')}.sql`;
  batchFiles.push(filename);
}

console.log('Found 26 batch files to execute');
console.log('Execute each batch using the Neon SQL tool\n');

// Read and prepare each batch
batchFiles.forEach((file, index) => {
  const filePath = path.join(__dirname, file);
  const sql = fs.readFileSync(filePath, 'utf-8');
  
  console.log(`Batch ${index + 1}: ${file}`);
  console.log(`  - Size: ${(sql.length / 1024).toFixed(1)} KB`);
  console.log(`  - Ready to execute via mcp__neon__run_sql`);
});

console.log('\nAll batches ready for execution');
console.log('Total: 25,354 ZIP codes to import');