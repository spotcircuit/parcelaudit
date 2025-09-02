import pdfplumber
import re
import json

# Open the PDF
with pdfplumber.open('das_zips_2025.pdf') as pdf:
    full_text = ""
    for page in pdf.pages:
        text = page.extract_text()
        if text:
            full_text += text + "\n"
    
    # Split into sections
    sections = {
        'added_to_contiguous': [],
        'moved_to_extended': [],
        'moved_to_contiguous_from_extended': [],
        'moved_to_remote': [],
        'removed_from_contiguous': [],
        'removed_from_remote': []
    }
    
    current_section = None
    
    for line in full_text.split('\n'):
        # Identify sections
        if 'ADDED TO CONTIGUOUS U.S. LIST' in line:
            current_section = 'added_to_contiguous'
        elif 'MOVED FROM CONTIGUOUS U.S. LIST TO CONTIGUOUS U.S. EXTENDED LIST' in line:
            current_section = 'moved_to_extended'
        elif 'MOVED FROM CONTIGUOUS U.S. EXTENDED LIST TO CONTIGUOUS U.S. LIST' in line:
            current_section = 'moved_to_contiguous_from_extended'
        elif 'MOVED FROM CONTIGUOUS U.S. EXTENDED LIST TO CONTIGUOUS U.S. REMOTE LIST' in line:
            current_section = 'moved_to_remote'
        elif 'REMOVED FROM CONTIGUOUS U.S. LIST' in line:
            current_section = 'removed_from_contiguous'
        elif 'REMOVED FROM CONTIGUOUS U.S. REMOTE LIST' in line:
            current_section = 'removed_from_remote'
        elif 'FedEx reserves' in line or 'Effective' in line:
            current_section = None
        elif current_section:
            # Extract ZIP codes from line
            zips = re.findall(r'\b\d{5}\b', line)
            sections[current_section].extend(zips)
    
    # Remove duplicates and sort
    for key in sections:
        sections[key] = sorted(list(set(sections[key])))
    
    # Print summary
    print("=== DAS ZIP CODE CHANGES SUMMARY ===")
    print(f"Added to Contiguous (DAS): {len(sections['added_to_contiguous'])} ZIPs")
    print(f"Moved to Extended (DAS Extended): {len(sections['moved_to_extended'])} ZIPs") 
    print(f"Moved to Contiguous from Extended: {len(sections['moved_to_contiguous_from_extended'])} ZIPs")
    print(f"Moved to Remote (DAS Remote): {len(sections['moved_to_remote'])} ZIPs")
    print(f"Removed from Contiguous: {len(sections['removed_from_contiguous'])} ZIPs")
    print(f"Removed from Remote: {len(sections['removed_from_remote'])} ZIPs")
    
    # Save to JSON for database import
    with open('das_zips.json', 'w') as f:
        json.dump(sections, f, indent=2)
    
    print("\n=== SAMPLE ZIPS FROM EACH CATEGORY ===")
    print("DAS (Contiguous):", sections['added_to_contiguous'][:10])
    print("DAS Extended:", sections['moved_to_extended'][:10])
    print("DAS Remote:", sections['moved_to_remote'][:10])