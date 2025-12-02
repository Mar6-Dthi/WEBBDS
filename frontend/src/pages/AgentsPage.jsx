// src/pages/AgentsPage.jsx
import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Star, Phone, ChevronRight } from "lucide-react";

import Header from "../components/header";
import Footer from "../components/footer";
import AgentsFilterBar, {
  PRICE_OPTIONS,
} from "../components/AgentsFilterBar";
import "../styles/AgentsPage.css";

/** ================== MOCK DỮ LIỆU MÔI GIỚI ================== */
/** avgPricePerM2: triệu / m2
 *  estateType: "canho" | "nhao" | "vpmb" | "dat"
 *  agentType: "buy" | "rent"
 */
const AGENTS = [
  {
    id: "ng_hang_nha_tho_cu",
    bannerUrl: "/Img/agents/banner-1.jpg",
    avatarUrl: "/Img/agents/avatar-1.jpg",
    name: "NG.HANG NHÀ THỔ CƯ",
    rating: 5,
    ratingCount: 11,
    badge: "CHỨNG CHỈ MÔI GIỚI",
    desc: `Chuyên đào tạo thực chiến MG BĐS nhà phố thổ cư. Tuyển dụng nhân sự bán hàng khu vực TP Hồ Chí Minh: Q.4, Q.7, Q.2, Q.9...`,
    area: "Quận 7, Quận 10, Quận Tân Bình (TP Hồ Chí Minh)",
    provinces: ["TP Hồ Chí Minh"],
    agentType: "buy",
    estateType: "nhao",
    avgPricePerM2: 65,
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
    area:
      "Quận Bình Thạnh, Quận Gò Vấp, Quận Phú Nhuận (TP Hồ Chí Minh)",
    provinces: ["TP Hồ Chí Minh"],
    agentType: "buy",
    estateType: "nhao",
    avgPricePerM2: 80,
  },
  {
    id: "canho_quan2",
    bannerUrl: "/Img/agents/banner-1.jpg",
    avatarUrl: "/Img/agents/avatar-1.jpg",
    name: "Lan – Căn hộ Quận 2",
    rating: 4.8,
    ratingCount: 23,
    badge: "CHUYÊN CĂN HỘ",
    desc: "Chuyên căn hộ khu Thủ Thiêm, An Phú, An Khánh.",
    area: "TP Thủ Đức (TP Hồ Chí Minh)",
    provinces: ["TP Hồ Chí Minh"],
    agentType: "buy",
    estateType: "canho",
    avgPricePerM2: 95,
  },
  {
    id: "dat_cu_chi",
    bannerUrl: "/Img/agents/banner-2.jpg",
    avatarUrl: "/Img/agents/avatar-2.jpg",
    name: "Tuấn đất nền Củ Chi",
    rating: 4.6,
    ratingCount: 17,
    badge: "",
    desc: "Đất vườn, đất thổ cư Củ Chi – Hóc Môn.",
    area: "Củ Chi, Hóc Môn (TP Hồ Chí Minh)",
    provinces: ["TP Hồ Chí Minh"],
    agentType: "buy",
    estateType: "dat",
    avgPricePerM2: 12,
  },
  {
    id: "vp_quan1",
    bannerUrl: "/Img/agents/banner-1.jpg",
    avatarUrl: "/Img/agents/avatar-1.jpg",
    name: "Anh Khoa – Văn phòng Quận 1",
    rating: 4.9,
    ratingCount: 9,
    badge: "VĂN PHÒNG CBD",
    desc: "Cho thuê văn phòng, shophouse trung tâm Quận 1.",
    area: "Quận 1 (TP Hồ Chí Minh)",
    provinces: ["TP Hồ Chí Minh"],
    agentType: "rent",
    estateType: "vpmb",
    avgPricePerM2: 120,
  },
  {
    id: "hn_canho_caugiay",
    bannerUrl: "/Img/agents/banner-2.jpg",
    avatarUrl: "/Img/agents/avatar-2.jpg",
    name: "Hà Nội – căn hộ Cầu Giấy",
    rating: 4.7,
    ratingCount: 15,
    badge: "",
    desc: "Căn hộ tầm trung khu Cầu Giấy, Nam Từ Liêm.",
    area: "Quận Cầu Giấy, Nam Từ Liêm (Hà Nội)",
    provinces: ["Hà Nội"],
    agentType: "buy",
    estateType: "canho",
    avgPricePerM2: 45,
  },
  {
    id: "hn_nhao_dongda",
    bannerUrl: "/Img/agents/banner-1.jpg",
    avatarUrl: "/Img/agents/avatar-1.jpg",
    name: "Nhà phố Đống Đa",
    rating: 4.5,
    ratingCount: 12,
    badge: "",
    desc: "Nhà ngõ rộng, gần trung tâm Đống Đa.",
    area: "Quận Đống Đa (Hà Nội)",
    provinces: ["Hà Nội"],
    agentType: "buy",
    estateType: "nhao",
    avgPricePerM2: 70,
  },
  {
    id: "danang_canho_bien",
    bannerUrl: "/Img/agents/banner-2.jpg",
    avatarUrl: "/Img/agents/avatar-2.jpg",
    name: "Căn hộ biển Đà Nẵng",
    rating: 4.9,
    ratingCount: 19,
    badge: "VIEW BIỂN",
    desc: "Căn hộ nghỉ dưỡng ven biển Mỹ Khê.",
    area: "Quận Sơn Trà (Đà Nẵng)",
    provinces: ["Đà Nẵng"],
    agentType: "buy",
    estateType: "canho",
    avgPricePerM2: 60,
  },
  {
    id: "bd_dat_thuanan",
    bannerUrl: "/Img/agents/banner-1.jpg",
    avatarUrl: "/Img/agents/avatar-1.jpg",
    name: "Đất nền Thuận An",
    rating: 4.3,
    ratingCount: 8,
    badge: "",
    desc: "Đất nền Bình Dương – Thuận An, Dĩ An.",
    area: "Thuận An, Dĩ An (Bình Dương)",
    provinces: ["Bình Dương"],
    agentType: "buy",
    estateType: "dat",
    avgPricePerM2: 18,
  },
  {
    id: "hn_vp_hoankiem",
    bannerUrl: "/Img/agents/banner-2.jpg",
    avatarUrl: "/Img/agents/avatar-2.jpg",
    name: "Văn phòng Hoàn Kiếm",
    rating: 4.8,
    ratingCount: 14,
    badge: "",
    desc: "Cho thuê văn phòng Hoàn Kiếm – Hai Bà Trưng.",
    area: "Quận Hoàn Kiếm (Hà Nội)",
    provinces: ["Hà Nội"],
    agentType: "rent",
    estateType: "vpmb",
    avgPricePerM2: 90,
  },
  {
    id: "ct_cantho_ninhkieu",
    bannerUrl: "/Img/agents/banner-1.jpg",
    avatarUrl: "/Img/agents/avatar-1.jpg",
    name: "Nhà đất Ninh Kiều",
    rating: 4.2,
    ratingCount: 10,
    badge: "",
    desc: "Nhà phố, đất nền trung tâm Cần Thơ.",
    area: "Quận Ninh Kiều (Cần Thơ)",
    provinces: ["Cần Thơ"],
    agentType: "buy",
    estateType: "nhao",
    avgPricePerM2: 25,
  },
];

const PAGE_SIZE = 10;

/** ================== CARD COMPONENT ================== */
function AgentCard({ agent, onClickDetail, onClickPosts }) {
  return (
    <div className="agcard">
      <div className="agcard-banner">
        <img src={agent.bannerUrl} alt={agent.name} />
      </div>

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
          Xem tin đăng
          <ChevronRight size={15} />
        </button>
      </div>

      <button
        type="button"
        className="agcard-overlay-link"
        onClick={() => onClickDetail(agent)}
        aria-label={"Xem trang môi giới " + agent.name}
      />
    </div>
  );
}

/** ================== PAGE COMPONENT ================== */
export default function AgentsPage() {
  const navigate = useNavigate();

  // ====== STATE FILTER ======
  const [filters, setFilters] = useState({
    province: "Tất cả",
    agentType: "all", // all | buy | rent
    estateType: "all",
    priceRange: "all",
  });

  const [currentPage, setCurrentPage] = useState(1);

  const handleProvinceChange = (province) => {
    setFilters((prev) => ({ ...prev, province }));
    setCurrentPage(1);
  };

  const handleAgentTypeChange = (type) => {
    setFilters((prev) => ({ ...prev, agentType: type }));
    setCurrentPage(1);
  };

  const handleEstateTypeChange = (estateType) => {
    setFilters((prev) => ({ ...prev, estateType }));
    setCurrentPage(1);
  };

  const handlePriceRangeChange = (priceRange) => {
    setFilters((prev) => ({ ...prev, priceRange }));
    setCurrentPage(1);
  };

  // ====== LỌC AGENT THEO FILTER ======
  const filteredAgents = useMemo(() => {
    return AGENTS.filter((agent) => {
      // 1. Lọc theo tỉnh
      if (filters.province && filters.province !== "Tất cả") {
        const list = agent.provinces || [];
        const lower = list.map((p) => p.toLowerCase());
        if (!lower.includes(filters.province.toLowerCase())) return false;
      }

      // 2. Lọc theo loại môi giới
      if (filters.agentType !== "all") {
        if (agent.agentType !== filters.agentType) return false;
      }

      // 3. Lọc theo loại BĐS
      if (filters.estateType !== "all") {
        if (agent.estateType !== filters.estateType) return false;
      }

      // 4. Lọc theo khoảng giá (triệu/m2)
      if (filters.priceRange !== "all") {
        const band = PRICE_OPTIONS.find(
          (o) => o.value === filters.priceRange
        );
        if (band) {
          const price = agent.avgPricePerM2 || 0;
          if (price < band.min || price >= band.max) return false;
        }
      }

      return true;
    });
  }, [
    filters.province,
    filters.agentType,
    filters.estateType,
    filters.priceRange,
  ]);

  // ====== PHÂN TRANG ======
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAgents.length / PAGE_SIZE)
  );
  const safePage = Math.min(currentPage, totalPages);

  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pageAgents = filteredAgents.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
  };

  const handleGoDetail = (agent) => {
    navigate(`/moi-gioi/${agent.id}`);
  };

  const handleGoPosts = (agent) => {
    navigate(`/moi-gioi/${agent.id}/tin-dang`);
  };

  return (
    <div className="nhatot">
      <div className="mk-page">
        <Header />

        <div className="agents-page-content">
          <div className="agents-wrapper">
            <div className="agents-main">
              {/* FILTER BAR */}
              <AgentsFilterBar
                province={filters.province}
                agentType={filters.agentType}
                estateType={filters.estateType}
                priceRange={filters.priceRange}
                onChangeProvince={handleProvinceChange}
                onOpenFilter={() => {}}
                onChangeAgentType={handleAgentTypeChange}
                onChangeEstateType={handleEstateTypeChange}
                onChangePriceRange={handlePriceRangeChange}
              />

              {/* LIST AGENT ĐÃ LỌC */}
              <div className="agents-list">
                {pageAgents.map((a) => (
                  <AgentCard
                    key={a.id}
                    agent={a}
                    onClickDetail={handleGoDetail}
                    onClickPosts={handleGoPosts}
                  />
                ))}
                {pageAgents.length === 0 && (
                  <p style={{ padding: "12px 0" }}>
                    Không tìm thấy môi giới phù hợp điều kiện lọc.
                  </p>
                )}
              </div>

              {/* PHÂN TRANG */}
              {totalPages > 1 && (
                <div className="agents-pagination">
                  <button
                    type="button"
                    className="ag-page-btn"
                    onClick={() => goToPage(safePage - 1)}
                    disabled={safePage === 1}
                  >
                    &lt;
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        type="button"
                        className={
                          "ag-page-btn" +
                          (page === safePage ? " ag-page-btn--active" : "")
                        }
                        onClick={() => goToPage(page)}
                      >
                        {page}
                      </button>
                    )
                  )}

                  <button
                    type="button"
                    className="ag-page-btn"
                    onClick={() => goToPage(safePage + 1)}
                    disabled={safePage === totalPages}
                  >
                    &gt;
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
