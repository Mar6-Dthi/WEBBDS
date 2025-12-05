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

import {
  toggleFavoriteMock,
} from "../services/mockFavoriteService";

import { addToViewHistory } from "../services/viewHistoryService";

/* ================= FORMATTERS ================= */
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

/* ========== FAVORITE LOCAL STORAGE ========= */
function getFavoriteUserKey() {
  try {
    const rawUser = localStorage.getItem("currentUser");
    if (rawUser) {
      const u = JSON.parse(rawUser);
      if (u.id || u.phone) return String(u.id || u.phone);
    }
  } catch {}

  const token = localStorage.getItem("accessToken");
  if (token) return "user_" + token;

  return "guest";
}

function getFavorites(userKey) {
  try {
    return JSON.parse(localStorage.getItem("favorites_" + userKey) || "[]");
  } catch {
    return [];
  }
}

function saveFavorites(userKey, list) {
  localStorage.setItem("favorites_" + userKey, JSON.stringify(list));
}

function isItemFavorite(userKey, item) {
  if (!item) return false;
  const list = getFavorites(userKey);

  if (item.id != null) {
    return list.some((p) => p.id === item.id);
  }
  return list.some((p) => p.title === item.title && p.price === item.price);
}

function toggleFavoriteForUser(userKey, item) {
  if (!item) return;

  let list = getFavorites(userKey);

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

  saveFavorites(userKey, list);
}

/* ================= THE CARD ================= */

export default function Post({ item, to = "#" }) {
  const navigate = useNavigate();
  const userKey = getFavoriteUserKey();
  const accessToken = localStorage.getItem("accessToken");

  const {
    id,
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
    ownerName,  // 🔥 rất quan trọng cho Notification
    isBroker,
  } = item || {};

  const [liked, setLiked] = useState(false);

  /* READ CURRENT FAVORITE STATE */
  useEffect(() => {
    if (!item) {
      setLiked(false);
      return;
    }
    const fav = isItemFavorite(userKey, item);
    setLiked(fav);
  }, [userKey, item]);

  /* ========== LIKE HANDLER ========== */
  const handleLikeClick = (e) => {
    e.preventDefault();

    if (!accessToken) {
      navigate("/login");
      return;
    }

    const currentlyLiked = isItemFavorite(userKey, item);
    toggleFavoriteForUser(userKey, item);
    setLiked(!currentlyLiked);

    // ✔ Chỉ khi "THÊM TIM" → tạo thông báo cho chủ bài
    if (!currentlyLiked && ownerName) {
      toggleFavoriteMock({
        postId: id,
        postTitle: title,
        ownerName,

        // ✔ bổ sung data để NotificationModal hiển thị đẹp
        postPrice: price,
        postLocation: location,
        postThumbnail: coverUrl,
      });
    }
  };

  /* ========== VIEW HISTORY ========== */
  const handleCardClick = () => {
    if (item) addToViewHistory(item);
  };

  /* ========== UI ========== */
  return (
    <NavLink
      to={to}
      state={{ item }}
      className="mk-post-card"
      aria-label={title}
      onClick={handleCardClick}
    >
      <div className="mk-post-media">
        <img src={coverUrl} alt={title} loading="lazy" />

        {isBroker && (
          <div className="mk-badge mk-badge-broker">Môi giới</div>
        )}

        <button
          type="button"
          aria-label={liked ? "Bỏ yêu thích" : "Yêu thích"}
          className={`mk-like ${liked ? "is-liked" : ""}`}
          onClick={handleLikeClick}
        >
          <Heart size={18} />
        </button>

        {photos > 0 && (
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

      <div className="mk-post-body">
        <h4 className="mk-post-title">{title}</h4>

        <div className="mk-post-meta">
          {beds && (
            <span>
              <BedDouble size={14} /> {beds} PN
            </span>
          )}
          {typeLabel && <span>{typeLabel}</span>}
        </div>

        <div className="mk-post-price">
          <div className="mk-price-main">
            {price != null ? formatPriceVND(price) : ""}
          </div>
          <div className="mk-price-sub">
            {pricePerM2 && <span>{formatPerM2(pricePerM2)}</span>}
            {area && (
              <span className="mk-dot">
                <Ruler size={14} /> {area} m²
              </span>
            )}
          </div>
        </div>

        {location && (
          <div className="mk-post-loc">
            <MapPin size={14} /> {location}
          </div>
        )}
      </div>
    </NavLink>
  );
}
