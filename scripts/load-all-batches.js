const fs = require('fs');
const path = require('path');

// Read all batch files and output them for execution
const batchFiles = [];
for (let i = 2; i <= 26; i++) {
  const filename = `batch_${String(i).padStart(2, '0')}.sql`;
  const filePath = path.join(__dirname, filename);
  
  if (fs.existsSync(filePath)) {
    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`\n=== Batch ${i} ===`);
    console.log(`File: ${filename}`);
    console.log(`Size: ${(sql.length / 1024).toFixed(1)} KB`);
    console.log('Ready to execute');
    
    // Save to individual execution files
    const execFile = path.join(__dirname, 'exec', `exec_${i}.json`);
    fs.mkdirSync(path.join(__dirname, 'exec'), { recursive: true });
    fs.writeFileSync(execFile, JSON.stringify({ 
      batch: i, 
      sql: sql,
      projectId: "orange-hall-17085884",
      databaseName: "neondb"
    }, null, 2));
  }
}

console.log('\n✓ All batch files prepared for execution');
console.log('Execute each via mcp__neon__run_sql');