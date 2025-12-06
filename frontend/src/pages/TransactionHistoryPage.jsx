// src/pages/TransactionHistoryPage.jsx
import React, { useMemo } from "react";
import NhatotHeader from "../components/header";
import Footer from "../components/footer";
import "../styles/TransactionHistory.css";

const TX_KEY = "membershipTransactions";

// Load lịch sử giao dịch từ localStorage
function loadTransactions() {
  try {
    const raw = localStorage.getItem(TX_KEY) || "[]";
    const list = JSON.parse(raw);
    return list.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export default function TransactionHistoryPage() {
  const transactions = useMemo(() => loadTransactions(), []);

  return (
    <div className="nhatot">
      <div className="mk-page">
        <NhatotHeader />

        <main className="tx-main">
          <div className="tx-card">
            <h1 className="tx-title">Lịch sử giao dịch hội viên</h1>

            {transactions.length === 0 ? (
              <p className="tx-empty">Chưa có giao dịch nào.</p>
            ) : (
              <table className="tx-table">
                <thead>
                  <tr>
                    <th>Thời gian</th>
                    <th>Gói</th>
                    <th>Phương thức</th>
                    <th>Số tiền</th>
                    <th>Trạng thái</th>
                  </tr>
                </thead>

                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id}>
                      <td>
                        {new Date(tx.createdAt).toLocaleString("vi-VN", {
                          hour12: false,
                        })}
                      </td>

                      <td>{tx.planName}</td>

                      <td>{tx.method === "momo" ? "MoMo" : "Ngân hàng"}</td>

                      <td>{tx.price.toLocaleString("vi-VN")}đ</td>

                      <td className="tx-status success">Thành công</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
