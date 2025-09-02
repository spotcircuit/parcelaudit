#!/usr/bin/env python3
"""
Generate 5 different UPS invoice CSV files for testing
Each with different characteristics and error patterns
"""

import csv
import random
from datetime import datetime, timedelta
import os

def generate_ups_invoice(filename, invoice_date, num_records, error_profile):
    """
    Generate a UPS invoice with specific error characteristics
    
    error_profile: dict with error type weights
    """
    
    with open(filename, 'w', newline='') as csvfile:
        fieldnames = [
            'Invoice_Date', 'Invoice_Number', 'Account_Number', 'Tracking_Number',
            'Service_Type', 'Origin_City', 'Origin_State', 'Origin_Zip',
            'Dest_City', 'Dest_State', 'Dest_Zip', 'Zone',
            'Actual_Weight', 'Billed_Weight', 'Dimensional_Weight',
            'Length', 'Width', 'Height', 'Published_Charge', 'Net_Charge',
            'Residential_Surcharge', 'Address_Correction_Fee', 'Fuel_Surcharge',
            'Peak_Surcharge', 'Large_Package_Surcharge', 'Saturday_Delivery_Fee',
            'On_Time_Delivery', 'Days_In_Transit'
        ]
        
        writer = csv.DictWriter(csvfile, fieldnames=fieldnames)
        writer.writeheader()
        
        invoice_num = f"UPS{datetime.now().strftime('%Y%m')}{random.randint(1000, 9999)}"
        
        for i in range(num_records):
            # Package dimensions
            length = round(random.uniform(6, 48), 1)
            width = round(random.uniform(6, 36), 1)
            height = round(random.uniform(6, 36), 1)
            
            # Weights
            actual_weight = round(random.uniform(0.5, 150), 1)
            dimensional_weight = round((length * width * height) / 139, 1)
            
            # Apply error profile for dimensional weight errors
            if random.random() < error_profile.get('dim_weight_error', 0.1):
                billed_weight = round(max(actual_weight, dimensional_weight) * random.uniform(1.5, 2.5), 1)
            else:
                billed_weight = round(max(actual_weight, dimensional_weight), 1)
            
            # Service types
            service_types = ['GROUND', 'NEXT_DAY_AIR', '2ND_DAY_AIR', '3_DAY_SELECT']
            service = random.choices(service_types, weights=[0.5, 0.2, 0.2, 0.1])[0]
            
            # Calculate base charge
            base_rate = {
                'GROUND': 15,
                'NEXT_DAY_AIR': 85,
                '2ND_DAY_AIR': 45,
                '3_DAY_SELECT': 25
            }
            
            published_charge = round(base_rate[service] + (billed_weight * random.uniform(0.5, 2.5)), 2)
            
            # Surcharges based on error profile
            residential = 1 if random.random() < error_profile.get('residential_rate', 0.3) else 0
            residential_surcharge = 5.20 if residential else 0
            
            # Address correction errors
            address_correction = 18.00 if random.random() < error_profile.get('address_correction_rate', 0.05) else 0
            
            # Fuel surcharge
            fuel_surcharge = round(published_charge * 0.065, 2)
            
            # Peak surcharge (some applied incorrectly)
            month = int(invoice_date.split('-')[1])
            if month in [11, 12, 1] or random.random() < error_profile.get('wrong_peak_rate', 0.02):
                peak_surcharge = 5.95
            else:
                peak_surcharge = 0
            
            # Large package surcharge
            girth = 2 * (width + height)
            large_package_surcharge = 95.00 if (length + girth) > 96 else 0
            
            # Saturday delivery
            saturday_fee = 16.00 if random.random() < 0.1 else 0
            
            # Calculate net charge
            total_surcharges = (residential_surcharge + address_correction + 
                              fuel_surcharge + peak_surcharge + 
                              large_package_surcharge + saturday_fee)
            net_charge = round(published_charge + total_surcharges, 2)
            
            # Delivery performance based on error profile
            if service in ['NEXT_DAY_AIR', '2ND_DAY_AIR']:
                # Higher chance of late delivery for guaranteed services
                on_time = 0 if random.random() < error_profile.get('late_delivery_rate', 0.1) else 1
            else:
                on_time = 0 if random.random() < 0.05 else 1
            
            if service == 'GROUND':
                expected_days = random.choice([3, 4, 5])
            elif service == 'NEXT_DAY_AIR':
                expected_days = 1
            elif service == '2ND_DAY_AIR':
                expected_days = 2
            else:
                expected_days = 3
            
            actual_days = expected_days + (1 if on_time == 0 else 0)
            
            # Write row
            writer.writerow({
                'Invoice_Date': invoice_date,
                'Invoice_Number': invoice_num,
                'Account_Number': '987654321',
                'Tracking_Number': f'1Z999AA10{str(random.randint(100000000, 999999999))}',
                'Service_Type': service,
                'Origin_City': random.choice(['New York', 'Los Angeles', 'Chicago', 'Houston']),
                'Origin_State': random.choice(['NY', 'CA', 'IL', 'TX']),
                'Origin_Zip': random.choice(['10001', '90001', '60601', '77001']),
                'Dest_City': random.choice(['Miami', 'Seattle', 'Boston', 'Denver', 'Phoenix']),
                'Dest_State': random.choice(['FL', 'WA', 'MA', 'CO', 'AZ']),
                'Dest_Zip': random.choice(['33101', '98101', '02101', '80201', '85001']),
                'Zone': random.choice([2, 3, 4, 5, 6, 7, 8]),
                'Actual_Weight': actual_weight,
                'Billed_Weight': billed_weight,
                'Dimensional_Weight': dimensional_weight,
                'Length': length,
                'Width': width,
                'Height': height,
                'Published_Charge': published_charge,
                'Net_Charge': net_charge,
                'Residential_Surcharge': residential_surcharge,
                'Address_Correction_Fee': address_correction,
                'Fuel_Surcharge': fuel_surcharge,
                'Peak_Surcharge': peak_surcharge,
                'Large_Package_Surcharge': large_package_surcharge,
                'Saturday_Delivery_Fee': saturday_fee,
                'On_Time_Delivery': on_time,
                'Days_In_Transit': actual_days
            })
    
    # Calculate summary
    with open(filename, 'r') as f:
        reader = csv.DictReader(f)
        total_charges = sum([float(row['Net_Charge']) for row in reader])
    
    return {
        'filename': filename,
        'invoice_number': invoice_num,
        'date': invoice_date,
        'shipments': num_records,
        'total': total_charges
    }

def main():
    """Generate 5 different UPS invoices with varying characteristics"""
    
    invoices = []
    
    # Invoice 1: High dimensional weight errors
    print("Generating Invoice 1: High dimensional weight errors...")
    invoice1 = generate_ups_invoice(
        'ups_invoice_january_2024.csv',
        '2024-01-15',
        75,
        {
            'dim_weight_error': 0.4,  # 40% have dim weight errors
            'residential_rate': 0.2,
            'address_correction_rate': 0.03,
            'late_delivery_rate': 0.05,
            'wrong_peak_rate': 0.0
        }
    )
    invoices.append(invoice1)
    
    # Invoice 2: Many late deliveries
    print("Generating Invoice 2: High late delivery rate...")
    invoice2 = generate_ups_invoice(
        'ups_invoice_february_2024.csv',
        '2024-02-20',
        120,
        {
            'dim_weight_error': 0.15,
            'residential_rate': 0.25,
            'address_correction_rate': 0.05,
            'late_delivery_rate': 0.35,  # 35% late deliveries
            'wrong_peak_rate': 0.0
        }
    )
    invoices.append(invoice2)
    
    # Invoice 3: Address correction issues
    print("Generating Invoice 3: Many address corrections...")
    invoice3 = generate_ups_invoice(
        'ups_invoice_march_2024.csv',
        '2024-03-10',
        95,
        {
            'dim_weight_error': 0.2,
            'residential_rate': 0.4,  # High residential
            'address_correction_rate': 0.25,  # 25% address corrections
            'late_delivery_rate': 0.1,
            'wrong_peak_rate': 0.0
        }
    )
    invoices.append(invoice3)
    
    # Invoice 4: Off-season peak charges
    print("Generating Invoice 4: Wrong peak season charges...")
    invoice4 = generate_ups_invoice(
        'ups_invoice_april_2024.csv',
        '2024-04-05',
        60,
        {
            'dim_weight_error': 0.25,
            'residential_rate': 0.3,
            'address_correction_rate': 0.08,
            'late_delivery_rate': 0.12,
            'wrong_peak_rate': 0.15  # 15% wrong peak charges in April
        }
    )
    invoices.append(invoice4)
    
    # Invoice 5: Mixed errors (typical invoice)
    print("Generating Invoice 5: Mixed typical errors...")
    invoice5 = generate_ups_invoice(
        'ups_invoice_may_2024.csv',
        '2024-05-18',
        150,
        {
            'dim_weight_error': 0.3,  # 30% dim weight errors
            'residential_rate': 0.35,
            'address_correction_rate': 0.1,
            'late_delivery_rate': 0.15,
            'wrong_peak_rate': 0.03
        }
    )
    invoices.append(invoice5)
    
    # Print summary
    print("\n" + "="*60)
    print("GENERATED 5 UPS INVOICE FILES")
    print("="*60)
    
    total_amount = 0
    total_shipments = 0
    
    for inv in invoices:
        print(f"\n📄 {inv['filename']}")
        print(f"   Invoice #: {inv['invoice_number']}")
        print(f"   Date: {inv['date']}")
        print(f"   Shipments: {inv['shipments']}")
        print(f"   Total: ${inv['total']:,.2f}")
        total_amount += inv['total']
        total_shipments += inv['shipments']
    
    print("\n" + "-"*60)
    print(f"TOTALS: {total_shipments} shipments, ${total_amount:,.2f}")
    print("="*60)
    
    print("\n✅ All files generated successfully!")
    print("\n📤 Upload these files to test the invoice list view:")
    print("   1. ups_invoice_january_2024.csv - Focus: DIM weight errors")
    print("   2. ups_invoice_february_2024.csv - Focus: Late deliveries")
    print("   3. ups_invoice_march_2024.csv - Focus: Address corrections")
    print("   4. ups_invoice_april_2024.csv - Focus: Wrong peak charges")
    print("   5. ups_invoice_may_2024.csv - Focus: Mixed errors")

if __name__ == "__main__":
    main()