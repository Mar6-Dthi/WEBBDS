// src/pages/ThanhToanHoiVien.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import NhatotHeader from "../components/header";
import Footer from "../components/footer";
import "../styles/Payment.css";

const TX_KEY = "membershipTransactions";
const MEMBERSHIP_KEY = "currentMembership";

function saveTransaction(tx) {
  const raw = localStorage.getItem(TX_KEY) || "[]";
  const list = JSON.parse(raw);
  list.push(tx);
  localStorage.setItem(TX_KEY, JSON.stringify(list));
}

function saveMembership(info) {
  localStorage.setItem(MEMBERSHIP_KEY, JSON.stringify(info));
}

export default function ThanhToanHoiVien() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [method, setMethod] = useState("momo");
  const [showSuccess, setShowSuccess] = useState(false);

  const planId = state?.planId || "p20";
  const planName = state?.planName || "Gói hội viên 20 tin/tháng";
  const price = state?.price || 299000;
  const quota = state?.quota || 20;

  // ======== QR MOCK ========
  const qrUrl = useMemo(() => {
    const text = `NhaTot|plan=${planId}|method=${method}|amount=${price}`;
    return (
      "https://api.qrserver.com/v1/create-qr-code/?size=260x260&data=" +
      encodeURIComponent(text)
    );
  }, [planId, method, price]);

  // ======== GIẢ LẬP THANH TOÁN TỰ ĐỘNG ========
  useEffect(() => {
    const timer = setTimeout(() => {
      const now = new Date();

      const tx = {
        id: Date.now(),
        planId,
        planName,
        price,
        quota,
        method,
        status: "SUCCESS",
        createdAt: now.toISOString(),
      };

      // Lưu lịch sử
      saveTransaction(tx);

      // Lưu gói hiện tại
      saveMembership({
        planId,
        planName,
        price,
        quota,
        method,
        activatedAt: now.toISOString(),
      });

      // Hiện modal thành công
      setShowSuccess(true);

      // 1.5s sau → trở về trang chủ
      setTimeout(() => navigate("/nhatot"), 2500);
    }, 3500);

    return () => clearTimeout(timer);
  }, [planId, planName, price, quota, method, navigate]);

  return (
    <div className="nhatot">
      <div className="mk-page">

        {/* HEADER */}
        <NhatotHeader />

        {/* MAIN CONTENT */}
        <main className="pay-page">
          <div className="pay-main">
            <div className="pay-card">
              <h1 className="pay-title">Thanh toán gói hội viên</h1>

              <p className="pay-plan">
                <strong>{planName}</strong> – {price.toLocaleString("vi-VN")}đ / tháng
              </p>

              {/* ====== PHƯƠNG THỨC THANH TOÁN ====== */}
              <div className="pay-tabs">
                <button
                  className={"pay-tab" + (method === "momo" ? " active" : "")}
                  onClick={() => setMethod("momo")}
                >
                  Ví MoMo
                </button>

                <button
                  className={"pay-tab" + (method === "bank" ? " active" : "")}
                  onClick={() => setMethod("bank")}
                >
                  Ngân hàng
                </button>
              </div>

              {/* ====== QR FRAME ====== */}
              <div className="pay-qr-section">
                <p className="pay-qr-title">
                  Quét mã QR bằng ứng dụng{" "}
                  {method === "momo" ? "MoMo" : "ngân hàng"}
                </p>

                <img src={qrUrl} alt="QR" className="pay-qr-img" />

                <p className="pay-amount">
                  Số tiền: <strong>{price.toLocaleString("vi-VN")}đ</strong>
                </p>

                <p className="pay-note">
                  * Hệ thống sẽ tự động xác nhận thanh toán trong vài giây.
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* FOOTER */}
        <Footer />

        {/* ===== MODAL SUCCESS ===== */}
        {showSuccess && (
          <div className="pay-success-overlay">
            <div className="pay-success-modal">
              <div className="pay-success-icon">✓</div>
              <h3>Thanh toán thành công!</h3>
              <p>Gói hội viên đã được kích hoạt.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
