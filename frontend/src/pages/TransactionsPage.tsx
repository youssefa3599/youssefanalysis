import { useState } from "react";
import TransactionForm from "../components/TransactionForm";
import TransactionList from "../components/TransactionList";
import "../styles/TransactionsPage.css"; // 👈 import external CSS

export default function TransactionsPage() {
  const [refreshFlag, setRefreshFlag] = useState(false);

  const handleTransactionAdded = () => {
    setRefreshFlag(prev => !prev);
  };

  return (
    <div className="transactions-page">
      <h1 className="transactions-title">Transactions</h1>
      <TransactionForm onTransactionAdded={handleTransactionAdded} />
      <TransactionList key={refreshFlag ? "r1" : "r2"} />
    </div>
  );
}
