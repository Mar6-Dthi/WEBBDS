// src/pages/MembershipPage.jsx
import React, { useState } from "react";
import "../styles/MembershipPage.css";

const PLANS = [
  { id: "p5", label: "5 tin/ tháng", posts: 5, price: 99000 },
  { id: "p10", label: "10 tin/ tháng", posts: 10, price: 179000, badge: "Giảm 13%" },
  { id: "p20", label: "20 tin/ tháng", posts: 20, price: 299000, primary: true },
];

const PAY_METHODS = [
  { id: "momo", label: "Ví MoMo" },
  { id: "bank", label: "Chuyển khoản ngân hàng" },
  { id: "card", label: "Thẻ nội địa/ quốc tế" },
];

export default function MembershipPage() {
  const [activeId, setActiveId] = useState("p20");
  const [showPayment, setShowPayment] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState("momo");

  const active = PLANS.find((p) => p.id === activeId) || PLANS[0];

  const handleOpenPayment = () => {
    setShowPayment(true);
  };

  const handleClosePayment = () => {
    setShowPayment(false);
  };

  const handleConfirmPayment = () => {
    // tạm thời demo – sau này nối API thanh toán thật
    alert(
      `Thanh toán gói "${active.label}" bằng "${PAY_METHODS.find(
        (m) => m.id === selectedMethod
      )?.label}"`
    );
    setShowPayment(false);
  };

  return (
    <div className="mship-page">
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
            src="/Img/demo/membership-house.png"
            alt="Gói hội viên"
            className="mship-hero-illu"
          />
        </div>
      </div>

      {/* Thanh chọn 3 gói */}
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

      {/* Box chi tiết gói đang chọn */}
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

        <button className="mship-cta" onClick={handleOpenPayment}>
          Đăng ký gói này
        </button>
      </div>

      {/* Popup phương thức thanh toán */}
      {showPayment && (
        <div className="mship-pay-overlay">
          <div className="mship-pay-modal">
            <button
              className="mship-pay-close"
              onClick={handleClosePayment}
              aria-label="Đóng"
            >
              ×
            </button>

            <h3 className="mship-pay-title">Thanh toán gói hội viên</h3>
            <p className="mship-pay-plan">
              Gói: <strong>{active.label}</strong> –{" "}
              <span>{active.price.toLocaleString("vi-VN")}đ / tháng</span>
            </p>

            <div className="mship-pay-methods">
              <p className="mship-pay-label">Chọn phương thức thanh toán:</p>
              {PAY_METHODS.map((m) => (
                <label key={m.id} className="mship-pay-option">
                  <input
                    type="radio"
                    name="payMethod"
                    value={m.id}
                    checked={selectedMethod === m.id}
                    onChange={() => setSelectedMethod(m.id)}
                  />
                  <span>{m.label}</span>
                </label>
              ))}
            </div>

            <button
              className="mship-pay-confirm"
              onClick={handleConfirmPayment}
            >
              Xác nhận thanh toán
            </button>

            <button
              className="mship-pay-cancel"
              onClick={handleClosePayment}
            >
              Hủy
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
