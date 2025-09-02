"""
UPS Billing CSV Structure Reference
Shows the typical column structure of UPS 250-column billing CSV files
and provides specific examples of common overcharges
"""

import pandas as pd
import numpy as np

# ========================================
# UPS CSV COLUMN STRUCTURE (Key Fields)
# ========================================

# The UPS 250-column CSV has these key columns (positions may vary):
UPS_KEY_COLUMNS = {
    # Account Information
    'col_1': 'Record_Type',           # Always '00001' for detail records
    'col_2': 'Account_Number',        # Your UPS account number
    'col_3': 'Invoice_Number',        # UPS invoice number
    'col_4': 'Invoice_Date',          # YYYYMMDD format
    
    # Shipment Details
    'col_11': 'Lead_Shipment_Number', # Primary tracking number
    'col_12': 'Tracking_Number',      # 1Z tracking number
    'col_16': 'Pickup_Date',          # YYYYMMDD
    'col_17': 'Delivery_Date',        # YYYYMMDD
    'col_19': 'Service_Code',         # GND, 01, 02, 03, etc.
    'col_20': 'Service_Description',  # Ground, Next Day Air, etc.
    
    # Origin Information
    'col_25': 'Shipper_Name',
    'col_26': 'Shipper_Address_1',
    'col_27': 'Shipper_Address_2',
    'col_28': 'Shipper_City',
    'col_29': 'Shipper_State',
    'col_30': 'Shipper_Postal_Code',
    'col_31': 'Shipper_Country',
    
    # Destination Information
    'col_35': 'Receiver_Name',
    'col_36': 'Receiver_Address_1',
    'col_37': 'Receiver_Address_2',
    'col_38': 'Receiver_City',
    'col_39': 'Receiver_State',
    'col_40': 'Receiver_Postal_Code',
    'col_41': 'Receiver_Country',
    
    # Package Details
    'col_45': 'Zone',                 # Shipping zone
    'col_46': 'Packages_Quantity',    # Number of packages
    'col_47': 'Billable_Weight',      # Weight you're charged for
    'col_48': 'Actual_Weight',        # Real package weight
    'col_49': 'Unit_Of_Measure',      # LBS or KGS
    
    # Dimensional Information
    'col_55': 'Length',               # Package length
    'col_56': 'Width',                # Package width
    'col_57': 'Height',               # Package height
    'col_58': 'Dimensional_Weight',   # Calculated dim weight
    
    # Reference Numbers
    'col_65': 'Reference_Number_1',
    'col_66': 'Reference_Number_2',
    'col_67': 'Reference_Number_3',
    
    # Charges - Base
    'col_75': 'Published_Charge',     # List price
    'col_76': 'Incentive_Credit',     # Your discount
    'col_77': 'Net_Charge',          # What you pay
    
    # Surcharges
    'col_80': 'Fuel_Surcharge',
    'col_81': 'Residential_Surcharge',
    'col_82': 'Extended_Area_Surcharge',
    'col_83': 'Delivery_Area_Surcharge',
    'col_84': 'Additional_Handling',
    'col_85': 'Large_Package_Surcharge',
    'col_86': 'Over_Maximum_Limits',
    'col_87': 'Peak_Surcharge',
    'col_88': 'Address_Correction',
    'col_89': 'Adult_Signature_Required',
    'col_90': 'Signature_Required',
    'col_91': 'Delivery_Confirmation',
    'col_92': 'Saturday_Delivery',
    'col_93': 'Early_AM_Delivery',
    'col_94': 'Remote_Area_Surcharge',
    
    # Adjustments
    'col_100': 'Rebill_Indicator',    # Y if this is an adjustment
    'col_101': 'Original_Charge',     # Original amount
    'col_102': 'Adjusted_Charge',     # New amount
    'col_103': 'Adjustment_Reason',   # Why it was adjusted
    
    # Service Guarantees
    'col_110': 'Time_In_Transit',     # Expected days
    'col_111': 'Actual_Delivery_Days', # Actual days
    'col_112': 'Service_Guarantee',   # Met or not
}

# ========================================
# REAL OVERCHARGE EXAMPLES
# ========================================

def create_overcharge_examples():
    """Create DataFrame with real-world overcharge examples"""
    
    examples = [
        {
            'Case': 'Amazon Seller Return',
            'Tracking_Number': '1Z999AA10123456784',
            'Actual_Weight': 3.0,
            'Customer_Entered_Weight': 52.0,
            'Carrier_Audited_Weight': 63.0,
            'Original_Charge': 12.50,
            'Adjusted_Charge': 65.15,
            'Overcharge_Amount': 52.65,
            'Issue': 'Incorrect dimensional weight calculation',
            'Resolution': 'File claim within 15 days'
        },
        {
            'Case': 'eBay Dimensional Disaster',
            'Tracking_Number': '1Z999AA10987654321',
            'Actual_Weight': 2.0,
            'Actual_Dimensions': '6x6x39',
            'UPS_Claimed_Weight': 440.0,
            'UPS_Claimed_Dimensions': '72x54x30',
            'Original_Charge': 45.00,
            'Adjusted_Charge': 1619.00,
            'Overcharge_Amount': 1574.00,
            'Issue': 'Grossly incorrect dimension measurement',
            'Resolution': 'Took 5 weeks to get refund'
        },
        {
            'Case': 'Large Box Adjustment',
            'Tracking_Number': '1Z999AA10456789123',
            'Actual_Weight': 65.0,
            'Dimensional_Weight': 89.0,
            'Original_Quote': 223.00,
            'Final_Charge': 1100.00,
            'Overcharge_Amount': 877.00,
            'Issue': 'Massive adjustment after shipping',
            'Resolution': 'Disputed through eBay'
        },
        {
            'Case': 'Address Correction - Valid Address',
            'Tracking_Number': '1Z999AA10111222333',
            'Service': 'Ground',
            'Base_Charge': 15.75,
            'Address_Correction_Fee': 18.00,
            'Issue': 'Charged correction fee for valid address',
            'Resolution': 'Must prove address was correct'
        },
        {
            'Case': 'Duplicate Billing',
            'Tracking_Number': '1Z999AA10222333444',
            'Invoice_1': 'INV123456',
            'Invoice_2': 'INV123789',
            'Charge_Per_Invoice': 85.50,
            'Total_Charged': 171.00,
            'Overcharge_Amount': 85.50,
            'Issue': 'Same shipment billed twice',
            'Resolution': 'Request credit for duplicate'
        },
        {
            'Case': 'Late Delivery - No Refund',
            'Tracking_Number': '1Z999AA10333444555',
            'Service': 'Next Day Air',
            'Guaranteed_Delivery': '2024-01-15 10:30 AM',
            'Actual_Delivery': '2024-01-16 2:15 PM',
            'Charge': 125.00,
            'Eligible_Refund': 125.00,
            'Issue': 'Service guarantee not met',
            'Resolution': 'Must file within 15 days'
        },
        {
            'Case': 'Residential Surcharge - Commercial Address',
            'Tracking_Number': '1Z999AA10444555666',
            'Delivery_Address': '123 Business Park, Suite 200',
            'Address_Type': 'Commercial',
            'Residential_Surcharge': 5.20,
            'Issue': 'Charged residential for business address',
            'Resolution': 'Prove commercial address'
        },
        {
            'Case': 'Peak Surcharge Off-Season',
            'Tracking_Number': '1Z999AA10555666777',
            'Ship_Date': '2024-03-15',
            'Peak_Season': 'Nov 15 - Jan 15',
            'Peak_Surcharge_Applied': 5.95,
            'Issue': 'Peak charge outside peak season',
            'Resolution': 'Point out date discrepancy'
        }
    ]
    
    return pd.DataFrame(examples)

# ========================================
# DIMENSIONAL WEIGHT CALCULATION
# ========================================

def calculate_dimensional_weight(length, width, height, divisor=139):
    """
    Calculate dimensional weight
    Domestic divisor: 139
    International divisor: 166
    """
    return (length * width * height) / divisor

def identify_dim_weight_errors(df):
    """Identify dimensional weight calculation errors"""
    
    # Calculate what dim weight should be
    df['Calculated_Dim_Weight'] = df.apply(
        lambda row: calculate_dimensional_weight(
            row['Length'], row['Width'], row['Height']
        ), axis=1
    )
    
    # Find discrepancies
    df['Dim_Weight_Error'] = abs(df['Dimensional_Weight'] - df['Calculated_Dim_Weight'])
    df['Dim_Weight_Error_Pct'] = (df['Dim_Weight_Error'] / df['Calculated_Dim_Weight']) * 100
    
    # Flag significant errors (>10% difference)
    df['Potential_Overcharge'] = df['Dim_Weight_Error_Pct'] > 10
    
    return df[df['Potential_Overcharge']]

# ========================================
# COMMON CHARGE CODES TO WATCH
# ========================================

UPS_SURCHARGE_CODES = {
    # These are the codes that appear in the CSV
    '270': 'Additional Handling',
    '271': 'Additional Handling - Length',
    '272': 'Additional Handling - Width',
    '273': 'Additional Handling - Weight',
    '274': 'Additional Handling - Packaging',
    '400': 'Address Correction',
    '401': 'Address Correction - Residential',
    '410': 'Remote Area Surcharge',
    '411': 'Remote Area - Commercial',
    '412': 'Remote Area - Residential',
    '240': 'Large Package Surcharge',
    '241': 'Large Package - Commercial',
    '242': 'Large Package - Residential',
    '199': 'Residential Surcharge',
    '250': 'Over Maximum Limits',
    '251': 'Over Maximum Weight',
    '252': 'Over Maximum Size',
    '375': 'Fuel Surcharge',
    '440': 'Peak/Demand Surcharge',
    '441': 'Peak - Additional Handling',
    '442': 'Peak - Large Package',
    '443': 'Peak - Over Maximum',
    '280': 'Saturday Delivery',
    '281': 'Saturday Pickup',
    '290': 'Early AM Delivery',
    '120': 'Delivery Confirmation',
    '121': 'Signature Required',
    '122': 'Adult Signature Required',
    '430': 'Extended Area Surcharge',
    '431': 'Delivery Area Surcharge - Extended',
    '432': 'Delivery Area Surcharge - Remote'
}

# ========================================
# QUICK AUDIT CHECKLIST
# ========================================

def quick_audit_checklist(csv_file_path):
    """
    Quick checklist for auditing UPS billing CSV
    Returns potential issues to investigate
    """
    
    issues_found = []
    
    # Load the CSV (assuming 250 columns, no headers)
    df = pd.read_csv(csv_file_path, header=None)
    
    # Map columns (you'll need to adjust based on your specific format)
    # This is a simplified example
    
    # 1. Check for duplicates
    tracking_col = 11  # Adjust to your tracking number column
    duplicates = df[df.duplicated(subset=[tracking_col], keep=False)]
    if not duplicates.empty:
        issues_found.append(f"Found {len(duplicates)} duplicate tracking numbers")
    
    # 2. Check dimensional weight vs actual weight
    actual_weight_col = 48
    dim_weight_col = 58
    billed_weight_col = 47
    
    # Find cases where billed weight > both actual and dim weight
    overcharged_weight = df[
        (df[billed_weight_col] > df[actual_weight_col]) & 
        (df[billed_weight_col] > df[dim_weight_col] * 1.1)
    ]
    if not overcharged_weight.empty:
        issues_found.append(f"Found {len(overcharged_weight)} potential weight overcharges")
    
    # 3. Check for address corrections
    addr_correction_col = 88
    addr_corrections = df[df[addr_correction_col] > 0]
    if not addr_corrections.empty:
        issues_found.append(f"Found {len(addr_corrections)} address correction charges to verify")
    
    # 4. Check for late deliveries (compare guaranteed vs actual)
    service_col = 19
    guaranteed_services = ['01', '02', '13', '14']  # Next Day, 2-Day, etc.
    premium_shipments = df[df[service_col].isin(guaranteed_services)]
    
    # Would need to compare dates here
    # This is simplified - you'd calculate actual vs promised delivery
    
    # 5. Check for off-season peak charges
    peak_charge_col = 87
    invoice_date_col = 4
    
    # Convert date and check if peak charges outside Nov-Jan
    df['invoice_month'] = pd.to_datetime(df[invoice_date_col], format='%Y%m%d').dt.month
    invalid_peak = df[(df[peak_charge_col] > 0) & ~df['invoice_month'].isin([11, 12, 1])]
    if not invalid_peak.empty:
        issues_found.append(f"Found {len(invalid_peak)} peak charges outside peak season")
    
    return issues_found

# ========================================
# SAMPLE OUTPUT
# ========================================

def main():
    """Display overcharge examples and structure"""
    
    print("="*70)
    print("UPS BILLING CSV STRUCTURE & OVERCHARGE EXAMPLES")
    print("="*70)
    
    # Show overcharge examples
    examples_df = create_overcharge_examples()
    
    print("\nREAL OVERCHARGE EXAMPLES FROM USERS:")
    print("-"*70)
    
    for idx, row in examples_df.iterrows():
        print(f"\nCase #{idx+1}: {row['Case']}")
        print(f"  Tracking: {row['Tracking_Number']}")
        if 'Overcharge_Amount' in row and pd.notna(row['Overcharge_Amount']):
            print(f"  Overcharge Amount: ${row['Overcharge_Amount']:,.2f}")
        print(f"  Issue: {row['Issue']}")
        print(f"  Resolution: {row['Resolution']}")
    
    print("\n" + "="*70)
    print("COMMON PATTERNS IN OVERCHARGES:")
    print("-"*70)
    print("""
    1. DIMENSIONAL WEIGHT ERRORS (30-40% of overcharges)
       - UPS measures package incorrectly
       - Can result in 2-10x the correct charge
       - Always verify: (L x W x H) / 139 for domestic
    
    2. DUPLICATE CHARGES (5-10% of overcharges)
       - Same tracking number billed multiple times
       - Often across different invoices
       - Easy to catch with tracking number analysis
    
    3. ADDRESS CORRECTIONS ($18 each)
       - Charged even when address is correct
       - Verify against your original shipping data
       - Contest if address was valid
    
    4. LATE DELIVERY REFUNDS (15-20% eligible)
       - Service guarantees not met
       - MUST file within 15 days
       - 100% refund for late guaranteed services
    
    5. RESIDENTIAL SURCHARGES ($5.20 each)
       - Applied to commercial addresses
       - Verify actual delivery location
       - Common with suite/office deliveries
    
    6. PEAK SURCHARGES (varies)
       - Should only apply Nov 15 - Jan 15
       - Check dates on all peak charges
       - Often mistakenly applied year-round
    """)
    
    print("="*70)
    print("KEY CSV COLUMNS TO ANALYZE:")
    print("-"*70)
    
    important_columns = [
        ('Tracking_Number (col 12)', 'Find duplicates'),
        ('Actual_Weight (col 48)', 'Compare to billed weight'),
        ('Billable_Weight (col 47)', 'What you\'re charged for'),
        ('Dimensional_Weight (col 58)', 'Verify calculation'),
        ('Net_Charge (col 77)', 'Your actual cost'),
        ('Address_Correction (col 88)', 'Verify if valid'),
        ('Service_Guarantee (col 112)', 'Check if met'),
        ('Rebill_Indicator (col 100)', 'Shows adjustments')
    ]
    
    for col, description in important_columns:
        print(f"  {col:30} - {description}")
    
    print("\n" + "="*70)
    print("RECOMMENDED ANALYSIS APPROACH:")
    print("-"*70)
    print("""
    1. Load CSV into pandas DataFrame
    2. Check for duplicate tracking numbers
    3. Compare actual vs billed weights
    4. Verify dimensional weight calculations
    5. Check all address correction charges
    6. Identify late deliveries for refunds
    7. Verify residential/commercial classifications
    8. Check peak charges against dates
    9. Calculate total potential refunds
    10. File claims within time limits
    """)

if __name__ == "__main__":
    main()
