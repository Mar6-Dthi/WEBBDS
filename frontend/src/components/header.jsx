// src/components/NhatotHeader.jsx
import React, { useState, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Heart, MessageCircle, Bell, User } from "lucide-react";
import "../styles/header.css";
import AccountModal from "./AccountModal";
import {
  getMyNotificationsMock,
  seedNotificationsForCurrentUser,
} from "../services/mockFavoriteService";
import {
  getMyUnreadChatsCountMock,
  markChatsAsReadMock,
} from "../services/mockChatService";
import NotificationModal from "./NotificationModal";

// Đọc thông tin user cho header
function getHeaderUserInfo() {
  const accessToken = localStorage.getItem("accessToken");
  const isLoggedIn = !!accessToken;

  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    currentUser = null;
  }

  const accountName = (localStorage.getItem("accountName") || "").trim();
  const displayName = (currentUser?.name || accountName || "").trim();

  const avatarUrl =
    currentUser?.avatarUrl ||
    currentUser?.photoURL ||
    currentUser?.picture ||
    "";

  return { isLoggedIn, displayName, avatarUrl };
}

export default function NhatotHeader() {
  const navigate = useNavigate();

  // ==== USER STATE (để khi đổi avatar bắn event là header update) ====
  const [userInfo, setUserInfo] = useState(() => getHeaderUserInfo());
  const { isLoggedIn, displayName, avatarUrl } = userInfo;

  const initial =
    displayName !== "" ? displayName.charAt(0).toUpperCase() : "";

  // ==== MODAL / BADGES ====
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isAccModalOpen, setIsAccModalOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);
  const [chatUnread, setChatUnread] = useState(0);

  // Khi profile thay đổi (avatar, tên...), hoặc storage thay đổi → reload userInfo
  useEffect(() => {
    const handleProfileChange = () => {
      setUserInfo(getHeaderUserInfo());
    };

    window.addEventListener("profile-changed", handleProfileChange);
    window.addEventListener("storage", handleProfileChange);

    return () => {
      window.removeEventListener("profile-changed", handleProfileChange);
      window.removeEventListener("storage", handleProfileChange);
    };
  }, []);

  // ===== NOTIFICATIONS =====
  const refreshNotifications = () => {
    if (!isLoggedIn) {
      setNotifCount(0);
      return;
    }
    seedNotificationsForCurrentUser();
    const list = getMyNotificationsMock();
    setNotifCount(list.length);
  };

  useEffect(() => {
    refreshNotifications();
    const handler = () => refreshNotifications();
    window.addEventListener("mock-notifications-changed", handler);
    return () =>
      window.removeEventListener("mock-notifications-changed", handler);
  }, [isLoggedIn]);

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
    refreshChatUnread();
    const chatHandler = () => refreshChatUnread();
    window.addEventListener("mock-chats-changed", chatHandler);
    return () => window.removeEventListener("mock-chats-changed", chatHandler);
  }, [isLoggedIn]);

  // require login cho các nút
  const handleProtectedClick = (path) => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    if (path) navigate(path);
  };

  const handleBellClick = () => {
    if (!isLoggedIn) {
      setShowLoginModal(true);
      return;
    }
    setNotifCount(0);
    setIsNotifOpen(true);
  };

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
          {/* LEFT */}
          <div className="mk-left mk-left-edge">
            <NavLink to="/nhatot" className="mk-logo" aria-label="Trang chủ">
              <img src="/Img/logo.png" alt="Nhà Tốt" className="mk-logo-img" />
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

          {/* RIGHT */}
          <div className="mk-right mk-right-edge">
            <button
              className="mk-icon-pill"
              aria-label="Yêu thích"
              onClick={() => handleProtectedClick("/yeu-thich")}
            >
              <Heart />
            </button>

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

            <button
              className="mk-chip"
              type="button"
              onClick={() => handleProtectedClick("/quan-ly-tin")}
            >
              Quản lý tin
            </button>

            <button
              className="mk-chip mk-post"
              type="button"
              onClick={() => handleProtectedClick("/dang-tin")}
            >
              Đăng tin
            </button>

            {/* AVATAR – mở panel tài khoản (hoặc modal login nếu chưa login) */}
            <button
              type="button"
              className="mk-avatar"
              aria-label="Tài khoản"
              onClick={() => {
                if (!isLoggedIn) {
                  setShowLoginModal(true);
                  return;
                }
                setIsAccModalOpen(true);
              }}
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
        userAvatar={avatarUrl}
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
