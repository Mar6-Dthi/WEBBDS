import React, { useEffect, useRef, useState } from "react";
import { ChevronDown, Building2 } from "lucide-react";

export default function TypeSelect({ value, onChange }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);
  const panelId = "estate-type-panel";

  // label: text hiển thị, value: code dùng để lọc (trùng category trong mock)
  const OPTIONS = [
    { label: "Tất cả bất động sản", value: "" },                     // => không lọc theo category
    { label: "Căn hộ/Chung cư", value: "Căn hộ/Chung cư" },
    { label: "Nhà ở", value: "Nhà ở" },
    { label: "Đất", value: "Đất" },
    {
      label: "Văn phòng, Mặt bằng kinh doanh",
      value: "Văn phòng",                                           // trùng category trong mock
    },
    {
      label: "Phòng trọ, Nhà trọ",
      value: "Phòng trọ",                                           // trùng category trong mock
    },
    {
      label: "Bất động sản khác",
      value: "Bất động sản khác",
    },
  ];

  useEffect(() => {
    const onDocClick = (e) => {
      if (!wrapRef.current) return;
      if (!wrapRef.current.contains(e.target)) setOpen(false);
    };
    const onEsc = (e) => e.key === "Escape" && setOpen(false);

    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const handleSelect = (opt) => {
    onChange?.(opt.value); // 👈 chỉ bắn value (code) ra ngoài
    setOpen(false);
  };

  // Tìm option hiện tại dựa trên value (code); nếu chưa chọn thì dùng option đầu
  const currentOption =
    OPTIONS.find((opt) => opt.value === value) || OPTIONS[0];

  return (
    <div className="mk-select-wrap mk-type-wrap" ref={wrapRef}>
      {/* Trigger */}
      <button
        type="button"
        className="mk-select mk-select-cat"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
      >
        <Building2 size={18} className="mk-type-ico" aria-hidden />

        <span className="mk-label truncate" title={currentOption.label}>
          {currentOption.label}
        </span>

        <ChevronDown size={18} aria-hidden />
      </button>

      {open && (
        <div
          id={panelId}
          className="mk-panel"
          role="listbox"
          aria-label="Loại hình bất động sản"
        >
          <ul>
            {OPTIONS.map((opt) => {
              const checked = currentOption.value === opt.value;
              return (
                <li key={opt.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={checked}
                    onClick={() => handleSelect(opt)}
                  >
                    <span>{opt.label}</span>
                    <span
                      className={`mk-radio${checked ? " is-checked" : ""}`}
                      aria-hidden
                    />
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
