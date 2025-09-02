const fs = require('fs');
const path = require('path');

// Read the statements
const statements = JSON.parse(fs.readFileSync(path.join(__dirname, 'all_das_inserts.json'), 'utf-8'));

console.log(`Ready to execute ${statements.length} INSERT statements`);
console.log(`Total ZIP codes: 25,354`);
console.log('\nStatements are in all_das_inserts.json');
console.log('Execute them one by one via the SQL tool');

// Show first few for verification
console.log('\nFirst statement (1000 ZIPs):');
console.log(statements[0].substring(0, 500) + '...\n');

// Save individual files for easier execution
statements.forEach((stmt, i) => {
  const filename = `batch_${String(i + 1).padStart(2, '0')}.sql`;
  fs.writeFileSync(path.join(__dirname, 'batches', filename), stmt);
});

console.log(`Individual batch files saved to scripts/batches/`);