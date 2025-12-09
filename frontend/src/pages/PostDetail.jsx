// src/pages/PostDetail.jsx
import React, { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  MapPin,
  Home,
  Ruler,
  BedDouble,
  Bath,
  Play,
} from "lucide-react";

import "../styles/PostDetail.css";
import NhatotHeader from "../components/header";
import Footer from "../components/footer";

import {
  getFavoriteIds,
  toggleFavorite,
  toggleFavoriteMock,
} from "../services/mockFavoriteService";
import ChatModal from "../components/ChatModal";

// ====== FORMAT GIÁ ======
function formatPrice(v) {
  if (v == null || v === "") return "Thỏa thuận";
  const num = Number(v);
  if (!Number.isFinite(num)) return "Thỏa thuận";

  if (num >= 1_000_000_000) {
    return (num / 1_000_000_000).toFixed(2).replace(/\.00$/, "") + " tỷ";
  }
  if (num >= 1_000_000) {
    return (num / 1_000_000).toFixed(0) + " triệu";
  }
  return num.toLocaleString("vi-VN") + " đ";
}

// ====== JOIN DATE GIỐNG PROFILEPAGE ======
const PROFILE_JOIN_KEY = "profile_join_date";

/** Lấy join date theo đúng logic trang Profile cho user hiện tại */
function getProfileJoinDate() {
  try {
    const currentUser = JSON.parse(
      localStorage.getItem("currentUser") || "null"
    );
    if (currentUser?.createdAt) {
      const created = new Date(currentUser.createdAt);
      if (!Number.isNaN(created.getTime())) {
        return created;
      }
    }
  } catch {
    // ignore
  }

  let join = localStorage.getItem(PROFILE_JOIN_KEY);
  if (!join) {
    join = new Date().toISOString();
    localStorage.setItem(PROFILE_JOIN_KEY, join);
  }
  return new Date(join);
}

/** Hiển thị thời gian hoạt động theo ngày / tháng / năm từ joinDate */
function formatActiveDuration(joinDate) {
  if (!joinDate) return "Mới tham gia";

  const now = new Date();
  const diffMs = now - joinDate;
  const diffDays = Math.max(
    0,
    Math.floor(diffMs / (1000 * 60 * 60 * 24))
  );

  if (diffDays === 0) return "Hôm nay";

  // < 30 ngày => hiển thị ngày
  if (diffDays < 30) {
    return `${diffDays} ngày`;
  }

  // 30–364 ngày => hiển thị tháng
  if (diffDays < 365) {
    const months = Math.max(1, Math.floor(diffDays / 30));
    return `${months} tháng`;
  }

  // >= 1 năm => hiển thị năm
  const years = Math.max(1, Math.floor(diffDays / 365));
  return `${years} năm`;
}

// Ảnh mock fallback khi không có media / images
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1560184897-74a4b1b3e30c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
];

// Chuẩn hoá media
function normalizeMedia(post) {
  // 1. Nếu có field media [{type, src}] thì dùng
  if (post && Array.isArray(post.media) && post.media.length > 0) {
    return post.media.map((m, idx) => ({
      id: m.id || `m-${idx}`,
      type: m.type === "video" ? "video" : "image",
      src: m.src,
    }));
  }

  // 2. Nếu có images array thì dùng images + coverUrl (nếu có)
  if (post && Array.isArray(post.images) && post.images.length > 0) {
    const base = post.images
      .filter(Boolean)
      .map((src, idx) => ({
        id: `img-${idx}`,
        type: "image",
        src,
      }));

    if (post.coverUrl) {
      const first = base[0]?.src;
      if (first && first === post.coverUrl) {
        return base;
      }
      return [
        {
          id: "cover",
          type: "image",
          src: post.coverUrl,
        },
        ...base,
      ];
    }
    return base;
  }

  // 3. Không có images nhưng có coverUrl
  if (post && post.coverUrl) {
    return [
      {
        id: "cover",
        type: "image",
        src: post.coverUrl,
      },
      ...FALLBACK_IMAGES.map((src, idx) => ({
        id: `fallback-${idx}`,
        type: "image",
        src,
      })),
    ];
  }

  // 4. Không có gì -> fallback
  return FALLBACK_IMAGES.map((src, idx) => ({
    id: `fallback-${idx}`,
    type: "image",
    src,
  }));
}

export default function PostDetail() {
  const { id } = useParams();
  const locationHook = useLocation();

  // Dữ liệu truyền qua Link/NavLink (từ MyPosts / Favorite / trang chủ)
  const itemFromState = locationHook.state?.item || null;

  // Lấy id ưu tiên: state.postId / state.id / param
  const stateId = itemFromState?.postId || itemFromState?.id;
  const finalId = stateId || id;

  // Fallback: lấy từ localStorage.posts theo id
  let postFromStore = null;
  try {
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    postFromStore =
      posts.find((p) => String(p.id) === String(finalId)) || null;
  } catch {
    postFromStore = null;
  }

  // Gộp dữ liệu:
  // - Ưu tiên bài đầy đủ từ localStorage
  // - Nếu không có, map lại từ object dạng favorite (postId, postTitle, ...)
  let rawPost = null;

  if (postFromStore) {
    rawPost = {
      ...postFromStore,
      title:
        itemFromState?.postTitle ||
        itemFromState?.title ||
        postFromStore.title,
      coverUrl:
        itemFromState?.postThumbnail ||
        itemFromState?.coverUrl ||
        postFromStore.coverUrl,
    };
  } else if (itemFromState) {
    rawPost = {
      id: itemFromState.postId || itemFromState.id || finalId,
      title: itemFromState.postTitle || itemFromState.title || "Tin đăng",
      coverUrl: itemFromState.postThumbnail || itemFromState.coverUrl,
      price:
        itemFromState.postPrice ??
        itemFromState.priceValue ??
        itemFromState.price,
      address:
        itemFromState.postLocation ??
        itemFromState.address ??
        itemFromState.location,
      ...itemFromState,
    };
  }

  // Chuẩn hoá field sử dụng trong UI
  const post = rawPost
    ? {
        ...rawPost,
        price: rawPost.priceValue ?? rawPost.price ?? rawPost.gia,
        bed: rawPost.bed ?? rawPost.beds ?? rawPost.soPhongNgu,
        bath: rawPost.bath ?? rawPost.baths ?? rawPost.soPhongTam,
        address: rawPost.address ?? rawPost.location ?? rawPost.diaChi,
        landArea:
          rawPost.landArea ??
          rawPost.dienTichDat ??
          rawPost.area ??
          rawPost.dienTich,
        usableArea:
          rawPost.usableArea ??
          rawPost.dienTichSd ??
          rawPost.dienTichSuDung,
        pricePerM2: rawPost.pricePerM2 ?? rawPost.giaM2 ?? rawPost.unitPrice,
        houseType:
          rawPost.houseType ??
          rawPost.typeLabel ??
          rawPost.loaiHinhNha ??
          rawPost.loaiBatDongSan,
        direction: rawPost.direction ?? rawPost.huongNha,
        legal:
          rawPost.legal ??
          rawPost.phapLy ??
          rawPost.giayToPhapLy ??
          rawPost.tinhTrangPhapLy,
        interior:
          rawPost.interior ??
          rawPost.noiThat ??
          rawPost.tinhTrangNoiThat ??
          rawPost.furnitureStatus ??
          rawPost.furniture,
      }
    : null;

  const [activeIndex, setActiveIndex] = useState(0);
  const [saved, setSaved] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [sellerStats, setSellerStats] = useState({
    totalPosts: 0,
    activeDurationLabel: "Mới tham gia",
  });

  const sellerName = post?.ownerName || post?.sellerName || "Người bán";
  const sellerId =
    post?.ownerId ||
    post?.sellerId ||
    post?.userId ||
    post?.authorId ||
    null;

  // Đồng bộ trạng thái Lưu tin với favorites_mock
  useEffect(() => {
    if (!post || !post.id) {
      setSaved(false);
      return;
    }
    const ids = getFavoriteIds();
    setSaved(ids.includes(String(post.id)));
  }, [post]);

  // Tính số tin đăng & thời gian hoạt động của người bán
  useEffect(() => {
    if (!post) return;

    let totalPosts = 0;
    try {
      const allPosts = JSON.parse(localStorage.getItem("posts") || "[]");

      if (sellerId) {
        totalPosts = allPosts.filter((p) => {
          const pOwnerId =
            p.ownerId || p.sellerId || p.userId || p.authorId || null;
          return pOwnerId && String(pOwnerId) === String(sellerId);
        }).length;
      } else if (sellerName) {
        totalPosts = allPosts.filter(
          (p) =>
            (p.ownerName || p.sellerName || "").trim() ===
            sellerName.trim()
        ).length;
      }
    } catch {
      totalPosts = 0;
    }

    // ===== LẤY NGÀY THAM GIA =====
    let joinDate = null;

    // 1. Nếu post có sẵn ownerJoinedAt thì ưu tiên dùng (mock riêng cho seller)
    if (post.ownerJoinedAt) {
      const d = new Date(post.ownerJoinedAt);
      if (!Number.isNaN(d.getTime())) {
        joinDate = d;
      }
    }

    // 2. Nếu người bán chính là currentUser -> dùng logic ProfilePage
    if (!joinDate) {
      try {
        const currentUser = JSON.parse(
          localStorage.getItem("currentUser") || "null"
        );
        if (currentUser) {
          const isOwnerCurrent =
            (sellerId && String(sellerId) === String(currentUser.id)) ||
            (!sellerId &&
              sellerName &&
              sellerName.trim() ===
                (currentUser.name || "").trim());

          if (isOwnerCurrent) {
            joinDate = getProfileJoinDate();
          }
        }
      } catch {
        // ignore
      }
    }

    // 3. Fallback cuối: thử đọc PROFILE_JOIN_KEY chung
    if (!joinDate) {
      try {
        const raw = localStorage.getItem(PROFILE_JOIN_KEY);
        if (raw) {
          const d = new Date(raw);
          if (!Number.isNaN(d.getTime())) {
            joinDate = d;
          }
        }
      } catch {
        // ignore
      }
    }

    const activeDurationLabel = formatActiveDuration(joinDate);

    setSellerStats({
      totalPosts,
      activeDurationLabel,
    });
  }, [post, sellerId, sellerName]);

  // Nếu không có post => Not found
  if (!post) {
    return (
      <div className="nhatot">
        <div className="mk-page">
          <NhatotHeader />
          <main className="pd-main">
            <div className="pd-container">
              <div className="pd-notfound">Không tìm thấy tin đăng.</div>
            </div>
          </main>
          <Footer />
        </div>
      </div>
    );
  }

  const mediaList = normalizeMedia(post);
  const active = mediaList[activeIndex] || mediaList[0];

  const priceText = formatPrice(post.price);
  const landArea = post.landArea;
  const usableArea = post.usableArea;

  let pricePerM2Text = "";
  if (post.pricePerM2) {
    const ppm2 = Number(post.pricePerM2);
    if (Number.isFinite(ppm2)) {
      pricePerM2Text =
        (ppm2 / 1_000_000).toFixed(2).replace(/\.00$/, "") +
        " triệu/m²";
    }
  } else if (post.price && landArea) {
    const ppm2 = Number(post.price) / Number(landArea);
    if (Number.isFinite(ppm2)) {
      pricePerM2Text =
        (ppm2 / 1_000_000).toFixed(2).replace(/\.00$/, "") +
        " triệu/m²";
    }
  }

  const handlePrev = () => {
    setActiveIndex((prev) =>
      prev === 0 ? mediaList.length - 1 : prev - 1
    );
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev === mediaList.length - 1 ? 0 : prev + 1
    );
  };

  const handleToggleSave = () => {
    if (!post.id) return;

    const { added } = toggleFavorite(post.id);
    setSaved(added);

    toggleFavoriteMock(
      {
        postId: post.id,
        postTitle: post.title,
        ownerName: post.ownerName,
        postPrice: post.price,
        postLocation: post.address,
        postThumbnail: post.coverUrl,
      },
      added
    );
  };

  return (
    <div className="nhatot">
      <div className="mk-page">
        <NhatotHeader />

        <main className="pd-main">
          <div className="pd-container">
            {/* CỘT TRÁI */}
            <div className="pd-left">
              {/* GALLERY SLIDER */}
              <div className="pd-gallery">
                <div className="pd-gallery-main">
                  {active.type === "video" ? (
                    <video
                      src={active.src}
                      controls
                      className="pd-main-media"
                    />
                  ) : (
                    <img
                      src={active.src}
                      alt={post.title || "Ảnh BĐS"}
                      className="pd-main-media"
                    />
                  )}

                  {mediaList.length > 1 && (
                    <>
                      <button
                        type="button"
                        className="pd-gallery-arrow pd-gallery-arrow--left"
                        onClick={handlePrev}
                      >
                        ‹
                      </button>
                      <button
                        type="button"
                        className="pd-gallery-arrow pd-gallery-arrow--right"
                        onClick={handleNext}
                      >
                        ›
                      </button>
                      <div className="pd-gallery-counter">
                        {activeIndex + 1}/{mediaList.length}
                      </div>
                    </>
                  )}

                  {active.type === "video" && (
                    <div className="pd-main-media-badge">
                      <Play size={16} />
                      <span>Video</span>
                    </div>
                  )}
                </div>

                {mediaList.length > 1 && (
                  <div className="pd-gallery-thumbs">
                    {mediaList.map((m, idx) => (
                      <button
                        key={m.id}
                        type="button"
                        className={
                          "pd-thumb" +
                          (idx === activeIndex
                            ? " pd-thumb--active"
                            : "")
                        }
                        onClick={() => setActiveIndex(idx)}
                      >
                        {m.type === "video" ? (
                          <div className="pd-thumb-video">
                            <video src={m.src} />
                            <div className="pd-thumb-video-icon">
                              <Play size={14} />
                            </div>
                          </div>
                        ) : (
                          <img src={m.src} alt={`Ảnh ${idx + 1}`} />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* HEADER: TIÊU ĐỀ + GIÁ + TÓM TẮT */}
              <section className="pd-card">
                <h1 className="pd-title">{post.title}</h1>

                <div className="pd-mainline">
                  <div className="pd-mainline-left">
                    <div className="pd-price">{priceText}</div>
                    {pricePerM2Text && (
                      <div className="pd-price-sub">
                        {pricePerM2Text}
                      </div>
                    )}

                    <div className="pd-tags-row">
                      {landArea && (
                        <div className="pd-tag">
                          <Ruler size={16} />
                          <span>{landArea} m²</span>
                        </div>
                      )}
                      {post.bed && (
                        <div className="pd-tag">
                          <BedDouble size={16} />
                          <span>{post.bed} PN</span>
                        </div>
                      )}
                      {post.bath && (
                        <div className="pd-tag">
                          <Bath size={16} />
                          <span>{post.bath} WC</span>
                        </div>
                      )}
                      {post.direction && (
                        <div className="pd-tag">
                          <Home size={16} />
                          <span>Hướng {post.direction}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    className={
                      "pd-save-btn" +
                      (saved ? " pd-save-btn--active" : "")
                    }
                    type="button"
                    onClick={handleToggleSave}
                  >
                    <Heart size={18} />
                    {saved ? "Đã lưu tin" : "Lưu tin"}
                  </button>
                </div>

                {post.address && (
                  <div className="pd-address">
                    <MapPin size={16} />
                    <span>{post.address}</span>
                  </div>
                )}
              </section>

              {/* THÔNG TIN CHI TIẾT */}
              <section className="pd-card">
                <h2 className="pd-section-title">Thông tin chi tiết</h2>
                <div className="pd-info-grid">
                  <div className="row">
                    <span>Loại hình nhà ở</span>
                    <p>{post.houseType || "Nhà ở"}</p>
                  </div>
                  <div className="row">
                    <span>Diện tích đất</span>
                    <p>{landArea ? `${landArea} m²` : "—"}</p>
                  </div>
                  <div className="row">
                    <span>Diện tích sử dụng</span>
                    <p>{usableArea ? `${usableArea} m²` : "—"}</p>
                  </div>
                  <div className="row">
                    <span>Số phòng ngủ</span>
                    <p>{post.bed || "—"}</p>
                  </div>
                  <div className="row">
                    <span>Số phòng vệ sinh</span>
                    <p>{post.bath || "—"}</p>
                  </div>
                  <div className="row">
                    <span>Tổng số tầng</span>
                    <p>{post.floors || "—"}</p>
                  </div>
                  <div className="row">
                    <span>Hướng cửa chính</span>
                    <p>{post.direction || "—"}</p>
                  </div>
                  <div className="row">
                    <span>Giấy tờ pháp lý</span>
                    <p>{post.legal || "—"}</p>
                  </div>
                  <div className="row">
                    <span>Tình trạng nội thất</span>
                    <p>{post.interior || "—"}</p>
                  </div>
                </div>
              </section>

              {/* MÔ TẢ */}
              <section className="pd-card">
                <h2 className="pd-section-title">Mô tả chi tiết</h2>
                <div className="pd-desc">
                  {post.description || "Chưa có mô tả chi tiết."}
                </div>
              </section>

              {/* ĐỊA ĐIỂM */}
              {post.address && (
                <section className="pd-card">
                  <h2 className="pd-section-title">Vị trí trên bản đồ</h2>
                  <div className="pd-map-placeholder">
                    <MapPin size={20} />
                    <div>
                      <div>{post.address}</div>
                      <p>Bản đồ Google sẽ được tích hợp sau (demo).</p>
                    </div>
                  </div>
                </section>
              )}
            </div>

            {/* CỘT PHẢI */}
            <aside className="pd-right">
              {/* NGƯỜI BÁN */}
              <div className="pd-card pd-seller-card">
                <div className="pd-seller-header">
                  <div className="pd-avatar">
                    {sellerName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <div className="pd-seller-name">{sellerName}</div>
                    <div className="pd-seller-sub">Đang hoạt động</div>
                  </div>
                </div>

                <div className="pd-seller-stats">
                  <div>
                    <strong>{sellerStats.totalPosts}</strong>
                    <span>tin đăng</span>
                  </div>
                  <div>
                    <strong>{sellerStats.activeDurationLabel}</strong>
                    <span>trên WebBĐS</span>
                  </div>
                </div>

                <button
                  className="pd-btn pd-btn-outline"
                  type="button"
                  onClick={() => setChatOpen(true)}
                >
                  <MessageCircle size={18} />
                  Chat với người bán
                </button>
              </div>

              {/* TÓM TẮT */}
              <div className="pd-card pd-summary-card">
                <h3>Tóm tắt</h3>
                <div className="pd-summary-row">
                  <span>Giá</span>
                  <strong>{priceText}</strong>
                </div>
                {pricePerM2Text && (
                  <div className="pd-summary-row">
                    <span>Giá/m²</span>
                    <strong>{pricePerM2Text}</strong>
                  </div>
                )}
                {landArea && (
                  <div className="pd-summary-row">
                    <span>Diện tích đất</span>
                    <strong>{landArea} m²</strong>
                  </div>
                )}
                {usableArea && (
                  <div className="pd-summary-row">
                    <span>Diện tích sử dụng</span>
                    <strong>{usableArea} m²</strong>
                  </div>
                )}
              </div>
            </aside>
          </div>
        </main>

        <Footer />

        {/* MODAL CHAT VỚI NGƯỜI BÁN */}
        <ChatModal
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          post={{ ...post, ownerName: sellerName }}
          mode="buyerToSeller"
        />
      </div>
    </div>
  );
}
