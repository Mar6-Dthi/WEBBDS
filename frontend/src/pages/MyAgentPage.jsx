// src/pages/MyAgentPage.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Share2 } from "lucide-react";

import Header from "../components/header";
import Footer from "../components/footer";
import "../styles/AgentDetail.css";

import { getAgentReviews } from "../services/mockAgentReviewService";

/* ===== KEY META ẢNH GIỐNG TRANG CÁ NHÂN ===== */
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

/* ========= ĐỌC USER & TÌM MÔI GIỚI CỦA CHÍNH MÌNH ========= */
function findMyAgent() {
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    currentUser = null;
  }
  if (!currentUser) return { agent: null, profile: null };

  // Đọc meta ảnh từ trang cá nhân
  const avatarMetaUrl = loadMetaUrl(AVATAR_META_KEY);
  const coverMetaUrl = loadMetaUrl(COVER_META_KEY);

  // Đọc danh sách môi giới mock
  let agents = [];
  try {
    const raw =
      localStorage.getItem("agents") ||
      localStorage.getItem("mockAgents") ||
      "[]";
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) agents = parsed;
  } catch {
    agents = [];
  }

  // Tìm agent record gắn với user hiện tại (nếu có)
  const myAgent =
    agents.find(
      (a) =>
        a.ownerId === currentUser.id ||
        a.userId === currentUser.id ||
        a.phone === currentUser.phone
    ) || {};

  // Đọc bài đăng để tính tin hiện có + thời gian hoạt động
  let posts = [];
  try {
    posts = JSON.parse(localStorage.getItem("posts") || "[]");
  } catch {
    posts = [];
  }

  const myPosts = posts.filter(
    (p) =>
      p.ownerId === currentUser.id ||
      p.userId === currentUser.id ||
      p.phone === currentUser.phone
  );

  const postsCount = myPosts.length;

  let yearsActive = myAgent.yearsActive || 0;
  if (!yearsActive && myPosts.length > 0) {
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

  const profileIntro = currentUser.profileIntro || "";
  const profileProvinces = currentUser.profileProvinces || [];

  // Gộp data thành 1 object agent dùng cho UI
  const mergedAgent = {
    id:
      myAgent.id ||
      currentUser.id ||
      currentUser.phone ||
      "my-agent-profile",
    name: myAgent.name || currentUser.name || "Trang môi giới của tôi",
    // ⭐ ƯU TIÊN ẢNH TỪ TRANG CÁ NHÂN (meta), rồi tới currentUser, rồi tới mock
    bannerUrl:
      coverMetaUrl ||
      currentUser.coverUrl ||
      myAgent.bannerUrl ||
      "/Img/agents/default-banner.jpg",
    avatarUrl: avatarMetaUrl || currentUser.avatarUrl || myAgent.avatarUrl || "",
    badge: myAgent.badge || "Môi giới cá nhân",
    followers: myAgent.followers ?? myAgent.followerCount ?? 0,
    responseRate: myAgent.responseRate ?? 0,
    desc: profileIntro || myAgent.desc || "",
    area:
      profileProvinces.join(", ") ||
      myAgent.area ||
      "Chưa cập nhật khu vực hoạt động",
    yearsActive: yearsActive || 0,
    postsCount: postsCount || myAgent.postsCount || 0,
    rating: myAgent.rating ?? myAgent.avgRating ?? 0,
    ratingCount: myAgent.ratingCount ?? myAgent.reviewCount ?? 0,
  };

  return { agent: mergedAgent, profile: currentUser };
}

/* ========= HÀNG SAO NHỎ ========= */
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

/* ========= TRANG CHUYÊN TRANG MÔI GIỚI CỦA TÔI ========= */
export default function MyAgentPage() {
  const navigate = useNavigate();
  const [agent, setAgent] = useState(null);
  const [reviews, setReviews] = useState([]);

  useEffect(() => {
    const { agent: myAgent } = findMyAgent();
    if (!myAgent) {
      navigate("/login");
      return;
    }
    setAgent(myAgent);

    getAgentReviews(myAgent.id).then((list) => {
      setReviews(Array.isArray(list) ? list : []);
    });
  }, [navigate]);

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

  if (!agent) {
    return (
      <div className="nhatot">
        <div className="mk-page">
          <Header />
          <div className="agd-page">
            <p style={{ padding: 24 }}>Đang tải chuyên trang môi giới...</p>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  const responseRate = agent.responseRate ?? 0;

  const handleViewAllListings = () => {
    navigate("/quan-ly-tin");
  };

  const handleViewAllReviews = () => {
    navigate(`/moi-gioi/${agent.id}/danh-gia`);
  };

  return (
    <div className="nhatot">
      <div className="mk-page">
        <Header />

        <div className="agd-page">
          <div className="agd-main">
            {/* ============== HERO ============== */}
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
                      <span>Người theo dõi: {agent.followers || 0}</span>
                    </div>
                  </div>
                </div>

                <div className="agd-hero-actions">
                  <button className="agd-hero-ghost-btn">
                    <Share2 size={16} />
                    Chia sẻ
                  </button>
                  {/* ĐÃ BỎ Chat với khách & Liên hệ */}
                </div>
              </div>
            </section>

            {/* ============== STATS ============== */}
            <section className="agd-stats-row">
              <div className="agd-stat-card">
                <p className="agd-stat-label">Thời gian hoạt động</p>
                <p className="agd-stat-value">
                  {agent.yearsActive || 0} năm
                </p>
                <p className="agd-stat-sub">Tính từ tin đăng đầu tiên</p>
              </div>

              <div className="agd-stat-card">
                <p className="agd-stat-label">Tin hiện có</p>
                <p className="agd-stat-value">{agent.postsCount || 0} tin</p>
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

            {/* ============== LAYOUT 2 CỘT ============== */}
            <section className="agd-layout">
              {/* LEFT COLUMN */}
              <div className="agd-left-col">
                {/* Giới thiệu */}
                <div className="agd-card">
                  <h2 className="agd-section-title">Giới thiệu</h2>
                  <div className="agd-about-text">
                    <p>
                      {agent.desc
                        ? `- ${agent.desc}`
                        : "- Chưa cập nhật phần giới thiệu."}
                    </p>
                  </div>
                </div>

                {/* Khu vực hoạt động */}
                <div className="agd-card">
                  <h2 className="agd-section-title">Khu vực hoạt động</h2>
                  <div className="agd-area-block">
                    <MapPin size={18} />
                    <div>
                      <p>{agent.area}</p>
                    </div>
                  </div>
                </div>

                {/* Tin đăng */}
                <div className="agd-card">
                  <div className="agd-card-header">
                    <h2 className="agd-section-title">
                      Tất cả tin đăng ({agent.postsCount || 0})
                    </h2>
                  </div>

                  <div className="agd-listings-grid">
                    {/* TODO: map bài đăng thật */}
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
                            {rv.name?.charAt(0).toUpperCase()}
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
      </div>
    </div>
  );
}
