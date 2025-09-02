import csv
import json

# Read the CSV file
records = []
with open('data/fedex_das_zips_2025_tagged.csv', 'r') as file:
    reader = csv.DictReader(file)
    for row in reader:
        # Map tier to das_type
        das_type = 'NONE'
        if row['tier'] == 'DAS Extended':
            das_type = 'DAS_EXTENDED'
        elif row['tier'] == 'DAS':
            das_type = 'DAS'
        elif row['tier'] == 'DAS Remote':
            das_type = 'DAS_REMOTE'
        
        records.append({
            'zip': row['zip'],
            'type': das_type
        })

# Group by type for summary
summary = {}
for record in records:
    if record['type'] not in summary:
        summary[record['type']] = []
    summary[record['type']].append(record['zip'])

print(f"Total ZIP codes: {len(records)}")
for das_type, zips in summary.items():
    print(f"  {das_type}: {len(zips)} ZIPs")

# Generate SQL insert statements in batches
batch_size = 500
with open('scripts/das_import.sql', 'w') as sql_file:
    sql_file.write("-- Clear existing data\n")
    sql_file.write("TRUNCATE TABLE fedex_das_zips;\n\n")
    
    sql_file.write("-- Insert new data\n")
    for i in range(0, len(records), batch_size):
        batch = records[i:i+batch_size]
        sql_file.write("INSERT INTO fedex_das_zips (zip_code, das_type) VALUES\n")
        values = []
        for record in batch:
            values.append(f"  ('{record['zip']}', '{record['type']}')")
        sql_file.write(",\n".join(values))
        sql_file.write("\nON CONFLICT (zip_code) DO UPDATE SET das_type = EXCLUDED.das_type;\n\n")

print(f"\nSQL file generated: scripts/das_import.sql")
print("You can now run this SQL file to import all DAS ZIPs")