// src/components/LoginHeader.jsx
import React from "react";

export default function LoginHeader() {
  return (
    <div className="nt-login-header">
      <div>
        <h1>Đăng nhập/Đăng ký</h1>
        <p className="nt-login-sub">
          Đăng nhập để quản lý tin đăng, lưu tin yêu thích và nhận thông báo
          bất động sản mới nhất.
        </p>
      </div>
      <img
        className="nt-login-mascot"
        src="/Img/iconLogin.avif"
        alt="Chợ Tốt mascot"
      />
    </div>
  );
}
