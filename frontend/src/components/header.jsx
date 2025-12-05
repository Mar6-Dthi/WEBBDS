// src/components/NhatotHeader.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Bell, User } from "lucide-react";
import "../styles/header.css";
import AccountModal from "./AccountModal";
import {
  getMyNotificationsMock,
  seedNotificationsForCurrentUser, // vẫn giữ seed
} from "../services/mockFavoriteService";

// Chat services
import {
  getMyUnreadChatsCountMock,
  markChatsAsReadMock,
} from "../services/mockChatService";

import NotificationModal from "./NotificationModal";

export default function NhatotHeader() {
  const navigate = useNavigate();

  // ====== LOGIN INFO ======
  const isLoggedIn = !!localStorage.getItem("accessToken");
  const accountName = (localStorage.getItem("accountName") || "").trim();

  // lấy currentUser (nếu đăng nhập Google thì nên lưu ở đây)
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    currentUser = null;
  }

  const displayName = (currentUser?.name || accountName || "").trim();

  // avatar từ Google (mock)
  const avatarUrl =
    currentUser?.avatarUrl ||
    currentUser?.photoURL ||
    currentUser?.picture ||
    "";

  // chữ cái đầu khi không có ảnh
  const initial =
    displayName !== "" ? displayName.charAt(0).toUpperCase() : "";

  // ====== MODAL STATE ======
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);

  // badges
  const [notifCount, setNotifCount] = useState(0);
  const [chatUnread, setChatUnread] = useState(0);

  // ===== NOTIFICATIONS =====
  const refreshNotifications = () => {
    if (!isLoggedIn) {
      setNotifCount(0);
      return;
    }

    // luôn seed vài thông báo mock cho user hiện tại nếu chưa có
    seedNotificationsForCurrentUser();

    const list = getMyNotificationsMock();
    setNotifCount(list.length);
  };

  // ===== CHAT UNREAD =====
  const refreshChatUnread = () => {
    if (!isLoggedIn) {
      setChatUnread(0);
      return;
    }
    const count = getMyUnreadChatsCountMock();
    setChatUnread(count);
  };

  useEffect(() => {
    refreshNotifications();

    const handler = () => {
      refreshNotifications();
    };

    window.addEventListener("mock-notifications-changed", handler);
    return () =>
      window.removeEventListener("mock-notifications-changed", handler);
  }, [isLoggedIn]);

  useEffect(() => {
    refreshChatUnread();

    const chatHandler = () => {
      refreshChatUnread();
    };

    window.addEventListener("mock-chats-changed", chatHandler);
    return () => window.removeEventListener("mock-chats-changed", chatHandler);
  }, [isLoggedIn]);

  // require login
  const handleProtectedClick = (path) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (path) navigate(path);
  };

  // bell
  const handleBellClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setNotifCount(0);
    setIsNotifOpen(true);
  };

  // messages
  const handleMessagesClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    markChatsAsReadMock();
    setChatUnread(0);
    navigate("/tin-nhan");
  };

  return (
    <>
      {/* FIXED HEADER */}
      <header className="mk-header-fixed" role="banner">
        <div className="mk-container mk-header-row">
          {/* LEFT SIDE */}
          <div className="mk-left mk-left-edge">
            {/* LOGO ẢNH – CLICK VỀ TRANG CHỦ */}
            <NavLink to="/" className="mk-logo" aria-label="Trang chủ">
              <img src="/Img/logo.png" alt="Nhà Tốt" className="mk-logo-img" />
            </NavLink>

            {/* NAV MENU (đang ẩn bằng CSS) */}
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

          {/* RIGHT SIDE */}
          <div className="mk-right mk-right-edge">
            {/* YÊU THÍCH */}
            <button
              className="mk-icon-pill"
              aria-label="Yêu thích"
              onClick={() => handleProtectedClick("/yeu-thich")}
            >
              <Heart />
            </button>

            {/* TIN NHẮN */}
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

            {/* ACCOUNT / AVATAR */}
            <button
              type="button"
              className="mk-avatar"
              aria-label="Tài khoản"
              onClick={() => setIsAccModalOpen(true)}
            >
              {!isLoggedIn ? (
                <User size={20} />
              ) : avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName || "Tài khoản"}
                  className="mk-avatar-img"
                />
              ) : (
                <span className="mk-avatar-initial">{initial}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ACCOUNT MODAL */}
      <AccountModal
        open={isAccModalOpen}
        onClose={() => setIsAccModalOpen(false)}
        isLoggedIn={isLoggedIn}
        userName={displayName}
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
