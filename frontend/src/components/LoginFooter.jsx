// src/components/LoginFooter.jsx
import React from "react";

export default function LoginFooter() {
  return (
    <div className="nt-login-footer">
      <div className="footer-links">
        <a href="#">Quy chế hoạt động sàn</a>
        <span className="dot" />
        <a href="#">Chính sách bảo mật</a>
        <span className="dot" />
        <a href="#">Liên hệ hỗ trợ</a>
      </div>

      <div className="footer-logos">
        <img src="/Img/logoChoTot.avif" alt="Chợ Tốt" />
        <img src="/Img/logoNhaTot.avif" alt="Nhà Tốt" />
        <img src="/Img/logoViecLamTot.avif" alt="Việc Làm Tốt" />
        <img src="/Img/logoChoTotXe.avif" alt="Chợ Tốt Xe" />
      </div>
    </div>
  );
}
