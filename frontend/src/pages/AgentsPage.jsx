// src/pages/AgentsPage.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  ChevronDown,
  MapPin,
  Star,
  Phone,
  ChevronRight,
} from "lucide-react";

import Header from "../components/header";
import Footer from "../components/footer";
import "../styles/AgentsPage.css";

const AGENTS = [
  {
    id: "ng_hang_nha_tho_cu",
    bannerUrl: "/Img/agents/banner-1.jpg",
    avatarUrl: "/Img/agents/avatar-1.jpg",
    name: "NG.HANG NHÀ THỔ CƯ",
    rating: 5,
    ratingCount: 11,
    badge: "CHỨNG CHỈ MÔI GIỚI",
    desc: `Chuyên đào tạo thực chiến MG BĐS nhà phố thổ cư. Tuyển dụng nhân sự bán hàng khu vực TP.HCM: Q.4, Q.7, Q.2, Q.9...`,
    area: "Quận 7, Quận 10, Quận Tân Bình (TP Hồ Chí Minh)",
    postsCount: 694,
  },
  {
    id: "hau_binh_thanh",
    bannerUrl: "/Img/agents/banner-2.jpg",
    avatarUrl: "/Img/agents/avatar-2.jpg",
    name: "Hậu chuyên nhà Bình Thạnh",
    rating: 5,
    ratingCount: 1,
    badge: "",
    desc: `Chuyên nhà Bình Thạnh, Phú Nhuận, Gò Vấp.`,
    area: "Quận Bình Thạnh, Quận Gò Vấp, Quận Phú Nhuận (TP Hồ Chí Minh)",
    postsCount: 610,
  },
];

function AgentCard({ agent, onClickDetail, onClickPosts }) {
  return (
    <div className="agcard">
      {/* Banner */}
      <div className="agcard-banner">
        <img src={agent.bannerUrl} alt={agent.name} />
      </div>

      {/* Thông tin */}
      <div className="agcard-body">
        <div className="agcard-top">
          <div className="agcard-avatar-wrap">
            <img
              src={agent.avatarUrl}
              alt={agent.name}
              onError={(e) => {
                e.target.src =
                  "https://ui-avatars.com/api/?background=fff7ec&color=ff7a00&name=" +
                  encodeURIComponent(agent.name);
              }}
            />
          </div>

          <div className="agcard-info">
            <div className="agcard-name-row">
              <h3 className="agcard-name">{agent.name}</h3>
              <button className="agcard-follow-btn">Theo dõi</button>
            </div>

            <div className="agcard-rating-row">
              <Star size={14} className="agcard-rating-icon" />
              <span className="agcard-rating-score">
                {agent.rating.toFixed(1)}
              </span>
              <span className="agcard-rating-count">
                ({agent.ratingCount})
              </span>
              {agent.badge && (
                <span className="agcard-badge">{agent.badge}</span>
              )}
            </div>

            <p className="agcard-desc">"{agent.desc}"</p>

            <div className="agcard-area">
              <MapPin size={14} />
              <span>Khu vực: {agent.area}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Footer nút */}
      <div className="agcard-footer">
        <button
          className="agcard-btn agcard-btn-ghost"
          type="button"
          onClick={() => alert("Mock: gọi " + agent.name)}
        >
          <Phone size={15} />
          Liên hệ
        </button>

        <button
          className="agcard-btn agcard-btn-outline"
          type="button"
          onClick={() => onClickPosts(agent)}
        >
          Xem {agent.postsCount} tin đăng
          <ChevronRight size={15} />
        </button>
      </div>

      {/* Click cả card → trang chi tiết môi giới */}
      <button
        type="button"
        className="agcard-overlay-link"
        onClick={() => onClickDetail(agent)}
        aria-label={"Xem trang môi giới " + agent.name}
      />
    </div>
  );
}

export default function AgentsPage() {
  const navigate = useNavigate();

  // Bấm vào card → sang trang chi tiết môi giới
  const handleGoDetail = (agent) => {
    navigate(`/moi-gioi/${agent.id}`);
  };

  // Bấm "Xem xxx tin đăng" → trang tin đăng của riêng môi giới
  const handleGoPosts = (agent) => {
    navigate(`/moi-gioi/${agent.id}/tin-dang`);
  };

  return (
    <div className="nhatot">
      <div className="mk-page">
        {/* HEADER chung */}
        <Header />

        {/* Phần nội dung, có margin-top để không bị header che */}
        <div className="agents-page-content">
          <div className="agents-wrapper">
            <div className="agents-main">
              {/* Thanh filter */}
              <div className="agents-filter-bar">
                <button className="agents-filter-btn" type="button">
                  <Filter size={16} />
                  Lọc
                </button>

                <button className="agents-filter-pill" type="button">
                  Toàn quốc <ChevronDown size={14} />
                </button>

                <button className="agents-filter-pill" type="button">
                  Môi giới mua bán <ChevronDown size={14} />
                </button>

                <button className="agents-filter-pill" type="button">
                  Loại BĐS <ChevronDown size={14} />
                </button>

                <button className="agents-filter-pill" type="button">
                  Khoảng giá mua bán <ChevronDown size={14} />
                </button>
              </div>

              {/* Danh sách môi giới 2 cột */}
              <div className="agents-list">
                {AGENTS.map((a) => (
                  <AgentCard
                    key={a.id}
                    agent={a}
                    onClickDetail={handleGoDetail}
                    onClickPosts={handleGoPosts}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* FOOTER chung */}
        <Footer />
      </div>
    </div>
  );
}
