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
  getFavoriteIds,
  toggleFavorite,
  toggleFavoriteMock,
} from "../services/mockFavoriteService";
import { addToViewHistory } from "../services/viewHistoryService";

/* ================= FORMATTERS ================= */
function formatPriceVND(n) {
  if (n == null) return "";
  const num = Number(n);
  if (!Number.isFinite(num)) return "";
  if (num >= 1_000_000_000) return `${+(num / 1_000_000_000).toFixed(2)} tỷ`;
  if (num >= 1_000_000) return `${+(num / 1_000_000).toFixed(0)} tr`;
  return num.toLocaleString("vi-VN");
}

function formatPerM2(n) {
  if (!n) return null;
  const num = Number(n);
  if (!Number.isFinite(num)) return null;
  if (num >= 1_000_000) return `${Math.round(num / 1_000_000)} tr/m²`;
  return `${num.toLocaleString("vi-VN")} đ/m²`;
}

/* =============== FIX LẤY ẢNH =============== */
function getPrimaryImage(item) {
  if (!item) return null;

  // 1) ưu tiên coverUrl
  if (item.coverUrl) return item.coverUrl;

  // 2) media kiểu {type,image,src}
  if (Array.isArray(item.media) && item.media.length > 0) {
    const m = item.media[0];
    if (m.src) return m.src;
  }

  // 3) images[] dạng string
  if (Array.isArray(item.images) && item.images.length > 0) {
    return item.images[0];
  }

  // fallback
  return "https://via.placeholder.com/400x300?text=No+Image";
}

/* ================= THE CARD ================= */
export default function Post({
  item,
  to = "#",
  isLiked,
  onToggleFavorite,
}) {
  const navigate = useNavigate();

  const {
    id,
    title,
    timeAgo,
    photos = 0,
    price,
    pricePerM2,
    area,
    beds,
    typeLabel,
    location,
    ownerName,
  } = item || {};

  // lấy ảnh đúng
  const primaryImage = getPrimaryImage(item);

  // ===== LIKE STATE =====
  const [likedInternal, setLikedInternal] = useState(false);

  useEffect(() => {
    if (!item || item.id == null) return setLikedInternal(false);
    const ids = getFavoriteIds();
    setLikedInternal(ids.includes(String(item.id)));
  }, [item]);

  const liked = typeof isLiked === "boolean" ? isLiked : likedInternal;

  const handleLikeClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (typeof onToggleFavorite === "function") {
      onToggleFavorite(e);
      return;
    }

    if (!id) return;

    const { ids, added } = toggleFavorite(id);
    setLikedInternal(added);

    toggleFavoriteMock(
      {
        postId: id,
        postTitle: title,
        ownerName,
        postPrice: price,
        postLocation: location,
        postThumbnail: primaryImage,
      },
      added
    );
  };

  const handleCardClick = () => item && addToViewHistory(item);

  return (
    <NavLink
      to={to}
      state={{ item }}
      className="mk-post-card"
      aria-label={title}
      onClick={handleCardClick}
    >
      <div className="mk-post-media">
        <img src={primaryImage} alt={title} loading="lazy" />

        {/* ❤️ */}
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
          <div className="mk-price-main">{formatPriceVND(price)}</div>
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
