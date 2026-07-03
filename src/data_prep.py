# src/data_prep.py

import pandas as pd

def compute_rfm(transactions: pd.DataFrame) -> pd.DataFrame:
    """
    Input: transactions DataFrame with columns:
        InvoiceNo, Quantity, InvoiceDate, UnitPrice, CustomerID
    Output: RFM DataFrame indexed by CustomerID with columns:
        Recency, Frequency, Monetary
    """
    df = transactions.copy()

    # Basic cleaning
    df = df.dropna(subset=['CustomerID'])
    df['InvoiceDate'] = pd.to_datetime(df['InvoiceDate'])
    df = df[df['Quantity'] > 0]
    df['TotalAmount'] = df['Quantity'] * df['UnitPrice']

    snapshot_date = df['InvoiceDate'].max() + pd.Timedelta(days=1)

    rfm = df.groupby('CustomerID').agg({
        'InvoiceDate': lambda x: (snapshot_date - x.max()).days,  # Recency
        'InvoiceNo': 'nunique',                                   # Frequency
        'TotalAmount': 'sum'                                      # Monetary
    })

    rfm = rfm.rename(columns={
        'InvoiceDate': 'Recency',
        'InvoiceNo': 'Frequency',
        'TotalAmount': 'Monetary'
    }).round(2)

    # Optional: filter extreme outliers (same as notebook)
    rfm = rfm[(rfm['Recency'] < 365) & (rfm['Frequency'] > 0)]

    return rfm
