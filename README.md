# Customer Segmentation using RFM Analysis and K-Means Clustering

## Overview

This project performs customer segmentation on online retail transaction data using **RFM Analysis** and **K-Means Clustering**. The goal is to group customers based on their purchasing behavior and help businesses identify high-value customers, at-risk customers, regular customers, inactive customers, and new customers.

The project includes:
- Data preprocessing from raw retail transactions
- RFM feature generation
- Customer clustering using K-Means
- Backend API using FastAPI
- Frontend dashboard for predictions
- Tableau dashboard for interactive business visualization
## Tableau Dashboard

Live Dashboard: [View on Tableau Public](https://public.tableau.com/shared/RSKG48GG8?:display_count=n&:origin=viz_share_link)
---

## Problem Statement

Businesses often have large transaction datasets but do not know which customers are most valuable, which customers are about to churn, and which customers need re-engagement.  
This project solves that problem by segmenting customers based on:

- **Recency** – How recently the customer purchased
- **Frequency** – How often the customer purchased
- **Monetary** – How much the customer spent

Using these three features, the project creates meaningful customer groups for better business decision-making.

---

## Objectives

- Convert raw transaction data into RFM format
- Identify different customer segments using clustering
- Build a machine learning pipeline for customer segmentation
- Provide API-based prediction support
- Visualize customer insights in an interactive dashboard
- Help businesses take targeted actions for each customer segment

---

## Dataset Used

- **Dataset Name:** Online Retail Dataset
- **File Name Used:** `online_retail_10_11.csv`
- **Source:** UCI Machine Learning Repository / Kaggle
- **Domain:** UK-based online retail transactions

### Dataset Features

| Column | Description |
|--------|-------------|
| InvoiceNo | Unique invoice number |
| StockCode | Product/item code |
| Description | Product description |
| Quantity | Number of items purchased |
| InvoiceDate | Date and time of purchase |
| UnitPrice | Price of one unit |
| CustomerID | Unique customer identifier |
| Country | Customer country |

---

## Why This Dataset?

This dataset was selected because:
- It is a real-world transactional dataset
- It contains all required fields for RFM analysis
- It is widely used in academic and machine learning projects
- It has a large number of records, making clustering meaningful
- It supports both customer behavior analysis and business visualization

---

## Data Preprocessing

The raw dataset was cleaned before applying RFM analysis.

### Preprocessing Steps

1. Removed rows with missing `CustomerID`
2. Removed cancelled transactions (`InvoiceNo` starting with `C`)
3. Converted `InvoiceDate` to datetime format
4. Created a new column:
   - `TotalPrice = Quantity × UnitPrice`
5. Selected a snapshot date:
   - Latest purchase date + 1 day
6. Grouped data by `CustomerID`

---

## RFM Feature Engineering

For each customer, the following features were calculated:

- **Recency** = Number of days since the last purchase
- **Frequency** = Number of unique invoices/orders
- **Monetary** = Total amount spent by the customer

Additional columns added for dashboard analysis:
- **LastPurchaseDate**
- **Country**

---

## Sample RFM Logic

```python
rfm = df.groupby('CustomerID').agg(
    Recency=('InvoiceDate', lambda x: (snapshot_date - pd.to_datetime(x).max()).days),
    Frequency=('InvoiceNo', 'nunique'),
    Monetary=('TotalPrice', 'sum'),
    LastPurchaseDate=('InvoiceDate', 'max'),
    Country=('Country', lambda x: x.mode())
).reset_index()
```

---

## Machine Learning Approach

### Algorithm Used
- **K-Means Clustering**

### Why K-Means?
K-Means was chosen because:
- It is an **unsupervised learning** algorithm
- No labeled output data was available
- It is simple, efficient, and widely used for segmentation tasks
- It works well for clustering customers based on numerical behavior patterns

### Why Not Decision Tree or SVM?
Decision Tree and SVM are supervised learning algorithms and require labeled training data.  
Since customer segments were not predefined, K-Means was the appropriate choice.

---

## Feature Scaling

Before clustering, RFM values were standardized using **StandardScaler**.

### Why Scaling Was Needed
Recency, Frequency, and Monetary are on very different scales.  
Without scaling, Monetary would dominate the clustering process.

---

## Choosing the Number of Clusters

The optimal number of clusters was selected using the **Elbow Method**.

### Elbow Method
The model was tested for multiple values of `K`, and the point where inertia started decreasing more slowly was selected as the best cluster count.

---

## Customer Segments

The clustered customers were mapped into meaningful business labels such as:

- Loyal High-Value
- At-Risk VIP
- Regular
- New Customers
- Lost / Inactive

These labels help convert raw ML cluster output into understandable business categories.

---

## Tech Stack

### Programming and ML
- Python
- Pandas
- NumPy
- Scikit-learn
- Matplotlib / Seaborn

### Backend
- FastAPI
- Uvicorn
- Pydantic

### Frontend
- React.js
- Recharts
- HTML
- CSS
- JavaScript

### Visualization
- Tableau Public

---

## Project Workflow

1. Load raw retail transaction dataset
2. Clean the dataset
3. Generate RFM features
4. Scale RFM values
5. Train K-Means clustering model
6. Assign segment labels
7. Save processed dataset
8. Serve predictions through FastAPI
9. Show results in React frontend
10. Visualize insights in Tableau dashboard

---

## System Architecture

### 1. Raw Data Layer
The project starts with the `online_retail_10_11.csv` dataset containing transaction records.

### 2. Processing Layer
Python scripts clean the data and convert raw transactions into customer-level RFM records.

### 3. Machine Learning Layer
K-Means clustering segments customers into groups based on RFM behavior.

### 4. Backend Layer
FastAPI exposes endpoints for prediction and processing.

### 5. Frontend Layer
React frontend allows users to upload CSV files and view segmentation results.

### 6. Dashboard Layer
Tableau provides interactive visual analytics for business users.

---

## FastAPI Functionality

The backend was developed using FastAPI to make the model accessible as an API.

### Features of FastAPI in This Project
- Handles CSV uploads
- Accepts RFM input for prediction
- Processes raw transaction files
- Returns customer segments
- Generates API documentation automatically using `/docs`

### Why FastAPI?
- Fast performance
- Easy request validation
- Automatic Swagger documentation
- Suitable for machine learning model deployment

---

## Frontend Functionality

The React frontend provides:
- Mode selection
- CSV upload interface
- Live prediction results
- Segment distribution charts
- Customer-level output display

---

## Tableau Dashboard Features

The Tableau dashboard was designed to make the project more interactive and business-friendly.

### Dashboard Components
- KPI cards for total customers, total revenue, and average value
- Customer count by segment
- Average revenue by segment
- Treemap for revenue distribution
- Customer detail drill-down
- Country map
- Date and country filters

### Interactivity Added
- Filter by month/year
- Filter by country
- Click on treemap to drill down into customer details
- Use country map as an interactive geographic filter
- Cross-chart filtering for better analysis

---

## Business Use Cases

This project can help businesses:
- Identify top customers for loyalty programs
- Detect at-risk high-value customers
- Create personalized marketing campaigns
- Reduce churn
- Improve retention strategies
- Analyze customer behavior country-wise and time-wise

---

## Expected Outcomes

- Better understanding of customer groups
- Data-driven customer targeting
- Improved retention and revenue planning
- Easier visualization of customer value distribution
- Better business decisions through segmentation

---

## Limitations

- K-Means assumes spherical clusters
- Segmentation is only based on RFM features
- No demographic or product-category features are included
- Performance depends on quality of transaction data
- Model may need retraining as customer behavior changes over time

---

## Future Enhancements

- Add churn prediction model
- Add Customer Lifetime Value (CLV) scoring
- Support dynamic column mapping for any input CSV
- Add more advanced dashboard analytics
- Deploy the project online
- Improve real-time interactivity between frontend and analytics layer

---

## How to Run the Project

### 1. Clone the repository

```bash
git clone https://github.com/your-username/your-repository-name.git
cd your-repository-name
```

### 2. Create virtual environment

```bash
python -m venv venv
```

### 3. Activate virtual environment

#### Windows
```bash
venv\Scripts\activate
```

#### Mac/Linux
```bash
source venv/bin/activate
```

### 4. Install dependencies

```bash
pip install -r requirements.txt
```

### 5. Run FastAPI server

```bash
uvicorn main:app --reload
```

### 6. Open API docs

Visit:
```bash
http://127.0.0.1:8000/docs
```

### 7. Run Frontend

```bash
npm install
npm start
```

---

## Project Structure

```bash
Customer-Segmentation-Project/
│
├── data/
│   └── online_retail_10_11.csv
│
├── notebooks/
│   └── rfm_analysis.ipynb
│
├── backend/
│   ├── main.py
│   ├── model.pkl
│   ├── scaler.pkl
│   └── utils.py
│
├── frontend/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── tableau/
│   └── dashboard.twb
│
├── outputs/
│   └── rfm_output.csv
│
├── requirements.txt
└── README.md
```

---

## Key Learnings

Through this project, the following concepts were implemented and understood:
- Real-world data cleaning
- RFM analysis
- Feature engineering
- Standardization
- Unsupervised machine learning
- Customer segmentation strategy
- Backend API development
- Frontend integration
- Business dashboard design

---

## Conclusion

This project demonstrates how machine learning and business intelligence can work together to solve a practical business problem. By combining RFM analysis, K-Means clustering, FastAPI, React, and Tableau, the system provides both technical and business-level insights into customer behavior.

---

## Author

**Omkar**

---

## License

This project is for educational and academic purposes.
