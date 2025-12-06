import React from "react";
import { X, ChevronRight, User } from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/AccountModal.css";

export default function AccountModal({
  open,
  onClose,
  isLoggedIn,
  userName,
  userAvatar,          // 👈 thêm
}) {
  const navigate = useNavigate();
  if (!open) return null;

  const trimmedName = (userName || "").trim();
  const shortName =
    trimmedName === "" ? "" : trimmedName.slice(0, 4).toUpperCase();
  const firstLetter =
    trimmedName === "" ? "U" : trimmedName.charAt(0).toUpperCase();

  const goLogin = () => {
    onClose?.();
    navigate("/login");
  };

  const goRegister = () => {
    onClose?.();
    navigate("/register");
  };

  const handleRowClick = (path) => {
    onClose?.();
    if (path) navigate(path);
  };

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("accountName");
    localStorage.removeItem("currentUser");
    onClose?.();
    navigate("/login");
  };

  const handleGoProfile = () => {
    onClose?.();
    navigate("/trang-ca-nhan");
  };

  return (
    <div className="acc-backdrop" onClick={onClose}>
      <aside
        className="acc-panel"
        onClick={(e) => e.stopPropagation()}
      >
        <button className="acc-close" type="button" onClick={onClose}>
          <X size={20} />
        </button>

        <header className="acc-header">
          {isLoggedIn ? (
            <button
              type="button"
              className="acc-header-logged"
              onClick={handleGoProfile}
            >
              <div className="acc-avatar-big">
                {userAvatar ? (
                  <img
                    src={userAvatar}
                    alt={userName || "Tài khoản"}
                    className="acc-avatar-img"
                  />
                ) : shortName ? (
                  <span>{firstLetter}</span>
                ) : (
                  <User size={26} />
                )}
              </div>
              <div className="acc-header-text">
                <div className="acc-hello">Xin chào,</div>
                <div className="acc-name">{userName}</div>
              </div>
            </button>
          ) : (
            <div className="acc-header-guest">
              <div className="acc-header-title">Mua thì hời, bán thì lời.</div>
              <div className="acc-header-sub">Đăng nhập cái đã!</div>

              <div className="acc-header-actions">
                <button
                  type="button"
                  className="acc-btn-outline"
                  onClick={goRegister}
                >
                  Tạo tài khoản
                </button>
                <button
                  type="button"
                  className="acc-btn-primary"
                  onClick={goLogin}
                >
                  Đăng nhập
                </button>
              </div>
            </div>
          )}
        </header>

        <div className="acc-body">
          <section className="acc-section">
            <h4 className="acc-section-title">Tiện ích</h4>

            <button
              type="button"
              className="acc-row"
              onClick={() => handleRowClick("/tin-da-luu")}
            >
              <span>Tin đăng đã lưu</span>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className="acc-row"
              onClick={() => handleRowClick("/tim-kiem-da-luu")}
            >
              <span>Tìm kiếm đã lưu</span>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className="acc-row"
              onClick={() => handleRowClick("/lich-su-xem")}
            >
              <span>Lịch sử xem tin</span>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className="acc-row"
              onClick={() => handleRowClick("/danh-gia-cua-toi")}
            >
              <span>Đánh giá từ tôi</span>
              <ChevronRight size={16} />
            </button>
          </section>

          <section className="acc-section">
            <h4 className="acc-section-title">Dịch vụ trả phí</h4>

            <button
              type="button"
              className="acc-row"
              onClick={() => handleRowClick("/dong-tot")}
            >
              <span>Đồng Tốt</span>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className="acc-row"
              onClick={() => handleRowClick("/goi-pro")}
            >
              <span>Gói PRO</span>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className="acc-row"
              onClick={() => handleRowClick("/kenh-doi-tac")}
            >
              <span>Kênh Đối Tác</span>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className="acc-row"
              onClick={() => handleRowClick("/lich-su-giao-dich")}
            >
              <span>Lịch sử giao dịch</span>
              <ChevronRight size={16} />
            </button>

            <button
              type="button"
              className="acc-row"
              onClick={() => handleRowClick("/cua-hang-chuyen-trang")}
            >
              <span>Cửa hàng / chuyên trang</span>
              <ChevronRight size={16} />
            </button>
          </section>

          {isLoggedIn && (
            <section className="acc-section acc-section-logout">
              <button
                type="button"
                className="acc-row acc-row-logout"
                onClick={handleLogout}
              >
                <span>Đăng xuất</span>
                <ChevronRight size={16} />
              </button>
            </section>
          )}
        </div>
      </aside>
    </div>
  );
}
