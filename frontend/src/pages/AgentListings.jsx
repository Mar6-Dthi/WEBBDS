// src/pages/AgentListings.jsx
import React, { useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import Post from "../components/Post";
import { filterMockListings } from "../services/mockListingService";
import "../styles/AgentListings.css";

// Map id môi giới -> thông tin hiển thị + list ownerName trong MOCK_LISTINGS
// LƯU Ý: mỗi ownerName bên dưới đều tồn tại trong MOCK_LISTINGS
const AGENT_CONFIG = {
  ng_hang_nha_tho_cu: {
    displayName: "NG.HANG NHÀ THỔ CƯ",
    badge: "CHỨNG CHỈ MÔI GIỚI",
    area: "Quận 7, Quận 10, Quận Tân Bình (TP Hồ Chí Minh)",
    rating: 5.0,
    ratingCount: 11,
    // nhà phố TP.HCM
    owners: ["Nguyễn Long", "Chị Hằng"],
  },

  hau_binh_thanh: {
    displayName: "Hậu chuyên nhà Bình Thạnh",
    badge: "",
    area: "Quận Bình Thạnh, Quận Gò Vấp, Quận Phú Nhuận (TP Hồ Chí Minh)",
    rating: 5.0,
    ratingCount: 1,
    // căn hộ + nhà cho thuê HCM
    owners: ["Loan Nguyễn", "Anh Hoài"],
  },

  canho_quan2: {
    displayName: "Lan – Căn hộ Quận 2",
    badge: "CHUYÊN CĂN HỘ",
    area: "TP Thủ Đức (TP Hồ Chí Minh)",
    rating: 4.8,
    ratingCount: 23,
    // căn hộ HCM
    owners: ["Anh Huy", "Chị B"],
  },

  dat_cu_chi: {
    displayName: "Tuấn đất nền Củ Chi",
    badge: "",
    area: "Củ Chi, Hóc Môn (TP Hồ Chí Minh)",
    rating: 4.6,
    ratingCount: 17,
    // đất Hóc Môn + Đồng Nai
    owners: ["Anh Trí", "Anh Phát"],
  },

  vp_quan1: {
    displayName: "Anh Khoa – Văn phòng Quận 1",
    badge: "VĂN PHÒNG CBD",
    area: "Quận 1 (TP Hồ Chí Minh)",
    rating: 4.9,
    ratingCount: 9,
    // shophouse, văn phòng, kho xưởng
    owners: ["Cường Real", "Anh Dũng", "Kho Logistics Nam"],
  },

  hn_canho_caugiay: {
    displayName: "Hà Nội – căn hộ Cầu Giấy",
    badge: "",
    area: "Quận Cầu Giấy, Nam Từ Liêm (Hà Nội)",
    rating: 4.7,
    ratingCount: 15,
    // căn hộ, nhà HN
    owners: ["Hoàng Thanh", "Anh Dũng", "Anh Hùng"],
  },

  hn_nhao_dongda: {
    displayName: "Nhà phố Đống Đa",
    badge: "",
    area: "Quận Đống Đa (Hà Nội)",
    rating: 4.5,
    ratingCount: 12,
    // nhà + cho thuê nhà ở Hà Nội
    owners: ["Mr. Bình", "Anh Dũng"],
  },

  danang_canho_bien: {
    displayName: "Căn hộ biển Đà Nẵng",
    badge: "VIEW BIỂN",
    area: "Quận Sơn Trà (Đà Nẵng)",
    rating: 4.9,
    ratingCount: 19,
    // nhà + căn hộ + studio Đà Nẵng
    owners: ["Ngọc Linh", "Quốc Thái", "Lan Anh"],
  },

  bd_dat_thuanan: {
    displayName: "Đất nền Thuận An",
    badge: "",
    area: "Thuận An, Dĩ An (Bình Dương)",
    rating: 4.3,
    ratingCount: 8,
    // nhà + đất + kho Bình Dương
    owners: ["Nhật Minh", "Anh Phát", "Cty Kho Miền Nam"],
  },

  hn_vp_hoankiem: {
    displayName: "Văn phòng Hoàn Kiếm",
    badge: "",
    area: "Quận Hoàn Kiếm (Hà Nội)",
    rating: 4.8,
    ratingCount: 14,
    // văn phòng Hải Phòng + HN
    owners: ["Anh An"],
  },

  ct_cantho_ninhkieu: {
    displayName: "Nhà đất Ninh Kiều",
    badge: "",
    area: "Quận Ninh Kiều (Cần Thơ)",
    rating: 4.2,
    ratingCount: 10,
    // nhà + phòng trọ Cần Thơ
    owners: ["Chị Mai", "Chú Tư"],
  },
};

// map option UI -> category trong MOCK_LISTINGS
const CATEGORY_OPTIONS = [
  { value: "all", label: "Tất cả loại BĐS" },
  { value: "Căn hộ/Chung cư", label: "Căn hộ/Chung cư" },
  { value: "Nhà ở", label: "Nhà ở" },
  { value: "Đất", label: "Đất" },
  { value: "Văn phòng", label: "Văn phòng" },
  { value: "Phòng trọ", label: "Phòng trọ" },
  { value: "Nhà xưởng/Kho bãi", label: "Nhà xưởng/Kho bãi" },
];

export default function AgentListings() {
  const params = useParams();
  // hỗ trợ cả /moi-gioi/:id/tin-dang và /moi-gioi/:agentId/tin-dang
  const agentId = params.id || params.agentId;
  const navigate = useNavigate();

  const config = AGENT_CONFIG[agentId];

  // state filter (luôn luôn khai báo, không conditional)
  const [dealType, setDealType] = useState("all"); // all | mua-ban | cho-thue
  const [category, setCategory] = useState("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  // lấy danh sách tin từ mockListingService
  const posts = useMemo(() => {
    if (!config) return [];

    let all = [];
    for (const ownerName of config.owners) {
      const list = filterMockListings({
        ownerName,
        dealType: dealType === "all" ? undefined : dealType,
        category: category === "all" ? undefined : category,
        minPrice: minPrice ? Number(minPrice) || undefined : undefined,
        maxPrice: maxPrice ? Number(maxPrice) || undefined : undefined,
      });
      all = all.concat(list);
    }

    // ưu tiên tin có giá trị cao hơn
    return all.sort((a, b) => (b.priceValue || 0) - (a.priceValue || 0));
  }, [config, dealType, category, minPrice, maxPrice]);

  return (
    <div className="nhatot">
      <div className="mk-page">
        <Header />

        <main className="ap-main">
          <div className="ap-inner">
            <button
              type="button"
              className="ap-back-btn"
              onClick={() => navigate("/moi-gioi")}
            >
              ← Quay lại danh sách môi giới
            </button>

            <h1 className="ap-title">Môi giới bất động sản</h1>

            {/* Nếu chưa cấu hình mock cho id này */}
            {!config ? (
              <p>Môi giới này chưa được cấu hình mock tin đăng.</p>
            ) : (
              <>
                {/* card info môi giới */}
                <section className="ap-agent-card">
                  <div className="ap-agent-avatar">
                    {config.displayName
                      .split(" ")
                      .map((w) => w[0])
                      .join("")
                      .slice(0, 2)}
                  </div>
                  <div className="ap-agent-info">
                    <div className="ap-agent-name-row">
                      <h2 className="ap-agent-name">
                        {config.displayName}
                      </h2>
                      {config.badge && (
                        <span className="ap-agent-badge">
                          {config.badge}
                        </span>
                      )}
                    </div>
                    <div className="ap-agent-meta">
                      <span className="ap-rating">
                        ⭐ {config.rating.toFixed(1)}{" "}
                        <span className="ap-rating-count">
                          ({config.ratingCount})
                        </span>
                      </span>
                      <span className="ap-dot">•</span>
                      <span className="ap-area">{config.area}</span>
                    </div>
                  </div>
                </section>

                {/* bộ lọc nhỏ */}
                <section className="ap-filter">
                  <h3 className="ap-filter-title">Môi giới bất động sản</h3>

                  <div className="ap-filter-grid">
                    <div className="ap-field">
                      <label className="ap-label">Loại giao dịch</label>
                      <select
                        className="ap-select"
                        value={dealType}
                        onChange={(e) => setDealType(e.target.value)}
                      >
                        <option value="all">Tất cả</option>
                        <option value="mua-ban">Mua bán</option>
                        <option value="cho-thue">Cho thuê</option>
                      </select>
                    </div>

                    <div className="ap-field">
                      <label className="ap-label">Loại BĐS</label>
                      <select
                        className="ap-select"
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                      >
                        {CATEGORY_OPTIONS.map((opt) => (
                          <option key={opt.value} value={opt.value}>
                            {opt.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="ap-field ap-field-range">
                      <label className="ap-label">Khoảng giá (VND)</label>
                      <div className="ap-range-row">
                        <input
                          type="number"
                          className="ap-input"
                          placeholder="Từ"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                        />
                        <span className="ap-range-sep">–</span>
                        <input
                          type="number"
                          className="ap-input"
                          placeholder="Đến"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(e.target.value)}
                        />
                      </div>
                      <p className="ap-hint">
                        Nhập giá trị VND, ví dụ: 3000000000 = 3 tỷ
                      </p>
                    </div>
                  </div>
                </section>

                {/* danh sách tin */}
                <section className="ap-posts">
                  <div className="ap-posts-head">
                    <h3>Tin đăng của môi giới ({posts.length})</h3>
                    <span className="ap-posts-sub">
                      Ưu tiên hiển thị các tin giá trị cao hơn trước (mock).
                    </span>
                  </div>

                  {posts.length === 0 ? (
                    <p className="ap-empty">
                      Môi giới này chưa có tin đăng phù hợp với bộ lọc.
                    </p>
                  ) : (
                    <div className="mk-feed-grid ap-posts-grid">
                      {posts.map((item) => (
                        <Post
                          key={item.id}
                          item={item}
                          to={`/post/${item.id}`}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </main>

        <Footer />
      </div>
    </div>
  );
}
