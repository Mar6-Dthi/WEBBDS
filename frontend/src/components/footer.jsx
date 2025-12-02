// src/components/footer.jsx
import React from "react";
import { Mail } from "lucide-react";
import "../styles/footer.css";

export default function Footer() {
  return (
    <footer className="mk-footer">
      <div className="mk-footer-inner">
        {/* Col 1: QR + badges */}
        <div className="mk-ft-col">
          <h3 className="mk-ft-title">Tìm bất động sản trên ứng dụng Chợ Tốt</h3>
          <div className="mk-qr-row">
            <img className="mk-qr" src="/Img/QR.png" alt="QR tải app" />
            <div className="mk-badges">
              <a href="#" className="mk-store-badge">
                <img src="/Img/appstore.webp" alt="App Store" />
              </a>
              <a href="#" className="mk-store-badge">
                <img src="/Img/googleplay.webp" alt="Google Play" />
              </a>
            </div>
          </div>
        </div>

        {/* Col 2: Về Nhà Tốt */}
        <div className="mk-ft-col">
          <h3 className="mk-ft-title">Về Nhà Tốt</h3>
          <ul className="mk-ft-links">
            <li><a href="#">Về Nhà Tốt</a></li>
            <li><a href="#">Quy chế hoạt động sàn</a></li>
            <li><a href="#">Chính sách bảo mật</a></li>
            <li><a href="#">Giải quyết tranh chấp</a></li>
            <li><a href="#">Điều khoản sử dụng</a></li>
          </ul>
        </div>

        {/* Col 3: Liên kết + contact */}
        <div className="mk-ft-col">
          <h3 className="mk-ft-title">Liên kết</h3>

          <div className="mk-socials">
            <a
              href="https://www.linkedin.com/company/chotot"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="LinkedIn"
              className="mk-social-btn mk-ln"
              title="LinkedIn"
            >
              <img className="mk-social-icon" src="/Img/linkedin.webp" alt="LinkedIn" />
            </a>

            <a
              href="https://www.youtube.com/@chotot"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="mk-social-btn mk-yt"
              title="YouTube"
            >
              <img className="mk-social-icon" src="/Img/youtube.webp" alt="YouTube" />
            </a>

            <a
              href="https://www.facebook.com/ChoTot.vn"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="mk-social-btn mk-fb"
              title="Facebook"
            >
              <img className="mk-social-icon" src="/Img/facebook.webp" alt="Facebook" />
            </a>
          </div>

          <div className="mk-contact">
            <p className="mk-contact-line">
              <Mail size={16} /> <span>Email: trogiup@chotot.vn</span>
            </p>
            <p className="mk-contact-line">CSKH: 19003003 (1.000đ/phút)</p>
            <p className="mk-contact-line">
              Địa chỉ: Tầng 18, Tòa nhà UOA, Số 6 đường Tân Trào, Phường Tân Mỹ,
              Thành phố Hồ Chí Minh, Việt Nam
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
