// This script helps execute all SQL batch files
const fs = require('fs');
const path = require('path');

// Get remaining batch numbers (3-26)
const remainingBatches = [];
for (let i = 3; i <= 26; i++) {
  remainingBatches.push(i);
}

console.log('FedEx DAS ZIP Import - Batch Executor');
console.log('=====================================');
console.log('Completed: Batches 1-2 (2000 ZIPs)');
console.log('Remaining: Batches 3-26 (23,354 ZIPs)');
console.log('');
console.log('Next batches to execute:');

remainingBatches.forEach(batchNum => {
  const filename = `batch_${String(batchNum).padStart(2, '0')}.sql`;
  const filePath = path.join(__dirname, filename);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`  Batch ${batchNum}: ${filename} (${(stats.size / 1024).toFixed(1)} KB)`);
  }
});

console.log('');
console.log('Total remaining: 24 batches');
console.log('Execute each batch using mcp__neon__run_sql');

// Output SQL for verification
console.log('\nTo verify after completion:');
console.log('SELECT COUNT(*) FROM fedex_das_zips;');
console.log('-- Should return 25,354 rows');