import pdfplumber
import re

# Open the PDF
with pdfplumber.open('das_zips_2025.pdf') as pdf:
    full_text = ""
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            full_text += text + "\n"
    
    print("=== EXTRACTED TEXT ===")
    print(full_text[:5000])  # First 5000 chars to see structure
    
    # Look for ZIP code patterns
    zip_pattern = r'\b\d{5}\b'
    zips = re.findall(zip_pattern, full_text)
    
    print("\n=== FOUND ZIP CODES ===")
    print(f"Total ZIPs found: {len(set(zips))}")
    print("Sample ZIPs:", list(set(zips))[:20])