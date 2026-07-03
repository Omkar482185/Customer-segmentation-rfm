import React, { useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";

type SegmentRecord = {
  CustomerID?: number | string;
  Recency: number;
  Frequency: number;
  Monetary: number;
  Segment: number;
  SegmentLabel: string;
};

function App() {
  const [data, setData] = useState<SegmentRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<"rfm" | "raw">("rfm");
  const [segmentFilter, setSegmentFilter] = useState<string>("All");

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);
    try {
      const url =
        mode === "rfm"
          ? "http://localhost:8000/predict"
          : "http://localhost:8000/segment-transactions";

      const res = await axios.post<SegmentRecord[]>(url, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setData(res.data);
      setSegmentFilter("All");
    } catch (error: any) {
      console.error(error);
      alert(
        "Error calling API: " +
          (error.response?.data?.detail || "Check console for details.")
      );
    } finally {
      setLoading(false);
    }
  };

  const segmentCounts = Object.entries(
    data.reduce<Record<string, number>>((acc, row) => {
      const key = row.SegmentLabel || `Segment ${row.Segment}`;
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {})
  ).map(([SegmentLabel, Count]) => ({ SegmentLabel, Count }));

  const segmentSummary = Object.values(
    data.reduce<
      Record<string, { label: string; count: number; totalMonetary: number }>
    >((acc, row) => {
      const key = row.SegmentLabel || `Segment ${row.Segment}`;
      if (!acc[key]) {
        acc[key] = { label: key, count: 0, totalMonetary: 0 };
      }
      acc[key].count += 1;
      acc[key].totalMonetary += row.Monetary;
      return acc;
    }, {})
  ).map((item) => ({
    label: item.label,
    count: item.count,
    avgMonetary:
      item.count > 0
        ? Number((item.totalMonetary / item.count).toFixed(2))
        : 0,
  }));

  const filteredData =
    segmentFilter === "All"
      ? data
      : data.filter((row) => row.SegmentLabel === segmentFilter);

  const cardColors: Record<string, string> = {
    "Loyal High-Value": "#c8e6c9",
    "New Customers": "#bbdefb",
    "At-Risk VIP": "#ffe0b2",
    "Lost / Inactive": "#ffcdd2",
    "Regular": "#e0e0e0",
  };

  return (
    <div
      style={{
        padding: "20px",
        fontFamily: "system-ui, sans-serif",
        maxWidth: 1200,
        margin: "0 auto",
      }}
    >
      <h1>Customer Segmentation Dashboard</h1>
      <p>
        Upload data to classify customers into meaningful segments and explore
        their behavior.
      </p>

      <div style={{ marginTop: "16px" }}>
        <div style={{ marginBottom: "12px" }}>
          <button
            onClick={() => setMode("rfm")}
            style={{
              marginRight: "8px",
              padding: "6px 12px",
              backgroundColor: mode === "rfm" ? "#1976d2" : "#e0e0e0",
              color: mode === "rfm" ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            RFM CSV
          </button>
          <button
            onClick={() => setMode("raw")}
            style={{
              padding: "6px 12px",
              backgroundColor: mode === "raw" ? "#1976d2" : "#e0e0e0",
              color: mode === "raw" ? "white" : "black",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Raw Transactions CSV
          </button>
        </div>

        <p style={{ marginBottom: "8px" }}>
          Mode:{" "}
          {mode === "rfm"
            ? "Upload RFM (Recency, Frequency, Monetary)"
            : "Upload raw transactions (InvoiceNo, Quantity, InvoiceDate, UnitPrice, CustomerID)"}
        </p>

        <input type="file" accept=".csv" onChange={handleFileChange} />
      </div>

      {loading && <p>Processing...</p>}

      {data.length > 0 && (
        <>
          <h2 style={{ marginTop: "24px" }}>Segment Overview</h2>
          <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
            {segmentSummary.map((seg) => (
              <div
                key={seg.label}
                style={{
                  flex: "1 1 200px",
                  minWidth: 200,
                  backgroundColor: cardColors[seg.label] || "#e0e0e0",
                  borderRadius: "8px",
                  padding: "12px",
                }}
              >
                <div style={{ fontWeight: 600 }}>{seg.label}</div>
                <div>Customers: {seg.count}</div>
                <div>Avg Monetary: ₹{seg.avgMonetary}</div>
              </div>
            ))}
          </div>

          <h2 style={{ marginTop: "24px" }}>Segment Distribution</h2>
          <ResponsiveContainer width="100%" height={400}>
            <BarChart data={segmentCounts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="SegmentLabel" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="Count" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>

          <h2 style={{ marginTop: "24px" }}>
            Segment Details (first 50 customers)
          </h2>

          <div style={{ marginTop: "8px", marginBottom: "8px" }}>
            <label style={{ marginRight: "8px" }}>Filter by segment:</label>
            <select
              value={segmentFilter}
              onChange={(e) => setSegmentFilter(e.target.value)}
            >
              <option value="All">All</option>
              {segmentSummary.map((seg) => (
                <option key={seg.label} value={seg.label}>
                  {seg.label}
                </option>
              ))}
            </select>
          </div>

          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginTop: "16px",
            }}
          >
            <thead>
              <tr style={{ backgroundColor: "#f5f5f5" }}>
                <th style={{ border: "1px solid #ddd", padding: "6px" }}>
                  CustomerID
                </th>
                <th style={{ border: "1px solid #ddd", padding: "6px" }}>
                  Recency
                </th>
                <th style={{ border: "1px solid #ddd", padding: "6px" }}>
                  Frequency
                </th>
                <th style={{ border: "1px solid #ddd", padding: "6px" }}>
                  Monetary
                </th>
                <th style={{ border: "1px solid #ddd", padding: "6px" }}>
                  Segment
                </th>
                <th style={{ border: "1px solid #ddd", padding: "6px" }}>
                  SegmentLabel
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 50).map((row, idx) => (
                <tr key={idx}>
                  <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                    {row.CustomerID ?? ""}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                    {row.Recency}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                    {row.Frequency}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                    {row.Monetary}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                    {row.Segment}
                  </td>
                  <td style={{ border: "1px solid #ddd", padding: "6px" }}>
                    {row.SegmentLabel}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </>
      )}
    </div>
  );
}

export default App;
