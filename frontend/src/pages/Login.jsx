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
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveMockUsers(list) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(list));
}

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [googlePopup, setGooglePopup] = useState(false);

  // ================= GOOGLE LOGIN =================
  const handleGoogleClick = () => {
    setGooglePopup(true);
  };

  // src/pages/Login.jsx (chỉ thay hàm này)

  const handleChooseGoogleAccount = (acc) => {
    // 1. Lưu accessToken + tên hiển thị (dùng cho header)
    localStorage.setItem("accessToken", "google-" + Date.now());
    localStorage.setItem("accountName", acc.name || acc.email);
    // Tài khoản GG: chưa có số điện thoại -> để trống
    localStorage.setItem("accountPhone", "");

    // 2. Cập nhật vào mockUsers với loginMethod = "google"
    const users = getMockUsers();
    const id = acc.email;
    const name = acc.name || acc.email;

    const idx = users.findIndex((u) => u.id === id || u.phone === id);

    let user;
    if (idx === -1) {
      user = {
        id,
        phone: "",            // KHÔNG gán email vào phone nữa
        name,
        email: id,
        loginMethod: "google",
      };
      users.push(user);
    } else {
      user = {
        ...users[idx],
        id,
        name,
        email: users[idx].email || id,
        phone: users[idx].phone || "",
        loginMethod: "google",
      };
      users[idx] = user;
    }
    localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));

    // 3. Lưu currentUser cho toàn site dùng
    const currentUser = { ...user };
    localStorage.setItem("currentUser", JSON.stringify(currentUser));

    // 4. Đóng popup & chuyển về Home
    setGooglePopup(false);
    navigate("/");
  };


  // ================= LOGIN BẰNG SĐT =================
  const handleContinuePhone = () => {
    if (!phone.trim()) {
      alert("Vui lòng nhập số điện thoại");
      return;
    }

    const users = getMockUsers();
    const exists = users.some((u) => u.phone === phone.trim());

    if (exists) {
      // đã có tài khoản → sang màn hình nhập mật khẩu
      navigate("/login-password", { state: { phone: phone.trim() } });
    } else {
      // chưa có → sang màn đăng ký
      navigate("/register-new", { state: { phone: phone.trim() } });
    }
  };

  const handleGotoRegister = () => {
    navigate("/register-new", { state: { phone: phone.trim() } });
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
