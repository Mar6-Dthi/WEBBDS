// src/components/LocationSelect.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { MapPin, ChevronDown, ChevronLeft, Search, Check } from "lucide-react";
import "../styles/Home.css";
import "../styles/LocationSelect.css";

/* 63 tỉnh/thành + “Tất cả” */
const PROVINCES = [
  "Tất cả",
  "An Giang","Bà Rịa - Vũng Tàu","Bạc Liêu","Bắc Giang","Bắc Kạn","Bắc Ninh",
  "Bến Tre","Bình Dương","Bình Định","Bình Phước","Bình Thuận","Cà Mau","Cao Bằng",
  "Cần Thơ","Đà Nẵng","Đắk Lắk","Đắk Nông","Điện Biên","Đồng Nai","Đồng Tháp",
  "Gia Lai","Hà Giang","Hà Nam","Hà Nội","Hà Tĩnh","Hải Dương","Hải Phòng",
  "Hậu Giang","Hòa Bình","Hưng Yên","Khánh Hòa","Kiên Giang","Kon Tum","Lai Châu",
  "Lâm Đồng","Lạng Sơn","Lào Cai","Long An","Nam Định","Nghệ An","Ninh Bình",
  "Ninh Thuận","Phú Thọ","Phú Yên","Quảng Bình","Quảng Nam","Quảng Ngãi",
  "Quảng Ninh","Quảng Trị","Sóc Trăng","Sơn La","Tây Ninh","Thái Bình","Thái Nguyên",
  "Thanh Hóa","Thừa Thiên Huế","Tiền Giang","TP Hồ Chí Minh","Trà Vinh","Tuyên Quang",
  "Vĩnh Long","Vĩnh Phúc","Yên Bái"
];

const strip = (s = "") =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

export default function LocationSelect({
  value = "Tất cả",
  onChange,
  onOpenChange, // ⭐ callback báo mở/đóng
}) {
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState("");
  const ref = useRef(null);

  const items = useMemo(
    () => PROVINCES.filter((p) => strip(p).includes(strip(q))),
    [q]
  );

  // helper: set trạng thái open + báo ra ngoài
  const setOpenWithNotify = (next) => {
    setOpen(next);
    onOpenChange?.(next);
  };

  useEffect(() => {
    const clickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpenWithNotify(false);
      }
    };
    const onEsc = (e) => {
      if (e.key === "Escape") setOpenWithNotify(false);
    };
    document.addEventListener("mousedown", clickOutside);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", clickOutside);
      document.removeEventListener("keydown", onEsc);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onOpenChange]); // để luôn dùng đúng callback mới nhất

  const select = (p) => {
    onChange?.(p);
    setOpenWithNotify(false);
  };

  return (
    <div className="mk-select-wrap" ref={ref}>
      <button
        type="button"
        className={`mk-select mk-select-loc ${open ? "open" : ""}`}
        onClick={() =>
          setOpen((prev) => {
            const next = !prev;
            onOpenChange?.(next);
            return next;
          })
        }
      >
        <MapPin size={18} />
        <span>{value}</span>
        <ChevronDown size={18} className="mk-caret" />
      </button>

      {open && (
        <div className="mk-panel">
          <div className="mk-panel-head">
            <button
              type="button"
              className="mk-head-back"
              onClick={() => setOpenWithNotify(false)}
            >
              <ChevronLeft size={18} />
            </button>
            <div className="mk-head-title">Tỉnh thành</div>
          </div>

          <div className="mk-panel-search">
            <Search size={16} />
            <input
              placeholder="Tìm tỉnh thành"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoFocus
            />
          </div>

          <ul className="mk-radio-list">
            {items.map((p) => {
              const active = p === value;
              return (
                <li key={p}>
                  <button
                    type="button"
                    className={`mk-radio-item ${active ? "is-active" : ""}`}
                    onClick={() => select(p)}
                  >
                    <span className="mk-radio-name">{p}</span>
                    <span className={`mk-radio ${active ? "is-checked" : ""}`}>
                      {active && (
                        <Check size={14} className="mk-radio-check" />
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
