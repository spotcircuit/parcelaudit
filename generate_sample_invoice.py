#!/usr/bin/env python3
"""
Generate a sample UPS invoice CSV file for testing the audit platform
Based on the UPS billing analyzer structure
"""

import csv
import random
from datetime import datetime, timedelta
import os

def generate_ups_invoice_csv(filename='ups_invoice_sample.csv', num_records=100):
    """Generate a realistic UPS invoice CSV file"""
    
    # Set seed for reproducibility
    random.seed(42)
    
    # Generate date range
    end_date = datetime.now()
    start_date = end_date - timedelta(days=30)
    
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
        
        for i in range(num_records):
            # Generate random shipment date
            days_ago = random.randint(0, 30)
            invoice_date = (end_date - timedelta(days=days_ago)).strftime('%Y-%m-%d')
            
            # Package dimensions
            length = round(random.uniform(6, 48), 1)
            width = round(random.uniform(6, 36), 1)
            height = round(random.uniform(6, 36), 1)
            
            # Weights
            actual_weight = round(random.uniform(0.5, 150), 1)
            dimensional_weight = round((length * width * height) / 139, 1)
            
            # Introduce some billing errors (30% of packages)
            if random.random() < 0.3:
                # Dimensional weight error - bill higher than should be
                billed_weight = round(max(actual_weight, dimensional_weight) * random.uniform(1.5, 2.5), 1)
            else:
                billed_weight = round(max(actual_weight, dimensional_weight), 1)
            
            # Service types
            service_types = ['GROUND', 'NEXT_DAY_AIR', '2ND_DAY_AIR', '3_DAY_SELECT']
            service_weights = [0.5, 0.2, 0.2, 0.1]
            service = random.choices(service_types, weights=service_weights)[0]
            
            # Calculate base charge
            base_rate = {
                'GROUND': 15,
                'NEXT_DAY_AIR': 85,
                '2ND_DAY_AIR': 45,
                '3_DAY_SELECT': 25
            }
            
            published_charge = round(base_rate[service] + (billed_weight * random.uniform(0.5, 2.5)), 2)
            
            # Surcharges (introduce some errors)
            residential = random.choice([0, 1])
            residential_surcharge = 5.20 if residential else 0
            
            # Address correction (5% of packages, some invalid)
            address_correction = 18.00 if random.random() < 0.05 else 0
            
            # Fuel surcharge
            fuel_surcharge = round(published_charge * 0.065, 2)
            
            # Peak surcharge (some applied incorrectly outside peak season)
            month = int(invoice_date.split('-')[1])
            if month in [11, 12, 1] or random.random() < 0.03:  # 3% wrong peak charges
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
            
            # Delivery performance
            if service == 'GROUND':
                expected_days = random.choice([3, 4, 5])
            elif service == 'NEXT_DAY_AIR':
                expected_days = 1
            elif service == '2ND_DAY_AIR':
                expected_days = 2
            else:
                expected_days = 3
            
            # 15% late deliveries
            if random.random() < 0.15:
                actual_days = expected_days + random.choice([1, 2])
                on_time = 0
            else:
                actual_days = expected_days
                on_time = 1
            
            # Write row
            writer.writerow({
                'Invoice_Date': invoice_date,
                'Invoice_Number': f'INV{str(random.randint(10000000, 99999999))}',
                'Account_Number': '123456789',
                'Tracking_Number': f'1Z999AA10{str(random.randint(100000000, 999999999))}',
                'Service_Type': service,
                'Origin_City': random.choice(['New York', 'Los Angeles', 'Chicago', 'Houston']),
                'Origin_State': random.choice(['NY', 'CA', 'IL', 'TX']),
                'Origin_Zip': random.choice(['10001', '90001', '60601', '77001']),
                'Dest_City': random.choice(['Miami', 'Seattle', 'Boston', 'Denver']),
                'Dest_State': random.choice(['FL', 'WA', 'MA', 'CO']),
                'Dest_Zip': random.choice(['33101', '98101', '02101', '80201']),
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
    
    print(f"✅ Generated {filename} with {num_records} shipment records")
    print(f"📍 File location: {os.path.abspath(filename)}")
    
    # Calculate some stats
    with open(filename, 'r') as f:
        reader = csv.DictReader(f)
        total_charges = sum([float(row['Net_Charge']) for row in reader])
    print(f"💰 Total invoice amount: ${total_charges:,.2f}")
    print("\n🔍 This file contains intentional billing errors for testing:")
    print("  - 30% have dimensional weight overcharges")
    print("  - 15% have late deliveries (refund eligible)")
    print("  - 5% have address correction fees")
    print("  - 3% have off-season peak charges")
    print("\n📤 Upload this file to test the audit system!")

if __name__ == "__main__":
    # Generate sample invoice
    generate_ups_invoice_csv()
    
    # Also generate a FedEx sample
    print("\n" + "="*50)
    generate_ups_invoice_csv('fedex_billing_sample.csv', 75)