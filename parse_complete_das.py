import pdfplumber
import re
import json

# Open the PDF
with pdfplumber.open('complete_das_zips_2025.pdf') as pdf:
    # Extract all text
    full_text = ""
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            full_text += text + "\n"
    
    # Initialize categories
    das_categories = {
        'contiguous': [],
        'extended': [],
        'alaska': [],
        'hawaii': []
    }
    
    current_category = None
    
    # Parse text line by line
    lines = full_text.split('\n')
    for i, line in enumerate(lines):
        # Identify sections
        if 'CONTIGUOUS U.S.' in line and 'EXTENDED' not in line:
            current_category = 'contiguous'
            print(f"Found Contiguous section at line {i}")
        elif 'CONTIGUOUS U.S. EXTENDED' in line:
            current_category = 'extended'
            print(f"Found Extended section at line {i}")
        elif 'ALASKA' in line:
            current_category = 'alaska'
            print(f"Found Alaska section at line {i}")
        elif 'HAWAII' in line:
            current_category = 'hawaii'
            print(f"Found Hawaii section at line {i}")
        elif current_category:
            # Extract ZIP codes (5-digit numbers)
            zips = re.findall(r'\b\d{5}\b', line)
            if zips:
                das_categories[current_category].extend(zips)
    
    # Remove duplicates and sort
    for category in das_categories:
        das_categories[category] = sorted(list(set(das_categories[category])))
    
    # Print summary
    print("\n=== COMPLETE DAS ZIP CODES ===")
    print(f"DAS Contiguous: {len(das_categories['contiguous'])} ZIPs")
    print(f"DAS Extended: {len(das_categories['extended'])} ZIPs")
    print(f"DAS Alaska: {len(das_categories['alaska'])} ZIPs")
    print(f"DAS Hawaii: {len(das_categories['hawaii'])} ZIPs")
    print(f"TOTAL: {sum(len(v) for v in das_categories.values())} ZIPs")
    
    # Sample ZIPs
    print("\n=== SAMPLE ZIPS ===")
    print("Contiguous:", das_categories['contiguous'][:10])
    print("Extended:", das_categories['extended'][:10])
    
    # Check if 65244 (MO) is in DAS list - from our invoice
    test_zips = ['65244', '98223', '83716', '96088', '28726']
    print("\n=== CHECKING INVOICE ZIPS ===")
    for zip_code in test_zips:
        found_in = []
        for category, zips in das_categories.items():
            if zip_code in zips:
                found_in.append(category)
        if found_in:
            print(f"{zip_code}: DAS {', '.join(found_in).upper()}")
        else:
            print(f"{zip_code}: NOT IN DAS")
    
    # Save to JSON
    with open('complete_das_zips.json', 'w') as f:
        json.dump(das_categories, f, indent=2)
    
    print("\nSaved to complete_das_zips.json")