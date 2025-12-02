// src/components/GoogleAccountPopup.jsx
import React from "react";
import "../styles/GoogleAccountPopup.css";

export default function GoogleAccountPopup({
  open,
  accounts,
  onChoose,
  onClose,
}) {
  if (!open) return null;

  // fallback avatar = chữ cái đầu
  const getInitial = (name = "") => name.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="gg-popup">
      <div className="gg-dialog">
        {/* Thanh trên giống Google */}
        <div className="gg-topbar">
          <div className="gg-topbar-left">
            <img
              src="/Img/google.webp"
              alt="Google"
              className="gg-topbar-logo"
            />
            <span>Đăng nhập bằng Google</span>
          </div>
          <button className="gg-topbar-close" onClick={onClose}>
            ✕
          </button>
        </div>

        {/* Nội dung chính */}
        <div className="gg-main">
          {/* App logo + tiêu đề */}
          <div className="gg-app-row">
            <div className="gg-app-icon">TỐT</div>
            <div>
              <h2 className="gg-title">Chọn tài khoản</h2>
              <p className="gg-sub">
                Tiếp tục tới{" "}
                <span className="gg-app-name">Ứng dụng Nhà Tốt</span>
              </p>
            </div>
          </div>

          {/* Danh sách tài khoản */}
          <div className="gg-account-list">
            {accounts.map((acc) => (
              <button
                key={acc.email}
                type="button"
                className="gg-account-row"
                onClick={() => onChoose(acc)}
              >
                <div className="gg-avatar">
                  {acc.avatarUrl ? (
                    <img src={acc.avatarUrl} alt={acc.name} />
                  ) : (
                    getInitial(acc.name)
                  )}
                </div>

                <div className="gg-account-text">
                  <div className="gg-name">{acc.name}</div>
                  <div className="gg-email">{acc.email}</div>
                </div>

                {acc.signedOut && (
                  <div className="gg-status">Đã đăng xuất</div>
                )}
              </button>
            ))}
          </div>

          {/* Tài khoản khác */}
          <button
            type="button"
            className="gg-other-account"
            onClick={() =>
              alert("Mock: ở đây sẽ mở form đăng nhập tài khoản khác 😊")
            }
          >
            Sử dụng tài khoản khác
          </button>
        </div>
      </div>
    </div>
  );
}
