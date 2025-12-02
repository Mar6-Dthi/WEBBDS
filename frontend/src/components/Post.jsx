// src/components/Post.jsx
import React, { useState, useEffect } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import {
  Heart,
  Camera,
  Clock,
  MapPin,
  BedDouble,
  Ruler,
} from "lucide-react";
import { toggleFavoriteMock } from "../services/mockFavoriteService"; // dùng để tạo thông báo
import { addToViewHistory } from "../services/viewHistoryService";    // 👈 THÊM DÒNG NÀY

function formatPriceVND(n) {
  if (n >= 1_000_000_000) return `${+(n / 1_000_000_000).toFixed(2)} tỷ`;
  if (n >= 1_000_000) return `${+(n / 1_000_000).toFixed(0)} tr`;
  return n.toLocaleString("vi-VN");
}

function formatPerM2(n) {
  if (!n) return null;
  if (n >= 1_000_000) return `${Math.round(n / 1_000_000)} tr/m²`;
  return `${n.toLocaleString("vi-VN")} đ/m²`;
}

/* ===== helper cho yêu thích (localStorage) ===== */

function getCurrentUserId() {
  try {
    const u = JSON.parse(localStorage.getItem("currentUser") || "{}");
    return u.id || u.phone || null;
  } catch {
    return null;
  }
}

function getFavorites(userId) {
  if (!userId) return [];
  try {
    return JSON.parse(localStorage.getItem("favorites_" + userId) || "[]");
  } catch {
    return [];
  }
}

function saveFavorites(userId, list) {
  if (!userId) return;
  localStorage.setItem("favorites_" + userId, JSON.stringify(list));
}

function isItemFavorite(userId, item) {
  if (!userId || !item) return false;
  const list = getFavorites(userId);

  // ưu tiên theo id
  if (item.id != null) {
    return list.some((p) => p.id === item.id);
  }
  // fallback nếu chưa có id
  return list.some((p) => p.title === item.title && p.price === item.price);
}

function toggleFavoriteForUser(userId, item) {
  if (!userId || !item) return;

  let list = getFavorites(userId);

  if (item.id != null) {
    const exists = list.some((p) => p.id === item.id);
    list = exists ? list.filter((p) => p.id !== item.id) : [...list, item];
  } else {
    const exists = list.some(
      (p) => p.title === item.title && p.price === item.price
    );
    list = exists
      ? list.filter(
          (p) => !(p.title === item.title && p.price === item.price)
        )
      : [...list, item];
  }

  saveFavorites(userId, list);
}

/* ===== Component card tin ===== */

export default function Post({ item, to = "#" }) {
  const navigate = useNavigate();
  const userId = getCurrentUserId();

  const {
    title,
    coverUrl,
    timeAgo,
    photos = 0,
    price,
    pricePerM2,
    area,
    beds,
    typeLabel,
    location,
  } = item || {};

  const [liked, setLiked] = useState(false);

  // 🔁 Mỗi lần card (hoặc user) thay đổi → đọc lại trạng thái tim
  useEffect(() => {
    if (!item || !userId) {
      setLiked(false);
      return;
    }
    const fav = isItemFavorite(userId, item);
    setLiked(fav);
  }, [userId, item]);

  const handleLikeClick = (e) => {
    e.preventDefault(); // không cho NavLink chuyển trang khi bấm tim

    if (!userId) {
      // chưa login → điều hướng sang trang đăng nhập
      navigate("/login");
      return;
    }

    // trạng thái hiện tại (trước khi toggle)
    const currentlyLiked = isItemFavorite(userId, item);

    // toggle trong danh sách yêu thích của user
    toggleFavoriteForUser(userId, item);
    setLiked(!currentlyLiked);

    // Nếu là hành động "thêm vào yêu thích" thì tạo thông báo cho chủ bài
    // YÊU CẦU: item phải có ownerName (đã thêm ở POSTS trong HomeNhaTot)
    if (!currentlyLiked && item?.ownerName) {
      toggleFavoriteMock({
        postId: item.id,
        postTitle: item.title,
        ownerName: item.ownerName,
        // nếu muốn có thêm thông tin trong thông báo thì sau này thêm vào:
        // postPrice: item.price,
        // postLocation: item.location,
        // postThumbnail: item.coverUrl,
      });
    }
  };

  const handleCardClick = () => {
    // 👉 lưu lịch sử xem khi bấm vào card (trừ nút tim vì đã preventDefault)
    if (item) {
      addToViewHistory(item);
    }
  };

  return (
    <NavLink
      to={to}
      state={{ item }} // 👈 TRUYỀN TOÀN BỘ DATA SANG TRANG CHI TIẾT
      className="mk-post-card"
      aria-label={title}
      onClick={handleCardClick} // 👈 THÊM SỰ KIỆN CLICK Ở ĐÂY
    >
      {/* Ảnh */}
      <div className="mk-post-media">
        <img src={coverUrl} alt={title} loading="lazy" />

        <button
          type="button"
          aria-label={liked ? "Bỏ yêu thích" : "Yêu thích"}
          className={`mk-like ${liked ? "is-liked" : ""}`}
          onClick={handleLikeClick}
        >
          <Heart size={18} />
        </button>

        {typeof photos === "number" && photos > 0 && (
          <div className="mk-badge mk-photos">
            <Camera size={14} /> <span>{photos}</span>
          </div>
        )}

        {timeAgo && (
          <div className="mk-badge mk-time">
            <Clock size={14} /> <span>{timeAgo}</span>
          </div>
        )}
      </div>

      {/* Nội dung */}
      <div className="mk-post-body">
        <h4 className="mk-post-title">{title}</h4>

        <div className="mk-post-meta">
          {beds ? (
            <span>
              <BedDouble size={14} /> {beds} PN
            </span>
          ) : null}
          {typeLabel ? <span>{typeLabel}</span> : null}
        </div>

        <div className="mk-post-price">
          <div className="mk-price-main">
            {price != null ? formatPriceVND(price) : ""}
          </div>
          <div className="mk-price-sub">
            {pricePerM2 ? <span>{formatPerM2(pricePerM2)}</span> : null}
            {area ? (
              <span className="mk-dot">
                <Ruler size={14} /> {area} m²
              </span>
            ) : null}
          </div>
        </div>

        {location ? (
          <div className="mk-post-loc">
            <MapPin size={14} /> {location}
          </div>
        ) : null}
      </div>
    </NavLink>
  );
}
