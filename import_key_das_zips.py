import json

# Load the complete DAS data
with open('complete_das_zips.json', 'r') as f:
    das_data = json.load(f)

# Create sets for faster lookup
das_contiguous = set(das_data['contiguous'])
das_extended = set(das_data['extended'])

# Key ZIP codes from the invoice that have DAS charges
invoice_zips = [
    '65244', '35058', '13320', '70420', '12538',
    '61072', '98382', '10536', '80549', '65243',
    '40626', '36360', '30540', '27253', '75189',
    '54129', '47031', '37184', '36867', '36421',
    '98223', '96088', '95326', '98580'
]

# Generate SQL to import these specific ZIPs with correct classification
sql_statements = []

for zip_code in invoice_zips:
    if zip_code in das_contiguous:
        das_type = 'DAS'
    elif zip_code in das_extended:
        das_type = 'DAS_EXTENDED'
    else:
        das_type = 'NONE'
    
    sql_statements.append(f"('{zip_code}', '{das_type}')")
    print(f"{zip_code}: {das_type}")

# Create single insert statement
insert_sql = "INSERT INTO fedex_das_zips (zip_code, das_type) VALUES " + ", ".join(sql_statements) + " ON CONFLICT (zip_code, das_type) DO NOTHING;"

print(f"\n{insert_sql}")