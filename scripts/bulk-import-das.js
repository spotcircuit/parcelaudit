const fs = require('fs');
const path = require('path');

async function bulkImportDAS() {
  // Read the CSV file
  const csvPath = path.join(__dirname, '..', 'data', 'fedex_das_zips_2025_tagged.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  
  // Parse CSV
  const lines = csvContent.split('\n').filter(line => line.trim());
  const records = [];
  
  // Skip header
  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split(',');
    if (parts.length >= 4) {
      const tier = parts[2].trim();
      let dasType = 'NONE';
      
      if (tier === 'DAS Extended') {
        dasType = 'DAS_EXTENDED';
      } else if (tier === 'DAS') {
        dasType = 'DAS';
      } else if (tier === 'DAS Remote') {
        dasType = 'DAS_REMOTE';
      }
      
      records.push({
        zip: parts[0].trim(),
        type: dasType
      });
    }
  }
  
  console.log(`Found ${records.length} ZIP codes`);
  
  // Group by type for summary
  const summary = {};
  records.forEach(r => {
    summary[r.type] = (summary[r.type] || 0) + 1;
  });
  
  console.log('Summary:');
  Object.entries(summary).forEach(([type, count]) => {
    console.log(`  ${type}: ${count}`);
  });
  
  // Create SQL statements in batches
  const batchSize = 200;
  const sqlStatements = [];
  
  for (let i = 0; i < records.length; i += batchSize) {
    const batch = records.slice(i, Math.min(i + batchSize, records.length));
    const values = batch.map(r => `('${r.zip}', '${r.type}')`).join(', ');
    sqlStatements.push(
      `INSERT INTO fedex_das_zips (zip_code, das_type) VALUES ${values} ON CONFLICT (zip_code) DO UPDATE SET das_type = EXCLUDED.das_type`
    );
  }
  
  // Save to file for manual execution
  const sqlPath = path.join(__dirname, 'das_bulk_import.sql');
  const sqlContent = [
    '-- Bulk import of FedEx DAS ZIPs',
    'TRUNCATE TABLE fedex_das_zips;',
    '',
    ...sqlStatements
  ].join(';\n') + ';';
  
  fs.writeFileSync(sqlPath, sqlContent);
  console.log(`\nSQL file created: ${sqlPath}`);
  console.log(`Total statements: ${sqlStatements.length}`);
  
  // Also create a JSON file with all the ZIPs for easier processing
  const jsonPath = path.join(__dirname, '..', 'data', 'das_zips_processed.json');
  fs.writeFileSync(jsonPath, JSON.stringify({
    total: records.length,
    summary,
    zips: records
  }, null, 2));
  console.log(`JSON file created: ${jsonPath}`);
}

bulkImportDAS();