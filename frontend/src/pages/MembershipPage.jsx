// src/pages/MembershipPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MembershipPage.css";

import NhatotHeader from "../components/header";
import Footer from "../components/footer";

// ===== CẤU HÌNH GÓI HỘI VIÊN =====
// posts = số tin được đăng mỗi ngày (limit/ngày)
const PLANS = [
  {
    id: "m1",
    label: "Gói 1 tháng",
    months: 1,
    posts: 5, // 5 tin/ngày
    price: 199000,
  },
  {
    id: "m3",
    label: "Gói 3 tháng",
    months: 3,
    posts: 5, // 5 tin/ngày
    price: 499000,
    badge: "Ưu tiên hơn",
    primary: true,
  },
];

const TX_KEY = "membershipTransactions";
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/* ===== LẤY USER HIỆN TẠI ===== */
function getCurrentUser() {
  try {
    const raw = localStorage.getItem("currentUser") || "null";
    const user = JSON.parse(raw);
    return user && typeof user === "object" ? user : null;
  } catch {
    return null;
  }
}

/**
 * Lấy userId dùng chung trong membership:
 * Ưu tiên: user.id -> user.phone -> user.email -> null
 * (khớp với ThanhToanHoiVien)
 */
function getMembershipUserId() {
  const user = getCurrentUser();
  if (!user) return null;
  return user.id || user.phone || user.email || null;
}

// ===== TÍNH GÓI CÒN HẠN + NGÀY HẾT HẠN SỚM NHẤT CHO ĐÚNG USER =====
function getMembershipSummary(userId) {
  if (!userId) return null; // chưa đăng nhập thì không có summary

  try {
    const raw = localStorage.getItem(TX_KEY) || "[]";
    const parsed = JSON.parse(raw);
    const allTx = Array.isArray(parsed) ? parsed : [];
    const now = Date.now();

    // ⚠️ Chỉ lấy giao dịch của đúng user (dùng tx.userId)
    const list = allTx.filter((tx) => tx.userId === userId);

    // Lấy các gói còn hạn
    const active = list.filter((tx) => {
      if (tx.status !== "SUCCESS") return false;

      const created = new Date(tx.createdAt).getTime();

      const durationMs =
        typeof tx.durationMs === "number" && tx.durationMs > 0
          ? tx.durationMs
          : ONE_MONTH_MS;

      return created + durationMs > now;
    });

    if (!active.length) return null;

    // Tính ngày hết hạn cho từng gói
    const withExpire = active.map((tx) => {
      const created = new Date(tx.createdAt).getTime();
      const durationMs =
        typeof tx.durationMs === "number" && tx.durationMs > 0
          ? tx.durationMs
          : ONE_MONTH_MS;
      const expiresAt = new Date(created + durationMs);
      return { ...tx, expiresAt };
    });

    // Tìm ngày hết hạn sớm nhất
    let earliest = withExpire[0].expiresAt;
    for (const tx of withExpire) {
      if (tx.expiresAt < earliest) earliest = tx.expiresAt;
    }

    return {
      activeCount: active.length,
      firstExpireDate: earliest,
    };
  } catch {
    return null;
  }
}

export default function MembershipPage() {
  // Mặc định chọn gói 3 tháng vì ưu tiên hơn
  const [activeId, setActiveId] = useState("m3");
  const [summary, setSummary] = useState(null);

  const navigate = useNavigate();

  const active = PLANS.find((p) => p.id === activeId) || PLANS[0];

  // 👉 Lấy userId một lần khi mount
  const [userId] = useState(() => getMembershipUserId());

  // Load summary khi mở trang
  useEffect(() => {
    const info = getMembershipSummary(userId);
    setSummary(info);
  }, [userId]);

  // Nghe event membership:updated từ ThanhToanHoiVien để cập nhật lại summary
  useEffect(() => {
    function handleUpdated(e) {
      const evtUserId = e.detail?.userId;
      if (!evtUserId) return;
      // Nếu event là của user khác thì bỏ qua
      if (evtUserId !== userId) return;

      const info = getMembershipSummary(evtUserId);
      setSummary(info);
    }

    window.addEventListener("membership:updated", handleUpdated);
    return () => window.removeEventListener("membership:updated", handleUpdated);
  }, [userId]);

  // Đi đến trang thanh toán
  const handleGoPaymentPage = () => {
    const durationMs = (active.months || 1) * ONE_MONTH_MS;

    navigate("/thanh-toan-hoi-vien", {
      state: {
        planId: active.id,
        planName: active.label,
        price: active.price,
        quota: active.posts, // 5 tin/ngày
        durationMs,
        userId, // ⭐ để trang thanh toán lưu đúng user
      },
    });
  };

  return (
    <div className="nhatot">
      <div className="mk-page">
        {/* HEADER */}
        <NhatotHeader />

        <main>
          <div className="mship-page">
            {/* HERO */}
            <div className="mship-hero">
              <div className="mship-hero-left">
                <div className="mship-breadcrumb">
                  Nhà Tốt / <span>Gói Pro</span>
                </div>

                <p className="mship-tagline">GÓI HỘI VIÊN NHÀ TỐT</p>
                <h1 className="mship-title">
                  Tối đa hiệu quả <br />
                  nâng tầm uy tín
                </h1>

                <div className="mship-sub-pill">
                  <span className="mship-avatars" />
                  Hơn 20.000 người đã sử dụng
                </div>
              </div>

              <div className="mship-hero-right">
                <img
                  src="/Img/house.webp"
                  alt="Gói hội viên"
                  className="mship-hero-illu"
                />
              </div>
            </div>

            {/* 🔔 SUMMARY: số gói còn hiệu lực + gói hết hạn sớm nhất */}
            {summary && (
              <div className="mship-summary">
                <div className="mship-summary-main">
                  Bạn đang có{" "}
                  <strong>{summary.activeCount}</strong> gói hội viên còn hiệu lực.
                </div>
                <div className="mship-summary-sub">
                  Gói hết hạn sớm nhất vào{" "}
                  <strong>
                    {summary.firstExpireDate.toLocaleDateString("vi-VN")}
                  </strong>
                  .
                </div>
              </div>
            )}

            {/* TABS 2 GÓI: 1 THÁNG / 3 THÁNG */}
            <div className="mship-plan-tabs">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  className={
                    "mship-tab" +
                    (p.id === activeId ? " mship-tab--active" : "") +
                    (p.primary ? " mship-tab--primary" : "")
                  }
                  onClick={() => setActiveId(p.id)}
                >
                  {p.label}
                  {p.badge && (
                    <span className="mship-tab-badge">{p.badge}</span>
                  )}
                </button>
              ))}
            </div>

            {/* BOX CHI TIẾT GÓI */}
            <div className="mship-plan-detail">
              <h2>{active.label}</h2>
              <p className="mship-price">
                {active.price.toLocaleString("vi-VN")}đ{" "}
                <span>
                  / {active.months} tháng – tối đa {active.posts} tin/ngày
                </span>
              </p>

              <ul className="mship-benefits">
                <li>Mỗi ngày được đăng tối đa {active.posts} tin hội viên.</li>
                <li>
                  Tin hội viên được ưu tiên hiển thị trong kết quả tìm kiếm,
                  tăng uy tín với khách.
                </li>
                {active.id === "m3" && (
                  <li>
                    Gói 3 tháng được ưu tiên hiển thị hơn so với gói 1 tháng.
                  </li>
                )}
              </ul>

              <button className="mship-cta" onClick={handleGoPaymentPage}>
                Đăng ký gói này
              </button>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <Footer />
      </div>
    </div>
  );
}
