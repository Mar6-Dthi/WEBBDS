// src/pages/LichSuXem.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Heart } from "lucide-react";

import NhatotHeader from "../components/header";
import Footer from "../components/footer";

import { getViewHistory } from "../services/viewHistoryService";
import { getFavoriteIds, toggleFavorite, toggleFavoriteMock } from "../services/mockFavoriteService";

import "../styles/History.css";

export default function LichSuXem() {
  const [items, setItems] = useState([]);
  const [favoriteIds, setFavoriteIds] = useState(
    () => new Set(getFavoriteIds() || [])
  );

  const navigate = useNavigate();

  useEffect(() => {
    setItems(getViewHistory());
  }, []);

  const handleCardClick = (item) => {
    navigate(`/post/${item.id}`, { state: { item } });
  };

  const handleToggleFavorite = (e, item) => {
    e.stopPropagation();
    e.preventDefault();

    const { ids, added } = toggleFavorite(item.id);
    setFavoriteIds(new Set(ids));

    if (added) {
      toggleFavoriteMock({
        postId: item.id,
        postTitle: item.title,
        ownerName: item.ownerName,
        postPrice: item.price,
        postLocation: item.address || item.location,
        postThumbnail: item.coverUrl,
      });
    }
  };

  return (
    <div className="hs-page nhatot">
      <NhatotHeader />

      <main className="hs-main">
        <div className="mk-container">
          <header className="hs-head">
            <h1 className="hs-title">Lịch sử xem</h1>
            <p className="hs-sub">
              Các bất động sản bạn đã bấm vào xem gần đây sẽ hiển thị tại đây.
            </p>
          </header>

          {items.length === 0 ? (
            <div className="hs-empty">
              Bạn chưa xem bất kỳ tin đăng nào.
            </div>
          ) : (
            <section className="hs-grid">
              {items.map((item) => {
                const isLiked = favoriteIds.has(item.id);

                return (
                  <article
                    key={item.id}
                    className="hs-card"
                    onClick={() => handleCardClick(item)}
                  >
                    <div className="hs-card-img-wrap">
                      <img src={item.coverUrl} alt={item.title} />
                      <span className="hs-card-badge">Tin đã xem</span>

                      <button
                        type="button"
                        className={`hs-like-btn ${isLiked ? "is-liked" : ""}`}
                        onClick={(e) => handleToggleFavorite(e, item)}
                        aria-label="Yêu thích"
                      >
                        <Heart
                          size={18}
                          aria-hidden
                          fill={isLiked ? "#f97316" : "none"}
                        />
                      </button>
                    </div>

                    <div className="hs-card-body">
                      <h2 className="hs-card-title">{item.title}</h2>

                      <div className="hs-card-line">
                        {item.beds != null && (
                          <>
                            <span>{item.beds} PN</span>
                            <span className="hs-dot">•</span>
                          </>
                        )}
                        <span>{item.typeLabel}</span>
                      </div>

                      <div className="hs-card-price-row">
                        <span className="hs-card-price">
                          {item.price}
                        </span>
                        {item.pricePerM2 && (
                          <span className="hs-card-price-sub">
                            {item.pricePerM2}
                          </span>
                        )}
                        {item.area && (
                          <span className="hs-card-area">{item.area} m²</span>
                        )}
                      </div>

                      <div className="hs-card-location">
                        <MapPin size={14} />
                        <span>{item.address || item.location}</span>
                      </div>
                    </div>
                  </article>
                );
              })}
            </section>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
