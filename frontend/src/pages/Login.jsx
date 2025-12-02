// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/Login.css";

import LoginHeader from "../components/LoginHeader";
import LoginFooter from "../components/LoginFooter";
import GoogleAccountPopup from "../components/GoogleAccountPopup";

const MOCK_USERS_KEY = "mockUsers";

function getMockUsers() {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY) || "[]";
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [googlePopup, setGooglePopup] = useState(false);

  // GOOGLE LOGIN
  const handleGoogleClick = () => {
    setGooglePopup(true);
  };

  const handleChooseGoogleAccount = (acc) => {
    // 1. Lưu token & tên hiển thị (chị đang dùng cho header)
    localStorage.setItem("accessToken", "google-" + Date.now());
    localStorage.setItem("accountName", acc.name || acc.email);

    // 2. Lưu currentUser để tính năng Yêu thích dùng
    const currentUser = {
      id: acc.email,              // dùng email làm id duy nhất
      phone: acc.email,           // demo: tạm gắn luôn email
      name: acc.name || acc.email,
    };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    // 3. Đóng popup & chuyển về Home
    setGooglePopup(false);
    navigate("/");
  };

  // SỐ ĐIỆN THOẠI
  const handleContinuePhone = () => {
    if (!phone.trim()) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }

    const users = getMockUsers();
    const exists = users.some((u) => u.phone === phone);

    if (exists) {
      navigate("/login-password", { state: { phone } });
    } else {
      navigate("/register-new", { state: { phone } });
    }
  };

  const handleGotoRegister = () => {
    navigate("/register-new", { state: { phone } });
  };

  return (
    <div className="nt-login-page">
      <img className="nt-bg-img" src="/Img/allbackground1.jpg" alt="" />

      <div className="nt-login-container">
        <LoginHeader />

        {/* GOOGLE */}
        <div className="nt-login-socials">
          <button
            className="nt-btn-social nt-btn-google"
            type="button"
            onClick={handleGoogleClick}
          >
            <span className="nt-icon-wrap">
              <img src="/Img/google.webp" alt="Google" />
            </span>
            <span>Tiếp tục với Google</span>
          </button>
        </div>

        {/* HOẶC */}
        <div className="nt-login-separator">
          <span className="line" />
          <span className="label">Hoặc</span>
          <span className="line" />
        </div>

        {/* SỐ ĐIỆN THOẠI */}
        <div className="nt-login-phone-area">
          <div className="nt-phone-row">
            <input
              type="tel"
              placeholder="Số điện thoại"
              className="nt-phone-input"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
            <button
              className="nt-btn-primary"
              type="button"
              onClick={handleContinuePhone}
            >
              Tiếp tục
            </button>
          </div>
        </div>

        <button
          className="nt-btn-register"
          type="button"
          onClick={handleGotoRegister}
        >
          Đăng ký tài khoản
        </button>

        <LoginFooter />

        <GoogleAccountPopup
          open={googlePopup}
          accounts={[
            { email: "loan@gmail.com", name: "Loan Nguyễn" },
            { email: "khiem.dev@gmail.com", name: "Khiêm Developer" },
          ]}
          onChoose={handleChooseGoogleAccount}
          onClose={() => setGooglePopup(false)}
        />
      </div>
    </div>
  );
}
