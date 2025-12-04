// src/pages/Favorite.jsx
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Heart } from "lucide-react";
import "../styles/Favorite.css";
import "../styles/header.css";
import NhatotHeader from "../components/header";
import ChatModal from "../components/ChatModal";

/* ===== helper: key dùng chung với Post.jsx ===== */

/**
 * Lấy key để lưu favorites:
 *  - Nếu có currentUser.id / phone → dùng cái đó
 *  - Nếu không nhưng có accessToken → dùng "user_<accessToken>"
 *  - Nếu không có gì → null (coi như chưa login)
 */
function getFavoriteUserKey() {
  try {
    const rawUser = localStorage.getItem("currentUser");
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u.id || u.phone) return String(u.id || u.phone);
    }
  } catch {
    // ignore
  }

  const token = localStorage.getItem("accessToken");
  if (token) return "user_" + token;

  return null;
}

// Lấy danh sách bài đã lưu theo userKey
function loadFavoritesForUser(userKey) {
  if (!userKey) return [];
  try {
    const raw = localStorage.getItem("favorites_" + userKey) || "[]";
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

// Lưu danh sách favorites
function saveFavoritesForUser(userKey, list) {
  if (!userKey) return;
  localStorage.setItem("favorites_" + userKey, JSON.stringify(list));
}

function formatPriceVND(n) {
  if (n == null) return "";
  const num = Number(n);
  if (!Number.isFinite(num)) return "";

  if (num >= 1_000_000_000) return `${+(num / 1_000_000_000).toFixed(2)} tỷ`;
  if (num >= 1_000_000) return `${+(num / 1_000_000).toFixed(0)} tr`;
  return num.toLocaleString("vi-VN") + " đ";
}

/* ===== Component chính ===== */
export default function Favorite() {
  const [userKey, setUserKey] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [list, setList] = useState([]);
  const [sessionLikes, setSessionLikes] = useState({}); // trạng thái tim trong phiên

  // state cho cửa sổ chat
  const [chatPost, setChatPost] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // kiểm tra login theo accessToken hoặc currentUser
    const hasToken = !!localStorage.getItem("accessToken");
    const hasUser = !!localStorage.getItem("currentUser");

    if (!hasToken && !hasUser) {
      setIsLoggedIn(false);
      return;
    }
    setIsLoggedIn(true);

    const key = getFavoriteUserKey();
    setUserKey(key);

    const favs = loadFavoritesForUser(key);
    setList(favs);

    // trạng thái tim trong phiên (mặc định tất cả đang được tim)
    const init = {};
    favs.forEach((it) => {
      const k = it.id ?? `${it.title}|${it.price}`;
      init[k] = true;
    });
    setSessionLikes(init);
  }, []);

  const handleToggleFavorite = (item) => {
    const key = item.id ?? `${item.title}|${item.price}`;
    const currentLiked = sessionLikes[key] ?? true;
    const nextLiked = !currentLiked;

    // 1. Cập nhật UI: chỉ đổi màu tim, KHÔNG xoá item khỏi list
    setSessionLikes((prev) => ({
      ...prev,
      [key]: nextLiked,
    }));

    // 2. Cập nhật localStorage: bỏ tim → xoá khỏi favorites_<userKey>
    if (!userKey) return;

    const currentList = loadFavoritesForUser(userKey);

    let nextList;
    if (nextLiked) {
      // thêm lại (trường hợp user bấm tim lại khi chưa reload)
      const existed = currentList.some(
        (p) => (p.id ?? `${p.title}|${p.price}`) === key
      );
      nextList = existed ? currentList : [...currentList, item];
    } else {
      // bỏ tim → xoá khỏi kho
      nextList = currentList.filter(
        (p) => (p.id ?? `${p.title}|${p.price}`) !== key
      );
    }

    saveFavoritesForUser(userKey, nextList);
    // ❗ KHÔNG cập nhật state `list` để item vẫn còn hiển thị tới khi reload
  };

  // bấm Chat
  const handleChatClick = (item) => {
    if (!isLoggedIn) {
      alert("Vui lòng đăng nhập để chat với người đăng tin.");
      return;
    }
    setChatPost(item);
    setIsChatOpen(true);
  };

  const total = list.length;

  return (
    <div className="nhatot">
      {/* HEADER NHÀ TỐT */}
      <NhatotHeader />

      {/* NỘI DUNG TRANG YÊU THÍCH */}
      <div className="fav-page">
        <main className="fav-main" style={{ paddingTop: 88 }}>
          <div className="fav-inner">
            {/* breadcrumb */}
            <div className="fav-breadcrumb">
              <span>Chợ Tốt</span>
              <span className="fav-breadcrumb-sep">»</span>
              <span>Tin đăng đã lưu</span>
            </div>

            <h1 className="fav-title">
              Tin đăng đã lưu{" "}
              <span className="fav-title-count">({total} / 100)</span>
            </h1>

            {/* chưa login */}
            {!isLoggedIn && (
              <div className="fav-empty">
                <p>Vui lòng đăng nhập để xem danh sách tin đã lưu.</p>
              </div>
            )}

            {/* login nhưng rỗng */}
            {isLoggedIn && total === 0 && (
              <div className="fav-empty">
                <p>Hiện tại chị chưa lưu tin nào.</p>
                <p>💛 Hãy bấm trái tim ở tin đăng để lưu lại.</p>
              </div>
            )}

            {/* có tin */}
            {isLoggedIn && total > 0 && (
              <div className="fav-list">
                {list.map((item, idx) => {
                  const likeKey = item.id ?? `${item.title}|${item.price}`;
                  const liked = sessionLikes[likeKey] ?? true;

                  const detailPath =
                    item.to || (item.id ? `/post/${item.id}` : "#");

                  const priceValue = item.priceValue ?? item.price;

                  return (
                    <div className="fav-item" key={item.id ?? idx}>
                      {/* ảnh */}
                      <NavLink
                        to={detailPath}
                        state={{ item }} // gửi data sang PostDetail
                        className="fav-thumb"
                        aria-label={item.title}
                      >
                        <img src={item.coverUrl} alt={item.title} />
                        {item.photos > 0 && (
                          <span className="fav-thumb-count">
                            {item.photos}
                          </span>
                        )}
                      </NavLink>

                      {/* thông tin */}
                      <div className="fav-content">
                        <NavLink
                          to={detailPath}
                          state={{ item }}
                          className="fav-item-title"
                        >
                          {item.title}
                        </NavLink>

                        <div className="fav-item-price">
                          {formatPriceVND(priceValue)}
                        </div>

                        <div className="fav-item-meta">
                          {item.typeLabel && <span>{item.typeLabel}</span>}
                          {item.timeAgo && (
                            <>
                              <span className="fav-dot">•</span>
                              <span>{item.timeAgo}</span>
                            </>
                          )}
                          {(item.address || item.location) && (
                            <>
                              <span className="fav-dot">•</span>
                              <span>{item.address || item.location}</span>
                            </>
                          )}
                        </div>
                      </div>

                      {/* action */}
                      <div className="fav-actions">
                        <button
                          className="fav-chat-btn"
                          type="button"
                          onClick={() => handleChatClick(item)}
                        >
                          Chat
                        </button>
                        <button
                          className={`fav-heart-btn ${
                            liked ? "fav-heart-btn--active" : ""
                          }`}
                          aria-label={
                            liked ? "Bỏ lưu tin" : "Lưu lại tin này"
                          }
                          onClick={() => handleToggleFavorite(item)}
                          type="button"
                        >
                          <Heart
                            size={18}
                            fill={liked ? "currentColor" : "none"}
                          />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>

      {/* CỬA SỔ CHAT */}
      <ChatModal
        open={isChatOpen}
        post={chatPost}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
}
