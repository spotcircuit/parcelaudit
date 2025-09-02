const fs = require('fs');
const path = require('path');

// Configuration
const PROJECT_ID = 'orange-hall-17085884';
const DATABASE = 'neondb';
const START_BATCH = 4;  // Starting from batch 4
const END_BATCH = 26;   // Through batch 26

console.log('🚀 DAS ZIP Import Orchestrator');
console.log('==============================');
console.log(`Project: ${PROJECT_ID}`);
console.log(`Database: ${DATABASE}`);
console.log(`Batches: ${START_BATCH} to ${END_BATCH}`);
console.log('');

// Prepare all SQL statements
const batches = [];
let totalZips = 0;

for (let i = START_BATCH; i <= END_BATCH; i++) {
  const filename = `batch_${String(i).padStart(2, '0')}.sql`;
  const filePath = path.join(__dirname, filename);
  
  if (fs.existsSync(filePath)) {
    const sql = fs.readFileSync(filePath, 'utf-8');
    const zipCount = (sql.match(/\('/g) || []).length;
    totalZips += zipCount;
    
    batches.push({
      number: i,
      filename: filename,
      sql: sql,
      zipCount: zipCount
    });
    
    console.log(`✓ Loaded batch ${i}: ${zipCount} ZIPs`);
  }
}

console.log(`\n📊 Total batches loaded: ${batches.length}`);
console.log(`📊 Total ZIPs to import: ${totalZips}`);

// Save orchestration data
const orchestrationData = {
  projectId: PROJECT_ID,
  database: DATABASE,
  totalBatches: batches.length,
  totalZips: totalZips,
  batches: batches.map(b => ({
    number: b.number,
    filename: b.filename,
    zipCount: b.zipCount
  }))
};

const outputPath = path.join(__dirname, 'orchestration.json');
fs.writeFileSync(outputPath, JSON.stringify(orchestrationData, null, 2));

console.log(`\n✅ Orchestration data saved to: orchestration.json`);
console.log('\n🎯 Ready to execute all batches via Neon SQL tool');
console.log('Each batch SQL is ready in the orchestration data.');

// Output execution instructions
console.log('\n📝 Execution Plan:');
batches.forEach(batch => {
  console.log(`   Batch ${batch.number}: Execute ${batch.filename} (${batch.zipCount} ZIPs)`);
});