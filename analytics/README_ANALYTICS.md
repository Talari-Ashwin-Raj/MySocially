# Marketing Spend Analytics

This module handles the data ingestion, cleaning, and analysis of multi-channel marketing spend data.

## Features

- **Data Cleaning**: Handles missing values and ensures correct data types for financial metrics.
- **KPI Engine**: Calculates core marketing performance indicators:
    - **CTR**: Click-Through Rate
    - **CPC**: Cost Per Click
    - **ROAS**: Return on Ad Spend
    - **CPA**: Cost Per Acquisition
    - **CVR**: Conversion Rate
- **Aggregations**: Summarizes data by marketing channel and monthly trends.
- **Data-Driven Insights**: Automatically identifies top-performing and underperforming campaigns.

## Requirements

- Python 3.8+
- Pandas

## How to Run

1. Ensure `marketing_spend_data.csv` is in the root directory.
2. Navigate to the `analytics` directory:
   ```bash
   cd analytics
   ```
3. Run the script:
   ```bash
   python3 spend_analysis.py
   ```
4. Find the results in `summary_data.json`.

## Technical Approach

- **Data Loading**: Used Pandas for efficient CSV parsing and vectorised KPI calculations.
- **Handling Zeroes**: Implemented safety checks for division by zero to prevent script crashes on inactive campaigns.
- **Aggregations**: Multi-level grouping (Channel -> Campaign) ensures granularity for both high-level dashboards and detailed campaign audits.
