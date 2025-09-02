const fs = require('fs');
const { sql } = require('@vercel/postgres');
const csv = require('csv-parse/sync');

async function importDASZips() {
  try {
    // Read the CSV file
    const fileContent = fs.readFileSync('./data/fedex_das_zips_2025_tagged.csv', 'utf-8');
    
    // Parse CSV
    const records = csv.parse(fileContent, {
      columns: true,
      skip_empty_lines: true
    });
    
    console.log(`Found ${records.length} ZIP codes to import`);
    
    // Prepare batch insert values
    const values = [];
    const placeholders = [];
    let paramCount = 1;
    
    for (const record of records) {
      const dasType = record.tier === 'DAS Extended' ? 'DAS_EXTENDED' : 
                      record.tier === 'DAS' ? 'DAS' : 
                      record.tier === 'DAS Remote' ? 'DAS_REMOTE' : 'NONE';
      
      values.push(record.zip, dasType);
      placeholders.push(`($${paramCount}, $${paramCount + 1})`);
      paramCount += 2;
    }
    
    // Insert in batches of 1000
    const batchSize = 1000;
    for (let i = 0; i < placeholders.length; i += batchSize) {
      const batchPlaceholders = placeholders.slice(i, i + batchSize);
      const batchValues = values.slice(i * 2, (i + batchSize) * 2);
      
      const query = `
        INSERT INTO fedex_das_zips (zip_code, das_type) 
        VALUES ${batchPlaceholders.join(', ')}
        ON CONFLICT (zip_code) DO UPDATE SET das_type = EXCLUDED.das_type
      `;
      
      await sql.query(query, batchValues);
      console.log(`Imported batch ${Math.floor(i / batchSize) + 1}`);
    }
    
    // Verify import
    const count = await sql`SELECT COUNT(*) as count FROM fedex_das_zips`;
    console.log(`Successfully imported ${count.rows[0].count} ZIP codes`);
    
  } catch (error) {
    console.error('Error importing DAS ZIPs:', error);
  }
}

// Run if called directly
if (require.main === module) {
  importDASZips();
}

module.exports = { importDASZips };