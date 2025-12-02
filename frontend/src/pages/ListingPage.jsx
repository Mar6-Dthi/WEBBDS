// src/pages/ListingPage.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import {
  Filter,
  ChevronDown,
  LayoutGrid,
  List,
  MapPin,
  Heart,
} from "lucide-react";

import "../styles/ListingPage.css";
import NhatotHeader from "../components/header";
import Footer from "../components/footer";
import {
  filterMockListings,
  getMockListings,
} from "../services/mockListingService";
import {
  getFavoriteIds,
  toggleFavorite,
  toggleFavoriteMock,
} from "../services/mockFavoriteService";
import { addToViewHistory } from "../services/viewHistoryService";

// ===== CÁC LOẠI HÌNH BĐS DÙNG CHO PANEL =====
const CATEGORY_OPTIONS = [
  { value: "", label: "Tất cả bất động sản" },
  { value: "Căn hộ/Chung cư", label: "Căn hộ/Chung cư" },
  { value: "Nhà ở", label: "Nhà ở" },
  { value: "Đất", label: "Đất" },
  { value: "Văn phòng", label: "Văn phòng, Mặt bằng kinh doanh" },
  { value: "Phòng trọ", label: "Phòng trọ" },
  { value: "Nhà xưởng/Kho bãi", label: "Nhà xưởng, Kho bãi" },
];

// giới hạn thanh kéo giá (đơn vị: TỶ)
const PRICE_MIN = 0;
const PRICE_MAX = 30;

// options số phòng ngủ
const BED_OPTIONS = [
  { value: 1, label: "1 PN" },
  { value: 2, label: "2 PN" },
  { value: 3, label: "3 PN" },
  { value: 4, label: "4 PN" },
  { value: 5, label: "5 PN" },
  { value: "gt5", label: "Nhiều hơn 5 PN" },
];

// page size
const PAGE_SIZE_LIST = 5;
const PAGE_SIZE_GRID = 8;

/** ===== Trang Listing ===== */
export default function ListingPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();

  // tim
  const [favoriteIds, setFavoriteIds] = useState(
    () => new Set(getFavoriteIds() || [])
  );

  // PANELS
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [isPriceOpen, setIsPriceOpen] = useState(false);
  const [isAreaOpen, setIsAreaOpen] = useState(false);
  const [isBedsOpen, setIsBedsOpen] = useState(false);
  const [isSortOpen, setIsSortOpen] = useState(false);

  // GIÁ
  const [sliderMin, setSliderMin] = useState(PRICE_MIN);
  const [sliderMax, setSliderMax] = useState(PRICE_MAX);
  const [priceMin, setPriceMin] = useState(null);
  const [priceMax, setPriceMax] = useState(null);

  // DIỆN TÍCH
  const [areaMinInput, setAreaMinInput] = useState("");
  const [areaMaxInput, setAreaMaxInput] = useState("");
  const [areaMin, setAreaMin] = useState(null);
  const [areaMax, setAreaMax] = useState(null);

  // SỐ PHÒNG NGỦ
  const [isBedsOpenState, setIsBedsOpenState] = useState(false);
  const [selectedBeds, setSelectedBeds] = useState([]);
  const [bedsDraft, setBedsDraft] = useState([]);

  // SORT
  const [sortType, setSortType] = useState("newest"); // 'newest' | 'price-asc' | 'price-desc'

  // VIEW: list / grid
  const [viewMode, setViewMode] = useState("list");

  // PAGINATION
  const [currentPage, setCurrentPage] = useState(1);

  // ===== Lấy filter từ URL =====
  const dealType = searchParams.get("dealType") || "";
  const provinceParam = searchParams.get("province") || "";
  const categoryParam = searchParams.get("category") || "";
  const q = (searchParams.get("q") || "").toLowerCase();

  // đổi code -> text cho tiêu đề
  const mapDealTypeLabel = (dt) => {
    if (dt === "mua-ban") return "Mua bán";
    if (dt === "cho-thue") return "Cho thuê";
    if (dt === "du-an") return "Dự án";
    return "Bất động sản";
  };
  const dealTypeLabel = mapDealTypeLabel(dealType);

  // label loại BĐS
  const activeCategoryLabel =
    CATEGORY_OPTIONS.find((c) => c.value === categoryParam)?.label ||
    categoryParam ||
    "Loại BĐS";

  // text H1
  const titleCategoryLabel = categoryParam ? activeCategoryLabel : "Bất động sản";

  // label GIÁ
  const hasPriceFilter = priceMin != null || priceMax != null;
  let priceChipLabel = "Giá";
  if (hasPriceFilter) {
    const from = priceMin != null ? `${priceMin} tỷ` : "0";
    const to = priceMax != null ? `${priceMax} tỷ` : `${PRICE_MAX}+ tỷ`;
    priceChipLabel = `${from} - ${to}`;
  }

  // label DIỆN TÍCH
  const hasAreaFilter = areaMin != null || areaMax != null;
  let areaChipLabel = "Diện tích";
  if (hasAreaFilter) {
    const from = areaMin != null ? `${areaMin} m²` : "0";
    const to = areaMax != null ? `${areaMax} m²` : "∞";
    areaChipLabel = `${from} - ${to}`;
  }

  // label PHÒNG NGỦ
  const hasBedsFilter = selectedBeds.length > 0;
  let bedsChipLabel = "Số phòng ngủ";
  if (hasBedsFilter) bedsChipLabel = `${selectedBeds.length} lựa chọn`;

  const showBedroomsFilter = categoryParam !== "Đất";

  // ===== Lọc + sort + ưu tiên tin đã tim =====
  const filtered = useMemo(() => {
    const hasFilter =
      dealType ||
      provinceParam ||
      categoryParam ||
      q ||
      hasPriceFilter ||
      hasAreaFilter ||
      hasBedsFilter;

    let minPriceVND;
    let maxPriceVND;
    if (priceMin != null) minPriceVND = priceMin * 1_000_000_000;
    if (priceMax != null) maxPriceVND = priceMax * 1_000_000_000;

    const payload = {
      dealType,
      province: provinceParam,
      category: categoryParam,
      q,
    };
    if (minPriceVND != null) payload.minPrice = minPriceVND;
    if (maxPriceVND != null) payload.maxPrice = maxPriceVND;
    if (areaMin != null) payload.minArea = areaMin;
    if (areaMax != null) payload.maxArea = areaMax;
    if (selectedBeds.length > 0) payload.bedsFilter = selectedBeds;

    const baseList = hasFilter
      ? filterMockListings(payload)
      : getMockListings();

    // sort theo giá
    let priceComparator = null;
    if (sortType === "price-asc") {
      priceComparator = (a, b) => (a.priceValue || 0) - (b.priceValue || 0);
    } else if (sortType === "price-desc") {
      priceComparator = (a, b) => (b.priceValue || 0) - (a.priceValue || 0);
    }

    const result = [...baseList].sort((a, b) => {
      const af = favoriteIds.has(a.id);
      const bf = favoriteIds.has(b.id);

      if (af && !bf) return -1;
      if (!af && bf) return 1;

      if (priceComparator) return priceComparator(a, b);
      return 0; // Tin mới nhất: giữ nguyên thứ tự mock
    });

    return result;
  }, [
    dealType,
    provinceParam,
    categoryParam,
    q,
    favoriteIds,
    priceMin,
    priceMax,
    hasPriceFilter,
    areaMin,
    areaMax,
    hasAreaFilter,
    selectedBeds,
    hasBedsFilter,
    sortType,
  ]);

  const total = filtered.length;

  // ===== Pagination phụ thuộc viewMode =====
  const pageSize = viewMode === "grid" ? PAGE_SIZE_GRID : PAGE_SIZE_LIST;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(currentPage, pageCount);
  const startIndex = (safePage - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const paginated = filtered.slice(startIndex, endIndex);

  // Khi filter / sort / viewMode đổi -> về trang 1
  useEffect(() => {
    setCurrentPage(1);
  }, [
    dealType,
    provinceParam,
    categoryParam,
    q,
    hasPriceFilter,
    hasAreaFilter,
    hasBedsFilter,
    sortType,
    viewMode,
  ]);

  const handleChangePage = (page) => {
    if (page < 1 || page > pageCount) return;
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ===== handler tim =====
  const handleToggleFavorite = (e, item) => {
    e.stopPropagation();
    e.preventDefault();

    const { ids, added } = toggleFavorite(item.id);
    setFavoriteIds(new Set(ids));

    if (added) {
      toggleFavoriteMock({
        postId: item.id,
        postTitle: item.title,
        ownerName: item.ownerName,
        postPrice: item.price,
        postLocation: item.address,
        postThumbnail: item.coverUrl,
      });
    }
  };

  // click card
  const handleCardClick = (item) => {
    try {
      localStorage.setItem("posts", JSON.stringify(filtered));
      addToViewHistory(item);
    } catch {
      // ignore
    }
    navigate(`/post/${item.id}`, { state: { item } });
  };

  // ===== PANEL LOẠI HÌNH BĐS =====
  const openCategoryPanel = () => {
    setIsCategoryOpen((v) => !v);
    setIsPriceOpen(false);
    setIsAreaOpen(false);
    setIsBedsOpenState(false);
    setIsSortOpen(false);
  };

  const applyCategory = (value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set("category", value);
    else next.delete("category");
    setSearchParams(next);
    setIsCategoryOpen(false);

    if (value === "Đất") {
      setSelectedBeds([]);
      setBedsDraft([]);
    }
  };

  const clearCategory = () => applyCategory("");

  // GIÁ
  const togglePricePanel = () => {
    setIsPriceOpen((v) => !v);
    setIsCategoryOpen(false);
    setIsAreaOpen(false);
    setIsBedsOpenState(false);
    setIsSortOpen(false);
  };

  const handleSliderMinChange = (e) => {
    const v = Math.min(Number(e.target.value), sliderMax);
    setSliderMin(v);
  };

  const handleSliderMaxChange = (e) => {
    const v = Math.max(Number(e.target.value), sliderMin);
    setSliderMax(v);
  };

  const handleResetPrice = () => {
    setSliderMin(PRICE_MIN);
    setSliderMax(PRICE_MAX);
    setPriceMin(null);
    setPriceMax(null);
  };

  const handleApplyPrice = () => {
    setPriceMin(sliderMin > PRICE_MIN ? sliderMin : null);
    setPriceMax(sliderMax < PRICE_MAX ? sliderMax : null);
    setIsPriceOpen(false);
  };

  const rangeLeft = (sliderMin / PRICE_MAX) * 100;
  const rangeWidth = ((sliderMax - sliderMin) / PRICE_MAX) * 100;

  // DIỆN TÍCH
  const toggleAreaPanel = () => {
    setIsAreaOpen((v) => !v);
    setIsCategoryOpen(false);
    setIsPriceOpen(false);
    setIsBedsOpenState(false);
    setIsSortOpen(false);
  };

  const handleResetArea = () => {
    setAreaMinInput("");
    setAreaMaxInput("");
    setAreaMin(null);
    setAreaMax(null);
  };

  const handleApplyArea = () => {
    let min = areaMinInput.trim()
      ? Number(areaMinInput.replace(",", "."))
      : null;
    let max = areaMaxInput.trim()
      ? Number(areaMaxInput.replace(",", "."))
      : null;

    if (!Number.isFinite(min)) min = null;
    if (!Number.isFinite(max)) max = null;

    if (min != null && max != null && min > max) {
      const tmp = min;
      min = max;
      max = tmp;
    }

    setAreaMin(min);
    setAreaMax(max);
    setIsAreaOpen(false);
  };

  // PHÒNG NGỦ
  const toggleBedsPanel = () => {
    setIsBedsOpenState((v) => {
      const next = !v;
      if (next) setBedsDraft(selectedBeds);
      return next;
    });
    setIsCategoryOpen(false);
    setIsPriceOpen(false);
    setIsAreaOpen(false);
    setIsSortOpen(false);
  };

  const handleToggleBedOption = (value) => {
    setBedsDraft((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    );
  };

  const handleResetBeds = () => {
    setBedsDraft([]);
    setSelectedBeds([]);
  };

  const handleApplyBeds = () => {
    setSelectedBeds(bedsDraft);
    setIsBedsOpenState(false);
  };

  // SORT PANEL
  const toggleSortPanel = () => {
    setIsSortOpen((v) => !v);
    setIsCategoryOpen(false);
    setIsPriceOpen(false);
    setIsAreaOpen(false);
    setIsBedsOpenState(false);
  };

  const applySort = (type) => {
    setSortType(type);
    setIsSortOpen(false);
  };

  let sortLabel = "Tin mới nhất";
  if (sortType === "price-asc") sortLabel = "Giá thấp đến cao";
  if (sortType === "price-desc") sortLabel = "Giá cao đến thấp";

  // ===== RENDER =====
  return (
    <div className="lp-page nhatot">
      <NhatotHeader />

      <main className="lp-main">
        <div className="mk-container">
          {/* ===== Breadcrumb + title ===== */}
          <div className="lp-breadcrumb">
            <span>Nhà Tốt</span>
            <span className="lp-breadcrumb-sep">/</span>
            <span>{dealTypeLabel}</span>
            {categoryParam && (
              <>
                <span className="lp-breadcrumb-sep">/</span>
                <span>{activeCategoryLabel}</span>
              </>
            )}
          </div>

          <section className="lp-head-card">
            <h1 className="lp-title">
              {total.toLocaleString("vi-VN")} {titleCategoryLabel}{" "}
              {provinceParam ? `tại ${provinceParam}` : ""}{" "}
              {dealTypeLabel && dealTypeLabel !== "Bất động sản"
                ? `${dealTypeLabel}`
                : ""}
            </h1>

            {/* Hàng nút lọc chính */}
            <div className="lp-head-actions">
              <button className="lp-chip lp-chip-outline" type="button">
                <Filter size={16} />
                Lọc
              </button>

              <button className="lp-chip lp-chip-ghost active" type="button">
                {dealTypeLabel || "Mua bán"}
              </button>

              {/* LOẠI HÌNH BĐS */}
              <button
                className={
                  "lp-chip lp-chip-ghost lp-chip-filter" +
                  (categoryParam ? " lp-chip-filter--active" : "")
                }
                type="button"
                onClick={openCategoryPanel}
              >
                {activeCategoryLabel}
                <ChevronDown size={14} />
              </button>

              {/* GIÁ */}
              <button
                className={
                  "lp-chip lp-chip-ghost lp-chip-filter" +
                  (hasPriceFilter ? " lp-chip-filter--active" : "")
                }
                type="button"
                onClick={togglePricePanel}
              >
                {priceChipLabel}
                <ChevronDown size={14} />
              </button>

              {/* DIỆN TÍCH */}
              <button
                className={
                  "lp-chip lp-chip-ghost lp-chip-filter" +
                  (hasAreaFilter ? " lp-chip-filter--active" : "")
                }
                type="button"
                onClick={toggleAreaPanel}
              >
                {areaChipLabel}
                <ChevronDown size={14} />
              </button>

              {/* PHÒNG NGỦ */}
              {showBedroomsFilter && (
                <button
                  className={
                    "lp-chip lp-chip-ghost lp-chip-filter" +
                    (hasBedsFilter ? " lp-chip-filter--active" : "")
                  }
                  type="button"
                  onClick={toggleBedsPanel}
                >
                  {bedsChipLabel}
                  <ChevronDown size={14} />
                </button>
              )}
            </div>

            {/* PANEL LOẠI HÌNH BĐS */}
            {isCategoryOpen && (
              <div className="lp-category-panel">
                <div className="lp-category-panel-inner">
                  <div className="lp-category-header">
                    <span className="lp-category-title">
                      Loại hình bất động sản
                    </span>
                  </div>

                  <ul className="lp-category-list">
                    {CATEGORY_OPTIONS.map((opt) => {
                      const isActive = opt.value === categoryParam;
                      return (
                        <li key={opt.value || "all"}>
                          <button
                            type="button"
                            className={
                              "lp-category-item" +
                              (isActive ? " lp-category-item--active" : "")
                            }
                            onClick={() => applyCategory(opt.value)}
                          >
                            {opt.label}
                          </button>
                        </li>
                      );
                    })}
                  </ul>

                  <button
                    type="button"
                    className="lp-category-clear"
                    onClick={clearCategory}
                  >
                    Xoá lọc
                  </button>
                </div>
              </div>
            )}

            {/* PANEL GIÁ */}
            {isPriceOpen && (
              <div className="lp-price-panel">
                <div className="lp-price-panel-inner">
                  <div className="lp-price-slider-track">
                    <div
                      className="lp-price-slider-range"
                      style={{ left: `${rangeLeft}%`, width: `${rangeWidth}%` }}
                    />
                    <input
                      type="range"
                      min={PRICE_MIN}
                      max={PRICE_MAX}
                      value={sliderMin}
                      onChange={handleSliderMinChange}
                      className="lp-price-slider-input"
                    />
                    <input
                      type="range"
                      min={PRICE_MIN}
                      max={PRICE_MAX}
                      value={sliderMax}
                      onChange={handleSliderMaxChange}
                      className="lp-price-slider-input"
                    />
                  </div>

                  <div className="lp-price-slider-labels">
                    <span>0</span>
                    <span>{PRICE_MAX} tỷ</span>
                  </div>

                  <div className="lp-price-inputs">
                    <div className="lp-price-input">
                      <label>Giá tối thiểu</label>
                      <div className="lp-price-input-row">
                        <input
                          value={sliderMin.toLocaleString("vi-VN")}
                          readOnly
                        />
                        <span className="lp-price-input-unit">tỷ</span>
                      </div>
                    </div>
                    <div className="lp-price-input">
                      <label>Giá tối đa</label>
                      <div className="lp-price-input-row">
                        <input
                          value={sliderMax.toLocaleString("vi-VN")}
                          readOnly
                        />
                        <span className="lp-price-input-unit">tỷ</span>
                      </div>
                    </div>
                  </div>

                  <div className="lp-price-actions">
                    <button
                      type="button"
                      className="lp-price-btn-reset"
                      onClick={handleResetPrice}
                    >
                      Xoá lọc
                    </button>
                    <button
                      type="button"
                      className="lp-price-btn-apply"
                      onClick={handleApplyPrice}
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL DIỆN TÍCH */}
            {isAreaOpen && (
              <div className="lp-area-panel">
                <div className="lp-area-panel-inner">
                  <div className="lp-area-inputs">
                    <div className="lp-area-input">
                      <label>Diện tích tối thiểu</label>
                      <div className="lp-area-input-row">
                        <input
                          type="number"
                          min="0"
                          value={areaMinInput}
                          onChange={(e) => setAreaMinInput(e.target.value)}
                        />
                        <span className="lp-area-input-unit">m²</span>
                      </div>
                    </div>
                    <div className="lp-area-input">
                      <label>Diện tích tối đa</label>
                      <div className="lp-area-input-row">
                        <input
                          type="number"
                          min="0"
                          value={areaMaxInput}
                          onChange={(e) => setAreaMaxInput(e.target.value)}
                        />
                        <span className="lp-area-input-unit">m²</span>
                      </div>
                    </div>
                  </div>

                  <div className="lp-area-actions">
                    <button
                      type="button"
                      className="lp-area-btn-reset"
                      onClick={handleResetArea}
                    >
                      Xoá lọc
                    </button>
                    <button
                      type="button"
                      className="lp-area-btn-apply"
                      onClick={handleApplyArea}
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PANEL SỐ PHÒNG NGỦ */}
            {isBedsOpenState && showBedroomsFilter && (
              <div className="lp-beds-panel">
                <div className="lp-beds-panel-inner">
                  <div className="lp-beds-list">
                    {BED_OPTIONS.map((opt) => (
                      <label className="lp-beds-row" key={opt.value}>
                        <span className="lp-beds-label">{opt.label}</span>
                        <input
                          type="checkbox"
                          checked={bedsDraft.includes(opt.value)}
                          onChange={() => handleToggleBedOption(opt.value)}
                        />
                      </label>
                    ))}
                  </div>

                  <div className="lp-beds-actions">
                    <button
                      type="button"
                      className="lp-beds-btn-reset"
                      onClick={handleResetBeds}
                    >
                      Xoá lọc
                    </button>
                    <button
                      type="button"
                      className="lp-beds-btn-apply"
                      onClick={handleApplyBeds}
                    >
                      Áp dụng
                    </button>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ===== BODY: LIST + SORT + VIEW ===== */}
          <section className="lp-body">
            <div className="lp-left">
              {/* Tabs + sort + view */}
              <div className="lp-list-head">
                <div className="lp-tabs">
                  <button className="lp-tab active" type="button">
                    Tất cả
                  </button>
                  <button className="lp-tab" type="button">
                    Cá nhân
                  </button>
                  <button className="lp-tab" type="button">
                    Môi giới
                  </button>
                </div>

                <div className="lp-sort-view">
                  <div className="lp-sort">
                    <button
                      type="button"
                      className="lp-sort-chip"
                      onClick={toggleSortPanel}
                    >
                      {sortLabel}
                      <ChevronDown size={14} />
                    </button>

                    {isSortOpen && (
                      <div className="lp-sort-panel">
                        <button
                          type="button"
                          className={
                            "lp-sort-item" +
                            (sortType === "newest"
                              ? " lp-sort-item--active"
                              : "")
                          }
                          onClick={() => applySort("newest")}
                        >
                          Tin mới nhất
                        </button>
                        <button
                          type="button"
                          className={
                            "lp-sort-item" +
                            (sortType === "price-asc"
                              ? " lp-sort-item--active"
                              : "")
                          }
                          onClick={() => applySort("price-asc")}
                        >
                          Giá thấp đến cao
                        </button>
                        <button
                          type="button"
                          className={
                            "lp-sort-item" +
                            (sortType === "price-desc"
                              ? " lp-sort-item--active"
                              : "")
                          }
                          onClick={() => applySort("price-desc")}
                        >
                          Giá cao đến thấp
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="lp-view-toggle">
                    <button
                      className={viewMode === "list" ? "is-active" : ""}
                      aria-label="Dạng danh sách"
                      type="button"
                      onClick={() => setViewMode("list")}
                    >
                      <List size={16} />
                    </button>
                    <button
                      className={viewMode === "grid" ? "is-active" : ""}
                      aria-label="Dạng lưới"
                      type="button"
                      onClick={() => setViewMode("grid")}
                    >
                      <LayoutGrid size={16} />
                    </button>
                  </div>
                </div>
              </div>

              {/* ===== LIST MODE ===== */}
              {viewMode === "list" && (
                <div className="lp-list">
                  {paginated.map((item) => {
                    const isLiked = favoriteIds.has(item.id);

                    return (
                      <article
                        className="lp-card"
                        key={item.id}
                        onClick={() => handleCardClick(item)}
                      >
                        <div className="lp-card-media">
                          <img src={item.coverUrl} alt={item.title} />
                          <span className="lp-card-badge">Tin ưu tiên</span>
                          <span className="lp-card-photos">
                            {item.area} m²
                          </span>
                        </div>

                        <div className="lp-card-body">
                          <h2 className="lp-card-title">{item.title}</h2>

                          <div className="lp-card-line">
                            <span>{item.beds ?? "--"} PN</span>
                            <span className="lp-dot">•</span>
                            <span>{item.typeLabel}</span>
                          </div>

                          <div className="lp-card-price-row">
                            <span className="lp-card-price">
                              {item.price}
                            </span>
                            <span className="lp-card-price-sub">
                              {item.pricePerM2}
                            </span>
                            <span className="lp-card-area">
                              {item.area} m²
                            </span>
                          </div>

                          <div className="lp-card-location">
                            <MapPin size={14} />
                            <span>{item.address}</span>
                          </div>

                          <div className="lp-card-owner">
                            <div className="lp-owner-avatar">
                              {item.ownerName.charAt(0)}
                            </div>
                            <div className="lp-owner-info">
                              <div className="lp-owner-name">
                                {item.ownerName}
                              </div>
                              <div className="lp-owner-sub">
                                {item.ownerPosts} tin đăng
                              </div>
                            </div>
                          </div>
                        </div>

                        <button
                          type="button"
                          className={`lp-like-btn ${isLiked ? "is-liked" : ""}`}
                          aria-label="Yêu thích"
                          onClick={(e) => handleToggleFavorite(e, item)}
                        >
                          <Heart
                            size={18}
                            aria-hidden
                            fill={isLiked ? "#f97316" : "none"}
                          />
                        </button>
                      </article>
                    );
                  })}

                  {paginated.length === 0 && (
                    <div className="lp-empty">
                      Không có tin phù hợp với bộ lọc hiện tại.
                    </div>
                  )}
                </div>
              )}

              {/* ===== GRID MODE ===== */}
              {viewMode === "grid" && (
                <div className="lp-grid">
                  {paginated.map((item) => {
                    const isLiked = favoriteIds.has(item.id);

                    return (
                      <article
                        key={item.id}
                        className="lp-card-grid"
                        onClick={() => handleCardClick(item)}
                      >
                        <div className="lp-card-grid-media">
                          <img src={item.coverUrl} alt={item.title} />
                          <span className="lp-card-grid-badge">Tin ưu tiên</span>
                          <button
                            type="button"
                            className={`lp-like-btn-grid ${
                              isLiked ? "is-liked" : ""
                            }`}
                            aria-label="Yêu thích"
                            onClick={(e) => handleToggleFavorite(e, item)}
                          >
                            <Heart
                              size={18}
                              aria-hidden
                              fill={isLiked ? "#f97316" : "none"}
                            />
                          </button>
                        </div>

                        <div className="lp-card-grid-body">
                          <h2 className="lp-card-grid-title">{item.title}</h2>

                          <div className="lp-card-grid-meta">
                            <span>{item.beds ?? "--"} PN</span>
                            <span>•</span>
                            <span>{item.typeLabel}</span>
                          </div>

                          <div className="lp-card-grid-price-row">
                            <span className="lp-card-grid-price">
                              {item.price}
                            </span>
                            <span className="lp-card-grid-price-sub">
                              {item.pricePerM2}
                            </span>
                          </div>

                          <div className="lp-card-grid-footer">
                            <span className="lp-card-grid-area">
                              {item.area} m²
                            </span>
                            <span className="lp-card-grid-location">
                              <MapPin size={13} />
                              {item.address}
                            </span>
                          </div>
                        </div>
                      </article>
                    );
                  })}

                  {paginated.length === 0 && (
                    <div className="lp-empty">
                      Không có tin phù hợp với bộ lọc hiện tại.
                    </div>
                  )}
                </div>
              )}

              {/* ===== Pagination ===== */}
              {pageCount > 1 && (
                <div className="lp-pagination">
                  {Array.from({ length: pageCount }, (_, i) => i + 1).map(
                    (page) => (
                      <button
                        key={page}
                        className={
                          "page-btn" + (page === safePage ? " active" : "")
                        }
                        type="button"
                        onClick={() => handleChangePage(page)}
                      >
                        {page}
                      </button>
                    )
                  )}
                </div>
              )}
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
