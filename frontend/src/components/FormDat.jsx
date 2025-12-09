// src/components/FormDat.jsx
import React, { useState } from "react";

/* ===== Simple modal để dùng khi cần thông báo ===== */
function SimpleModal({
  open,
  title,
  message,
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
}) {
  if (!open) return null;
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.35)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: "min(520px,92vw)",
          background: "#fff",
          borderRadius: 10,
          padding: 18,
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
        }}
      >
        {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
        <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{message}</div>

        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "flex-end",
            marginTop: 12,
          }}
        >
          {secondaryLabel && (
            <button
              type="button"
              onClick={onSecondary}
              style={{
                background: "#f3f4f6",
                border: "none",
                padding: "8px 12px",
                borderRadius: 8,
              }}
            >
              {secondaryLabel}
            </button>
          )}

          {primaryLabel && (
            <button
              type="button"
              onClick={onPrimary}
              style={{
                background: "#0f172a",
                color: "#fff",
                border: "none",
                padding: "8px 12px",
                borderRadius: 8,
              }}
            >
              {primaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* ============================================================
    FORM ĐẤT - FE SẠCH
    KHÔNG LƯU STORAGE, KHÔNG NAVIGATE, KHÔNG QUOTA
    CHỈ GỌI onSubmit(payload)
===============================================================*/

export default function FormDat({ estateType, onSubmit }) {
  const isRent = estateType === "Cho thuê";

  // ========= FORM STATE =========
  const [form, setForm] = useState({
    projectName: "",
    address: "",
    phanKhu: "",
    maLo: "",
    landType: "",
    direction: "",
    legal: "",
    landArea: "",
    width: "",
    length: "",
    price: "",
    title: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  // ========= OPTIONAL MODAL =========
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpts, setModalOpts] = useState({
    title: "",
    message: "",
    primaryLabel: "Đóng",
    secondaryLabel: null,
    onPrimary: null,
    onSecondary: null,
  });

  const openModal = (opts = {}) => {
    setModalOpts({
      title: opts.title || "Thông báo",
      message: opts.message || "",
      primaryLabel: opts.primaryLabel || "Đóng",
      secondaryLabel: opts.secondaryLabel || null,
      onPrimary: opts.onPrimary || (() => setModalOpen(false)),
      onSecondary: opts.onSecondary || (() => setModalOpen(false)),
    });
    setModalOpen(true);
  };

  const closeModal = () => setModalOpen(false);

  // ========= FORM CHANGE =========
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  // ========= VALIDATION =========
  const validate = () => {
    const next = {};
    if (!form.address.trim()) next.address = "Vui lòng nhập địa chỉ";
    if (!form.landType) next.landType = "Vui lòng chọn loại hình đất";
    if (!form.landArea) next.landArea = "Vui lòng nhập diện tích đất";
    if (!form.price) next.price = "Vui lòng nhập giá";
    if (!form.title.trim()) next.title = "Vui lòng nhập tiêu đề tin";
    if (!form.description.trim()) next.description = "Vui lòng nhập mô tả";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ========= SUBMIT =========
  const handleSubmit = async () => {
    if (busy) return;
    if (!validate()) return;

    if (typeof onSubmit !== "function") {
      openModal({
        title: "Lỗi cấu hình",
        message: "FormDat chưa được truyền hàm onSubmit.",
      });
      return;
    }

    setBusy(true);
    try {
      const payload = {
        // các field mà PostCreate / MyPosts dùng chung
        title: form.title.trim(),
        description: form.description.trim(),
        address: form.address.trim(),

        price: Number(form.price) || 0,
        landArea: Number(form.landArea) || 0,
        usableArea: Number(form.landArea) || 0,

        bed: "",
        bath: "",
        direction: form.direction || "",
        floors: "",

        houseType: form.landType || "Đất",
        legal: form.legal || "",
        interior: "",
        estateStatus: "",

        projectName: form.projectName,
        phanKhu: form.phanKhu,
        maLo: form.maLo,

        width: form.width ? Number(form.width) : null,
        length: form.length ? Number(form.length) : null,

        estateType, // để parent nếu cần fallback
      };

      const result = onSubmit(payload);
      if (result instanceof Promise) await result;
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pct-card pct-form-card">
      {/* ==== ĐỊA CHỈ ===== */}
      <section className="pct-section">
        <h3 className="pct-section-title">Địa chỉ BĐS và Hình ảnh</h3>

        <div className="pct-field-col">
          <div className="pct-field">
            <label className="pct-label">Tên dự án đất nền</label>
            <input
              className="pct-input"
              type="text"
              name="projectName"
              value={form.projectName}
              onChange={handleChange}
              placeholder="Nhập tên dự án đất nền"
            />
          </div>

          <p className="pct-help-text">
            Không tìm thấy dự án cần đăng tin?{" "}
            <button type="button" className="pct-link-inline">
              Yêu cầu thêm dự án
            </button>
          </p>

          <div className="pct-field">
            <label className="pct-label">
              Địa chỉ <span className="pct-required">*</span>
            </label>
            <input
              className="pct-input"
              type="text"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Số lô, đường, phường/xã, quận/huyện"
            />
            {errors.address && <div className="pct-error">{errors.address}</div>}
          </div>
        </div>
      </section>

      {/* ==== VỊ TRÍ ==== */}
      <section className="pct-section">
        <h3 className="pct-section-title">Vị trí BĐS</h3>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">Tên phân khu</label>
            <input
              className="pct-input"
              type="text"
              name="phanKhu"
              value={form.phanKhu}
              onChange={handleChange}
              placeholder="VD: Phân khu A"
            />
          </div>
        </div>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">Mã lô</label>
            <input
              className="pct-input"
              type="text"
              name="maLo"
              value={form.maLo}
              onChange={handleChange}
              placeholder="VD: Lô A12"
            />
          </div>
        </div>

        <label className="pct-checkbox">
          <input type="checkbox" />
          <span>Hiển thị mã lô trong tin rao</span>
        </label>
      </section>

      {/* ==== THÔNG TIN CHI TIẾT ==== */}
      <section className="pct-section">
        <h3 className="pct-section-title">Thông tin chi tiết</h3>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">
              Loại hình đất <span className="pct-required">*</span>
            </label>
            <select
              className="pct-input"
              name="landType"
              value={form.landType}
              onChange={handleChange}
            >
              <option value="">Chọn loại hình</option>
              <option>Đất nền dự án</option>
              <option>Đất thổ cư</option>
              <option>Đất nông nghiệp</option>
              <option>Đất khác</option>
            </select>
            {errors.landType && (
              <div className="pct-error">{errors.landType}</div>
            )}
          </div>
        </div>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">Hướng đất</label>
            <select
              className="pct-input"
              name="direction"
              value={form.direction}
              onChange={handleChange}
            >
              <option value="">Chọn</option>
              <option>Đông</option>
              <option>Tây</option>
              <option>Nam</option>
              <option>Bắc</option>
              <option>Đông Nam</option>
              <option>Đông Bắc</option>
              <option>Tây Nam</option>
              <option>Tây Bắc</option>
            </select>
          </div>
        </div>
      </section>

      {/* ==== THÔNG TIN KHÁC ==== */}
      <section className="pct-section">
        <h3 className="pct-section-title">Thông tin khác</h3>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">Giấy tờ pháp lý</label>
            <select
              className="pct-input"
              name="legal"
              value={form.legal}
              onChange={handleChange}
            >
              <option value="">Chọn</option>
              <option>Sổ đỏ</option>
              <option>Sổ hồng</option>
              <option>Giấy tờ khác</option>
            </select>
          </div>
        </div>
      </section>

      {/* ==== DIỆN TÍCH & GIÁ ==== */}
      <section className="pct-section">
        <h3 className="pct-section-title">Diện tích &amp; giá</h3>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">
              Diện tích đất <span className="pct-required">*</span>
            </label>
            <input
              className="pct-input"
              type="number"
              name="landArea"
              value={form.landArea}
              onChange={handleChange}
              placeholder="m²"
            />
            {errors.landArea && (
              <div className="pct-error">{errors.landArea}</div>
            )}
          </div>
        </div>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">Chiều ngang</label>
            <input
              className="pct-input"
              type="number"
              name="width"
              value={form.width}
              onChange={handleChange}
              placeholder="m"
            />
          </div>

          <div className="pct-field">
            <label className="pct-label">Chiều dài</label>
            <input
              className="pct-input"
              type="number"
              name="length"
              value={form.length}
              onChange={handleChange}
              placeholder="m"
            />
          </div>
        </div>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">
              {isRent ? "Giá thuê/tháng" : "Giá bán"}{" "}
              <span className="pct-required">*</span>
            </label>
            <input
              className="pct-input"
              type="number"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="VND"
            />
            {errors.price && <div className="pct-error">{errors.price}</div>}
          </div>
        </div>
      </section>

      {/* ==== TIÊU ĐỀ & MÔ TẢ ==== */}
      <section className="pct-section">
        <h3 className="pct-section-title">
          Tiêu đề tin đăng và Mô tả chi tiết
        </h3>

        <div className="pct-field-col">
          <div className="pct-field">
            <label className="pct-label">
              Tiêu đề tin đăng <span className="pct-required">*</span>
            </label>
            <input
              className="pct-input"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ví dụ: Bán đất 100m² mặt tiền đẹp..."
            />
            <div className="pct-help-text">{form.title.length}/70 kí tự</div>
            {errors.title && <div className="pct-error">{errors.title}</div>}
          </div>

          <div className="pct-field">
            <label className="pct-label">
              Mô tả chi tiết <span className="pct-required">*</span>
            </label>
            <textarea
              className="pct-textarea"
              rows={5}
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Nên có: loại đất, vị trí, diện tích, thổ cư, pháp lý..."
            />
            <div className="pct-help-text">
              {form.description.length}/1500 kí tự
            </div>
            {errors.description && (
              <div className="pct-error">{errors.description}</div>
            )}
          </div>
        </div>
      </section>

      {/* ==== NÚT SUBMIT ==== */}
      <div className="pct-actions-row">
        <button
          type="button"
          className="pct-btn pct-btn-primary"
          onClick={handleSubmit}
          disabled={busy}
        >
          {busy
            ? "Đang đăng..."
            : isRent
            ? "Đăng tin cho thuê"
            : "Đăng tin"}
        </button>
      </div>

      {/* ==== MODAL ==== */}
      <SimpleModal
        open={modalOpen}
        title={modalOpts.title}
        message={modalOpts.message}
        primaryLabel={modalOpts.primaryLabel}
        onPrimary={modalOpts.onPrimary}
        secondaryLabel={modalOpts.secondaryLabel}
        onSecondary={modalOpts.onSecondary}
      />
    </div>
  );
}
