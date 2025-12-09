// src/pages/ThanhToanHoiVien.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import NhatotHeader from "../components/header";
import Footer from "../components/footer";
import "../styles/Payment.css";

const TX_KEY = "membershipTransactions";
const MEMBERSHIP_KEY = "currentMembership";

// Lưu lịch sử giao dịch (có xử lý lỗi JSON)
function saveTransaction(tx) {
  let list = [];
  try {
    const raw = localStorage.getItem(TX_KEY) || "[]";
    const parsed = JSON.parse(raw);
    list = Array.isArray(parsed) ? parsed : [];
  } catch {
    list = [];
  }

  list.push(tx);
  localStorage.setItem(TX_KEY, JSON.stringify(list));
}

// Lưu gói hiện tại (fast path cho UI)
function saveMembership(info) {
  localStorage.setItem(MEMBERSHIP_KEY, JSON.stringify(info));
}

/**
 * 🔁 HÀM LẤY userId DÙNG CHUNG VỚI Membership / PostCreate
 * Ưu tiên: user.id -> user.phone -> user.email -> null
 */
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

export default function ThanhToanHoiVien() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [method, setMethod] = useState("momo");
  const [showSuccess, setShowSuccess] = useState(false);

  const planId = state?.planId || "p20";
  const planName = state?.planName || "Gói hội viên 20 tin/tháng";
  const price = state?.price || 299000;
  const quota = state?.quota || 20;
  const durationMs = state?.durationMs || 30 * 24 * 60 * 60 * 1000;

  // userId được truyền từ MembershipPage (nếu có)
  const routeUserId = state?.userId || null;

  // 👉 userId cuối cùng dùng cho giao dịch này
  const userId = routeUserId || getMembershipUserId() || null;

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
    // ❗ Không có userId thì KHÔNG tạo giao dịch (tránh tx rác, không gắn user)
    if (!userId) {
      console.warn("Không có userId, không tạo giao dịch membership.");
      return;
    }

    const timer = setTimeout(() => {
      const now = new Date();

      const tx = {
        id: Date.now(),          // id GIAO DỊCH (không phải id user)
        planId,
        planName,
        price,
        quota,
        method,
        status: "SUCCESS",
        createdAt: now.toISOString(),

        // ⭐ ID HỘI VIÊN THEO USER – KHỚP VỚI PostCreate & Membership
        userId,                  // dùng để lọc theo user
        ownerId: userId,         // giữ thêm field ownerId cho đồng bộ

        // thời hạn gói
        durationMs,
      };

      // Lưu lịch sử giao dịch
      saveTransaction(tx);

      // Lưu gói hiện tại để UI chỗ khác dùng nhanh
      saveMembership({
        planId,
        planName,
        price,
        quota,
        method,
        activatedAt: now.toISOString(),
        userId,
        ownerId: userId,
        durationMs,
      });

      // phát event để Membership / PostCreate cập nhật
      try {
        window.dispatchEvent(
          new CustomEvent("membership:updated", {
            detail: {
              userId,
              ownerId: userId,
              planId,
              planName,
              price,
              quota,
              durationMs,
            },
          })
        );
      } catch (e) {
        // ignore nếu trình duyệt chặn custom event
      }

      // Hiện modal thành công
      setShowSuccess(true);

      // 1.5s sau → trở về trang chủ
      setTimeout(() => navigate("/nhatot"), 1500);
    }, 3500);

    return () => clearTimeout(timer);
  }, [planId, planName, price, quota, method, navigate, durationMs, userId]);

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
                <strong>{planName}</strong> –{" "}
                {price.toLocaleString("vi-VN")}đ
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
                  Số tiền:{" "}
                  <strong>{price.toLocaleString("vi-VN")}đ</strong>
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
