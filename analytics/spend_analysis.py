import pandas as pd
import json
import os
from datetime import datetime

class MarketingAnalytics:
    def __init__(self, file_path):
        self.file_path = file_path
        self.df = None
        self.summary = {}

    def load_and_clean_data(self):
        """Loads the marketing data and performs initial cleaning."""
        print(f"Loading data from {self.file_path}...")
        
        # Load the CSV
        self.df = pd.read_csv(self.file_path)
        
        # Handle missing values - for this dataset, we'll fill with 0 for metrics 
        # and 'N/A' for categorical to ensure calculations don't break
        numeric_cols = ['spend', 'impressions', 'clicks', 'conversions', 'revenue']
        for col in numeric_cols:
            self.df[col] = pd.to_numeric(self.df[col], errors='coerce').fillna(0)
            
        # Ensure channel and campaign names are strings and handle NaNs
        self.df['channel'] = self.df['channel'].fillna('Unknown').astype(str)
        self.df['campaign_name'] = self.df['campaign_name'].fillna('Unnamed').astype(str)

        # Convert date and add week_number
        self.df['date'] = pd.to_datetime(self.df['date'])
        self.df['week_number'] = self.df['date'].dt.strftime('%Y-%W')
        self.df['month'] = self.df['date'].dt.strftime('%Y-%m')

        print("Data cleaning complete. Adding KPI calculations...")
        self._calculate_kpis()

    def _calculate_kpis(self):
        """Internal method to calculate core KPIs."""
        # CTR: (Clicks / Impressions) * 100
        self.df['ctr'] = (self.df['clicks'] / self.df['impressions'].replace(0, float('inf'))) * 100
        
        # CPC: Spend / Clicks
        self.df['cpc'] = self.df['spend'] / self.df['clicks'].replace(0, float('inf'))
        
        # ROAS: Revenue / Spend
        self.df['roas'] = self.df['revenue'] / self.df['spend'].replace(0, float('inf'))
        
        # CPA: Spend / Conversions
        self.df['cpa'] = self.df['spend'] / self.df['conversions'].replace(0, float('inf'))
        
        # CVR: (Conversions / Clicks) * 100
        self.df['cvr'] = (self.df['conversions'] / self.df['clicks'].replace(0, float('inf'))) * 100

        # Replace inf with 0 for cleaner output
        for col in ['ctr', 'cpc', 'roas', 'cpa', 'cvr']:
            self.df[col] = self.df[col].replace([float('inf'), -float('inf')], 0)

    def summarize_by_channel(self):
        """Groups results by channel and sorts by ROAS descending."""
        channel_summary = self.df.groupby('channel').agg({
            'spend': 'sum',
            'impressions': 'sum',
            'clicks': 'sum',
            'conversions': 'sum',
            'revenue': 'sum'
        }).reset_index()

        # Re-calculate KPIs for grouped data
        channel_summary['ctr'] = (channel_summary['clicks'] / channel_summary['impressions']).fillna(0) * 100
        channel_summary['cpc'] = (channel_summary['spend'] / channel_summary['clicks']).replace([float('inf'), -float('inf')], 0).fillna(0)
        channel_summary['roas'] = (channel_summary['revenue'] / channel_summary['spend']).replace([float('inf'), -float('inf')], 0).fillna(0)
        channel_summary['cpa'] = (channel_summary['spend'] / channel_summary['conversions']).replace([float('inf'), -float('inf')], 0).fillna(0)
        channel_summary['cvr'] = (channel_summary['conversions'] / channel_summary['clicks']).fillna(0) * 100

        self.summary['channels'] = channel_summary.sort_values(by='roas', ascending=False).to_dict(orient='records')
        return channel_summary

    def summarize_by_month(self):
        """Generates monthly trends for spend, revenue, and conversions."""
        monthly_summary = self.df.groupby('month').agg({
            'spend': 'sum',
            'revenue': 'sum',
            'conversions': 'sum'
        }).reset_index()
        
        self.summary['monthly_performance'] = monthly_summary.sort_values(by='month').to_dict(orient='records')
        return monthly_summary

    def summarize_campaigns(self):
        """Helper to get campaign level metrics for seeding."""
        campaign_summary = self.df.groupby(['channel', 'campaign_name']).agg({
            'spend': 'sum',
            'impressions': 'sum',
            'clicks': 'sum',
            'conversions': 'sum',
            'revenue': 'sum'
        }).reset_index()

        # Re-calculate ROAS and CPA for campaigns
        campaign_summary['roas'] = (campaign_summary['revenue'] / campaign_summary['spend']).replace([float('inf'), -float('inf')], 0).fillna(0)
        campaign_summary['cpa'] = (campaign_summary['spend'] / campaign_summary['conversions']).replace([float('inf'), -float('inf')], 0).fillna(0)

        self.summary['campaigns'] = campaign_summary.to_dict(orient='records')
        return campaign_summary

    def generate_insights(self):
        """Generates bullet points recommending scaling or pausing specific campaigns."""
        insights = []
        
        # 1. Best Performing Channel by ROAS
        best_channel = self.summary['channels'][0]
        insights.append(f"Scale {best_channel['channel']}: Currently the highest-performing channel with a ROAS of {best_channel['roas']:.2f}.")

        # 2. Channel with Lowest Efficiency
        worst_channel = self.summary['channels'][-1]
        insights.append(f"Re-evaluate {worst_channel['channel']}: Lowest efficiency with a ROAS of {worst_channel['roas']:.2f}. Consider reallocating budget.")

        # 3. High Efficiency Campaign (Micro Management)
        campaign_df = pd.DataFrame(self.summary['campaigns'])
        top_campaign = campaign_df[campaign_df['spend'] > 1000].sort_values(by='roas', ascending=False).iloc[0]
        insights.append(f"Star Campaign: '{top_campaign['campaign_name']}' in {top_campaign['channel']} is over-performing. Increase budget for this specific campaign.")

        # 4. Low CVR Warning
        campaign_df['cvr'] = (campaign_df['conversions'] / campaign_df['clicks']).fillna(0) * 100
        low_cvr = campaign_df[campaign_df['clicks'] > 500].sort_values(by='cvr').iloc[0]
        insights.append(f"Performance Alert: '{low_cvr['campaign_name']}' has high traffic but low conversion rate ({low_cvr['cvr']:.2f}%). Audit the landing page.")

        # 5. Month-over-Month Growth (simple check)
        monthly_df = pd.DataFrame(self.summary['monthly_performance'])
        if len(monthly_df) >= 2:
            last_month = monthly_df.iloc[-1]
            prev_month = monthly_df.iloc[-2]
            revenue_growth = ((last_month['revenue'] - prev_month['revenue']) / prev_month['revenue']) * 100
            trend = "upward" if revenue_growth > 0 else "downward"
            insights.append(f"Overall Trend: Revenue is on a {trend} trend ({revenue_growth:+.1f}% vs previous month).")

        # 6. High CPA Issue
        high_cpa = campaign_df[campaign_df['conversions'] > 10].sort_values(by='cpa', ascending=False).iloc[0]
        insights.append(f"Cost Audit: '{high_cpa['campaign_name']}' has an unusually high CPA of ${high_cpa['cpa']:.2f}. Optimize targeting to lower acquisition costs.")

        self.summary['insights'] = insights
        return insights

    def export_summary(self, output_file):
        """Saves the combined summary data to a JSON file."""
        # Add a high-level summary object
        self.summary['total_metrics'] = {
            'total_spend': self.df['spend'].sum(),
            'total_revenue': self.df['revenue'].sum(),
            'total_conversions': int(self.df['conversions'].sum()),
            'overall_roas': self.df['revenue'].sum() / self.df['spend'].sum() if self.df['spend'].sum() > 0 else 0
        }
        
        with open(output_file, 'w') as f:
            json.dump(self.summary, f, indent=4)
        print(f"Summary successfully exported to {output_file}")

if __name__ == "__main__":
    DATA_PATH = '../marketing_spend_data.csv'
    OUTPUT_PATH = 'summary_data.json'
    
    analytics = MarketingAnalytics(DATA_PATH)
    analytics.load_and_clean_data()
    
    analytics.summarize_by_channel()
    analytics.summarize_by_month()
    analytics.summarize_campaigns()
    analytics.generate_insights()
    
    analytics.export_summary(OUTPUT_PATH)
