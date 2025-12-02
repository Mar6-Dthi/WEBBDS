// src/pages/PostDetail.jsx
import React, { useState } from "react";
import { useParams, useLocation } from "react-router-dom";
import {
  Heart,
  MessageCircle,
  Phone,
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

// Ảnh mock fallback khi không có media / images
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1560184897-74a4b1b3e30c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1200&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
];

// Chuẩn hoá media:
// - Ưu tiên post.media: [{id, type:'image'|'video', src}]
// - Nếu không có thì đọc post.images: ["url", ...]
// - Nếu có coverUrl thì dùng coverUrl làm ảnh đầu tiên
// - Nếu vẫn không có thì dùng FALLBACK_IMAGES
function normalizeMedia(post) {
  if (post && Array.isArray(post.media) && post.media.length > 0) {
    return post.media.map((m, idx) => ({
      id: m.id || `m-${idx}`,
      type: m.type === "video" ? "video" : "image",
      src: m.src,
    }));
  }

  if (post && Array.isArray(post.images) && post.images.length > 0) {
    const base = post.images.map((src, idx) => ({
      id: `img-${idx}`,
      type: "image",
      src,
    }));
    // thêm coverUrl lên đầu nếu có
    if (post.coverUrl) {
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

  return FALLBACK_IMAGES.map((src, idx) => ({
    id: `fallback-${idx}`,
    type: "image",
    src,
  }));
}

export default function PostDetail() {
  const { id } = useParams();
  const locationHook = useLocation();

  // Ưu tiên dữ liệu được truyền từ card (ListingPage/Post → state={{ item }})
  const itemFromState = locationHook.state?.item || null;

  // Fallback: lấy từ localStorage nếu user F5 hoặc vào thẳng link
  let postFromStore = null;
  try {
    const posts = JSON.parse(localStorage.getItem("posts") || "[]");
    postFromStore =
      posts.find((p) => String(p.id) === String(id)) || null;
  } catch {
    postFromStore = null;
  }

  // Gộp & map field để màn chi tiết dùng thống nhất
  const rawPost = itemFromState || postFromStore;

  const post = rawPost
    ? {
        ...rawPost,

        // dùng số để format "tỷ / triệu"
        price: rawPost.priceValue ?? rawPost.price,

        // chuẩn hoá tên field
        bed: rawPost.bed ?? rawPost.beds,
        bath: rawPost.bath ?? rawPost.baths,
        address: rawPost.address ?? rawPost.location,
        landArea: rawPost.landArea ?? rawPost.dienTichDat ?? rawPost.area,
        usableArea: rawPost.usableArea ?? rawPost.dienTichSd,
        pricePerM2: rawPost.pricePerM2 ?? rawPost.giaM2,
      }
    : null;

  const [activeIndex, setActiveIndex] = useState(0);
  const [saved, setSaved] = useState(false);

  // Nếu vẫn không có post => show not found + header/footer
  if (!post) {
    return (
      <div className="pd-page nhatot">
        <NhatotHeader />
        <div className="pd-container">
          <div className="pd-notfound">Không tìm thấy tin đăng.</div>
        </div>
        <Footer />
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
        (ppm2 / 1_000_000).toFixed(2).replace(/\.00$/, "") + " triệu/m²";
    }
  } else if (post.price && landArea) {
    const ppm2 = Number(post.price) / Number(landArea);
    if (Number.isFinite(ppm2)) {
      pricePerM2Text =
        (ppm2 / 1_000_000).toFixed(2).replace(/\.00$/, "") + " triệu/m²";
    }
  }

  const handlePrev = () => {
    setActiveIndex((prev) => (prev === 0 ? mediaList.length - 1 : prev - 1));
  };

  const handleNext = () => {
    setActiveIndex((prev) =>
      prev === mediaList.length - 1 ? 0 : prev + 1
    );
  };

  const sellerName = post.ownerName || post.sellerName || "Người bán";
  const sellerPhone = post.sellerPhone || "0900000000";

  return (
    <div className="pd-page nhatot">
      <NhatotHeader />

      <div className="pd-container">
        {/* CỘT TRÁI */}
        <div className="pd-left">
          {/* GALLERY SLIDER (ảnh + video) */}
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
                      (idx === activeIndex ? " pd-thumb--active" : "")
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
                  <div className="pd-price-sub">{pricePerM2Text}</div>
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
                  "pd-save-btn" + (saved ? " pd-save-btn--active" : "")
                }
                type="button"
                onClick={() => setSaved((v) => !v)}
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
                <p>{post.houseType || post.typeLabel || "Nhà ở"}</p>
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
              <div className="row">
                <span>Cá nhân / Môi giới</span>
                <p>{post.ownerType || "—"}</p>
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
                <strong>18</strong>
                <span>tin đăng</span>
              </div>
              <div>
                <strong>5 năm</strong>
                <span>trên WebBĐS</span>
              </div>
            </div>

            <button className="pd-btn pd-btn-outline">
              <MessageCircle size={18} />
              Chat với người bán
            </button>
            <button className="pd-btn pd-btn-primary">
              <Phone size={18} />
              Gọi {sellerPhone}
            </button>
          </div>

          {/* FORM LIÊN HỆ */}
          <div className="pd-card pd-contact-card">
            <div className="pd-contact-title">Bạn cần tư vấn thêm?</div>
            <label className="pd-field">
              Họ và tên *
              <input className="pd-input" placeholder="Nhập họ tên của bạn" />
            </label>
            <label className="pd-field">
              Số điện thoại *
              <input
                className="pd-input"
                placeholder="Nhập số điện thoại của bạn"
              />
            </label>
            <label className="pd-field">
              Lời nhắn
              <textarea
                className="pd-textarea"
                rows={3}
                placeholder="Tôi quan tâm đến bất động sản này..."
              />
            </label>
            <button className="pd-btn pd-btn-black">Gửi thông tin</button>
            <p className="pd-contact-note">
              Bằng việc gửi thông tin, bạn đồng ý với Chính sách bảo mật của
              WebBĐS.
            </p>
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

      <Footer />
    </div>
  );
}
