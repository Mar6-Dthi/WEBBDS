// src/pages/AgentDetail.jsx
import React from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  MapPin,
  Star,
  Phone,
  Share2,
  Clock,
} from "lucide-react";

import Header from "../components/header";
import Footer from "../components/footer";
import "../styles/AgentDetail.css";

const MOCK_AGENT = {
  id: "ng_hang_nha_tho_cu",
  bannerUrl: "/Img/agents/banner-1.jpg",
  avatarUrl: "/Img/agents/avatar-1.jpg",
  name: "NG.HANG NHÀ THỔ CƯ",
  hasCert: true,
  status: "Đang hoạt động",
  responseRate: 87,
  responseTime: "trong ~1 phút",
  followers: 101,
  yearsOnPlatform: 9,
  numDeals: 13,
  numPosts: 706,
  rating: 5,
  ratingCount: 10,
  about: [
    "Chuyên đào tạo thực chiến MG BĐS nhà phố thổ cư.",
    "Tuyển dụng nhân sự bán hàng khu vực TP.HCM: Q.4, Q.7, Q.2, Q.9, Nhà Bè,...",
    "Nhận ký gửi, mua bán, môi giới nhà phố thổ cư Tp.HCM, khu Nam Sài Gòn Q.7, khu Trung tâm Sài Gòn, Q.10, Tân Bình...",
    "Nguồn hàng đa dạng: nhà ở, cho thuê, đầu tư, có dòng tiền...",
    "Hỗ trợ tất cả các dịch vụ pháp lý BĐS. Tận tâm, uy tín, chuyên nghiệp.",
  ],
  areas: [
    "Quận 7, Quận 10, Quận Tân Bình (TP Hồ Chí Minh)",
    "Một số khu vực lân cận theo yêu cầu khách hàng",
  ],
};

const MOCK_SOLD = [
  {
    id: "sold1",
    title: "NHÀ ĐẸP 90M2 - MTKD - GẦN LOTTE Q7",
    timeAgo: "3 ngày trước",
  },
  {
    id: "sold2",
    title: "NHÀ PHỐ GẦN PHÚ MỸ HƯNG - FULL NỘI THẤT",
    timeAgo: "1 tuần trước",
  },
];

const MOCK_LISTINGS = [
  {
    id: "lst1",
    title: "Nhà phố 4x16, full nội thất, Nam Sài Gòn",
    price: "7.500.000.000 đ",
    area: "64 m²",
    location: "Quận 7, TP.HCM",
    imageUrl: "/Img/demo/house-1.jpg",
  },
  {
    id: "lst2",
    title: "Nhà hẻm xe hơi, gần Lotte Mart Q7",
    price: "6.200.000.000 đ",
    area: "60 m²",
    location: "Quận 7, TP.HCM",
    imageUrl: "/Img/demo/house-2.jpg",
  },
  {
    id: "lst3",
    title: "Nhà mặt tiền kinh doanh, Tân Bình",
    price: "9.800.000.000 đ",
    area: "72 m²",
    location: "Quận Tân Bình, TP.HCM",
    imageUrl: "/Img/demo/house-3.jpg",
  },
];

const MOCK_REVIEWS = [
  {
    id: 1,
    name: "Nghi Phương",
    rating: 5,
    timeAgo: "hôm qua",
    tags: ["Đúng hẹn", "Chất lượng sản phẩm tốt", "+4"],
    content:
      "Nhà đúng mô tả, anh hỗ trợ giấy tờ, sang tên nhanh. Rất hài lòng.",
    listingTitle: "NHÀ MỚI SÁT KHU NAM LONG – FULL NỘI THẤT",
    listingPrice: "7.500.000.000 đ",
  },
  {
    id: 2,
    name: "Samsung&GE Máy siêu âm",
    rating: 5,
    timeAgo: "hôm qua",
    tags: ["Nhiệt tình", "Có tâm", "Tư vấn kỹ"],
    content:
      "Anh Quân tư vấn kỹ lưỡng, hỗ trợ thương lượng giá tốt. Sẽ giới thiệu thêm bạn bè.",
    listingTitle: "NHÀ MỚI SÁT KHU NAM LONG – FULL NỘI THẤT",
    listingPrice: "7.500.000.000 đ",
  },
];

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

export default function AgentDetail() {
  const navigate = useNavigate();
  const { id } = useParams(); // sau này dùng id để gọi API

  const agent = MOCK_AGENT; // tạm mock

  const handleViewAllListings = () => {
    navigate(`/moi-gioi/${agent.id}/tin-dang`);
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
            {/* HERO */}
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
                      {agent.hasCert && (
                        <span className="agd-hero-cert-badge">
                          <span className="agd-hero-cert-dot" />
                          Chứng chỉ môi giới
                        </span>
                      )}
                    </div>

                    <div className="agd-hero-status-row">
                      <span className="agd-status-dot" />
                      <span>{agent.status}</span>
                      <span className="agd-dot-sep">•</span>
                      <span>
                        Tỷ lệ phản hồi:{" "}
                        <strong>{agent.responseRate}%</strong> (
                        {agent.responseTime})
                      </span>
                      <span className="agd-dot-sep">•</span>
                      <span>
                        Người theo dõi:{" "}
                        <button
                          type="button"
                          className="agd-link-inline"
                          onClick={() => alert("Mock: xem danh sách follower")}
                        >
                          {agent.followers}
                        </button>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="agd-hero-actions">
                  <button
                    type="button"
                    className="agd-hero-ghost-btn"
                    onClick={() =>
                      navigator.clipboard &&
                      navigator.clipboard.writeText(window.location.href)
                    }
                  >
                    <Share2 size={16} />
                    Chia sẻ
                  </button>
                  <button
                    type="button"
                    className="agd-hero-ghost-btn"
                    onClick={() => alert("Mock: theo dõi")}
                  >
                    + Theo dõi
                  </button>
                  <button
                    type="button"
                    className="agd-hero-chip-btn"
                    onClick={() => alert("Mock: chat Zalo")}
                  >
                    Zalo
                  </button>
                  <button
                    type="button"
                    className="agd-hero-chip-btn"
                    onClick={() => alert("Mock: chat trong hệ thống")}
                  >
                    Chat
                  </button>
                  <button
                    type="button"
                    className="agd-hero-main-btn"
                    onClick={() => alert("Mock: gọi điện")}
                  >
                    <Phone size={18} />
                    Liên hệ
                  </button>
                </div>
              </div>
            </section>

            {/* STATS */}
            <section className="agd-stats-row">
              <div className="agd-stat-card">
                <p className="agd-stat-label">Thời gian hoạt động</p>
                <p className="agd-stat-value">{agent.yearsOnPlatform} năm</p>
                <p className="agd-stat-sub">Trên Nhà Tốt</p>
              </div>

              <div className="agd-stat-card">
                <p className="agd-stat-label">Đã giao dịch</p>
                <p className="agd-stat-value">{agent.numDeals} BĐS</p>
                <p className="agd-stat-sub">Trên Nhà Tốt</p>
              </div>

              <div className="agd-stat-card">
                <p className="agd-stat-label">Tin hiện có</p>
                <p className="agd-stat-value">{agent.numPosts} tin</p>
                <button
                  type="button"
                  className="agd-stat-link"
                  onClick={handleViewAllListings}
                >
                  Xem tất cả
                </button>
              </div>

              <div className="agd-stat-card">
                <p className="agd-stat-label">Đánh giá</p>
                <p className="agd-stat-value">
                  {agent.rating}{" "}
                  <Star size={18} className="agd-stat-star-icon" />
                </p>
                <p className="agd-stat-sub">{agent.ratingCount} đánh giá</p>
              </div>
            </section>

            {/* MAIN 2 CỘT */}
            <section className="agd-layout">
              {/* LEFT */}
              <div className="agd-left-col">
                <div className="agd-card">
                  <h2 className="agd-section-title">Giới thiệu</h2>
                  <div className="agd-about-text">
                    {agent.about.map((line, idx) => (
                      <p key={idx}>- {line}</p>
                    ))}
                  </div>
                </div>

                <div className="agd-card">
                  <h2 className="agd-section-title">Khu vực hoạt động</h2>
                  <div className="agd-area-block">
                    <MapPin size={18} />
                    <div>
                      {agent.areas.map((a, idx) => (
                        <p key={idx}>{a}</p>
                      ))}
                    </div>
                  </div>
                  <button
                    type="button"
                    className="agd-outline-pill-btn"
                    onClick={() => alert("Mock: xem tất cả thông tin khu vực")}
                  >
                    Xem tất cả thông tin
                  </button>
                </div>

                <div className="agd-card">
                  <div className="agd-card-header">
                    <h2 className="agd-section-title">Đã bán/Đã cho thuê</h2>
                    <span className="agd-card-sub-count">
                      ({MOCK_SOLD.length})
                    </span>
                  </div>

                  <div className="agd-sold-list">
                    {MOCK_SOLD.map((item) => (
                      <div key={item.id} className="agd-sold-item">
                        <div className="agd-sold-icon">
                          <Clock size={16} />
                        </div>
                        <div className="agd-sold-main">
                          <p className="agd-sold-title">{item.title}</p>
                          <p className="agd-sold-meta">{item.timeAgo}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="agd-outline-pill-btn"
                    onClick={() => alert("Mock: xem tất cả giao dịch đã bán")}
                  >
                    Xem tất cả
                  </button>
                </div>

                <div className="agd-card">
                  <div className="agd-card-header">
                    <h2 className="agd-section-title">
                      Tất cả tin đăng ({agent.numPosts})
                    </h2>
                  </div>

                  <div className="agd-tabs-row">
                    <button className="agd-tab-btn agd-tab-btn-active">
                      Mua bán
                    </button>
                    <button className="agd-tab-btn">Cho thuê</button>
                    <button className="agd-tab-btn">Loại hình BĐS ▾</button>
                  </div>

                  <div className="agd-listings-grid">
                    {MOCK_LISTINGS.map((lst) => (
                      <div key={lst.id} className="agd-listing-card">
                        <div className="agd-listing-img-wrap">
                          <img src={lst.imageUrl} alt={lst.title} />
                        </div>
                        <h3 className="agd-listing-title">{lst.title}</h3>
                        <p className="agd-listing-price">{lst.price}</p>
                        <p className="agd-listing-meta">
                          {lst.area} • {lst.location}
                        </p>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="agd-outline-pill-btn agd-outline-pill-full"
                    onClick={handleViewAllListings}
                  >
                    Xem tất cả tin đăng
                  </button>
                </div>
              </div>

              {/* RIGHT – reviews summary */}
              <aside className="agd-right-col">
                <div className="agd-card">
                  <div className="agd-card-header">
                    <h2 className="agd-section-title">
                      Đánh giá từ khách hàng ({agent.ratingCount})
                    </h2>
                    <div className="agd-rating-summary">
                      <span className="agd-rating-score-main">
                        {agent.rating}
                      </span>
                      <Star size={18} className="agd-stat-star-icon" />
                      <span className="agd-rating-count-main">
                        ({agent.ratingCount} đánh giá)
                      </span>
                    </div>
                  </div>

                  <div className="agd-review-list">
                    {MOCK_REVIEWS.map((rv) => (
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

                        <div className="agd-review-tags">
                          {rv.tags.map((tag, idx) => (
                            <span key={idx} className="agd-tag-pill">
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <button
                    type="button"
                    className="agd-outline-pill-btn agd-outline-pill-full"
                    onClick={handleViewAllReviews}
                  >
                    Xem tất cả đánh giá ({agent.ratingCount})
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
