// src/components/AgentsFilterBar.jsx
import React, { useState, useMemo } from "react";
import { Filter, ChevronDown, MapPin } from "lucide-react";
import "../styles/AgentsPage.css";

const PROVINCES = [
  "Tất cả",
  "An Giang",
  "Bà Rịa - Vũng Tàu",
  "Bạc Liêu",
  "Bắc Giang",
  "Bắc Kạn",
  "Bắc Ninh",
  "Bến Tre",
  "Bình Dương",
  "Bình Định",
  "Bình Phước",
  "Bình Thuận",
  "Cà Mau",
  "Cao Bằng",
  "Cần Thơ",
  "Đà Nẵng",
  "Đắk Lắk",
  "Đắk Nông",
  "Điện Biên",
  "Đồng Nai",
  "Đồng Tháp",
  "Gia Lai",
  "Hà Giang",
  "Hà Nam",
  "Hà Nội",
  "Hà Tĩnh",
  "Hải Dương",
  "Hải Phòng",
  "Hậu Giang",
  "Hòa Bình",
  "Hưng Yên",
  "Khánh Hòa",
  "Kiên Giang",
  "Kon Tum",
  "Lai Châu",
  "Lâm Đồng",
  "Lạng Sơn",
  "Lào Cai",
  "Long An",
  "Nam Định",
  "Nghệ An",
  "Ninh Bình",
  "Ninh Thuận",
  "Phú Thọ",
  "Phú Yên",
  "Quảng Bình",
  "Quảng Nam",
  "Quảng Ngãi",
  "Quảng Ninh",
  "Quảng Trị",
  "Sóc Trăng",
  "Sơn La",
  "Tây Ninh",
  "Thái Bình",
  "Thái Nguyên",
  "Thanh Hóa",
  "Thừa Thiên Huế",
  "Tiền Giang",
  "TP Hồ Chí Minh",
  "Trà Vinh",
  "Tuyên Quang",
  "Vĩnh Long",
  "Vĩnh Phúc",
  "Yên Bái",
];

const ESTATE_OPTIONS = [
  { value: "all", label: "Tất cả" },
  { value: "canho", label: "Căn hộ chung cư" },
  { value: "nhao", label: "Nhà ở" },
  { value: "vpmb", label: "Văn phòng, Mặt bằng kinh doanh" },
  { value: "dat", label: "Đất" },
];

// 👉 export để AgentsPage dùng cho logic lọc
export const PRICE_OPTIONS = [
  { value: "all", label: "Tất cả khoảng giá", min: 0, max: Infinity },
  { value: "lt5", label: "dưới 5 tr/m2", min: 0, max: 5 },
  { value: "5-10", label: "5 - 10tr/m2", min: 5, max: 10 },
  { value: "10-20", label: "10 - 20tr/m2", min: 10, max: 20 },
  { value: "20-35", label: "20 - 35tr/m2", min: 20, max: 35 },
  { value: "35-50", label: "35 - 50tr/m2", min: 35, max: 50 },
  { value: "50-85", label: "50 - 85tr/m2", min: 50, max: 85 },
  { value: "85-100", label: "85 - 100tr/m2", min: 85, max: 100 },
  { value: "gt100", label: "trên 100tr/m2", min: 100, max: Infinity },
];

export default function AgentsFilterBar({
  province,
  agentType,
  estateType,
  priceRange,
  onChangeProvince,
  onOpenFilter,
  onChangeAgentType,
  onChangeEstateType,
  onChangePriceRange,
}) {
  const [isProvinceOpen, setProvinceOpen] = useState(false);
  const [isAgentTypeOpen, setAgentTypeOpen] = useState(false);
  const [isEstateOpen, setEstateOpen] = useState(false);
  const [isPriceOpen, setPriceOpen] = useState(false);
  const [search, setSearch] = useState("");

  // ====== Lọc danh sách tỉnh theo keyword ======
  const filteredProvinces = useMemo(() => {
    const keyword = search.trim().toLowerCase();
    if (!keyword) return PROVINCES;
    return PROVINCES.filter((p) => p.toLowerCase().includes(keyword));
  }, [search]);

  const handleSelectProvince = (p) => {
    onChangeProvince(p);
    setProvinceOpen(false);
    setSearch("");
  };

  const agentTypeLabel =
    agentType === "buy"
      ? "Môi giới mua bán"
      : agentType === "rent"
      ? "Môi giới cho thuê"
      : "Tất cả loại môi giới";

  const currentEstateLabel =
    ESTATE_OPTIONS.find((o) => o.value === estateType)?.label || "Loại BĐS";

  const currentPriceLabel =
    PRICE_OPTIONS.find((o) => o.value === priceRange)?.label ||
    "Khoảng giá mua bán";

  return (
    <div className="agents-filter-bar">
      {/* Nút Lọc tổng */}
      <button className="agents-filter-btn" onClick={onOpenFilter}>
        <Filter size={16} />
        Lọc
      </button>

      {/* Nút tỉnh thành + panel */}
      <div className="agents-province-wrapper">
        <button
          type="button"
          className="agents-filter-pill"
          onClick={() => {
            setProvinceOpen((v) => !v);
            setAgentTypeOpen(false);
            setEstateOpen(false);
            setPriceOpen(false);
          }}
        >
          <MapPin size={14} />
          {province || "Tất cả"}
          <ChevronDown
            size={14}
            className={isProvinceOpen ? "ag-rotate-180" : ""}
          />
        </button>

        {isProvinceOpen && (
          <div className="agents-province-panel">
            <div className="agents-province-search">
              <input
                type="text"
                placeholder="Tìm tỉnh thành"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <div className="agents-province-list">
              {filteredProvinces.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={
                    "agents-province-item" +
                    (p === province ? " agents-province-item--active" : "")
                  }
                  onClick={() => handleSelectProvince(p)}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Dropdown loại môi giới: all / buy / rent */}
      <div className="agents-agenttype-wrapper">
        <button
          type="button"
          className="agents-filter-pill"
          onClick={() => {
            setAgentTypeOpen((v) => !v);
            setProvinceOpen(false);
            setEstateOpen(false);
            setPriceOpen(false);
          }}
        >
          {agentTypeLabel}
          <ChevronDown
            size={14}
            className={isAgentTypeOpen ? "ag-rotate-180" : ""}
          />
        </button>

        {isAgentTypeOpen && (
          <div className="agents-agenttype-panel">
            <button
              type="button"
              className={
                "agents-agenttype-item" +
                (agentType === "all" ? " agents-agenttype-item--active" : "")
              }
              onClick={() => {
                onChangeAgentType("all");
                setAgentTypeOpen(false);
              }}
            >
              Tất cả loại môi giới
            </button>
            <button
              type="button"
              className={
                "agents-agenttype-item" +
                (agentType === "buy" ? " agents-agenttype-item--active" : "")
              }
              onClick={() => {
                onChangeAgentType("buy");
                setAgentTypeOpen(false);
              }}
            >
              Môi giới mua bán
            </button>
            <button
              type="button"
              className={
                "agents-agenttype-item" +
                (agentType === "rent" ? " agents-agenttype-item--active" : "")
              }
              onClick={() => {
                onChangeAgentType("rent");
                setAgentTypeOpen(false);
              }}
            >
              Môi giới cho thuê
            </button>
          </div>
        )}
      </div>

      {/* Dropdown LOẠI BĐS */}
      <div className="agents-estate-wrap">
        <button
          className="agents-filter-pill"
          type="button"
          onClick={() => {
            setEstateOpen((v) => !v);
            setProvinceOpen(false);
            setAgentTypeOpen(false);
            setPriceOpen(false);
          }}
        >
          {currentEstateLabel}
          <ChevronDown
            size={14}
            className={isEstateOpen ? "ag-rotate-180" : ""}
          />
        </button>

        {isEstateOpen && (
          <div className="agents-estate-panel">
            {ESTATE_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={
                  "agents-estate-item" +
                  (opt.value === estateType
                    ? " agents-estate-item--active"
                    : "")
                }
                onClick={() => {
                  onChangeEstateType(opt.value);
                  setEstateOpen(false);
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown KHOẢNG GIÁ */}
      <div className="agents-price-wrap">
        <button
          className="agents-filter-pill"
          type="button"
          onClick={() => {
            setPriceOpen((v) => !v);
            setProvinceOpen(false);
            setAgentTypeOpen(false);
            setEstateOpen(false);
          }}
        >
          {currentPriceLabel}
          <ChevronDown
            size={14}
            className={isPriceOpen ? "ag-rotate-180" : ""}
          />
        </button>

        {isPriceOpen && (
          <div className="agents-price-panel">
            <div className="agents-price-header">
              Khoảng giá từ <strong>0</strong> đến <strong>100tr/m2+</strong>
            </div>

            <div className="agents-price-bar">
              <div className="agents-price-bar-line" />
              <div className="agents-price-bar-thumb" />
              <div className="agents-price-bar-thumb right" />
            </div>

            <div className="agents-price-list">
              {PRICE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={
                    "agents-price-item" +
                    (opt.value === priceRange
                      ? " agents-price-item--active"
                      : "")
                  }
                  onClick={() => onChangePriceRange(opt.value)}
                >
                  <span>{opt.label}</span>
                  <span className="agents-price-radio" />
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
