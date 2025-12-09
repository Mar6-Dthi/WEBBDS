// src/pages/AgentDetail.jsx
import React, { useEffect, useState, useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { MapPin, Star, Phone, Share2 } from "lucide-react";

import Header from "../components/header";
import Footer from "../components/footer";
import "../styles/AgentDetail.css";

import { getAgentById } from "../services/mockAgentService";
import { getAgentReviews } from "../services/mockAgentReviewService";

// 🔹 dùng chung follow service với AgentsPage & ProfilePage
import {
  isFollowingAgent,
  toggleFollowAgent,
} from "../services/mockFollowService";

// 🔹 dùng lại ChatModal (giống trang PostDetail)
import ChatModal from "../components/ChatModal";

/* ===== META ẢNH GIỐNG MyAgentPage ===== */
const AVATAR_META_KEY = "profile_avatar_meta";
const COVER_META_KEY = "profile_cover_meta";

function loadMetaUrl(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return "";
    const meta = JSON.parse(raw);
    return meta?.url || "";
  } catch {
    return "";
  }
}

function StarRow({ value }) {
  return (
    <div className="agd-star-row">
      {Array.from({ length: 5 }).map((_, idx) => (
        <Star
          key={idx}
          size={14}
          className={idx < value ? "agd-star-filled" : "agd-star-empty"}
        />
      ))}
    </div>
  );
}

/* ====== LẤY CURRENT USER ====== */
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}

/* ====== LẤY PROFILE CỦA MÔI GIỚI TỪ LOCALSTORAGE ====== */
function getProfileFromAgent(agent) {
  if (!agent) return null;

  let users = [];
  try {
    const raw = localStorage.getItem("mockUsers") || "[]";
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) users = parsed;
  } catch {
    users = [];
  }

  const found =
    users.find(
      (u) =>
        u.id === agent.ownerId ||
        u.id === agent.userId ||
        u.userId === agent.ownerId ||
        u.phone === agent.phone ||
        u.phone === agent.ownerPhone
    ) || null;

  if (!found) {
    try {
      const current = JSON.parse(localStorage.getItem("currentUser") || "null");
      if (
        current &&
        (current.id === agent.ownerId || current.phone === agent.phone)
      ) {
        return current;
      }
    } catch {
      // ignore
    }
  }

  return found;
}

/* ====== LẤY DANH SÁCH TIN ĐĂNG THUỘC VỀ MÔI GIỚI ====== */
function getPostsForAgent(agent) {
  if (!agent) return [];

  let allPosts = [];
  try {
    allPosts = JSON.parse(localStorage.getItem("posts") || "[]");
  } catch {
    allPosts = [];
  }
  if (!Array.isArray(allPosts)) allPosts = [];

  const matchIds = new Set(
    [agent.ownerId, agent.userId].filter(Boolean).map(String)
  );
  const matchPhones = new Set(
    [agent.phone, agent.ownerPhone].filter(Boolean).map(String)
  );

  const filtered = allPosts.filter((p) => {
    const ownerId = p.ownerId || p.userId || p.user_id;
    const phone = p.phone || p.ownerPhone;

    const okId = ownerId && matchIds.has(String(ownerId));
    const okPhone = phone && matchPhones.has(String(phone));

    return okId || okPhone;
  });

  return filtered;
}

/* ====== FORMAT HỖ TRỢ HIỂN THỊ TIN ĐĂNG ====== */
function formatPostPrice(post) {
  if (post.priceText) return post.priceText;
  if (post.displayPrice) return post.displayPrice;
  const p = post.price;
  if (p == null) return "";
  const num = Number(p);
  if (!Number.isFinite(num)) return String(p);
  if (num >= 1_000_000_000) {
    return `${(num / 1_000_000_000).toFixed(2)} tỷ`;
  }
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(2)} triệu`;
  }
  return num.toLocaleString("vi-VN") + " đ";
}

function formatPostArea(post) {
  const a = post.areaSize || post.acreage || post.area || post.square;
  if (!a) return "";
  const num = Number(a);
  if (!Number.isFinite(num)) return String(a);
  return `${num} m²`;
}

function formatPostLocation(post) {
  if (post.addressShort) return post.addressShort;
  if (post.location) return post.location;

  const parts = [
    post.wardName || post.ward,
    post.districtName || post.district,
    post.provinceName || post.province,
  ].filter(Boolean);

  if (parts.length) return parts.join(", ");

  return post.fullAddress || "";
}

function getPostThumb(post) {
  if (Array.isArray(post.images) && post.images.length > 0) {
    return post.images[0];
  }
  if (Array.isArray(post.imageUrls) && post.imageUrls.length > 0) {
    return post.imageUrls[0];
  }
  return post.thumbnail || post.imageUrl || "/Img/demo/house-1.jpg";
}

/* ====== FALLBACK: XÂY DỰNG AGENT TỪ USER ID (GIỐNG MyAgentPage) ====== */
function buildAgentFromIdFallback(id) {
  let users = [];
  try {
    const raw = localStorage.getItem("mockUsers") || "[]";
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) users = parsed;
  } catch {
    users = [];
  }

  const current = getCurrentUser();

  let user =
    users.find(
      (u) =>
        String(u.id) === String(id) ||
        String(u.userId) === String(id) ||
        String(u.phone) === String(id)
    ) || null;

  if (
    !user &&
    current &&
    (String(current.id) === String(id) ||
      String(current.phone) === String(id))
  ) {
    user = current;
  }

  // Nếu vẫn không tìm thấy user, trả về agent default
  if (!user) {
    return {
      id,
      name: "Môi giới",
      avatarUrl: "/Img/agents/avatar-1.jpg",
      bannerUrl: "/Img/agents/banner-1.jpg",
      badge: "",
      desc: "Chưa có giới thiệu",
      area: "Chưa cập nhật khu vực hoạt động",
      responseRate: 0,
      followers: 0,
      postsCount: 0,
      yearsActive: 1,
      rating: 0,
      ratingCount: 0,
    };
  }

  // Nếu là chính user hiện tại thì ưu tiên meta ảnh
  const avatarMetaUrl =
    current && current.id === user.id ? loadMetaUrl(AVATAR_META_KEY) : "";
  const coverMetaUrl =
    current && current.id === user.id ? loadMetaUrl(COVER_META_KEY) : "";

  // Lấy posts thật của user để tính yearsActive & postsCount
  let allPosts = [];
  try {
    allPosts = JSON.parse(localStorage.getItem("posts") || "[]");
  } catch {
    allPosts = [];
  }
  if (!Array.isArray(allPosts)) allPosts = [];

  const myPosts = allPosts.filter(
    (p) =>
      p.ownerId === user.id ||
      p.userId === user.id ||
      p.user_id === user.id ||
      p.phone === user.phone
  );

  let yearsActive = 0;
  if (myPosts.length > 0) {
    let first = null;
    myPosts.forEach((p) => {
      if (!p.createdAt) return;
      const d = new Date(p.createdAt);
      if (Number.isNaN(d.getTime())) return;
      if (!first || d < first) first = d;
    });
    if (first) {
      const diffMs = Date.now() - first.getTime();
      const diffYears = diffMs / (1000 * 60 * 60 * 24 * 365);
      yearsActive = diffYears < 1 ? 0 : Math.floor(diffYears);
    }
  }

  const profileIntro = user.profileIntro || "";
  const profileProvinces = user.profileProvinces || [];

  return {
    id: user.id ?? id,
    name: user.name || "Môi giới",
    bannerUrl:
      coverMetaUrl || user.coverUrl || "/Img/agents/default-banner.jpg",
    avatarUrl:
      avatarMetaUrl || user.avatarUrl || "/Img/agents/avatar-1.jpg",
    badge: user.agentBadge || "Môi giới cá nhân",
    followers: user.followers ?? 0,
    responseRate: user.responseRate ?? 0,
    desc: profileIntro || user.desc || "",
    area:
      (Array.isArray(profileProvinces) && profileProvinces.length
        ? profileProvinces.join(", ")
        : user.area || "Chưa cập nhật khu vực hoạt động"),
    yearsActive,
    postsCount: myPosts.length,
    rating: user.rating ?? 0,
    ratingCount: user.ratingCount ?? 0,
    // Quan trọng: gắn owner để getPostsForAgent / getProfileFromAgent hoạt động
    ownerId: user.id,
    userId: user.id,
    phone: user.phone,
    ownerPhone: user.phone,
  };
}

export default function AgentDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [agent, setAgent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [ownerProfile, setOwnerProfile] = useState(null);

  // 🔹 tin đăng thật của môi giới
  const [myPosts, setMyPosts] = useState([]);

  // 🔹 trạng thái theo dõi & số follower hiển thị
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);

  // 🔹 trạng thái mở modal chat
  const [chatOpen, setChatOpen] = useState(false);

  // 🔹 trạng thái mở modal chia sẻ
  const [isShareOpen, setIsShareOpen] = useState(false);

  const currentUser = useMemo(() => getCurrentUser(), []);

  useEffect(() => {
    getAgentById(id).then((a) => {
      // ⭐ Nếu không tìm thấy trong mockAgentService,
      //   xây agent từ user giống MyAgentPage
      let agentData = a;
      if (!agentData) {
        agentData = buildAgentFromIdFallback(id);
      }

      setAgent(agentData);
      setOwnerProfile(getProfileFromAgent(agentData));

      // trạng thái đang theo dõi từ localStorage
      const followed = isFollowingAgent(agentData.id);
      setIsFollowing(followed);

      // follower mock ban đầu
      setFollowerCount(
        typeof agentData.followers === "number" ? agentData.followers : 0
      );

      // 🔹 LẤY TIN ĐĂNG THẬT CỦA MÔI GIỚI
      const posts = getPostsForAgent(agentData);
      setMyPosts(posts);
    });

    getAgentReviews(id).then((list) => {
      setReviews(Array.isArray(list) ? list : []);
    });
  }, [id]);

  // 👉 xác định có phải chính chủ môi giới này không
  const isOwner = useMemo(() => {
    if (!agent || !currentUser) return false;
    return (
      agent.ownerId === currentUser.id ||
      agent.userId === currentUser.id ||
      agent.phone === currentUser.phone ||
      agent.ownerPhone === currentUser.phone
    );
  }, [agent, currentUser]);

  // ===== TÍNH ĐIỂM TRUNG BÌNH & SỐ LƯỢNG ĐÁNH GIÁ =====
  const avgRating = useMemo(() => {
    if (!agent) return 0;
    if (!reviews.length) {
      return typeof agent.rating === "number"
        ? agent.rating.toFixed(1)
        : agent.rating || 0;
    }
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews, agent]);

  const ratingCount = useMemo(() => {
    if (reviews.length) return reviews.length;
    return agent?.ratingCount || 0;
  }, [reviews, agent]);

  const latestReviews = useMemo(() => reviews.slice(0, 3), [reviews]);

  // 🔹 số tin hiện có: ưu tiên tin thật, fallback postsCount trong agent
  const postsCount = myPosts.length || agent?.postsCount || 0;

  if (!agent) {
    return (
      <div className="nhatot">
        <div className="mk-page">
          <Header />
          <div className="agd-page">
            <p style={{ padding: 24 }}>Đang tải thông tin môi giới...</p>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  const handleViewAllListings = () => {
    navigate(`/moi-gioi/${agent.id}/tin-dang`);
  };

  const handleViewAllReviews = () => {
    navigate(`/moi-gioi/${agent.id}/danh-gia`);
  };

  const responseRate = agent.responseRate ?? 0;

  // ⭐ LẤY GIỚI THIỆU & KHU VỰC TỪ TRANG CÁ NHÂN (nếu có)
  const introText =
    ownerProfile?.profileIntro?.trim() || agent.desc || "Chưa có giới thiệu";

  const areaChips =
    Array.isArray(ownerProfile?.profileProvinces) &&
    ownerProfile.profileProvinces.length > 0
      ? ownerProfile.profileProvinces
      : agent.area
      ? [agent.area]
      : [];

  // 🔹 Toggle theo dõi môi giới từ trang chi tiết
  const handleToggleFollow = () => {
    const res = toggleFollowAgent(agent.id);

    if (!res.ok && res.reason === "NO_USER") {
      alert("Vui lòng đăng nhập để theo dõi môi giới.");
      return;
    }

    setIsFollowing((prev) => {
      const wasFollowing = prev;
      const nowFollowing = res.isFollowing;

      setFollowerCount((c) => {
        const current = typeof c === "number" ? c : 0;
        if (nowFollowing && !wasFollowing) return current + 1;
        if (!nowFollowing && wasFollowing) return Math.max(0, current - 1);
        return current;
      });

      return nowFollowing;
    });

    try {
      window.dispatchEvent(new Event("follow-changed"));
    } catch {
      // ignore
    }
  };

  // 🔹 Dữ liệu giả để truyền vào ChatModal (xem môi giới như 1 "bài" riêng)
  const chatPostObject = {
    id: `agent_${agent.id}`,
    title: `Trao đổi với môi giới ${agent.name}`,
    ownerName: agent.name,
  };

  // 🔹 link chia sẻ trang môi giới
  const shareUrl = `${window.location.origin}/moi-gioi/${agent.id}`;

  return (
    <div className="nhatot">
      <div className="mk-page">
        <Header />

        <div className="agd-page">
          <div className="agd-main">
            {/* ================= HERO ================ */}
            <section className="agd-hero-card">
              <div className="agd-hero-banner">
                <img src={agent.bannerUrl} alt={agent.name} />
              </div>

              <div className="agd-hero-bottom">
                <div className="agd-hero-left">
                  <div className="agd-hero-avatar-wrap">
                    <img
                      src={agent.avatarUrl}
                      alt={agent.name}
                      onError={(e) => {
                        e.target.src =
                          "https://ui-avatars.com/api/?background=fff&color=ff7a00&name=" +
                          encodeURIComponent(agent.name);
                      }}
                    />
                  </div>

                  <div className="agd-hero-info">
                    <div className="agd-hero-name-row">
                      <h1 className="agd-hero-name">{agent.name}</h1>
                      {agent.badge && (
                        <span className="agd-hero-cert-badge">
                          <span className="agd-hero-cert-dot" />
                          {agent.badge}
                        </span>
                      )}
                    </div>

                    <div className="agd-hero-status-row">
                      <span className="agd-status-dot" />
                      <span>Đang hoạt động</span>

                      <span className="agd-dot-sep">•</span>
                      <span>
                        Tỷ lệ phản hồi:{" "}
                        <strong>
                          {Math.round(responseRate * 100) / 100}%
                        </strong>{" "}
                        (trong ~1 phút)
                      </span>

                      <span className="agd-dot-sep">•</span>
                      <span>
                        Người theo dõi:{" "}
                        <button type="button" className="agd-link-inline">
                          {followerCount}
                        </button>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="agd-hero-actions">
                  {/* nút Share luôn có cho mọi người */}
                  <button
                    className="agd-hero-ghost-btn"
                    type="button"
                    onClick={() => setIsShareOpen(true)}
                  >
                    <Share2 size={16} />
                    Chia sẻ
                  </button>

                  {/* Nếu KHÔNG phải chính chủ: cho phép Theo dõi + Liên hệ */}
                  {!isOwner && (
                    <>
                      <button
                        type="button"
                        className={
                          "agd-hero-ghost-btn agd-follow-btn" +
                          (isFollowing ? " agd-follow-btn--active" : "")
                        }
                        onClick={handleToggleFollow}
                      >
                        {isFollowing ? "Đang theo dõi" : "+ Theo dõi"}
                      </button>

                      <button
                        className="agd-hero-main-btn"
                        type="button"
                        onClick={() => setChatOpen(true)}
                      >
                        <Phone size={18} />
                        Liên hệ
                      </button>
                    </>
                  )}

                  {/* Nếu là CHÍNH CHỦ: chỉ có nút đi tới trang quản lý của tôi */}
                  {isOwner && (
                    <button
                      className="agd-hero-main-btn"
                      type="button"
                      onClick={() => navigate("/moi-gioi-cua-toi")}
                    >
                      Quản lý trang
                    </button>
                  )}
                </div>
              </div>
            </section>

            {/* ================= STATS ================ */}
            <section className="agd-stats-row">
              <div className="agd-stat-card">
                <p className="agd-stat-label">Thời gian hoạt động</p>
                <p className="agd-stat-value">{agent.yearsActive} năm</p>
                <p className="agd-stat-sub">Tính từ tin đăng đầu tiên</p>
              </div>

              <div className="agd-stat-card">
                <p className="agd-stat-label">Tin hiện có</p>
                <p className="agd-stat-value">{postsCount} tin</p>
                <button
                  className="agd-stat-link"
                  onClick={handleViewAllListings}
                >
                  Xem tất cả
                </button>
              </div>

              <div className="agd-stat-card">
                <p className="agd-stat-label">Đánh giá</p>
                <p className="agd-stat-value">
                  {avgRating}
                  <Star size={18} className="agd-stat-star-icon" />
                </p>
                <p className="agd-stat-sub">{ratingCount} đánh giá</p>
              </div>
            </section>

            {/* ================= MAIN LAYOUT 2 CỘT ================ */}
            <section className="agd-layout">
              {/* LEFT COLUMN */}
              <div className="agd-left-col">
                {/* Giới thiệu */}
                <div className="agd-card">
                  <h2 className="agd-section-title">Giới thiệu</h2>
                  <div className="agd-about-text">
                    <p>- {introText}</p>
                  </div>
                </div>

                {/* Khu vực hoạt động */}
                <div className="agd-card">
                  <h2 className="agd-section-title">Khu vực hoạt động</h2>
                  <div className="agd-area-block">
                    <MapPin size={18} />
                    <div>
                      {areaChips.length === 0 ? (
                        <p>Chưa cập nhật</p>
                      ) : (
                        areaChips.map((area) => <p key={area}>{area}</p>)
                      )}
                    </div>
                  </div>
                </div>

                {/* Tin đăng */}
                <div className="agd-card">
                  <div className="agd-card-header">
                    <h2 className="agd-section-title">
                      Tất cả tin đăng ({postsCount})
                    </h2>
                  </div>

                  <div className="agd-listings-grid">
                    {myPosts.length === 0 ? (
                      <p style={{ padding: 8 }}>Chưa có tin đăng nào.</p>
                    ) : (
                      myPosts.map((post) => {
                        const thumb = getPostThumb(post);
                        const price = formatPostPrice(post);
                        const area = formatPostArea(post);
                        const location = formatPostLocation(post);

                        return (
                          <div key={post.id} className="agd-listing-card">
                            <div className="agd-listing-img-wrap">
                              <img src={thumb} alt={post.title} />
                            </div>
                            <h3 className="agd-listing-title">
                              {post.title || "Tin đăng"}
                            </h3>
                            {price && (
                              <p className="agd-listing-price">{price}</p>
                            )}
                            <p className="agd-listing-meta">
                              {area && `${area} • `}
                              {location}
                            </p>
                          </div>
                        );
                      })
                    )}
                  </div>

                  <button
                    className="agd-outline-pill-btn agd-outline-pill-full"
                    onClick={handleViewAllListings}
                  >
                    Xem tất cả tin đăng
                  </button>
                </div>
              </div>

              {/* RIGHT COLUMN – REVIEW */}
              <aside className="agd-right-col">
                <div className="agd-card">
                  <div className="agd-card-header">
                    <h2 className="agd-section-title">
                      Đánh giá từ khách hàng ({ratingCount})
                    </h2>

                    <div className="agd-rating-summary">
                      <span className="agd-rating-score-main">
                        {avgRating}
                      </span>
                      <Star size={18} className="agd-stat-star-icon" />
                      <span className="agd-rating-count-main">
                        ({ratingCount} đánh giá)
                      </span>
                    </div>
                  </div>

                  <div className="agd-review-list">
                    {latestReviews.map((rv) => (
                      <div key={rv.id} className="agd-review-item">
                        <div className="agd-review-header">
                          <div className="agd-review-avatar">
                            {rv.name.charAt(0).toUpperCase()}
                          </div>

                          <div className="agd-review-head-text">
                            <div className="agd-review-name">{rv.name}</div>
                            <div className="agd-review-meta-row">
                              <StarRow value={rv.rating} />
                              <span className="agd-review-time">
                                {rv.timeAgo}
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="agd-review-content">{rv.content}</p>

                        {rv.tags && rv.tags.length > 0 && (
                          <div className="agd-review-tags">
                            {rv.tags.map((tag, idx) => (
                              <span key={idx} className="agd-tag-pill">
                                {tag}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    ))}

                    {latestReviews.length === 0 && (
                      <p className="agd-review-empty">
                        Chưa có đánh giá nào cho môi giới này.
                      </p>
                    )}
                  </div>

                  <button
                    className="agd-outline-pill-btn agd-outline-pill-full"
                    onClick={handleViewAllReviews}
                  >
                    Xem tất cả đánh giá ({ratingCount})
                  </button>
                </div>
              </aside>
            </section>
          </div>
        </div>

        <Footer />

        {/* 🔹 MODAL CHAT LIÊN HỆ MÔI GIỚI */}
        <ChatModal
          open={chatOpen}
          onClose={() => setChatOpen(false)}
          post={chatPostObject}
          mode="buyerToAgent"
        />

        {/* 🔹 MODAL CHIA SẺ LINK TRANG MÔI GIỚI */}
        {isShareOpen && (
          <div
            className="agd-share-backdrop"
            onClick={() => setIsShareOpen(false)}
          >
            <div
              className="agd-share-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <h3 className="agd-share-title">Chia sẻ trang môi giới</h3>
              <p className="agd-share-desc">
                Sao chép đường link bên dưới và gửi cho khách hàng / bạn bè.
              </p>

              <div className="agd-share-input-row">
                <input
                  type="text"
                  className="agd-share-input"
                  readOnly
                  value={shareUrl}
                  onFocus={(e) => e.target.select()}
                />
                <button
                  type="button"
                  className="agd-share-copy-btn"
                  onClick={() => navigator.clipboard.writeText(shareUrl)}
                >
                  Copy
                </button>
              </div>

              <button
                type="button"
                className="agd-outline-pill-btn agd-outline-pill-full agd-share-close-btn"
                onClick={() => setIsShareOpen(false)}
              >
                Đóng
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
