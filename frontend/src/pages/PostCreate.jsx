// src/pages/PostCreate.jsx
import React, { useState, useRef } from "react";
import "../styles/PostCreate.css";

import Header from "../components/header";
import Footer from "../components/footer";

// 5 form component
import FormCanho from "../components/FormCanho";
import FormNhao from "../components/FormNhao";
import FormDat from "../components/FormDat";
import FormVanphong from "../components/FormVanphong";
import FormPhongtro from "../components/FormPhongtro";

const CATEGORY_GROUP = [
  "Căn hộ/Chung cư",
  "Nhà ở",
  "Đất",
  "Văn phòng, Mặt bằng kinh doanh",
  "Phòng trọ",
];

const PREFIX = "Bất động sản - ";

function getPureCategory(fullLabel) {
  if (!fullLabel) return "";
  return fullLabel.startsWith(PREFIX)
    ? fullLabel.slice(PREFIX.length).trim()
    : fullLabel;
}

export default function PostCreate() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [category, setCategory] = useState(""); // "Bất động sản - Căn hộ/Chung cư"
  const [estateType, setEstateType] = useState(""); // "Cần bán" | "Cho thuê"

  // ===== MEDIA (ảnh + video) =====
  const [media, setMedia] = useState([]); // [{id, type: 'image'|'video', src}]
  const fileInputRef = useRef(null);

  const MAX_FILES = 10;
  const MAX_SIZE_MB = 10; // demo: 10MB/file

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    let slot = MAX_FILES - media.length;
    if (slot <= 0) {
      alert("Chỉ được tải tối đa 10 ảnh/video.");
      return;
    }

    const selected = files.slice(0, slot);
    const newItems = [];

    selected.forEach((file) => {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        alert(`File "${file.name}" vượt quá ${MAX_SIZE_MB}MB, bỏ qua.`);
        return;
      }

      // Dùng blob URL để không đầy localStorage
      const url = URL.createObjectURL(file);

      newItems.push({
        id: Date.now() + Math.random(),
        type: file.type.startsWith("video") ? "video" : "image",
        src: url,
      });
    });

    if (!newItems.length) {
      e.target.value = "";
      return;
    }

    setMedia((prev) => {
      const next = [...prev, ...newItems];
      // Lưu tạm, form con sẽ đọc postDraftMedia để gắn vào tin đăng
      localStorage.setItem("postDraftMedia", JSON.stringify(next));
      return next;
    });

    // cho phép chọn lại cùng file
    e.target.value = "";
  };

  const handleOpenFileDialog = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveMedia = (id) => {
    setMedia((prev) => {
      const found = prev.find((m) => m.id === id);
      if (found && found.src && found.src.startsWith("blob:")) {
        URL.revokeObjectURL(found.src);
      }

      const next = prev.filter((m) => m.id !== id);
      localStorage.setItem("postDraftMedia", JSON.stringify(next));
      return next;
    });
  };

  // ===== MODAL DANH MỤC =====
  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  const handleSelectCategory = (name) => {
    setCategory(PREFIX + name);
    setEstateType(""); // đổi danh mục thì reset Cần bán / Cho thuê
    closeModal();
  };

  const pureCategory = getPureCategory(category);
  const hasCategory = Boolean(category);
  const hasEstateType = Boolean(estateType);
  const isPhongTro = pureCategory === "Phòng trọ";

  // ===== CHỌN FORM =====
  const renderForm = () => {
    if (!hasCategory) return null; // chưa chọn danh mục thì ẩn form
    if (!isPhongTro && !hasEstateType) return null; // 4 loại đầu phải chọn Cần bán / Cho thuê

    switch (pureCategory) {
      case "Căn hộ/Chung cư":
        return <FormCanho estateType={estateType} />;
      case "Nhà ở":
        return <FormNhao estateType={estateType} />;
      case "Đất":
        return <FormDat estateType={estateType} />;
      case "Văn phòng, Mặt bằng kinh doanh":
        return <FormVanphong estateType={estateType} />;
      case "Phòng trọ":
        return <FormPhongtro />;
      default:
        return null;
    }
  };

  // ===== TEXT MINH HỌA =====
  let illuTitle = "ĐĂNG NHANH - BÁN GỌN";
  let illuDesc = 'Chọn "danh mục tin đăng" để đăng tin';

  if (hasCategory && !isPhongTro) {
    illuTitle = "Chọn Cần bán hoặc Cho thuê";
    illuDesc = "để tiếp tục";
  } else if (hasCategory && isPhongTro) {
    illuTitle = "Đăng phòng trọ";
    illuDesc = "Điền các thông tin bên dưới để tiếp tục";
  }

  const showEstateType = hasCategory && !isPhongTro;

  return (
    <div className="nhatot">
      <div className="mk-page">
        <Header />

        {/* MAIN TRANG ĐĂNG TIN */}
        <main className="pct-page">
          <div className="pct-container">
            {/* ========= CARD 1: Hình ảnh + chọn danh mục ========= */}
            <div className="pct-card">
              <div className="pct-header-row">
                <div className="pct-title-wrap">
                  <h2 className="pct-title">Hình ảnh và Video sản phẩm</h2>
                  <p className="pct-subtitle">
                    Xem thêm về{" "}
                    <button type="button" className="pct-link">
                      Quy định đăng tin của Chợ Tốt
                    </button>
                  </p>
                </div>

                {/* Danh mục tin đăng */}
                <div className="pct-category-wrap">
                  <label className="pct-label">
                    Danh Mục Tin Đăng <span className="pct-required">*</span>
                  </label>
                  <button
                    type="button"
                    className="pct-select"
                    onClick={openModal}
                  >
                    <span>{category || "Chọn danh mục tin đăng"}</span>
                    <span className="pct-chevron-down">▾</span>
                  </button>
                </div>
              </div>

              {/* Hàng nội dung: trái upload – phải Cần bán / Cho thuê + minh họa */}
              <div className="pct-body-row">
                {/* Khung upload */}
                <div className="pct-upload-card">
                  {/* input file ẩn */}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    hidden
                    onChange={handleFilesChange}
                  />

                  <div
                    className="pct-upload-dropzone"
                    onClick={handleOpenFileDialog}
                  >
                    <div className="pct-upload-inner">
                      <div className="pct-upload-icon">
                        <div className="pct-upload-icon-circle" />
                        <span className="pct-upload-plus">+</span>
                      </div>
                      <p className="pct-upload-text">
                        Thêm hình ảnh hoặc video
                      </p>
                      <p className="pct-upload-hint">
                        Hình có kích thước tối thiểu 240x240 – Tối đa 10 file
                      </p>

                      {/* PREVIEW thumbnail nhỏ */}
                      {media.length > 0 && (
                        <>
                          <p className="pct-upload-counter">
                            Đã chọn {media.length}/10 file
                          </p>

                          <div className="pct-upload-preview-grid">
                            {media.map((m) => (
                              <div key={m.id} className="pct-upload-thumb">
                                <button
                                  type="button"
                                  className="pct-upload-thumb-remove"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRemoveMedia(m.id);
                                  }}
                                >
                                  ×
                                </button>

                                {m.type === "image" ? (
                                  <img src={m.src} alt="" />
                                ) : (
                                  <video src={m.src} />
                                )}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Cột phải */}
                <div className="pct-right-col">
                  {/* Danh mục bất động sản: Cần bán / Cho thuê (trừ Phòng trọ) */}
                  {showEstateType && (
                    <div className="pct-estate-type">
                      <label className="pct-label">
                        Danh mục bất động sản{" "}
                        <span className="pct-required">*</span>
                      </label>
                      <div className="pct-pill-group">
                        <button
                          type="button"
                          className={
                            "pct-pill" +
                            (estateType === "Cần bán"
                              ? " pct-pill--active"
                              : "")
                          }
                          onClick={() => setEstateType("Cần bán")}
                        >
                          Cần bán
                        </button>
                        <button
                          type="button"
                          className={
                            "pct-pill" +
                            (estateType === "Cho thuê"
                              ? " pct-pill--active"
                              : "")
                          }
                          onClick={() => setEstateType("Cho thuê")}
                        >
                          Cho thuê
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Minh hoạ */}
                  <div className="pct-illu-wrap">
                    <div className="pct-illu-image-box">
                      <img
                        src="/Img/empty-category.svg"
                        alt="Lựa chọn loại bất động sản"
                        className="pct-illu-image"
                      />
                    </div>

                    <div className="pct-illu-text">
                      <h3>{illuTitle}</h3>
                      <p>{illuDesc}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* ========= CARD 2: Form chi tiết ========= */}
            <div className="pct-card pct-form-card">{renderForm()}</div>
          </div>
        </main>

        <Footer />

        {/* ========= MODAL CHỌN DANH MỤC ========= */}
        {isModalOpen && (
          <div className="pct-modal-backdrop" onClick={closeModal}>
            <div
              className="pct-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pct-modal-header">
                <button
                  type="button"
                  className="pct-modal-back-btn"
                  onClick={closeModal}
                >
                  ←
                </button>
                <span className="pct-modal-title">
                  Chọn danh mục bất động sản
                </span>
              </div>

              <div className="pct-modal-body">
                <div className="pct-modal-section-title">CHỌN DANH MỤC</div>

                <div className="pct-modal-list">
                  {CATEGORY_GROUP.map((item) => (
                    <button
                      type="button"
                      key={item}
                      className="pct-modal-item"
                      onClick={() => handleSelectCategory(item)}
                    >
                      <span>{item}</span>
                      <span className="pct-modal-item-arrow">›</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
