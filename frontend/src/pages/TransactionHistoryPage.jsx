// src/pages/TransactionHistoryPage.jsx
import React, { useMemo } from "react";
import NhatotHeader from "../components/header";
import Footer from "../components/footer";
import "../styles/TransactionHistory.css";

const TX_KEY = "membershipTransactions";

/* ===== LẤY userId DÙNG CHUNG VỚI Membership / Payment / PostCreate ===== */
function getMembershipUserId() {
  try {
    const raw = localStorage.getItem("currentUser") || "null";
    const user = JSON.parse(raw);
    if (!user || typeof user !== "object") return null;
    return user.id || user.phone || user.email || null;
  } catch {
    return null;
  }
}

// Load lịch sử giao dịch từ localStorage CHO ĐÚNG user
function loadTransactionsForUser(userId) {
  if (!userId) return [];

  try {
    const raw = localStorage.getItem(TX_KEY) || "[]";
    const list = JSON.parse(raw);
    const all = Array.isArray(list) ? list : [];

    // 🔥 Chỉ lấy giao dịch của đúng user (tx.userId hoặc tx.ownerId)
    const mine = all.filter(
      (tx) => tx.userId === userId || tx.ownerId === userId
    );

    // Sắp xếp mới nhất lên đầu
    return mine.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch {
    return [];
  }
}

export default function TransactionHistoryPage() {
  const userId = useMemo(() => getMembershipUserId(), []);
  const transactions = useMemo(
    () => loadTransactionsForUser(userId),
    [userId]
  );

  return (
    <div className="nhatot">
      <div className="mk-page">
        <NhatotHeader />

        <main className="tx-main">
          <div className="tx-card">
            <h1 className="tx-title">Lịch sử giao dịch hội viên</h1>

            {!userId ? (
              <p className="tx-empty">
                Vui lòng đăng nhập để xem lịch sử giao dịch.
              </p>
            ) : transactions.length === 0 ? (
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
