// src/pages/MyReviewsPage.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MyReviewsPage.css";
import NhatotHeader from "../components/header";
import Footer from "../components/footer";
import { MessageSquare, Star, Clock } from "lucide-react";
import { getMyReviews } from "../services/reviewService";

// Lấy currentUser từ localStorage
function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    return null;
  }
}

// reviewerId chuẩn theo AgentReview.jsx
function getReviewerIdFromUser(u) {
  if (!u) return null;
  return u.id || u.userId || u.phone || u.email || null;
}

function formatDate(ts) {
  if (!ts) return "";
  const d = new Date(ts);
  return d.toLocaleString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function MyReviewsPage() {
  const navigate = useNavigate();
  const [reviews, setReviews] = useState([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const user = getCurrentUser();
    const reviewerId = getReviewerIdFromUser(user);

    if (!reviewerId) {
      setReviews([]);
      setLoaded(true);
      return;
    }

    const list = getMyReviews(reviewerId);
    setReviews(list);
    setLoaded(true);
  }, []);

  const handleGoAgent = (agentId) => {
    if (!agentId) return;
    // Trang môi giới tương ứng, sau này chị dùng đúng route thật ở đây
    navigate(`/moi-gioi/${agentId}`);
  };

  return (
    <div className="nhatot">
      <div className="mk-page">
        <NhatotHeader />

        <main className="myrv-page">
          <div className="myrv-inner">
            {/* Header trang */}
            <div className="myrv-head">
              <p className="myrv-breadcrumb">
                Trang chủ <span className="myrv-breadcrumb-sep">›</span> Đánh giá của tôi
              </p>
              <h1 className="myrv-title">Đánh giá của tôi</h1>
              <p className="myrv-sub">
                Lịch sử các đánh giá chị đã thực hiện cho trang môi giới trên hệ thống.
              </p>
            </div>

            {/* Nội dung */}
            {!loaded ? (
              <div className="myrv-empty">
                <MessageSquare size={22} />
                <div>
                  <h2>Đang tải dữ liệu...</h2>
                  <p>Vui lòng chờ trong giây lát.</p>
                </div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="myrv-empty">
                <MessageSquare size={22} />
                <div>
                  <h2>Chị chưa có đánh giá nào</h2>
                  <p>Khi chị đánh giá bất kỳ trang môi giới nào, lịch sử sẽ được ghi lại tại đây.</p>
                </div>
              </div>
            ) : (
              <div className="myrv-list">
                {reviews.map((rv) => (
                  <div
                    key={rv.id}
                    className="myrv-item"
                    onClick={() => handleGoAgent(rv.agentId)}
                  >
                    <div className="myrv-item-header">
                      <div>
                        <p className="myrv-agent-name myrv-agent-link">
                          Trang môi giới #{rv.agentId}
                        </p>
                        <p className="myrv-meta">
                          <Clock size={14} /> {formatDate(rv.createdAt)}
                        </p>
                      </div>
                      <div className="myrv-rating">
                        <Star className="myrv-star" />
                        <span>{rv.rating}/5</span>
                      </div>
                    </div>

                    {!!rv.content && (
                      <p className="myrv-comment">“{rv.content}”</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
