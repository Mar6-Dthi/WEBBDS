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
    price: 199000, // tuỳ bạn chỉnh lại giá
  },
  {
    id: "m3",
    label: "Gói 3 tháng",
    months: 3,
    posts: 5, // 5 tin/ngày
    price: 499000, // tuỳ bạn chỉnh lại giá
    badge: "Ưu tiên hơn",
    primary: true, // dùng cho CSS tô nổi bật
  },
];

const TX_KEY = "membershipTransactions";
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

// ===== TÍNH GÓI CÒN HẠN + NGÀY HẾT HẠN SỚM NHẤT =====
// Ở đây không tính tổng tin nữa, chỉ quan tâm số gói & ngày hết hạn
function getMembershipSummary() {
  try {
    const raw = localStorage.getItem(TX_KEY) || "[]";
    const list = JSON.parse(raw);
    const now = Date.now();

    // Lấy gói còn hạn
    const active = list.filter((tx) => {
      if (tx.status !== "SUCCESS") return false;

      const created = new Date(tx.createdAt).getTime();

      // Nếu tx có durationMs thì dùng, không thì mặc định 1 tháng
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

  // Load summary khi mở trang
  useEffect(() => {
    const info = getMembershipSummary();
    setSummary(info);
  }, []);

  // Đi đến trang thanh toán
  const handleGoPaymentPage = () => {
    // durationMs dùng cho tx về sau (3 tháng dài hơn 1 tháng)
    const durationMs = (active.months || 1) * ONE_MONTH_MS;

    navigate("/thanh-toan-hoi-vien", {
      state: {
        planId: active.id,
        planName: active.label,
        price: active.price,
        quota: active.posts, // ở đây đang mang nghĩa: 5 tin/ngày
        durationMs, // để bên trang thanh toán / lưu giao dịch dùng
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
                  {p.badge && <span className="mship-tab-badge">{p.badge}</span>}
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
