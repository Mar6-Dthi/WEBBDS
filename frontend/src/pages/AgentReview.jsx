// src/pages/AgentReview.jsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Star,
  User,
  Phone,
  MapPin,
  MessageCircle,
  ThumbsUp,
} from "lucide-react";

import Header from "../components/header";
import Footer from "../components/footer";
import "../styles/AgentReview.css";

import {
  addAgentReview,
  getAgentReviews,
  seedAgentReviews,
} from "../services/reviewService";
import { getAgentById } from "../services/mockAgentService"; // ⭐ lấy info môi giới thật

// Agent default (fallback)
const MOCK_AGENT = {
  id: "ng_hang_nha_tho_cu",
  name: "NG.HANG NHÀ THỔ CƯ",
  avatar: "/Img/agents/avatar-1.jpg",
  phone: "09xx xxx xxx",
  area: "Quận 7, Quận 10, Quận Tân Bình (TP.HCM)",
  numDeals: 128,
  yearsExp: 9,
};

// Review khởi tạo cho riêng NG.HANG (môi giới khác mặc định không seed)
const INITIAL_REVIEWS = [
  {
    id: 1,
    userName: "Trần Thị Lan",
    rating: 5,
    content:
      "Anh Quân hỗ trợ rất nhiệt tình, dẫn đi xem nhà đúng nhu cầu, giải thích rõ ràng giấy tờ.",
    createdAt: "2025-11-20T10:00:00",
    likes: 4,
  },
  {
    id: 2,
    userName: "Nguyễn Hữu Phúc",
    rating: 4,
    content:
      "Thái độ ok, tư vấn kỹ. Có hơi chậm phản hồi lúc cao điểm nhưng nhìn chung hài lòng.",
    createdAt: "2025-11-18T15:30:00",
    likes: 2,
  },
];

function formatTime(iso) {
  const d = new Date(iso);
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

export default function AgentReview() {
  const navigate = useNavigate();
  const { id: agentId } = useParams(); // /moi-gioi/:id/danh-gia

  const [agent, setAgent] = useState(MOCK_AGENT); // sẽ override bằng data thật
  const [reviews, setReviews] = useState([]);
  const [form, setForm] = useState({
    userName: "",
    rating: 0,
    content: "",
  });
  const [errors, setErrors] = useState({});

  // ====== LOAD THÔNG TIN MÔI GIỚI + SEED REVIEW THEO agentId ======
  useEffect(() => {
    // 1. Lấy môi giới theo id từ mockAgentService
    getAgentById(agentId).then((data) => {
      if (!data) return;

      // map field từ mockAgentService sang cấu trúc AgentReview đang dùng
      setAgent({
        id: data.id,
        name: data.name,
        avatar: data.avatarUrl,
        phone: data.phone || "09xx xxx xxx",
        area: data.area,
        numDeals: data.transactionsCount,
        yearsExp: data.yearsActive,
      });
    });

    // 2. Seed dữ liệu review ban đầu theo từng môi giới
    // Chỉ seed INITIAL_REVIEWS cho NG.HANG, các môi giới khác để mảng rỗng
    const initial =
      agentId === "ng_hang_nha_tho_cu" ? INITIAL_REVIEWS : [];
    seedAgentReviews(agentId, initial);

    // 3. Load review của đúng môi giới từ service
    const list = getAgentReviews(agentId);
    setReviews(list);
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
    const nextErrors = {};
    if (!form.userName.trim()) nextErrors.userName = "Vui lòng nhập tên của bạn";
    if (!form.rating) nextErrors.rating = "Vui lòng chọn số sao đánh giá";
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

    // Lưu review theo ĐÚNG agentId
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
    setReviews((prev) =>
      prev.map((r) =>
        r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r
      )
    );

    // OPTIONAL: sync ngược về localStorage nếu reviewService cũng dùng key này
    const all = JSON.parse(localStorage.getItem("agentReviews") || "[]");
    const updated = all.map((r) =>
      r.id === reviewId ? { ...r, likes: (r.likes || 0) + 1 } : r
    );
    localStorage.setItem("agentReviews", JSON.stringify(updated));
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
                      <User size={16} /> {agent.yearsExp} năm kinh nghiệm
                    </span>
                    <span>
                      <MapPin size={16} /> Khu vực: {agent.area}
                    </span>
                  </div>
                  <div className="agr-agent-meta">
                    <span>
                      <MessageCircle size={16} /> Đã giao dịch: {agent.numDeals}+
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
                <button
                  className="agr-contact-btn"
                  type="button"
                  onClick={() => alert("Mock: Gọi điện cho môi giới")}
                >
                  <Phone size={18} />
                  Gọi {agent.phone}
                </button>
              </div>
            </section>

            {/* layout 2 cột */}
            <section className="agr-layout">
              {/* form */}
              <div className="agr-form-card">
                <h2 className="agr-section-title">
                  Viết đánh giá về môi giới này
                </h2>
                <p className="agr-form-note">
                  Chia sẻ trải nghiệm thực tế để những khách hàng khác có thêm
                  thông tin trước khi làm việc với môi giới.
                </p>

                <form onSubmit={handleSubmit} className="agr-form">
                  <div className="agr-field">
                    <label>
                      Tên của bạn <span className="agr-required">*</span>
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
                      Mức độ hài lòng <span className="agr-required">*</span>
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
                      Nhận xét chi tiết <span className="agr-required">*</span>
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

              {/* review list */}
              <div className="agr-review-card">
                <h2 className="agr-section-title">
                  Đánh giá từ khách hàng ({reviews.length})
                </h2>

                {reviews.length === 0 && (
                  <div className="agr-empty">
                    Chưa có đánh giá nào. Hãy là người đầu tiên chia sẻ trải
                    nghiệm!
                  </div>
                )}

                <div className="agr-review-list">
                  {reviews.map((r) => (
                    <div key={r.id} className="agr-review-item">
                      <div className="agr-review-header">
                        <div className="agr-review-avatar">
                          {(r.reviewerName || r.userName || "?")
                            .charAt(0)
                            .toUpperCase()}
                        </div>
                        <div>
                          <div className="agr-review-name">
                            {r.reviewerName || r.userName}
                          </div>
                          <div className="agr-review-stars">
                            <StarRating value={r.rating} readOnly />
                          </div>
                        </div>
                        <div className="agr-review-time">
                          {formatTime(r.createdAt)}
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
                          <span className="agr-like-count">{r.likes}</span>
                        )}
                      </button>
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
