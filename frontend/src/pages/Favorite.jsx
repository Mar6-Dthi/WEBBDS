// src/pages/Favorite.jsx
import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import { Heart } from "lucide-react";
import "../styles/Favorite.css";
import "../styles/header.css";
import NhatotHeader from "../components/header";
import ChatModal from "../components/ChatModal";

import {
  getFavoriteIds,
  toggleFavorite,
  toggleFavoriteMock,
  getFavoritePosts,
} from "../services/mockFavoriteService";

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
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [list, setList] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(() => new Set(getFavoriteIds() || []));

  // state cho cửa sổ chat
  const [chatPost, setChatPost] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  useEffect(() => {
    // kiểm tra login theo accessToken hoặc currentUser (vẫn giữ rule cũ cho phần chat)
    const hasToken = !!localStorage.getItem("accessToken");
    const hasUser = !!localStorage.getItem("currentUser");
    setIsLoggedIn(hasToken || hasUser);

    // load danh sách tin yêu thích từ mockFavoriteService
    const favPosts = getFavoritePosts();
    setList(favPosts);

    // đồng bộ lại set ID tim
    setFavoriteIds(new Set(getFavoriteIds() || []));
  }, []);

  const handleToggleFavorite = (item) => {
    const id = String(item.postId ?? item.id);
    if (!id) return;

    // 1. Đảo trạng thái yêu thích trong store ID
    const { ids, added } = toggleFavorite(id);
    setFavoriteIds(new Set(ids));

    // 2. Cập nhật kho bài yêu thích (favorite_posts)
    //    item ở đây đã có cấu trúc từ getFavoritePosts (postId, postTitle, ...)
    toggleFavoriteMock(item, added);

    // 3. Cập nhật lại danh sách hiển thị
    const nextList = getFavoritePosts();
    setList(nextList);
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

            {/* chưa có tin yêu thích */}
            {total === 0 && (
              <div className="fav-empty">
                <p>Hiện tại chị chưa lưu tin nào.</p>
                <p>💛 Hãy bấm trái tim ở tin đăng để lưu lại.</p>
              </div>
            )}

            {/* có tin */}
            {total > 0 && (
              <div className="fav-list">
                {list.map((item, idx) => {
                  const id = String(item.postId ?? item.id ?? idx);
                  const liked = favoriteIds.has(id);

                  const title = item.postTitle ?? item.title ?? "Tin đăng";
                  const thumb = item.postThumbnail ?? item.coverUrl;
                  const priceValue =
                    item.postPrice ?? item.priceValue ?? item.price;
                  const location =
                    item.postLocation ?? item.address ?? item.location;

                  const detailId = item.postId ?? item.id;
                  const detailPath = detailId ? `/post/${detailId}` : "#";

                  return (
                    <div className="fav-item" key={id}>
                      {/* ảnh */}
                      <NavLink
                        to={detailPath}
                        state={{ item }}
                        className="fav-thumb"
                        aria-label={title}
                      >
                        {thumb ? (
                          <img src={thumb} alt={title} />
                        ) : (
                          <div className="fav-thumb-placeholder" />
                        )}
                      </NavLink>

                      {/* thông tin */}
                      <div className="fav-content">
                        <NavLink
                          to={detailPath}
                          state={{ item }}
                          className="fav-item-title"
                        >
                          {title}
                        </NavLink>

                        <div className="fav-item-price">
                          {formatPriceVND(priceValue)}
                        </div>

                        <div className="fav-item-meta">
                          {location && <span>{location}</span>}
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
