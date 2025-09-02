import json

# Load the DAS ZIP codes
with open('complete_das_zips.json', 'r') as f:
    das_zips = json.load(f)

# Generate SQL statements for batch insert
sql_statements = []

# Clear existing data first
sql_statements.append("DELETE FROM fedex_das_zips;")

# Insert Contiguous DAS ZIPs
for zip_code in das_zips['contiguous'][:500]:  # First 500 to avoid timeout
    sql_statements.append(f"INSERT INTO fedex_das_zips (zip_code, das_type) VALUES ('{zip_code}', 'DAS') ON CONFLICT DO NOTHING;")

# Insert Extended DAS ZIPs  
for zip_code in das_zips['extended'][:500]:  # First 500 to avoid timeout
    sql_statements.append(f"INSERT INTO fedex_das_zips (zip_code, das_type) VALUES ('{zip_code}', 'DAS_EXTENDED') ON CONFLICT DO NOTHING;")

# Save to file for execution
with open('das_import.sql', 'w') as f:
    f.write('\n'.join(sql_statements))

print(f"Generated {len(sql_statements)} SQL statements")
print("First 5 statements:")
for stmt in sql_statements[:5]:
    print(stmt)