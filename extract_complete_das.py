import pdfplumber
import re
import json

def extract_zips_from_text(text):
    """Extract individual ZIP codes and ranges from text"""
    zips = []
    # Split by commas, newlines, or spaces
    parts = re.split(r'[,\n\s]+', text)
    
    for part in parts:
        part = part.strip()
        if not part:
            continue
            
        # Check if it's a range (e.g., "12345-12350")
        if '-' in part and re.match(r'^\d{5}-\d{5}$', part):
            start, end = part.split('-')
            start_num = int(start)
            end_num = int(end)
            # Add all ZIPs in range
            for num in range(start_num, end_num + 1):
                zips.append(str(num).zfill(5))
        # Single ZIP code
        elif re.match(r'^\d{5}$', part):
            zips.append(part)
    
    return zips

# Categories to collect
categories = {
    'contiguous': [],
    'extended': [],
    'alaska': [],
    'hawaii': []
}

current_category = None

with pdfplumber.open('complete_das_zips_2025.pdf') as pdf:
    for page_num, page in enumerate(pdf.pages):
        # Extract text to identify section
        text = page.extract_text()
        if text:
            if 'Contiguous U.S. Extended' in text or 'Contiguous U.S.: Extended' in text:
                current_category = 'extended'
                print(f"Page {page_num + 1}: Extended section")
            elif 'Alaska' in text and 'ZIP' in text:
                current_category = 'alaska'
                print(f"Page {page_num + 1}: Alaska section")
            elif 'Hawaii' in text and 'ZIP' in text:
                current_category = 'hawaii'
                print(f"Page {page_num + 1}: Hawaii section")
            elif 'Contiguous U.S.' in text and 'Extended' not in text:
                current_category = 'contiguous'
                print(f"Page {page_num + 1}: Contiguous section")
        
        # Extract tables
        tables = page.extract_tables()
        if tables and current_category:
            for table in tables:
                for row in table:
                    for cell in row:
                        if cell:
                            zips = extract_zips_from_text(cell)
                            categories[current_category].extend(zips)

# Remove duplicates and sort
for category in categories:
    categories[category] = sorted(list(set(categories[category])))

# Print summary
print("\n=== COMPLETE DAS ZIP CODES ===")
print(f"DAS Contiguous: {len(categories['contiguous'])} ZIPs")
print(f"DAS Extended: {len(categories['extended'])} ZIPs")
print(f"DAS Alaska: {len(categories['alaska'])} ZIPs") 
print(f"DAS Hawaii: {len(categories['hawaii'])} ZIPs")
print(f"TOTAL: {sum(len(v) for v in categories.values())} ZIPs")

# Check specific ZIPs from invoice
test_zips = ['65244', '98223', '83716', '96088', '28726']
print("\n=== CHECKING INVOICE ZIPS ===")
for zip_code in test_zips:
    found_in = []
    for category, zips in categories.items():
        if zip_code in zips:
            found_in.append(category)
    if found_in:
        print(f"{zip_code}: DAS {', '.join(found_in).upper()}")
    else:
        print(f"{zip_code}: NOT IN DAS")

# Save to JSON
with open('complete_das_zips.json', 'w') as f:
    json.dump(categories, f, indent=2)

print("\nSaved to complete_das_zips.json")