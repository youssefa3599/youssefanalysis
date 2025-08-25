import { useState } from "react";
import axios from "axios";
import "../styles/TransactionForm.css";
// 👈 import the purple theme CSS

type Props = {
  onTransactionAdded: () => void;
};

export default function TransactionForm({ onTransactionAdded }: Props) {
  const [date, setDate] = useState("");
  const [category, setCategory] = useState("");
  const [type, setType] = useState<"Income" | "Expense">("Expense");
  const [amount, setAmount] = useState<number | "">("");
  const [description, setDescription] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!date || !category || !amount || !type) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "http://localhost:5000/api/transactions",
        { date, category, type, amount, description },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      console.log("✅ Transaction created:", res.data);
      alert("Transaction added successfully!");

      // reset form
      setDate("");
      setCategory("");
      setType("Expense");
      setAmount("");
      setDescription("");

      onTransactionAdded();
    } catch (error) {
      console.error("❌ Error creating transaction", error);
      alert("Failed to create transaction");
    }
  };

  return (
    <form className="transaction-form" onSubmit={handleSubmit}>
      <h3>Add Transaction</h3>

      <input
        type="date"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        required
      />

      <input
        type="text"
        placeholder="Category"
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        required
      />

      <select
        value={type}
        onChange={(e) => setType(e.target.value as "Income" | "Expense")}
      >
        <option value="Income">Income</option>
        <option value="Expense">Expense</option>
      </select>

      <input
        type="number"
        placeholder="Amount"
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value))}
        required
      />

      <input
        type="text"
        placeholder="Description (optional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />

      <button type="submit">Add</button>
    </form>
  );
}
