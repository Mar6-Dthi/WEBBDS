// src/pages/AgentReview.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Star, User, MapPin, ThumbsUp } from "lucide-react";

import Header from "../components/header";
import Footer from "../components/footer";
import "../styles/AgentReview.css";

import {
  addAgentReview,
  getAgentReviews,
  addAgentReply,
} from "../services/mockAgentReviewService"; // 🔹 dùng file mockAgentReviewService mới
import { getAgentById } from "../services/mockAgentService";

// ===== META AVATAR GIỐNG PROFILE =====
const AVATAR_META_KEY = "profile_avatar_meta";

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

function formatTime(iso) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StarRating({ value = 0, onChange, size = 18, readOnly = false }) {
  const [hover, setHover] = useState(0);
  const displayValue = hover || value;

  return (
    <div className="agr-stars">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          className={`agr-star-btn ${
            displayValue >= n ? "agr-star-filled" : "agr-star-empty"
          } ${readOnly ? "agr-star-readonly" : ""}`}
          onMouseEnter={() => !readOnly && setHover(n)}
          onMouseLeave={() => !readOnly && setHover(0)}
          onClick={() => !readOnly && onChange && onChange(n)}
        >
          <Star size={size} />
        </button>
      ))}
    </div>
  );
}

function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}

/** Fallback: build môi giới từ chính currentUser (dùng cho trang /moi-gioi/:id/danh-gia của mình) */
function buildAgentFromCurrentUser(agentIdFromUrl) {
  const current = getCurrentUser();
  if (!current) return null;

  const avatarMetaUrl = loadMetaUrl(AVATAR_META_KEY);

  let posts = [];
  try {
    posts = JSON.parse(localStorage.getItem("posts") || "[]");
  } catch {
    posts = [];
  }

  const myPosts = posts.filter(
    (p) =>
      p.ownerId === current.id ||
      p.userId === current.id ||
      p.phone === current.phone
  );

  const numDeals = myPosts.length;

  let yearsExp = 0;
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
      yearsExp = diffYears < 1 ? 0 : Math.floor(diffYears);
    }
  }

  const areaProvinces = current.profileProvinces || [];

  return {
    id: agentIdFromUrl || current.id || current.phone || "my-agent-profile",
    name: current.name || "Trang môi giới của tôi",
    avatar: avatarMetaUrl || current.avatarUrl || "",
    phone: current.phone || "09xx xxx xxx",
    area: areaProvinces.join(", ") || "Chưa cập nhật khu vực hoạt động",
    numDeals,
    yearsExp,
  };
}

export default function AgentReview() {
  const navigate = useNavigate();
  const { id: agentId } = useParams(); // /moi-gioi/:id/danh-gia

  const [agent, setAgent] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [isSelfAgent, setIsSelfAgent] = useState(false);

  const [form, setForm] = useState({
    userName: "",
    rating: 0,
    content: "",
  });
  const [errors, setErrors] = useState({});
  const [replyInputs, setReplyInputs] = useState({}); // { [reviewId]: text }

  // ====== LOAD THÔNG TIN MÔI GIỚI & REVIEW ======
  useEffect(() => {
    async function loadData() {
      // 1. Lấy môi giới theo id từ mockAgentService
      const data = await getAgentById(agentId);

      if (data) {
        setAgent({
          id: data.id,
          name: data.name,
          avatar: data.avatarUrl,
          phone: data.phone || "09xx xxx xxx",
          area: data.area,
          numDeals: data.transactionsCount,
          yearsExp: data.yearsActive,
        });
        setIsSelfAgent(false);
      } else {
        // Không có trong mock => xem như trang môi giới của chính mình
        const fallback = buildAgentFromCurrentUser(agentId);
        if (fallback) {
          setAgent(fallback);
          setIsSelfAgent(true);
        }
      }

      // 2. Load review từ service (đã kèm replies)
      const list = await getAgentReviews(agentId);
      setReviews(Array.isArray(list) ? list : []);
    }

    loadData();
  }, [agentId]);

  const avgRating = useMemo(() => {
    if (!reviews.length) return 0;
    const sum = reviews.reduce((acc, r) => acc + (r.rating || 0), 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Không cho tự review bản thân
    if (isSelfAgent) {
      alert("Bạn không thể tự viết đánh giá cho bản thân.");
      return;
    }

    const nextErrors = {};
    if (!form.userName.trim())
      nextErrors.userName = "Vui lòng nhập tên của bạn";
    if (!form.rating)
      nextErrors.rating = "Vui lòng chọn số sao đánh giá";
    if (!form.content.trim())
      nextErrors.content = "Vui lòng nhập nội dung nhận xét";

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert("Vui lòng đăng nhập để gửi đánh giá");
      navigate("/login");
      return;
    }

    const reviewerId =
      currentUser.id ||
      currentUser.userId ||
      currentUser.phone ||
      currentUser.email;

    const reviewerName =
      form.userName.trim() ||
      currentUser.name ||
      currentUser.displayName ||
      "Người dùng";

    const saved = addAgentReview({
      agentId,
      reviewerId,
      reviewerName,
      rating: form.rating,
      content: form.content.trim(),
    });

    setReviews((prev) => [saved, ...prev]);
    setForm({ userName: "", rating: 0, content: "" });
    setErrors({});
  };

  const handleLike = (reviewId) => {
    // Cập nhật UI
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r
      )
    );

    // Sync lại localStorage cho agentReviews (object { [agentId]: [] })
    try {
      const all = JSON.parse(
        localStorage.getItem("agentReviews") || "{}"
      );
      if (all[agentId]) {
        all[agentId] = all[agentId].map((r) =>
          r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r
        );
        localStorage.setItem("agentReviews", JSON.stringify(all));
      }
    } catch {
      // ignore
    }
  };

  // ====== REPLY ======

  const handleReplyChange = (reviewId, value) => {
    setReplyInputs((prev) => ({ ...prev, [reviewId]: value }));
  };

  const handleSubmitReply = (reviewId) => {
    const text = (replyInputs[reviewId] || "").trim();
    if (!text) return;

    const currentUser = getCurrentUser();
    if (!currentUser) {
      alert("Vui lòng đăng nhập để trả lời đánh giá");
      navigate("/login");
      return;
    }

    const replierId =
      currentUser.id ||
      currentUser.userId ||
      currentUser.phone ||
      currentUser.email;

    const replierName =
      currentUser.name || currentUser.displayName || "Môi giới";

    const reply = addAgentReply({
      agentId,
      reviewId,
      replierId,
      replierName,
      content: text,
    });

    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId
          ? { ...r, replies: [...(r.replies || []), reply] }
          : r
      )
    );

    setReplyInputs((prev) => ({ ...prev, [reviewId]: "" }));
  };

  if (!agent) {
    return (
      <div className="nhatot">
        <div className="mk-page">
          <Header />
          <div className="agr-page">
            <p style={{ padding: 24 }}>Đang tải thông tin môi giới...</p>
          </div>
          <Footer />
        </div>
      </div>
    );
  }

  const handleGoReviewerAgent = (review) => {
    if (!review.reviewerId) return;
    navigate(`/moi-gioi/${encodeURIComponent(review.reviewerId)}/danh-gia`);
  };

  return (
    <div className="nhatot">
      <div className="mk-page">
        <Header />

        <div className="agr-page">
          <div className="agr-main">
            {/* breadcrumb */}
            <div className="agr-breadcrumb">
              <span
                className="agr-breadcrumb-link"
                onClick={() => navigate("/moi-gioi")}
              >
                Danh sách môi giới
              </span>
              <span className="agr-breadcrumb-sep">/</span>
              <span
                className="agr-breadcrumb-link"
                onClick={() => navigate(`/moi-gioi/${agent.id}`)}
              >
                {agent.name}
              </span>
              <span className="agr-breadcrumb-sep">/</span>
              <span>Đánh giá & nhận xét</span>
            </div>

            {/* Agent summary */}
            <section className="agr-agent-card">
              <div className="agr-agent-left">
                <div className="agr-avatar-wrap">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    onError={(e) => {
                      e.target.src =
                        "https://ui-avatars.com/api/?background=fff7ec&color=ff7a00&name=" +
                        encodeURIComponent(agent.name);
                    }}
                  />
                </div>
                <div>
                  <h1 className="agr-agent-name">{agent.name}</h1>
                  <div className="agr-agent-meta">
                    <span>
                      <User size={16} /> {agent.yearsExp || 0} năm
                      kinh nghiệm
                    </span>
                    <span>
                      <MapPin size={16} /> Khu vực: {agent.area}
                    </span>
                  </div>
                </div>
              </div>

              <div className="agr-agent-right">
                <div className="agr-rating-summary">
                  <div className="agr-rating-main">
                    <span className="agr-rating-score">{avgRating}</span>
                    <StarRating value={Number(avgRating)} readOnly />
                  </div>
                  <p className="agr-rating-sub">
                    {reviews.length} đánh giá từ khách hàng
                  </p>
                </div>
              </div>
            </section>

            {/* layout 2 cột */}
            <section className="agr-layout">
              {/* LEFT: form hoặc note */}
              {!isSelfAgent ? (
                <div className="agr-form-card">
                  <h2 className="agr-section-title">
                    Viết đánh giá về môi giới này
                  </h2>
                  <p className="agr-form-note">
                    Chia sẻ trải nghiệm thực tế để những khách hàng khác có
                    thêm thông tin trước khi làm việc với môi giới.
                  </p>

                  <form onSubmit={handleSubmit} className="agr-form">
                    <div className="agr-field">
                      <label>
                        Tên của bạn{" "}
                        <span className="agr-required">*</span>
                      </label>
                      <input
                        type="text"
                        name="userName"
                        value={form.userName}
                        onChange={handleChange}
                        placeholder="Ví dụ: Nguyễn Thị A"
                      />
                      {errors.userName && (
                        <p className="agr-error">{errors.userName}</p>
                      )}
                    </div>

                    <div className="agr-field">
                      <label>
                        Mức độ hài lòng{" "}
                        <span className="agr-required">*</span>
                      </label>
                      <StarRating
                        value={form.rating}
                        onChange={(v) =>
                          setForm((prev) => ({ ...prev, rating: v }))
                        }
                        size={24}
                      />
                      {errors.rating && (
                        <p className="agr-error">{errors.rating}</p>
                      )}
                    </div>

                    <div className="agr-field">
                      <label>
                        Nhận xét chi tiết{" "}
                        <span className="agr-required">*</span>
                      </label>
                      <textarea
                        name="content"
                        rows={4}
                        value={form.content}
                        onChange={handleChange}
                        placeholder="Ví dụ: Môi giới tư vấn rõ ràng, hỗ trợ xem nhà, thương lượng giá, hỗ trợ giấy tờ..."
                      />
                      {errors.content && (
                        <p className="agr-error">{errors.content}</p>
                      )}
                    </div>

                    <button type="submit" className="agr-submit-btn">
                      Gửi đánh giá
                    </button>
                  </form>
                </div>
              ) : (
                <div className="agr-form-card">
                  <h2 className="agr-section-title">
                    Đánh giá về bạn từ khách hàng
                  </h2>
                  <p className="agr-form-note">
                    Bạn không thể tự viết đánh giá cho bản thân. Bạn chỉ
                    có thể trả lời các đánh giá của khách hàng trong danh
                    sách bên phải.
                  </p>
                </div>
              )}

              {/* RIGHT: danh sách review + reply */}
              <div className="agr-review-card">
                <h2 className="agr-section-title">
                  Đánh giá từ khách hàng ({reviews.length})
                </h2>

                {reviews.length === 0 && (
                  <div className="agr-empty">
                    Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ
                    trải nghiệm!
                  </div>
                )}

                <div className="agr-review-list">
                  {reviews.map((r) => (
                    <div key={r.id} className="agr-review-item">
                      <div className="agr-review-header">
                        <div className="agr-review-avatar">
                          {(r.name || r.reviewerName || r.userName || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="agr-review-name">
                            {r.reviewerId ? (
                              <button
                                type="button"
                                className="agr-review-name-btn"
                                onClick={() =>
                                  handleGoReviewerAgent(r)
                                }
                              >
                                {r.name || r.reviewerName || r.userName}
                              </button>
                            ) : (
                              r.name || r.reviewerName || r.userName
                            )}
                          </div>
                          <div className="agr-review-stars">
                            <StarRating value={r.rating} readOnly />
                          </div>
                        </div>
                        <div className="agr-review-time">
                          {formatTime(r.createdAt) || r.timeAgo}
                        </div>
                      </div>

                      <p className="agr-review-content">{r.content}</p>

                      <button
                        type="button"
                        className="agr-like-btn"
                        onClick={() => handleLike(r.id)}
                      >
                        <ThumbsUp size={16} />
                        <span>Hữu ích</span>
                        {r.likes > 0 && (
                          <span className="agr-like-count">
                            {r.likes}
                          </span>
                        )}
                      </button>

                      {/* REPLIES */}
                      {r.replies && r.replies.length > 0 && (
                        <div className="agr-replies">
                          {r.replies.map((rep) => (
                            <div
                              key={rep.id}
                              className="agr-reply-item"
                            >
                              <div className="agr-reply-meta">
                                <span className="agr-reply-name">
                                  {rep.name}
                                </span>
                                <span className="agr-reply-time">
                                  {formatTime(rep.createdAt)}
                                </span>
                              </div>
                              <p className="agr-reply-content">
                                {rep.content}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}

                      {isSelfAgent && (
                        <div className="agr-reply-form">
                          <textarea
                            rows={2}
                            placeholder="Trả lời khách hàng..."
                            value={replyInputs[r.id] || ""}
                            onChange={(e) =>
                              handleReplyChange(r.id, e.target.value)
                            }
                          />
                          <button
                            type="button"
                            className="agr-reply-btn"
                            onClick={() => handleSubmitReply(r.id)}
                          >
                            Trả lời
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
