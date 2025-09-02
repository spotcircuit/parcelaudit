const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ID = 'orange-hall-17085884';
const DATABASE = 'neondb';

console.log('FedEx DAS ZIP Import - Final Push');
console.log('==================================');
console.log(`Project: ${PROJECT_ID}`);
console.log(`Database: ${DATABASE}`);
console.log('');

// Track progress
const completed = [1, 2, 3]; // Already done
const remaining = [];
for (let i = 4; i <= 26; i++) {
  remaining.push(i);
}

console.log(`✓ Completed: Batches ${completed.join(', ')} (3,000 ZIPs)`);
console.log(`⏳ Remaining: Batches ${remaining[0]}-${remaining[remaining.length-1]} (22,354 ZIPs)`);
console.log('');

// Process remaining batches
console.log('Batches ready for execution:');
console.log('----------------------------');

remaining.forEach((batchNum, index) => {
  const filename = `batch_${String(batchNum).padStart(2, '0')}.sql`;
  const filePath = path.join(__dirname, filename);
  
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sql = fs.readFileSync(filePath, 'utf-8');
    const zipCount = (sql.match(/\('/g) || []).length;
    
    console.log(`Batch ${batchNum}: ${zipCount} ZIPs (${(stats.size / 1024).toFixed(1)} KB)`);
    
    // For execution reference
    if (index === 0) {
      console.log('\nNext to execute: Batch 4');
      console.log('Use: mcp__neon__run_sql with the SQL from batch_04.sql');
    }
  }
});

console.log('\n📋 Total to import: 22,354 ZIP codes');
console.log('🎯 Target total: 25,354 ZIP codes');
console.log('\nExecute each batch sequentially via Neon SQL tool.');