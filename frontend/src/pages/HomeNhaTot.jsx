// src/pages/HomeNhaTot.jsx
import React, { useRef, useState, useEffect } from "react";
import {
  Search,
  BarChart3,
  HandCoins,
  BookOpen,
  Crown,
  BriefcaseBusiness,
  UsersRound,
  ChevronRight,
} from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/HomeNhaTot.css";
import LocationSelect from "../components/LocationSelect";
import TypeSelect from "../components/TypeSelect";
import Post from "../components/Post";
import Footer from "../components/footer";
import NhatotHeader from "../components/header";

/** ===== Demo data ===== */
// dùng membershipPlanId để ưu tiên, isBroker chỉ để sort & hiển thị badge trong Post
const POSTS = [
  {
    id: "p1",
    title: "🎉 Lên sóng siêu phẩm 6.8 tỷ - Bà Điểm Bắc Lân",
    coverUrl: "/Img/demo/house-1.jpg",
    timeAgo: "30 giây trước",
    photos: 8,
    price: 6_800_000_000,
    pricePerM2: 80_000_000,
    area: 85,
    beds: 5,
    typeLabel: "Nhà phố",
    location: "Tp Hồ Chí Minh",
    liked: false,
    ownerName: "Loan",
    membershipPlanId: "p20", // gói cao nhất
    isBroker: true,
    createdAt: "2025-11-30T10:30:00Z",
  },
  {
    id: "p2",
    title: "CG. Nhà 3 tầng 2 mặt tiền ô tô 7 chỗ vào",
    coverUrl: "/Img/demo/house-2.jpg",
    timeAgo: "38 giây trước",
    photos: 12,
    price: 7_499_000_000,
    pricePerM2: 107_000_000,
    area: 70,
    beds: 3,
    typeLabel: "Nhà ngõ, hẻm",
    location: "Tp Hồ Chí Minh",
    liked: false,
    ownerName: "Loan",
    membershipPlanId: "p10",
    isBroker: true,
    createdAt: "2025-11-30T10:20:00Z",
  },
  {
    id: "p3",
    title: "Chủ bán miếng đất cũ CHI 155m² full thổ - giá tốt",
    coverUrl: "/Img/demo/land-1.jpg",
    timeAgo: "59 giây trước",
    photos: 3,
    price: 710_000_000,
    pricePerM2: 4_600_000,
    area: 155,
    beds: null,
    typeLabel: "Đất thổ cư",
    location: "Tp Hồ Chí Minh",
    liked: false,
    ownerName: "Loan",
    membershipPlanId: "p5",
    isBroker: false,
    createdAt: "2025-11-30T10:10:00Z",
  },
  {
    id: "p4",
    title: "Ngã Tư Hàng Xanh - cạnh HXH - 20m² - hẻm 3m",
    coverUrl: "/Img/demo/house-3.jpg",
    timeAgo: "2 phút trước",
    photos: 6,
    price: 2_000_000_000,
    pricePerM2: 100_000_000,
    area: 20,
    beds: 2,
    typeLabel: "Nhà ngõ, hẻm",
    location: "Tp Hồ Chí Minh",
    liked: false,
    ownerName: "Loan",
    membershipPlanId: null, // không hội viên
    isBroker: true,
    createdAt: "2025-11-30T10:05:00Z",
  },
  {
    id: "p5",
    title: "Siêu phẩm Nguyễn Văn Công, hẻm xe hơi",
    coverUrl: "/Img/demo/house-4.jpg",
    timeAgo: "2 phút trước",
    photos: 4,
    price: 5_490_000_000,
    pricePerM2: 137_000_000,
    area: 40,
    beds: 2,
    typeLabel: "Nhà ngõ, hẻm",
    location: "Tp Hồ Chí Minh",
    liked: false,
    ownerName: "Loan",
    membershipPlanId: null,
    isBroker: false,
    createdAt: "2025-11-30T09:50:00Z",
  },
];

const POSTS2 = [
  {
    id: "r1",
    title: "Căn hộ dịch vụ full nội thất Q.1 – ban công thoáng",
    coverUrl: "/Img/demo/rent-1.jpg",
    timeAgo: "1 phút trước",
    photos: 10,
    price: 12_000_000,
    pricePerM2: 300_000,
    area: 40,
    beds: 1,
    typeLabel: "Căn hộ dịch vụ",
    location: "Q.1, TP.HCM",
    ownerName: "Chị B",
    membershipPlanId: "p20",
    isBroker: true,
    createdAt: "2025-11-30T10:25:00Z",
  },
  {
    id: "r2",
    title: "Phòng trọ mới 100% gần ĐH CNTT – có máy lạnh",
    coverUrl: "/Img/demo/rent-2.jpg",
    timeAgo: "3 phút trước",
    photos: 6,
    price: 3_500_000,
    pricePerM2: 180_000,
    area: 18,
    beds: 1,
    typeLabel: "Phòng trọ",
    location: "TP Thủ Đức",
    ownerName: "Chị Thi",
    membershipPlanId: "p10",
    isBroker: false,
    createdAt: "2025-11-30T10:15:00Z",
  },
  {
    id: "r3",
    title: "Nhà nguyên căn 1 trệt 1 lầu – hẻm xe hơi",
    coverUrl: "/Img/demo/rent-3.jpg",
    timeAgo: "5 phút trước",
    photos: 9,
    price: 15_000_000,
    pricePerM2: 220_000,
    area: 68,
    beds: 2,
    typeLabel: "Nhà nguyên căn",
    location: "Gò Vấp, TP.HCM",
    ownerName: "Anh Hoài",
    membershipPlanId: "p5",
    isBroker: true,
    createdAt: "2025-11-30T10:00:00Z",
  },
  {
    id: "r4",
    title: "Căn hộ 2PN Masteri – view sông, nội thất cao cấp",
    coverUrl: "/Img/demo/rent-4.jpg",
    timeAgo: "7 phút trước",
    photos: 12,
    price: 22_000_000,
    pricePerM2: 400_000,
    area: 55,
    beds: 2,
    typeLabel: "Chung cư",
    location: "TP Thủ Đức",
    ownerName: "Anh Hải",
    membershipPlanId: null,
    isBroker: true,
    createdAt: "2025-11-30T09:55:00Z",
  },
  {
    id: "r5",
    title: "Văn phòng 50m² – setup sẵn, vào làm ngay",
    coverUrl: "/Img/demo/rent-5.jpg",
    timeAgo: "9 phút trước",
    photos: 4,
    price: 18_000_000,
    pricePerM2: 360_000,
    area: 50,
    beds: null,
    typeLabel: "Văn phòng",
    location: "Quận 3, TP.HCM",
    ownerName: "Anh Dũng",
    membershipPlanId: null,
    isBroker: false,
    createdAt: "2025-11-30T09:45:00Z",
  },
];

/** ===== Helper xếp hạng hội viên ===== */
function getMembershipRank(planId) {
  switch (planId) {
    case "p20":
      return 3; // gói cao nhất
    case "p10":
      return 2;
    case "p5":
      return 1;
    default:
      return 0; // không hội viên
  }
}

export default function HomeNhaTot() {
  const [tab, setTab] = useState("Mua bán");
  const [location, setLocation] = useState("Tỉnh thành");
  const [estateType, setEstateType] = useState("");
  const [keyword, setKeyword] = useState("");

  const navigate = useNavigate();

  // ===== helper: nhảy nhanh sang trang listing =====
  const goToListingQuick = (dealType, category) => {
    const params = new URLSearchParams();

    if (dealType) params.set("dealType", dealType);

    if (location && location !== "Tỉnh thành") {
      params.set("province", location);
    }

    if (category) params.set("category", category);

    navigate(`/listing?${params.toString()}`);
  };

  // ===== SEARCH SUBMIT =====
  const handleSearchSubmit = (e) => {
    e.preventDefault();

    let dealType = "";
    if (tab === "Mua bán") dealType = "mua-ban";
    if (tab === "Cho thuê") dealType = "cho-thue";
    if (tab === "Dự án") dealType = "du-an";

    const params = new URLSearchParams();
    if (dealType) params.set("dealType", dealType);

    if (location && location !== "Tỉnh thành") {
      params.set("province", location);
    }
    if (estateType) {
      params.set("category", estateType);
    }
    if (keyword.trim()) params.set("q", keyword.trim());

    navigate(`/listing?${params.toString()}`);
  };

  // ===== dropdown state =====
  const [saleMenuOpen, setSaleMenuOpen] = useState(false);
  const [rentMenuOpen, setRentMenuOpen] = useState(false);
  const saleWrapRef = useRef(null);
  const rentWrapRef = useRef(null);

  const saleImgRef = useRef(null);
  const rentImgRef = useRef(null);
  const [saleHeaderImg, setSaleHeaderImg] = useState("");
  const [rentHeaderImg, setRentHeaderImg] = useState("");

  const handleBlurSale = (e) => {
    const next = e.relatedTarget;
    if (saleWrapRef.current && next && saleWrapRef.current.contains(next))
      return;
    setSaleMenuOpen(false);
  };

  const handleBlurRent = (e) => {
    const next = e.relatedTarget;
    if (rentWrapRef.current && next && rentWrapRef.current.contains(next))
      return;
    setRentMenuOpen(false);
  };

  // đo hero
  const heroRef = useRef(null);
  useEffect(() => {
    const setTop = () => {
      const h = heroRef.current?.offsetHeight || 300;
      document.documentElement.style.setProperty("--hero-bottom", `${h}px`);
    };
    setTop();
    window.addEventListener("resize", setTop);
    return () => window.removeEventListener("resize", setTop);
  }, []);

  const [aboutOpen, setAboutOpen] = useState(false);

  /** ===== SORT FEED: Ưu tiên hội viên > môi giới > bài mới ===== */
  const sortedPosts = [...POSTS].sort((a, b) => {
    const rankA = getMembershipRank(a.membershipPlanId);
    const rankB = getMembershipRank(b.membershipPlanId);

    // 1. ưu tiên hội viên & gói cao hơn
    if (rankA !== rankB) return rankB - rankA;

    // 2. ưu tiên môi giới
    const brokerA = a.isBroker ? 1 : 0;
    const brokerB = b.isBroker ? 1 : 0;
    if (brokerA !== brokerB) return brokerB - brokerA;

    // 3. ưu tiên bài mới
    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  const sortedPosts2 = [...POSTS2].sort((a, b) => {
    const rankA = getMembershipRank(a.membershipPlanId);
    const rankB = getMembershipRank(b.membershipPlanId);

    if (rankA !== rankB) return rankB - rankA;

    const brokerA = a.isBroker ? 1 : 0;
    const brokerB = b.isBroker ? 1 : 0;
    if (brokerA !== brokerB) return brokerB - brokerA;

    return new Date(b.createdAt || 0) - new Date(a.createdAt || 0);
  });

  return (
    <div className="mk-page nhatot">
      <div
        className="mk-fixed-bg"
        aria-hidden="true"
        style={{ backgroundImage: "url(/Img/allbackground1.jpg)" }}
      />

      <NhatotHeader />

      {/* ===== HERO ===== */}
      <section
        ref={heroRef}
        className="mk-hero"
        style={{
          backgroundImage:
            "linear-gradient(90deg,#ff7a00,#ffa43a 60%,#ffbb66), url(/Img/allbackground2.jpg)",
        }}
      >
        <img className="mk-bg-decor" src="/Img/Background1.png" alt="" />
        <div className="mk-container" style={{ paddingBottom: 12 }}>
          <h1 className="mk-hero-title">"Nhà" mới toanh. Khám phá nhanh!</h1>
        </div>

        <div className="mk-hero-tabs" role="tablist" aria-label="Chọn loại">
          {["Cho thuê", "Mua bán", "Dự án"].map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              className={`seg-btn ${tab === t ? "active" : ""}`}
              onClick={() => setTab(t)}
              type="button"
            >
              {t}
            </button>
          ))}
        </div>

        {/* Ô tìm kiếm trong hero */}
        <section className="mk-search-wrap" aria-label="Tìm kiếm">
          <div className="mk-container">
            <form className="mk-search-grid" onSubmit={handleSearchSubmit}>
              <div className="mk-input">
                <Search size={18} aria-hidden />
                <input
                  placeholder="Tìm bất động sản…"
                  aria-label="Từ khóa bất động sản"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>

              <div className="mk-select-wrap">
                <LocationSelect value={location} onChange={setLocation} />
              </div>

              <TypeSelect value={estateType} onChange={setEstateType} />

              <button className="mk-btn-search" type="submit">
                Tìm nhà
              </button>
            </form>
          </div>
        </section>
      </section>

      {/* ===== CATEGORIES ===== */}
      <section className="mk-cats" aria-label="Danh mục nhanh">
        <div className="mk-container">
          <div className="mk-cats-card" data-onepanel>
            {/* Mua bán */}
            <div className="mk-cat has-menu" id="cat-sale">
              <div
                ref={saleWrapRef}
                className={`mk-cat-wrap ${saleMenuOpen ? "open" : ""}`}
                tabIndex={0}
                role="group"
                aria-haspopup="menu"
                aria-expanded={saleMenuOpen}
                aria-controls="sale-menu"
                onMouseEnter={() => {
                  setSaleMenuOpen(true);
                  setSaleHeaderImg(saleImgRef.current?.src || "");
                }}
                onMouseLeave={() => setSaleMenuOpen(false)}
                onFocus={() => {
                  setSaleMenuOpen(true);
                  setSaleHeaderImg(saleImgRef.current?.src || "");
                }}
                onBlur={handleBlurSale}
              >
                <div className="mk-cat-trigger">
                  <div className="mk-cat-img" aria-hidden="true">
                    <img ref={saleImgRef} src="/Img/Muaban.png" alt="" />
                  </div>
                  <div>
                    <NavLink
                      to="/listing"
                      onClick={(e) => {
                        e.preventDefault();
                        goToListingQuick("mua-ban");
                      }}
                      className="mk-cat-name mk-cat-title-link"
                    >
                      Mua bán
                    </NavLink>
                    <div className="muted">86.811 tin mua bán</div>
                  </div>
                </div>

                <div
                  id="sale-menu"
                  className="mk-cat-menu"
                  role="menu"
                  aria-label="Danh mục Mua bán"
                >
                  <div className="mk-menu-head" aria-hidden="true">
                    <img src={saleHeaderImg} alt="" />
                    <div className="mk-menu-head-text">
                      <h4>Mua bán</h4>
                      <p>86.811 tin mua bán</p>
                    </div>
                  </div>

                  <NavLink
                    to="/listing"
                    className="mk-cat-opt"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      goToListingQuick("mua-ban", "Căn hộ/Chung cư");
                    }}
                  >
                    Căn hộ / Chung cư
                  </NavLink>
                  <NavLink
                    to="/listing"
                    className="mk-cat-opt"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      goToListingQuick("mua-ban", "Nhà ở");
                    }}
                  >
                    Nhà ở
                  </NavLink>
                  <NavLink
                    to="/listing"
                    className="mk-cat-opt"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      goToListingQuick("mua-ban", "Văn phòng");
                    }}
                  >
                    Văn phòng, Mặt bằng kinh doanh
                  </NavLink>
                  <NavLink
                    to="/listing"
                    className="mk-cat-opt"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      goToListingQuick("mua-ban", "Đất");
                    }}
                  >
                    Đất
                  </NavLink>
                </div>
              </div>
            </div>

            {/* Cho thuê */}
            <div className="mk-cat has-menu" id="cat-rent">
              <div
                ref={rentWrapRef}
                className={`mk-cat-wrap ${rentMenuOpen ? "open" : ""}`}
                tabIndex={0}
                role="group"
                aria-haspopup="menu"
                aria-expanded={rentMenuOpen}
                aria-controls="rent-menu"
                onMouseEnter={() => {
                  setRentMenuOpen(true);
                  setRentHeaderImg(rentImgRef.current?.src || "");
                }}
                onMouseLeave={() => setRentMenuOpen(false)}
                onFocus={() => {
                  setRentMenuOpen(true);
                  setRentHeaderImg(rentImgRef.current?.src || "");
                }}
                onBlur={handleBlurRent}
              >
                <div className="mk-cat-trigger">
                  <div className="mk-cat-img" aria-hidden="true">
                    <img ref={rentImgRef} src="/Img/Chothue.png" alt="" />
                  </div>
                  <div>
                    <NavLink
                      to="/listing"
                      className="mk-cat-name mk-cat-title-link"
                      onClick={(e) => {
                        e.preventDefault();
                        goToListingQuick("cho-thue");
                      }}
                    >
                      Cho thuê
                    </NavLink>
                    <div className="muted">73.524 tin cho thuê</div>
                  </div>
                </div>

                <div
                  id="rent-menu"
                  className="mk-cat-menu"
                  role="menu"
                  aria-label="Danh mục Cho thuê"
                >
                  <div className="mk-menu-head" aria-hidden="true">
                    <img src={rentHeaderImg} alt="" />
                    <div className="mk-menu-head-text">
                      <h4>Cho thuê</h4>
                      <p>73.524 tin cho thuê</p>
                    </div>
                  </div>

                  <NavLink
                    to="/listing"
                    className="mk-cat-opt"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      goToListingQuick("cho-thue", "Căn hộ/Chung cư");
                    }}
                  >
                    Căn hộ dịch vụ
                  </NavLink>
                  <NavLink
                    to="/listing"
                    className="mk-cat-opt"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      goToListingQuick("cho-thue", "Căn hộ/Chung cư");
                    }}
                  >
                    Chung cư
                  </NavLink>
                  <NavLink
                    to="/listing"
                    className="mk-cat-opt"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      goToListingQuick("cho-thue", "Nhà ở");
                    }}
                  >
                    Nhà nguyên căn
                  </NavLink>
                  <NavLink
                    to="/listing"
                    className="mk-cat-opt"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      goToListingQuick("cho-thue", "Phòng trọ");
                    }}
                  >
                    Phòng trọ
                  </NavLink>
                  <NavLink
                    to="/listing"
                    className="mk-cat-opt"
                    role="menuitem"
                    onClick={(e) => {
                      e.preventDefault();
                      goToListingQuick("cho-thue", "Văn phòng");
                    }}
                  >
                    Văn phòng / Mặt bằng
                  </NavLink>
                </div>
              </div>
            </div>

            {/* Dự án */}
            <NavLink
              className="mk-cat"
              to="/du-an"
              aria-label="Đi đến mục Dự án"
            >
              <div className="mk-cat-img" aria-hidden="true">
                <img src="/Img/Duan.png" alt="" />
              </div>
              <div>
                <div className="mk-cat-name">Dự án</div>
                <div className="muted">5.197 dự án</div>
              </div>
            </NavLink>

            {/* Môi giới */}
            <NavLink
              className="mk-cat"
              to="/moi-gioi"
              aria-label="Đi đến mục Môi giới"
            >
              <div className="mk-cat-img" aria-hidden="true">
                <img src="/Img/Moigioi.png" alt="" />
              </div>
              <div>
                <div className="mk-cat-name">Môi giới</div>
                <div className="muted">183 chuyên trang</div>
              </div>
            </NavLink>
          </div>
        </div>
      </section>

      {/* ===== FEED: Tin mua bán mới đăng ===== */}
      <section className="mk-feed" aria-label="Tin mua bán mới đăng">
        <div className="mk-container">
          <div className="mk-feed-box">
            <div className="mk-feed-head">
              <h3>Tin mua bán mới đăng</h3>
            </div>

            <div className="mk-feed-grid">
              {sortedPosts.map((it) => {
                const link = `/post/${it.id}`;
                return <Post key={it.id} item={it} to={link} />;
              })}
            </div>

            <div className="mk-feed-cta">
              <button className="mk-cta-more" type="button">
                Xem thêm tin mua bán
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== FEED 2: Tin cho thuê mới đăng ===== */}
      <section className="mk-feed" aria-label="Tin cho thuê mới đăng">
        <div className="mk-container">
          <div className="mk-feed-box">
            <div className="mk-feed-head">
              <h3>Tin cho thuê mới đăng</h3>
            </div>

            <div className="mk-feed-grid">
              {sortedPosts2.map((it) => {
                const link = `/post/${it.id}`;
                return <Post key={it.id} item={it} to={link} />;
              })}
            </div>

            <div className="mk-feed-cta">
              <button className="mk-cta-more" type="button">
                Xem thêm tin cho thuê
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== ABOUT / SEO TEXT ===== */}
      <section
        id="about-nhatot"
        className="mk-about"
        aria-label="Giới thiệu Nhà Tốt"
      >
        <div className="mk-container">
          <article className="mk-about-box">
            <h2 className="mk-about-title">
              Mua Bán Và Cho Thuê Bất Động Sản Nhanh Chóng Trên Nhà Tốt
              (nhatot.com)
            </h2>
            <p className="mk-about-sub">
              (Nhà Tốt: Nền Tảng Công nghệ Bất động sản được phát triển bởi Chợ
              Tốt)
            </p>

            <div
              className={`mk-about-content ${
                aboutOpen ? "open" : "collapsed"
              }`}
            >
              <p>…</p>
            </div>

            <button
              type="button"
              className="mk-cta-more"
              onClick={() => setAboutOpen((v) => !v)}
              aria-expanded={aboutOpen}
              aria-controls="about-nhatot"
            >
              {aboutOpen ? "Thu gọn" : "Xem thêm"}
            </button>
          </article>
        </div>
      </section>

      {/* ===== APP PROMO ===== */}
      <section className="mk-app-hero" aria-label="Tải ứng dụng Nhà Tốt">
        <div className="mk-container mk-app-hero__grid">
          <div className="mk-app-hero__text">
            <h2>Mua thì hời, bán thì lời</h2>
            <p>Tải app ngay!</p>
            <div className="mk-app-hero__badges">
              <a className="store-badge" href="#" aria-label="App Store">
                <img src="/Img/appstore.webp" alt="Download on the App Store" />
              </a>
              <a className="store-badge" href="#" aria-label="Google Play">
                <img src="/Img/googleplay.webp" alt="Get it on Google Play" />
              </a>
            </div>
          </div>
          <div className="mk-app-hero__art" aria-hidden>
            <img className="art-hero" src="/Img/Background3.png" alt="" />
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
