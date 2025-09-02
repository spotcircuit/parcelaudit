import pdfplumber

# Open the PDF and examine structure
with pdfplumber.open('complete_das_zips_2025.pdf') as pdf:
    print(f"Total pages: {len(pdf.pages)}")
    
    # Check first few pages
    for i in range(min(3, len(pdf.pages))):
        page = pdf.pages[i]
        text = page.extract_text()
        
        print(f"\n=== PAGE {i+1} ===")
        if text:
            # Show first 1500 chars
            print(text[:1500])
        else:
            print("No text extracted")
        
        # Try extracting tables
        tables = page.extract_tables()
        if tables:
            print(f"\nFound {len(tables)} table(s)")
            for j, table in enumerate(tables):
                print(f"Table {j+1}: {len(table)} rows")
                if table and len(table) > 0:
                    print("First few rows:")
                    for row in table[:5]:
                        print(row)