const { neon } = require('@neondatabase/serverless');
const fs = require('fs');
const path = require('path');

async function importAllDAS() {
  const sql = neon(process.env.DATABASE_URL || 'postgresql://neondb_owner:vXy0VnDs1Lra@ep-small-math-a5x5cuy5.us-east-2.aws.neon.tech/neondb?sslmode=require');
  
  // Read the complete data
  const data = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'das_zips_processed.json'), 'utf-8'));
  
  console.log(`Importing ${data.total} ZIP codes...`);
  
  // Clear table
  await sql`TRUNCATE TABLE fedex_das_zips`;
  
  // Import in batches of 100
  const batchSize = 100;
  let imported = 0;
  
  for (let i = 0; i < data.zips.length; i += batchSize) {
    const batch = data.zips.slice(i, Math.min(i + batchSize, data.zips.length));
    
    // Insert batch
    for (const zip of batch) {
      await sql`INSERT INTO fedex_das_zips (zip_code, das_type) VALUES (${zip.zip}, ${zip.type})`;
    }
    
    imported += batch.length;
    if (imported % 1000 === 0) {
      console.log(`Imported ${imported} of ${data.total}...`);
    }
  }
  
  // Verify
  const count = await sql`SELECT COUNT(*) as count FROM fedex_das_zips`;
  console.log(`\nComplete! Imported ${count[0].count} ZIP codes`);
  
  // Check key ZIPs
  const testZips = await sql`
    SELECT * FROM fedex_das_zips 
    WHERE zip_code IN ('76531', '65244', '98223', '28726')
    ORDER BY zip_code
  `;
  
  console.log('\nKey ZIP validations:');
  testZips.forEach(z => {
    console.log(`  ${z.zip_code}: ${z.das_type}`);
  });
}

importAllDAS().catch(console.error);