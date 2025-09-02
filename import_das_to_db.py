import json
import psycopg2
import os
from datetime import datetime

# Load the DAS ZIP codes
with open('complete_das_zips.json', 'r') as f:
    das_zips = json.load(f)

# Database connection
DATABASE_URL = os.environ.get('DATABASE_URL')

if not DATABASE_URL:
    print("DATABASE_URL not set")
    exit(1)

# Connect to database
conn = psycopg2.connect(DATABASE_URL)
cur = conn.cursor()

try:
    # Clear existing data
    cur.execute("DELETE FROM fedex_das_zips")
    
    # Insert new data
    insert_count = 0
    for category, zips in das_zips.items():
        if category == 'contiguous':
            das_type = 'DAS'
        elif category == 'extended':
            das_type = 'DAS_EXTENDED'
        elif category == 'alaska':
            das_type = 'DAS_ALASKA'
        elif category == 'hawaii':
            das_type = 'DAS_HAWAII'
        else:
            continue
        
        for zip_code in zips:
            cur.execute("""
                INSERT INTO fedex_das_zips (zip_code, das_type, effective_date)
                VALUES (%s, %s, %s)
                ON CONFLICT (zip_code, das_type) DO NOTHING
            """, (zip_code, das_type, '2025-01-13'))
            insert_count += 1
    
    conn.commit()
    print(f"Successfully imported {insert_count} DAS ZIP codes")
    
    # Verify counts
    cur.execute("SELECT das_type, COUNT(*) FROM fedex_das_zips GROUP BY das_type")
    results = cur.fetchall()
    
    print("\n=== DATABASE SUMMARY ===")
    for das_type, count in results:
        print(f"{das_type}: {count} ZIPs")
    
except Exception as e:
    print(f"Error: {e}")
    conn.rollback()
finally:
    cur.close()
    conn.close()