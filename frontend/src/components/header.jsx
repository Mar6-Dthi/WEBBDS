// src/components/NhatotHeader.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Menu, Heart, MessageCircle, Bell, User } from "lucide-react";
import "../styles/header.css";
import AccountModal from "./AccountModal";
import { getMyNotificationsMock } from "../services/mockFavoriteService";

// ✅ import service chat
import {
  getMyUnreadChatsCountMock,
  markChatsAsReadMock,
} from "../services/mockChatService";

import NotificationModal from "./NotificationModal";

export default function NhatotHeader() {
  const navigate = useNavigate();

  // trạng thái login
  const isLoggedIn = !!localStorage.getItem("accessToken");
  const accountName = localStorage.getItem("accountName") || "";
  const shortName =
    accountName.trim() === ""
      ? ""
      : accountName.trim().slice(0, 4).toUpperCase();

  // modal
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // badge
  const [notifCount, setNotifCount] = useState(0);      // thông báo tim bài
  const [chatUnread, setChatUnread] = useState(0);      // tin nhắn chưa đọc

  // ====== THÔNG BÁO (tim bài) ======
  const refreshNotifications = () => {
    if (!isLoggedIn) {
      setNotifCount(0);
      return;
    }
    const list = getMyNotificationsMock();
    setNotifCount(list.length); // nếu sau này có isRead thì chỉ đếm chưa đọc
  };

  // ====== TIN NHẮN (chat) ======
  const refreshChatUnread = () => {
    if (!isLoggedIn) {
      setChatUnread(0);
      return;
    }
    const count = getMyUnreadChatsCountMock();
    setChatUnread(count);
  };

  useEffect(() => {
    // load lần đầu
    refreshNotifications();

    const handler = () => {
      refreshNotifications();
    };

    window.addEventListener("mock-notifications-changed", handler);
    return () => {
      window.removeEventListener("mock-notifications-changed", handler);
    };
  }, [isLoggedIn]);

  useEffect(() => {
    // load lần đầu cho badge tin nhắn
    refreshChatUnread();

    const chatHandler = () => {
      refreshChatUnread();
    };

    window.addEventListener("mock-chats-changed", chatHandler);
    return () => {
      window.removeEventListener("mock-chats-changed", chatHandler);
    };
  }, [isLoggedIn]);

  // click vào chức năng cần đăng nhập
  const handleProtectedClick = (path) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (path) navigate(path);
  };

  // Bấm chuông → mở modal + reset badge = 0 (nhưng KHÔNG sửa isRead trong storage)
  const handleBellClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setNotifCount(0);    // số trên icon về 0
    setIsNotifOpen(true);
  };

  // Bấm icon Tin nhắn
  const handleMessagesClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }

    // Đánh dấu tất cả tin là đã đọc + reset badge
    markChatsAsReadMock();
    setChatUnread(0);

    // Điều hướng sang trang danh sách tin nhắn
    navigate("/tin-nhan");
  };

  return (
    <>
      {/* HEADER CỐ ĐỊNH */}
      <header className="mk-header-fixed" role="banner">
        <div className="mk-container mk-header-row">
          <div className="mk-left mk-left-edge">
            <button className="mk-icon-btn" aria-label="Menu">
              <Menu />
            </button>

            {/* Logo về trang HomeNhaTot */}
            <NavLink
              to="/nhatot"  // nếu HomeNhaTot đang ở "/", đổi lại cho đúng route chị đang dùng
              className="mk-logo"
              aria-label="Nhà Tốt"
            >
              NHÀ<span>TỐT</span>
            </NavLink>

            <nav className="mk-nav" aria-label="Chuyển mục">
              <a href="#">Kênh môi giới</a>
              <a href="#">Chợ Tốt</a>
              <a href="#">Xe cộ</a>
              <a href="#" style={{ fontWeight: 800 }}>
                Bất động sản
              </a>
              <a href="#">Việc làm</a>
            </nav>
          </div>

          <div className="mk-right mk-right-edge">
            {/* YÊU THÍCH */}
            <button
              className="mk-icon-pill"
              aria-label="Yêu thích"
              onClick={() => handleProtectedClick("/yeu-thich")}
            >
              <Heart />
            </button>

            {/* TIN NHẮN + badge chưa đọc */}
            <button
              className="mk-icon-pill"
              aria-label="Tin nhắn"
              onClick={handleMessagesClick}
            >
              <MessageCircle />
              {chatUnread > 0 && (
                <span className="mk-badge-count">
                  {chatUnread > 9 ? "9+" : chatUnread}
                </span>
              )}
            </button>

            {/* THÔNG BÁO */}
            <button
              className="mk-icon-pill mk-bell"
              aria-label="Thông báo"
              onClick={handleBellClick}
            >
              <Bell />
              {notifCount > 0 && (
                <span className="mk-badge-count">
                  {notifCount > 9 ? "9+" : notifCount}
                </span>
              )}
            </button>

            {/* QUẢN LÝ TIN */}
            <button
              className="mk-chip"
              type="button"
              onClick={() => handleProtectedClick("/quan-ly-tin")}
            >
              Quản lý tin
            </button>

            {/* ĐĂNG TIN */}
            <button
              className="mk-chip mk-post"
              type="button"
              onClick={() => handleProtectedClick("/dang-tin")}
            >
              Đăng tin
            </button>

            {/* AVATAR / ACCOUNT */}
            <button
              type="button"
              className="mk-avatar"
              aria-label="Tài khoản"
              onClick={() => setIsAccModalOpen(true)}
            >
              {isLoggedIn ? <span>{shortName}</span> : <User size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* ACCOUNT MODAL */}
      <AccountModal
        open={isAccModalOpen}
        onClose={() => setIsAccModalOpen(false)}
        isLoggedIn={isLoggedIn}
        userName={accountName}
      />

      {/* LOGIN MODAL */}
      {showLoginModal && (
        <div className="login-modal-backdrop">
          <div className="login-modal">
            <h3>Đăng nhập để tiếp tục</h3>
            <p>Bạn cần đăng nhập để sử dụng chức năng này.</p>
            <div className="login-modal-actions">
              <button
                className="btn-primary"
                onClick={() => {
                  setShowLoginModal(false);
                  navigate("/login");
                }}
              >
                Đăng nhập
              </button>
              <button
                className="btn-ghost"
                onClick={() => setShowLoginModal(false)}
              >
                Để sau
              </button>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICATION MODAL */}
      <NotificationModal
        open={isNotifOpen}
        onClose={() => setIsNotifOpen(false)}
      />
    </>
  );
}
