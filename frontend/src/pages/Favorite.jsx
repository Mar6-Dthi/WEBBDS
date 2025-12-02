// src/pages/Favorite.jsx
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Heart } from "lucide-react";
import "../styles/Favorite.css";
import "../styles/header.css";
import NhatotHeader from "../components/header";
import ChatModal from "../components/ChatModal";

// 🧡 DÙNG CHUNG VỚI LISTING
import { getFavoriteIds, toggleFavorite } from "../services/mockFavoriteService";
import { getMockListings } from "../services/mockListingService";

/* ===== helper ===== */
function getCurrentUserId() {
  try {
    const u = JSON.parse(localStorage.getItem("currentUser") || "{}");
    return u.id || u.phone || null;
  } catch {
    return null;
  }
}

// Lấy danh sách tin đã tim từ mock (favorites_mock + MOCK_LISTINGS)
function getFavorites() {
  try {
    const ids = getFavoriteIds() || [];
    const all = getMockListings() || [];
    return all.filter((p) => ids.includes(p.id));
  } catch {
    return [];
  }
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
  const [userId, setUserId] = useState(null);
  const [list, setList] = useState([]);
  const [sessionLikes, setSessionLikes] = useState({}); // trạng thái tim trong phiên

  // state cho cửa sổ chat
  const [chatPost, setChatPost] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    const id = getCurrentUserId();
    setUserId(id);

    // Lưu sẵn toàn bộ posts để PostDetail F5 vẫn đọc được
    try {
      const all = getMockListings();
      localStorage.setItem("posts", JSON.stringify(all));
    } catch {
      // ignore
    }

    if (id) {
      const favs = getFavorites();
      setList(favs);

      const init = {};
      favs.forEach((it) => {
        const k = it.id ?? `${it.title}|${it.price}`;
        init[k] = true;
      });
      setSessionLikes(init);
    }
  }, []);

  const handleToggleFavorite = (item) => {
    const key = item.id ?? `${item.title}|${item.price}`;
    const currentLiked = sessionLikes[key] ?? true;
    const nextLiked = !currentLiked;

    // 1. cập nhật UI (chỉ đổi màu tim, KHÔNG xoá item khỏi list)
    setSessionLikes((prev) => ({
      ...prev,
      [key]: nextLiked,
    }));

    // 2. cập nhật kho tim chung (favorites_mock)
    toggleFavorite(item.id);
    // -> lần sau reload trang Yêu thích, những tin bỏ tim sẽ tự biến mất
  };

  // bấm Chat
  const handleChatClick = (item) => {
    if (!userId) {
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
            {!userId && (
              <div className="fav-empty">
                <p>Vui lòng đăng nhập để xem danh sách tin đã lưu.</p>
              </div>
            )}

            {/* login nhưng rỗng */}
            {userId && total === 0 && (
              <div className="fav-empty">
                <p>Hiện tại chị chưa lưu tin nào.</p>
                <p>💛 Hãy bấm trái tim ở tin đăng để lưu lại.</p>
              </div>
            )}

            {/* có tin */}
            {userId && total > 0 && (
              <div className="fav-list">
                {list.map((item, idx) => {
                  const likeKey = item.id ?? `${item.title}|${item.price}`;
                  const liked = sessionLikes[likeKey] ?? true;

                  const detailPath =
                    item.to || (item.id ? `/post/${item.id}` : "#");

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
                          {formatPriceVND(item.priceValue)}
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
