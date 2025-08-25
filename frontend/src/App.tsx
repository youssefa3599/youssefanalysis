import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import MonthlyDashboard from "./pages/MonthlyDashboard";
import YearlyDashboard from "./pages/YearlyDashboard";
import Transactions from "./pages/TransactionsPage";
import Auth from "./pages/Auth";

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const isLoggedIn = !!token;

  return (
    <Routes>
      {/* Public route */}
      <Route
        path="/auth"
        element={isLoggedIn ? <Navigate to="/" replace /> : <Auth setToken={setToken} />}
      />

      {/* Protected routes */}
      {isLoggedIn && (
        <>
          <Route path="/" element={<MonthlyDashboard />} />
          <Route path="/yearly" element={<YearlyDashboard />} />
          <Route path="/transactions" element={<Transactions />} />
        </>
      )}

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to={isLoggedIn ? "/" : "/auth"} replace />} />
    </Routes>
  );
}
