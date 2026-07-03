import os
import sys
import io

sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import joblib

from src.data_prep import compute_rfm

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

model = joblib.load("../models/kmeans.joblib")
scaler = joblib.load("../models/scaler.joblib")


def label_segment_from_rfm(r: float, f: float, m: float) -> str:
    if r <= 30 and f >= 10 and m >= 500:
        return "Loyal High-Value"
    elif r <= 30 and f < 10 and m < 500:
        return "New Customers"
    elif r > 90 and m >= 500:
        return "At-Risk VIP"
    elif r > 180:
        return "Lost / Inactive"
    else:
        return "Regular"


@app.get("/")
def root():
    return {"status": "Customer Segmentation API is running"}


@app.post("/predict")
async def predict(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        for col in ["Recency", "Frequency", "Monetary"]:
            if col not in df.columns:
                raise HTTPException(status_code=400, detail=f"Missing required column: {col}")

        features = df[["Recency", "Frequency", "Monetary"]]
        features_scaled = scaler.transform(features)
        segments = model.predict(features_scaled)

        df["Segment"] = segments
        df["SegmentLabel"] = [
            label_segment_from_rfm(r, f, m)
            for r, f, m in zip(df["Recency"], df["Frequency"], df["Monetary"])
        ]

        return df.to_dict(orient="records")

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@app.post("/segment-transactions")
async def segment_transactions(file: UploadFile = File(...)):
    try:
        contents = await file.read()
        df = pd.read_csv(io.BytesIO(contents))

        required_cols = ["InvoiceNo", "CustomerID", "InvoiceDate", "Quantity", "UnitPrice"]
        missing = [col for col in required_cols if col not in df.columns]
        if missing:
            raise HTTPException(
                status_code=400,
                detail=f"Missing required columns: {missing}. Expected columns: {required_cols}"
            )

        rfm = compute_rfm(df)

        features = rfm[["Recency", "Frequency", "Monetary"]]
        features_scaled = scaler.transform(features)
        segments = model.predict(features_scaled)

        rfm["Segment"] = segments
        rfm["SegmentLabel"] = [
            label_segment_from_rfm(r, f, m)
            for r, f, m in zip(rfm["Recency"], rfm["Frequency"], rfm["Monetary"])
        ]

        return rfm.to_dict(orient="records")

    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))
