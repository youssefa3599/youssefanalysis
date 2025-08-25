// src/pages/MonthlyDashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell,
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from "recharts";
import "../styles/MonthlyDashboard.css";  // CSS file

const API_URL = import.meta.env.VITE_API_URL;
const COLORS = ["#0088FE", "#FF8042", "#00C49F", "#FFBB28", "#FF6666", "#AA66CC"];

const categoryTypes: Record<string, "income" | "expense"> = {
  Salary: "income",
  Bonus: "income",
  Investment: "income",
  Food: "expense",
  Rent: "expense",
  Transport: "expense",
  Shopping: "expense",
};

const getYAxisMax = (value: number, padding = 1.1) => {
  if (value === 0) return 10;
  const padded = value * padding;
  const magnitude = Math.pow(10, Math.floor(Math.log10(padded)));
  return Math.ceil(padded / magnitude) * magnitude;
};

const MonthlyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [categoryTrends, setCategoryTrends] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());

  const [comparisonMode, setComparisonMode] = useState(false);
  const [selectedYear1, setSelectedYear1] = useState<number>(new Date().getFullYear());
  const [selectedYear2, setSelectedYear2] = useState<number>(new Date().getFullYear() - 1);
  const [categoryTrends1, setCategoryTrends1] = useState<any[]>([]);
  const [categoryTrends2, setCategoryTrends2] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  useEffect(() => {
    const currentYear = new Date().getFullYear();
    setAvailableYears([currentYear, currentYear - 1, currentYear - 2, currentYear - 3, currentYear - 4]);
  }, []);

  // Fetch single year data
  useEffect(() => {
    if (comparisonMode) return;
    const fetchData = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/transactions/category-trends-monthly?year=${selectedYear}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCategoryTrends(data);
        const allCats = data.length > 0 ? Object.keys(data[0]).filter((key) => key !== "month") : [];
        setSelectedCategories(allCats);
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    };
    fetchData();
  }, [token, selectedYear, comparisonMode]);

  // Fetch comparison mode data
  useEffect(() => {
    if (!comparisonMode) return;
    const fetchBoth = async () => {
      try {
        const [res1, res2] = await Promise.all([
          axios.get(`${API_URL}/api/transactions/category-trends-monthly?year=${selectedYear1}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          axios.get(`${API_URL}/api/transactions/category-trends-monthly?year=${selectedYear2}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        setCategoryTrends1(res1.data);
        setCategoryTrends2(res2.data);

        const allCats1 = res1.data.length > 0 ? Object.keys(res1.data[0]).filter((key) => key !== "month") : [];
        const allCats2 = res2.data.length > 0 ? Object.keys(res2.data[0]).filter((key) => key !== "month") : [];
        setSelectedCategories(Array.from(new Set([...allCats1, ...allCats2])));

      } catch (err) {
        console.error("Error fetching comparison data:", err);
      }
    };
    fetchBoth();
  }, [token, selectedYear1, selectedYear2, comparisonMode]);

  const categories = comparisonMode
    ? Array.from(new Set([
        ...(categoryTrends1.length > 0 ? Object.keys(categoryTrends1[0]).filter((k) => k !== "month") : []),
        ...(categoryTrends2.length > 0 ? Object.keys(categoryTrends2[0]).filter((k) => k !== "month") : []),
      ]))
    : (categoryTrends.length > 0 ? Object.keys(categoryTrends[0]).filter((k) => k !== "month") : []);

  const adjustValue = (cat: string, value: number) =>
    categoryTypes[cat] === "expense" ? -Math.abs(value) : value;

  const buildFilteredData = (trends: any[]) =>
    trends.map((m) => {
      const filtered: any = { month: m.month };
      selectedCategories.forEach((cat) => {
        filtered[cat] = adjustValue(cat, m[cat]);
      });
      return filtered;
    });

  const basePieData = (trends: any[]) =>
    categories
      .map((cat) => {
        const rawValue = trends.reduce((sum, m) => sum + (m[cat] || 0), 0);
        const isExpense = rawValue < 0;
        const value = Math.abs(rawValue);
        const isSelected = selectedCategories.includes(cat);
        return { name: cat, value, isExpense, isSelected };
      })
      .sort((a, b) => {
        if (a.isExpense && !b.isExpense) return -1;
        if (!a.isExpense && b.isExpense) return 1;
        return b.value - a.value;
      });

  const getYAxis = (trends: any[]) => {
    let max = 0;
    trends.forEach((month) => {
      categories.forEach((cat) => {
        const val = adjustValue(cat, month[cat]);
        if (Math.abs(val) > max) max = Math.abs(val);
      });
    });
    return getYAxisMax(max, 1.1);
  };

  const toggleCategory = (cat: string) => {
    setSelectedCategories(prev =>
      prev.includes(cat) ? prev.filter(c => c !== cat) : [...prev, cat]
    );
  };

  // Render charts, vertical = true will stack charts vertically
  const renderCharts = (title: string, trends: any[], vertical = false) => {
    const data = buildFilteredData(trends);
    const pieData = basePieData(trends);
    const yAxisMax = getYAxis(trends);

    const radarData = selectedCategories.map((cat) => {
      const total = trends.reduce((sum, m) => sum + (m[cat] || 0), 0);
      return { category: cat, value: Math.abs(adjustValue(cat, total)) };
    });

    return (
      <div className="chart-block">
        <h2 className="chart-title">{title}</h2>

        <div className={vertical ? "charts-vertical" : "charts-grid"}>

          {/* Pie Chart */}
          <div className="chart-item">
            <h3 className="chart-subtitle">Category Breakdown (All Years Total)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  cx="50%"
                  cy="50%"
                  outerRadius="80%"
                  labelLine={false}
                  label={({ name, percent, value }) =>
                    value && value > 0 ? `${name}: ${(percent! * 100).toFixed(1)}%` : ""
                  }
                >
                  {pieData.map((entry) => (
                    <Cell
                      key={entry.name}
                      fill={entry.isSelected ? (entry.isExpense ? "#FF0000" : "#00CC00") : "transparent"}
                      stroke="#FFFFFF"
                      strokeWidth={4}
                    />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Radar Chart */}
          <div className="chart-item">
            <h3 className="chart-subtitle">Category Totals (Radar)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <RadarChart data={radarData} margin={{ top: 20, right: 20, left: 20, bottom: 20 }}>
                <PolarGrid />
                <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                <PolarRadiusAxis domain={[0, yAxisMax]} />
                <Radar name="Total" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Legend />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          {/* Bar Chart */}
          <div className="chart-item">
            <h3 className="chart-subtitle">Category Trends Over Years (Bar)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={data} margin={{ top: 20, right: 20, left: 40, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} />
                <YAxis domain={[-yAxisMax, yAxisMax]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {selectedCategories.map((cat, idx) => (
                  <Bar key={cat} dataKey={cat} fill={COLORS[idx % COLORS.length]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Line Chart */}
          <div className="chart-item">
            <h3 className="chart-subtitle">Category Trends Over Years (Line)</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={data} margin={{ top: 20, right: 20, left: 40, bottom: 50 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" angle={-45} textAnchor="end" height={60} />
                <YAxis domain={[-yAxisMax, yAxisMax]} tick={{ fontSize: 12 }} />
                <Tooltip />
                <Legend />
                {selectedCategories.map((cat, idx) => (
                  <Line key={cat} type="monotone" dataKey={cat} stroke={COLORS[idx % COLORS.length]} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

        </div>
      </div>
    );
  };

  return (
    <div className="dashboard-container">
      <button onClick={handleLogout} className="logout-btn">Logout</button>

      <h1 className="dashboard-title">Monthly Dashboard</h1>

      <div className="dashboard-links">
        <Link to="/">Back</Link> | <Link to="/yearly">Yearly</Link>
      </div>

      <div className="dashboard-buttons">
        <button onClick={() => navigate("/transactions")}>➕ View / Add Transactions</button>
        <button onClick={() => setComparisonMode(!comparisonMode)}>
          {comparisonMode ? "Disable Year Comparison" : "Enable Year Comparison"}
        </button>
      </div>

      {!comparisonMode ? (
        <>
          <div className="year-selector">
            <label>Year: </label>
            <select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
              {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>

          <div className="category-checkboxes">
            {categories.map(cat => (
              <label key={cat}>
                <input type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)} /> {cat}
              </label>
            ))}
          </div>

          <div className="charts-container">
            {renderCharts(`Year ${selectedYear}`, categoryTrends)}
          </div>
        </>
      ) : (
        <>
          <div className="year-selector">
            <label>Year 1: </label>
            <select value={selectedYear1} onChange={(e) => setSelectedYear1(Number(e.target.value))}>
              {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>

            <label style={{ marginLeft: "20px" }}>Year 2: </label>
            <select value={selectedYear2} onChange={(e) => setSelectedYear2(Number(e.target.value))}>
              {availableYears.map(year => <option key={year} value={year}>{year}</option>)}
            </select>
          </div>

          <div className="category-checkboxes">
            {categories.map(cat => (
              <label key={cat}>
                <input type="checkbox"
                  checked={selectedCategories.includes(cat)}
                  onChange={() => toggleCategory(cat)} /> {cat}
              </label>
            ))}
          </div>

          <div className="comparison-charts">
            <div className="comparison-chart">
              {renderCharts(`Year ${selectedYear1}`, categoryTrends1, true)}
            </div>
            <div className="comparison-chart">
              {renderCharts(`Year ${selectedYear2}`, categoryTrends2, true)}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default MonthlyDashboard;
