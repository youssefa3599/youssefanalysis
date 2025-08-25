// src/pages/YearlyDashboard.tsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  PieChart, Pie, Cell,
  LineChart, Line,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,ResponsiveContainer
} from "recharts";
import "../styles/YearlyDashboard.css"; // ✅ import CSS

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

const YearlyDashboard: React.FC = () => {
  const [categoryTrends, setCategoryTrends] = useState<any[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const token = localStorage.getItem("token");

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  useEffect(() => {
    const fetchCategoryTrends = async () => {
      try {
        const { data } = await axios.get(
          `${API_URL}/api/transactions/category-trends-yearly`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setCategoryTrends(data);
        const allCats = data.length > 0 ? Object.keys(data[0]).filter((key) => key !== "year") : [];
        setSelectedCategories(allCats);
      } catch (err) {
        console.error("Error fetching yearly trends:", err);
      }
    };
    fetchCategoryTrends();
  }, [token]);

  const categories = categoryTrends.length > 0
    ? Object.keys(categoryTrends[0]).filter((key) => key !== "year")
    : [];

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) =>
      prev.includes(cat)
        ? prev.filter((c) => c !== cat)
        : [...prev, cat]
    );
  };

  const adjustValue = (cat: string, value: number) => {
    return categoryTypes[cat] === "expense" ? -Math.abs(value) : value;
  };

  const buildFilteredData = (trends: any[]) =>
    trends.map((y) => {
      const filtered: any = { year: y.year };
      selectedCategories.forEach((cat) => {
        filtered[cat] = adjustValue(cat, y[cat]);
      });
      return filtered;
    });

  const basePieData = (trends: any[]) =>
    categories.map((cat) => {
      const rawValue = trends.reduce((sum, y) => sum + (y[cat] || 0), 0);
      const isExpense = rawValue < 0;
      const value = Math.abs(rawValue);
      const isSelected = selectedCategories.includes(cat);
      return { name: cat, value, isExpense, isSelected };
    });

  const getYAxis = (trends: any[]) => {
    let max = 0;
    trends.forEach((y) => {
      categories.forEach((cat) => {
        const val = adjustValue(cat, y[cat]);
        if (Math.abs(val) > max) max = Math.abs(val);
      });
    });
    return getYAxisMax(max, 1.1);
  };

  const data = buildFilteredData(categoryTrends);
  const pieData = basePieData(categoryTrends);
  const yAxisMax = getYAxis(categoryTrends);

  const sortedPieData = [...pieData].sort((a, b) => {
    if (a.isExpense && !b.isExpense) return -1;
    if (!a.isExpense && b.isExpense) return 1;
    return b.value - a.value;
  });

  const radarData = selectedCategories.map((cat) => {
    const total = categoryTrends.reduce((sum, y) => sum + (y[cat] || 0), 0);
    return { category: cat, value: Math.abs(adjustValue(cat, total)) };
  });

  return (
    <div className="yearly-dashboard">
      <button className="logout-btn" onClick={handleLogout}>Logout</button>

      <h1>Yearly Dashboard</h1>
      <Link to="/">Back</Link> | <Link to="/transactions">View/Add Transactions</Link>

      <div className="category-filters">
        <label>Categories: </label>
        {categories.map((cat) => (
          <label key={cat}>
            <input
              type="checkbox"
              checked={selectedCategories.includes(cat)}
              onChange={() => toggleCategory(cat)}
            />{" "}
            {cat}
          </label>
        ))}
      </div>

      {/* Grid for charts */}
      <div className="charts-grid">
        <div className="chart-card">
          <h2>Category Breakdown (All Years Total)</h2>
          <ResponsiveContainer width="100%" height="100%">
          <PieChart width={400} height={300}>
            <Pie
              data={sortedPieData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={100}
              labelLine
              label={({ name, value, percent }) =>
                value && value > 0 ? `${name}: ${(percent! * 100).toFixed(1)}%` : ""
              }
            >
              {sortedPieData.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.isSelected ? (entry.isExpense ? "#FF0000" : "#00CC00") : "transparent"}
                  stroke="#FFFFFF"
                  strokeWidth={2}
                />
              ))}
            </Pie>
          </PieChart>
          </ResponsiveContainer>
        </div>
<div className="chart-card">
          <h2>Category Totals (Radar)</h2>
          <ResponsiveContainer width="100%" height="100%">
          <RadarChart outerRadius={80} width={400} height={300} data={radarData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="category" />
            <PolarRadiusAxis domain={[0, yAxisMax]} />
            <Radar name="Total" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
            <Legend />
          </RadarChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-card">
          <h2>Category Trends Over Years (Bar)</h2>
           <ResponsiveContainer width="100%" height="100%">
          <BarChart width={450} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis domain={[-yAxisMax, yAxisMax]} />
            <Tooltip />
            <Legend />
            {selectedCategories.map((cat, idx) => (
              <Bar key={cat} dataKey={cat} fill={COLORS[idx % COLORS.length]} />
            ))}
          </BarChart>
          </ResponsiveContainer>
        </div>


        <div className="chart-card">
          <h2>Category Trends Over Years (Line)</h2>
          <ResponsiveContainer width="100%" height="100%">
          <LineChart width={450} height={300} data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis domain={[-yAxisMax, yAxisMax]} />
            <Tooltip />
            <Legend />
            {selectedCategories.map((cat, idx) => (
              <Line
                key={cat}
                type="basis"
                dataKey={cat}
                stroke={COLORS[idx % COLORS.length]}
              />
            ))}
          </LineChart>
          </ResponsiveContainer>
        </div>

        
      </div>
    </div>
  );
};

export default YearlyDashboard;
