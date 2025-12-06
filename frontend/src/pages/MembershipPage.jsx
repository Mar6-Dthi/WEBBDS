// src/pages/MembershipPage.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MembershipPage.css";

import NhatotHeader from "../components/header";
import Footer from "../components/footer";

const PLANS = [
  { id: "p5", label: "5 tin/ tháng", posts: 5, price: 99000 },
  { id: "p10", label: "10 tin/ tháng", posts: 10, price: 179000, badge: "Giảm 13%" },
  { id: "p20", label: "20 tin/ tháng", posts: 20, price: 299000, primary: true },
];

const TX_KEY = "membershipTransactions";
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

// ===== TÍNH TỔNG TIN + GÓI SẮP HẾT HẠN =====
function getMembershipSummary() {
  try {
    const raw = localStorage.getItem(TX_KEY) || "[]";
    const list = JSON.parse(raw);
    const now = Date.now();

    // Lấy gói còn hạn
    const active = list.filter((tx) => {
      if (tx.status !== "SUCCESS") return false;
      const created = new Date(tx.createdAt).getTime();
      return created + ONE_MONTH_MS > now;
    });

    if (!active.length) return null;

    // Tổng số tin còn hiệu lực
    const totalPosts = active.reduce((sum, tx) => sum + (tx.quota || 0), 0);

    // Tính ngày hết hạn từng gói
    const withExpire = active.map((tx) => {
      const created = new Date(tx.createdAt).getTime();
      const expiresAt = new Date(created + ONE_MONTH_MS);
      return { ...tx, expiresAt };
    });

    // Tìm ngày hết hạn sớm nhất
    let earliest = withExpire[0].expiresAt;
    for (const tx of withExpire) {
      if (tx.expiresAt < earliest) earliest = tx.expiresAt;
    }

    // Cộng quota của tất cả gói hết cùng NGÀY đó
    const earliestDateStr = earliest.toDateString();
    const firstExpireQuota = withExpire
      .filter((tx) => tx.expiresAt.toDateString() === earliestDateStr)
      .reduce((sum, tx) => sum + tx.quota, 0);

    return {
      totalPosts,
      firstExpireDate: earliest,
      firstExpireQuota,
    };
  } catch {
    return null;
  }
}

export default function MembershipPage() {
  const [activeId, setActiveId] = useState("p20");
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
    navigate("/thanh-toan-hoi-vien", {
      state: {
        planId: active.id,
        planName: active.label,
        price: active.price,
        quota: active.posts,
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

            {/* 🔔 SUMMARY: tổng tin + tin sắp hết hạn */}
            {summary && (
              <div className="mship-summary">
                <div className="mship-summary-main">
                  Bạn đang có <strong>{summary.totalPosts}</strong> tin hội viên còn hiệu lực.
                </div>
                <div className="mship-summary-sub">
                  Trong đó <strong>{summary.firstExpireQuota}</strong> tin sẽ hết hạn vào{" "}
                  <strong>
                    {summary.firstExpireDate.toLocaleDateString("vi-VN")}
                  </strong>.
                </div>
              </div>
            )}

            {/* TABS */}
            <div className="mship-plan-tabs">
              {PLANS.map((p) => (
                <button
                  key={p.id}
                  className={
                    "mship-tab" + (p.id === activeId ? " mship-tab--active" : "")
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
                <span>/ tháng – tối đa {active.posts} tin</span>
              </p>

              <ul className="mship-benefits">
                <li>Chỉ hội viên mới được đăng tin.</li>
                <li>Ưu tiên hiển thị tin, tăng uy tín với khách.</li>
                <li>Hỗ trợ kỹ thuật & tư vấn tối ưu tin đăng.</li>
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
