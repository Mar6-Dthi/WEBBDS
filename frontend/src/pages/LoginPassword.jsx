// src/pages/LoginPassword.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import "../styles/LoginPassword.css";
import LoginFooter from "../components/LoginFooter";

const MOCK_USERS_KEY = "mockUsers";

function getMockUsers() {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY) || "[]";
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Modal trạng thái đăng nhập
function LoginStatusModal({ open, success, message, onClose }) {
  if (!open) return null;
  return (
    <div className="lp-modal-backdrop">
      <div className="lp-modal">
        <h3>{success ? "Đăng nhập thành công" : "Đăng nhập thất bại"}</h3>
        <p>{message}</p>
        <button type="button" className="lp-modal-btn" onClick={onClose}>
          Đã hiểu
        </button>
      </div>
    </div>
  );
}

export default function LoginPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  // phone được truyền từ bước nhập số điện thoại
  const phone = location.state?.phone || "";

  const [password, setPassword] = useState("");

  // state cho modal
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusSuccess, setStatusSuccess] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  const handleBack = () => {
    navigate(-1);
  };

  const handleSubmit = () => {
    if (!password.trim()) {
      setStatusSuccess(false);
      setStatusMessage("Vui lòng nhập mật khẩu.");
      setStatusOpen(true);
      return;
    }

    const users = getMockUsers();
    const user = users.find((u) => u.phone === phone);

    if (!user) {
      setStatusSuccess(false);
      setStatusMessage("Không tìm thấy tài khoản tương ứng (mock).");
      setStatusOpen(true);
      return;
    }

    if (user.password !== password) {
      setStatusSuccess(false);
      setStatusMessage("Mật khẩu không chính xác. Vui lòng thử lại.");
      setStatusOpen(true);
      return;
    }

    // ✅ Đăng nhập thành công
    // mock lưu token + tên
    localStorage.setItem("accessToken", "mock-token-" + Date.now());
    localStorage.setItem("accountName", user.name || phone);

    setStatusSuccess(true);
    setStatusMessage("Bạn đã đăng nhập thành công.");
    setStatusOpen(true);
  };

  // Sau khi đóng modal:
  // - Nếu login thành công -> chuyển về trang chủ
  // - Nếu thất bại -> chỉ đóng modal
  const handleCloseStatus = () => {
    const ok = statusSuccess;
    setStatusOpen(false);
    if (ok) {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="nt-login-page">
      <img className="nt-bg-img" src="/Img/allbackground1.jpg" alt="" />

      <div className="nt-login-container lp-container">
        <div className="lp-main">
          {/* HEADER */}
          <div className="lp-header">
            <button
              type="button"
              className="lp-back-btn"
              onClick={handleBack}
            >
              ←
            </button>
            <h1 className="lp-title">Vui lòng nhập mật khẩu</h1>
          </div>

          <p className="lp-sub">
            Nhập mật khẩu để đăng nhập tài khoản{" "}
            {phone && <span className="lp-phone">{phone}</span>}
          </p>

          {/* INPUT PASSWORD */}
          <div className="lp-form">
            <div className="lp-input-row">
              <input
                type="password"
                placeholder="Mật khẩu *"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            <button
              type="button"
              className="lp-submit"
              onClick={handleSubmit}
            >
              Tiếp tục
            </button>

            <button
              type="button"
              className="lp-forgot-link"
              onClick={() =>
                navigate("/forgot-password", { state: { phone } })
              }
            >
              Quên mật khẩu?
            </button>
          </div>
        </div>

        <LoginFooter />
      </div>

      {/* Modal thông báo đăng nhập */}
      <LoginStatusModal
        open={statusOpen}
        success={statusSuccess}
        message={statusMessage}
        onClose={handleCloseStatus}
      />
    </div>
  );
}
