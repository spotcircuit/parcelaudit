const fs = require('fs');
const path = require('path');

// List all remaining batches (4-26)
const remainingBatches = [];
for (let i = 4; i <= 26; i++) {
  remainingBatches.push(i);
}

console.log('Executing remaining DAS ZIP batches');
console.log('===================================');
console.log('Completed: Batches 1-3 (3000 ZIPs)');
console.log('Remaining: Batches 4-26 (22,354 ZIPs)');
console.log('');

// Read and prepare each batch
remainingBatches.forEach(batchNum => {
  const filename = `batch_${String(batchNum).padStart(2, '0')}.sql`;
  const filePath = path.join(__dirname, filename);
  
  if (fs.existsSync(filePath)) {
    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`\n// Batch ${batchNum}: ${filename}`);
    console.log(`// Execute via: mcp__neon__run_sql`);
    console.log(`// Project: orange-hall-17085884`);
    console.log(`// Database: neondb`);
    
    // Save each SQL to a ready file
    const readyFile = path.join(__dirname, 'ready', `ready_${batchNum}.sql`);
    fs.mkdirSync(path.join(__dirname, 'ready'), { recursive: true });
    fs.writeFileSync(readyFile, sql);
  }
});

console.log('\n\nAll batch files prepared in /scripts/ready/');
console.log('Execute each via Neon SQL tool.');