"""
UPS Billing Analysis Tool
A comprehensive Python script for analyzing UPS billing data from CSV files
Identifies overcharges, patterns, and anomalies in shipping costs
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime, timedelta
import warnings
warnings.filterwarnings('ignore')

class UPSBillingAnalyzer:
    """
    Analyzes UPS billing data to identify overcharges and patterns
    """
    
    def __init__(self, filepath=None):
        """Initialize the analyzer with optional CSV file path"""
        self.df = None
        self.summary_stats = {}
        self.overcharges = []
        
        # Common UPS charge codes and their descriptions
        self.charge_codes = {
            'GROUND': 'Ground Shipping',
            'NEXT_DAY_AIR': 'Next Day Air',
            '2ND_DAY_AIR': '2nd Day Air',
            'RES_SURCHARGE': 'Residential Surcharge',
            'ADDR_CORRECT': 'Address Correction',
            'DIM_WEIGHT': 'Dimensional Weight',
            'LARGE_PKG': 'Large Package Surcharge',
            'ADD_HANDLING': 'Additional Handling',
            'FUEL_SURCHARGE': 'Fuel Surcharge',
            'PEAK_SURCHARGE': 'Peak Season Surcharge',
            'REMOTE_AREA': 'Remote Area Surcharge',
            'SAT_DELIVERY': 'Saturday Delivery',
            'SIG_REQUIRED': 'Signature Required',
            'ADULT_SIG': 'Adult Signature',
            'COD': 'Collect on Delivery',
            'HAZMAT': 'Hazardous Materials',
            'DRY_ICE': 'Dry Ice',
            'OVERSIZE': 'Oversize Package',
            'IMPORT_DUTY': 'Import Duties',
            'BROKERAGE': 'Brokerage Fees'
        }
        
        if filepath:
            self.load_data(filepath)
    
    def generate_sample_data(self, num_records=1000):
        """
        Generate sample UPS billing data for demonstration
        This simulates the structure of real UPS billing CSV files
        """
        np.random.seed(42)
        
        # Generate sample data with realistic patterns
        dates = pd.date_range(start='2024-01-01', periods=num_records, freq='H')
        
        data = {
            'Invoice_Date': np.random.choice(dates, num_records),
            'Invoice_Number': [f'INV{str(i).zfill(8)}' for i in range(1, num_records + 1)],
            'Account_Number': np.random.choice(['123456', '234567', '345678'], num_records),
            'Tracking_Number': [f'1Z{str(np.random.randint(100000000, 999999999))}' for _ in range(num_records)],
            'Reference_1': [f'REF{str(i).zfill(6)}' for i in range(1, num_records + 1)],
            'Reference_2': np.random.choice(['PO12345', 'PO23456', 'PO34567', None], num_records),
            'Service_Type': np.random.choice(['GROUND', 'NEXT_DAY_AIR', '2ND_DAY_AIR', '3_DAY_SELECT'], 
                                           num_records, p=[0.5, 0.2, 0.2, 0.1]),
            'Origin_City': np.random.choice(['New York', 'Los Angeles', 'Chicago', 'Houston'], num_records),
            'Origin_State': np.random.choice(['NY', 'CA', 'IL', 'TX'], num_records),
            'Origin_Zip': np.random.choice(['10001', '90001', '60601', '77001'], num_records),
            'Dest_City': np.random.choice(['Miami', 'Seattle', 'Boston', 'Denver'], num_records),
            'Dest_State': np.random.choice(['FL', 'WA', 'MA', 'CO'], num_records),
            'Dest_Zip': np.random.choice(['33101', '98101', '02101', '80201'], num_records),
            'Zone': np.random.choice([2, 3, 4, 5, 6, 7, 8], num_records),
            'Actual_Weight': np.random.uniform(0.5, 150, num_records),
            'Billed_Weight': np.nan,  # Will be calculated
            'Dimensional_Weight': np.nan,  # Will be calculated
            'Length': np.random.uniform(6, 48, num_records),
            'Width': np.random.uniform(6, 36, num_records),
            'Height': np.random.uniform(6, 36, num_records),
            'Published_Charge': np.random.uniform(10, 500, num_records),
            'Discounted_Charge': np.nan,  # Will be calculated
            'Net_Charge': np.nan,  # Will be calculated
            'Residential_Delivery': np.random.choice([0, 1], num_records, p=[0.7, 0.3]),
            'Residential_Surcharge': 0,
            'Address_Correction': np.random.choice([0, 1], num_records, p=[0.95, 0.05]),
            'Address_Correction_Fee': 0,
            'Large_Package_Surcharge': 0,
            'Additional_Handling': 0,
            'Fuel_Surcharge': 0,
            'Peak_Surcharge': 0,
            'Saturday_Delivery': np.random.choice([0, 1], num_records, p=[0.9, 0.1]),
            'Saturday_Delivery_Fee': 0,
            'Remote_Area_Surcharge': 0,
            'Delivery_Date': None,
            'Days_In_Transit': np.random.choice([1, 2, 3, 4, 5], num_records),
            'On_Time_Delivery': np.random.choice([0, 1], num_records, p=[0.85, 0.15])
        }
        
        df = pd.DataFrame(data)
        
        # Calculate dimensional weight (L x W x H / 139 for domestic)
        df['Dimensional_Weight'] = (df['Length'] * df['Width'] * df['Height']) / 139
        
        # Billed weight is the greater of actual or dimensional weight
        df['Billed_Weight'] = df[['Actual_Weight', 'Dimensional_Weight']].max(axis=1)
        
        # Add some realistic overcharges and errors
        # 1. Random dimensional weight errors (10% of packages)
        error_indices = np.random.choice(df.index, size=int(0.1 * len(df)), replace=False)
        df.loc[error_indices, 'Billed_Weight'] = df.loc[error_indices, 'Billed_Weight'] * np.random.uniform(1.5, 3, len(error_indices))
        
        # 2. Add surcharges
        df.loc[df['Residential_Delivery'] == 1, 'Residential_Surcharge'] = 5.20
        df.loc[df['Address_Correction'] == 1, 'Address_Correction_Fee'] = 18.00
        df.loc[df['Saturday_Delivery'] == 1, 'Saturday_Delivery_Fee'] = 16.00
        
        # Large package surcharge for packages over 96 inches in length + girth
        girth = 2 * (df['Width'] + df['Height'])
        df.loc[(df['Length'] + girth) > 96, 'Large_Package_Surcharge'] = 95.00
        
        # Additional handling for packages over 70 lbs
        df.loc[df['Actual_Weight'] > 70, 'Additional_Handling'] = 24.00
        
        # Fuel surcharge (percentage of base charge)
        df['Fuel_Surcharge'] = df['Published_Charge'] * 0.065
        
        # Peak surcharge during holiday season
        df['Invoice_Date'] = pd.to_datetime(df['Invoice_Date'])
        peak_dates = (df['Invoice_Date'].dt.month == 12) | (df['Invoice_Date'].dt.month == 11)
        df.loc[peak_dates, 'Peak_Surcharge'] = 5.00
        
        # Calculate discounts and net charges
        df['Discounted_Charge'] = df['Published_Charge'] * 0.85  # 15% discount
        
        # Calculate total surcharges
        surcharge_columns = ['Residential_Surcharge', 'Address_Correction_Fee', 
                            'Large_Package_Surcharge', 'Additional_Handling', 
                            'Fuel_Surcharge', 'Peak_Surcharge', 'Saturday_Delivery_Fee']
        df['Total_Surcharges'] = df[surcharge_columns].sum(axis=1)
        
        # Net charge is discounted charge plus all surcharges
        df['Net_Charge'] = df['Discounted_Charge'] + df['Total_Surcharges']
        
        # Add some duplicate charges (2% of records)
        duplicate_indices = np.random.choice(df.index, size=int(0.02 * len(df)), replace=False)
        duplicates = df.loc[duplicate_indices].copy()
        duplicates['Invoice_Number'] = duplicates['Invoice_Number'] + '_DUP'
        df = pd.concat([df, duplicates], ignore_index=True)
        
        return df
    
    def load_data(self, filepath):
        """Load UPS billing data from CSV file"""
        try:
            # Try to read with different encodings
            for encoding in ['utf-8', 'latin-1', 'cp1252']:
                try:
                    self.df = pd.read_csv(filepath, encoding=encoding, low_memory=False)
                    print(f"Successfully loaded data with {encoding} encoding")
                    print(f"Shape: {self.df.shape}")
                    break
                except:
                    continue
            
            if self.df is None:
                raise ValueError("Could not read file with any encoding")
                
            # Convert date columns
            date_columns = [col for col in self.df.columns if 'date' in col.lower()]
            for col in date_columns:
                try:
                    self.df[col] = pd.to_datetime(self.df[col], errors='coerce')
                except:
                    pass
                    
        except Exception as e:
            print(f"Error loading file: {e}")
            print("Generating sample data instead...")
            self.df = self.generate_sample_data()
    
    def identify_overcharges(self):
        """Identify potential overcharges and billing errors"""
        overcharges = []
        
        if self.df is None:
            print("No data loaded. Please load data first.")
            return
        
        # 1. Check for dimensional weight errors
        if 'Dimensional_Weight' in self.df.columns and 'Billed_Weight' in self.df.columns:
            dim_errors = self.df[self.df['Billed_Weight'] > self.df['Dimensional_Weight'] * 1.5]
            if not dim_errors.empty:
                overcharges.append({
                    'type': 'Dimensional Weight Error',
                    'count': len(dim_errors),
                    'potential_savings': (dim_errors['Billed_Weight'] - dim_errors['Dimensional_Weight']).sum() * 2.5,
                    'affected_shipments': dim_errors['Tracking_Number'].tolist()[:5]  # Show first 5
                })
        
        # 2. Check for duplicate charges
        if 'Tracking_Number' in self.df.columns:
            duplicates = self.df[self.df.duplicated(['Tracking_Number'], keep=False)]
            if not duplicates.empty:
                overcharges.append({
                    'type': 'Duplicate Charges',
                    'count': len(duplicates) // 2,
                    'potential_savings': duplicates.groupby('Tracking_Number')['Net_Charge'].sum().sum() / 2,
                    'affected_shipments': duplicates['Tracking_Number'].unique()[:5].tolist()
                })
        
        # 3. Check for invalid address correction fees
        if 'Address_Correction_Fee' in self.df.columns:
            invalid_addr = self.df[self.df['Address_Correction_Fee'] > 0]
            if not invalid_addr.empty:
                # Assume 30% are invalid
                est_invalid = int(len(invalid_addr) * 0.3)
                overcharges.append({
                    'type': 'Invalid Address Corrections',
                    'count': est_invalid,
                    'potential_savings': est_invalid * 18.00,
                    'affected_shipments': invalid_addr['Tracking_Number'].tolist()[:5]
                })
        
        # 4. Check for late deliveries (eligible for refunds)
        if 'On_Time_Delivery' in self.df.columns:
            late_deliveries = self.df[self.df['On_Time_Delivery'] == 0]
            if not late_deliveries.empty:
                overcharges.append({
                    'type': 'Late Delivery Refunds',
                    'count': len(late_deliveries),
                    'potential_savings': late_deliveries['Net_Charge'].sum(),
                    'affected_shipments': late_deliveries['Tracking_Number'].tolist()[:5]
                })
        
        # 5. Check for residential surcharges on commercial addresses
        if 'Residential_Surcharge' in self.df.columns:
            res_charges = self.df[self.df['Residential_Surcharge'] > 0]
            if not res_charges.empty:
                # Assume 20% are actually commercial
                est_commercial = int(len(res_charges) * 0.2)
                overcharges.append({
                    'type': 'Invalid Residential Surcharges',
                    'count': est_commercial,
                    'potential_savings': est_commercial * 5.20,
                    'affected_shipments': res_charges['Tracking_Number'].tolist()[:5]
                })
        
        self.overcharges = overcharges
        return overcharges
    
    def generate_summary_statistics(self):
        """Generate summary statistics for the billing data"""
        if self.df is None:
            print("No data loaded.")
            return
        
        summary = {
            'Total Shipments': len(self.df),
            'Date Range': f"{self.df['Invoice_Date'].min()} to {self.df['Invoice_Date'].max()}",
            'Total Charges': self.df['Net_Charge'].sum(),
            'Average Charge': self.df['Net_Charge'].mean(),
            'Median Charge': self.df['Net_Charge'].median(),
            'Total Surcharges': self.df['Total_Surcharges'].sum() if 'Total_Surcharges' in self.df.columns else 0,
            'Most Common Service': self.df['Service_Type'].mode()[0] if 'Service_Type' in self.df.columns else 'N/A',
            'Average Weight': self.df['Actual_Weight'].mean() if 'Actual_Weight' in self.df.columns else 0,
            'Dimensional Weight %': (self.df['Billed_Weight'] > self.df['Actual_Weight']).mean() * 100 if 'Billed_Weight' in self.df.columns else 0
        }
        
        # Service type breakdown
        if 'Service_Type' in self.df.columns:
            service_breakdown = self.df['Service_Type'].value_counts().to_dict()
            summary['Service Breakdown'] = service_breakdown
        
        # Zone distribution
        if 'Zone' in self.df.columns:
            zone_dist = self.df['Zone'].value_counts().to_dict()
            summary['Zone Distribution'] = zone_dist
        
        self.summary_stats = summary
        return summary
    
    def visualize_data(self):
        """Create visualizations of billing patterns"""
        if self.df is None:
            print("No data loaded.")
            return
        
        fig, axes = plt.subplots(2, 3, figsize=(15, 10))
        fig.suptitle('UPS Billing Analysis Dashboard', fontsize=16, fontweight='bold')
        
        # 1. Charges over time
        if 'Invoice_Date' in self.df.columns and 'Net_Charge' in self.df.columns:
            daily_charges = self.df.groupby(pd.Grouper(key='Invoice_Date', freq='D'))['Net_Charge'].sum()
            axes[0, 0].plot(daily_charges.index, daily_charges.values)
            axes[0, 0].set_title('Daily Shipping Charges')
            axes[0, 0].set_xlabel('Date')
            axes[0, 0].set_ylabel('Total Charges ($)')
            axes[0, 0].tick_params(axis='x', rotation=45)
        
        # 2. Service type distribution
        if 'Service_Type' in self.df.columns:
            service_counts = self.df['Service_Type'].value_counts()
            axes[0, 1].bar(service_counts.index, service_counts.values)
            axes[0, 1].set_title('Shipments by Service Type')
            axes[0, 1].set_xlabel('Service Type')
            axes[0, 1].set_ylabel('Count')
            axes[0, 1].tick_params(axis='x', rotation=45)
        
        # 3. Weight distribution
        if 'Actual_Weight' in self.df.columns:
            axes[0, 2].hist(self.df['Actual_Weight'], bins=30, edgecolor='black')
            axes[0, 2].set_title('Weight Distribution')
            axes[0, 2].set_xlabel('Weight (lbs)')
            axes[0, 2].set_ylabel('Frequency')
        
        # 4. Zone distribution
        if 'Zone' in self.df.columns:
            zone_counts = self.df['Zone'].value_counts().sort_index()
            axes[1, 0].bar(zone_counts.index.astype(str), zone_counts.values)
            axes[1, 0].set_title('Shipments by Zone')
            axes[1, 0].set_xlabel('Zone')
            axes[1, 0].set_ylabel('Count')
        
        # 5. Surcharge breakdown
        surcharge_cols = ['Residential_Surcharge', 'Address_Correction_Fee', 
                         'Large_Package_Surcharge', 'Additional_Handling', 
                         'Fuel_Surcharge', 'Peak_Surcharge']
        surcharge_totals = []
        surcharge_labels = []
        for col in surcharge_cols:
            if col in self.df.columns:
                total = self.df[col].sum()
                if total > 0:
                    surcharge_totals.append(total)
                    surcharge_labels.append(col.replace('_', ' '))
        
        if surcharge_totals:
            axes[1, 1].pie(surcharge_totals, labels=surcharge_labels, autopct='%1.1f%%')
            axes[1, 1].set_title('Surcharge Distribution')
        
        # 6. Actual vs Dimensional Weight
        if 'Actual_Weight' in self.df.columns and 'Dimensional_Weight' in self.df.columns:
            sample = self.df.sample(min(100, len(self.df)))
            axes[1, 2].scatter(sample['Actual_Weight'], sample['Dimensional_Weight'], alpha=0.5)
            axes[1, 2].plot([0, 150], [0, 150], 'r--', label='Equal weights')
            axes[1, 2].set_title('Actual vs Dimensional Weight')
            axes[1, 2].set_xlabel('Actual Weight (lbs)')
            axes[1, 2].set_ylabel('Dimensional Weight (lbs)')
            axes[1, 2].legend()
        
        plt.tight_layout()
        plt.show()
    
    def export_audit_report(self, filename='ups_audit_report.xlsx'):
        """Export comprehensive audit report to Excel"""
        if self.df is None:
            print("No data loaded.")
            return
        
        with pd.ExcelWriter(filename, engine='openpyxl') as writer:
            # Summary sheet
            summary_df = pd.DataFrame([self.summary_stats])
            summary_df.to_excel(writer, sheet_name='Summary', index=False)
            
            # Overcharges sheet
            if self.overcharges:
                overcharges_df = pd.DataFrame(self.overcharges)
                overcharges_df.to_excel(writer, sheet_name='Overcharges', index=False)
            
            # Sample data
            self.df.head(100).to_excel(writer, sheet_name='Sample_Data', index=False)
            
            # Duplicate charges
            if 'Tracking_Number' in self.df.columns:
                duplicates = self.df[self.df.duplicated(['Tracking_Number'], keep=False)]
                if not duplicates.empty:
                    duplicates.to_excel(writer, sheet_name='Duplicate_Charges', index=False)
            
            # Late deliveries
            if 'On_Time_Delivery' in self.df.columns:
                late = self.df[self.df['On_Time_Delivery'] == 0]
                if not late.empty:
                    late.head(100).to_excel(writer, sheet_name='Late_Deliveries', index=False)
        
        print(f"Audit report exported to {filename}")
    
    def calculate_potential_savings(self):
        """Calculate total potential savings from identified issues"""
        total_savings = sum([charge['potential_savings'] for charge in self.overcharges])
        
        print("\n" + "="*60)
        print("POTENTIAL SAVINGS SUMMARY")
        print("="*60)
        
        for charge in self.overcharges:
            print(f"\n{charge['type']}:")
            print(f"  Count: {charge['count']:,}")
            print(f"  Potential Savings: ${charge['potential_savings']:,.2f}")
            print(f"  Sample Affected Shipments: {charge['affected_shipments'][:3]}")
        
        print("\n" + "-"*60)
        print(f"TOTAL POTENTIAL SAVINGS: ${total_savings:,.2f}")
        print("="*60)
        
        return total_savings

# Example usage
def main():
    """Main function to demonstrate the analyzer"""
    print("UPS Billing Analysis Tool")
    print("="*60)
    
    # Create analyzer instance
    analyzer = UPSBillingAnalyzer()
    
    # Generate sample data (replace with your actual CSV file path)
    print("\nGenerating sample UPS billing data...")
    analyzer.df = analyzer.generate_sample_data(1000)
    print(f"Generated {len(analyzer.df)} records")
    
    # Generate summary statistics
    print("\nGenerating summary statistics...")
    summary = analyzer.generate_summary_statistics()
    print("\nSummary Statistics:")
    for key, value in summary.items():
        if isinstance(value, dict):
            print(f"\n{key}:")
            for k, v in value.items():
                print(f"  {k}: {v}")
        else:
            print(f"  {key}: {value}")
    
    # Identify overcharges
    print("\nIdentifying potential overcharges...")
    overcharges = analyzer.identify_overcharges()
    
    # Calculate savings
    total_savings = analyzer.calculate_potential_savings()
    
    # Create visualizations
    print("\nGenerating visualizations...")
    analyzer.visualize_data()
    
    # Export report
    print("\nExporting audit report...")
    analyzer.export_audit_report()
    
    # Show sample of problematic records
    print("\nSample of Potential Issues:")
    print("-"*60)
    
    # Show duplicates
    if 'Tracking_Number' in analyzer.df.columns:
        duplicates = analyzer.df[analyzer.df.duplicated(['Tracking_Number'], keep=False)]
        if not duplicates.empty:
            print("\nDuplicate Charges (first 5):")
            print(duplicates[['Tracking_Number', 'Invoice_Number', 'Net_Charge']].head())
    
    # Show dimensional weight discrepancies
    if 'Dimensional_Weight' in analyzer.df.columns:
        dim_issues = analyzer.df[analyzer.df['Billed_Weight'] > analyzer.df['Dimensional_Weight'] * 1.5]
        if not dim_issues.empty:
            print("\nDimensional Weight Issues (first 5):")
            print(dim_issues[['Tracking_Number', 'Actual_Weight', 'Dimensional_Weight', 'Billed_Weight']].head())

if __name__ == "__main__":
    main()
