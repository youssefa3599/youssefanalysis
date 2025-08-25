import axios from "axios";
import { useEffect, useState } from "react";
import "../styles/TransactionList.css"; // new CSS file

interface Transaction {
  _id: string;
  description?: string;
  category: string;
  type: "Income" | "Expense";
  amount: number;
  date: string;
}

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get("http://localhost:5000/api/transactions", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions(res.data);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this transaction?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/api/transactions/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTransactions((prev) => prev.filter((tx) => tx._id !== id));
    } catch (error) {
      console.error("Error deleting transaction:", error);
    }
  };

  if (loading) return <p>Loading transactions...</p>;
  if (transactions.length === 0) return <p>No transactions found.</p>;

  return (
    <table className="transaction-list">
      <thead>
        <tr>
          <th>Date</th>
          <th>Category</th>
          <th>Type</th>
          <th>Description</th>
          <th>Amount</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {transactions.map((tx) => (
          <tr key={tx._id}>
            <td>{new Date(tx.date).toLocaleDateString()}</td>
            <td>{tx.category}</td>
            <td className={tx.type === "Income" ? "income" : "expense"}>{tx.type}</td>
            <td>{tx.description || "-"}</td>
            <td className={tx.type === "Income" ? "income" : "expense"}>
              {tx.type === "Expense" ? "-" : "+"}${tx.amount.toFixed(2)}
            </td>
            <td>
              <button onClick={() => handleDelete(tx._id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
