// src/components/FormPhongtro.jsx
import React, { useState } from "react";

/* ===== Simple modal for messages (nếu cần) ===== */
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
   FORM PHÒNG TRỌ – FE SẠCH
   - Không localStorage, không quota, không navigate
   - Chỉ validate + gom payload + gọi onSubmit(payload)
   - Phòng trọ mặc định estateType = "Cho thuê"
=============================================================== */

export default function FormPhongtro({ onSubmit }) {
  // Phòng trọ mặc định là cho thuê
  const estateType = "Cho thuê";

  const [form, setForm] = useState({
    address: "",
    interior: "",
    area: "",
    price: "",
    deposit: "",
    title: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  // modal (dùng khi thiếu onSubmit hoặc báo lỗi chung)
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpts, setModalOpts] = useState({
    title: "",
    message: "",
    primaryLabel: "Đóng",
    secondaryLabel: null,
    onPrimary: null,
    onSecondary: null,
  });

  function openModal(opts = {}) {
    setModalOpts({
      title: opts.title || "Thông báo",
      message: opts.message || "",
      primaryLabel: opts.primaryLabel || "Đóng",
      secondaryLabel: opts.secondaryLabel || null,
      onPrimary: opts.onPrimary || (() => setModalOpen(false)),
      onSecondary: opts.onSecondary || (() => setModalOpen(false)),
    });
    setModalOpen(true);
  }
  function closeModal() {
    setModalOpen(false);
  }

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function validate() {
    const next = {};
    if (!form.address.trim()) next.address = "Vui lòng nhập địa chỉ";
    if (!form.area) next.area = "Vui lòng nhập diện tích";
    if (!form.price) next.price = "Vui lòng nhập giá thuê";
    if (!form.title.trim()) next.title = "Vui lòng nhập tiêu đề tin";
    if (!form.description.trim()) next.description = "Vui lòng nhập mô tả";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  const handleSubmit = async () => {
    if (busy) return;
    if (!validate()) return;

    if (typeof onSubmit !== "function") {
      openModal({
        title: "Lỗi cấu hình",
        message: "FormPhongtro chưa được truyền hàm onSubmit.",
      });
      return;
    }

    setBusy(true);
    try {
      const areaNum = form.area ? Number(form.area) : 0;
      const priceNum = form.price ? Number(form.price) : 0;
      const depositNum = form.deposit ? Number(form.deposit) : null;

      const payload = {
        // các field chung mà PostCreate / MyPosts dùng
        title: form.title.trim(),
        description: form.description.trim(),
        address: form.address.trim(),

        price: priceNum,
        area: areaNum,
        landArea: areaNum,
        usableArea: areaNum,

        houseType: "Phòng trọ",
        interior: form.interior,
        deposit: depositNum,

        estateType, // "Cho thuê"
      };

      const result = onSubmit(payload);
      if (result instanceof Promise) await result;
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pct-card pct-form-card">
      {/* ========== ĐỊA CHỈ BĐS ========== */}
      <section className="pct-section">
        <h3 className="pct-section-title">Địa chỉ BĐS và Hình ảnh</h3>

        <div className="pct-field-col">
          <div className="pct-field">
            <label className="pct-label">
              Địa chỉ <span className="pct-required">*</span>
            </label>
            <input
              type="text"
              className="pct-input"
              name="address"
              value={form.address}
              onChange={handleChange}
              placeholder="Số nhà, đường, phường/xã, quận/huyện"
            />
            {errors.address && (
              <div className="pct-error">{errors.address}</div>
            )}
          </div>
        </div>
      </section>

      {/* ========== THÔNG TIN KHÁC ========== */}
      <section className="pct-section">
        <h3 className="pct-section-title">Thông tin khác</h3>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">Tình trạng nội thất</label>
            <select
              className="pct-input"
              name="interior"
              value={form.interior}
              onChange={handleChange}
            >
              <option value="">Chọn</option>
              <option>Không nội thất</option>
              <option>Cơ bản</option>
              <option>Đầy đủ</option>
            </select>
          </div>
        </div>
      </section>

      {/* ========== DIỆN TÍCH & GIÁ ========== */}
      <section className="pct-section">
        <h3 className="pct-section-title">Diện tích &amp; giá</h3>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">
              Diện tích <span className="pct-required">*</span>
            </label>
            <input
              type="number"
              min="0"
              className="pct-input"
              name="area"
              value={form.area}
              onChange={handleChange}
              placeholder="m²"
            />
            {errors.area && <div className="pct-error">{errors.area}</div>}
          </div>
        </div>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">
              Giá thuê <span className="pct-required">*</span>
            </label>
            <input
              type="number"
              min="0"
              className="pct-input"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="VND/tháng"
            />
            {errors.price && <div className="pct-error">{errors.price}</div>}
          </div>
        </div>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">Số tiền cọc</label>
            <input
              type="number"
              min="0"
              className="pct-input"
              name="deposit"
              value={form.deposit}
              onChange={handleChange}
              placeholder="VND"
            />
          </div>
        </div>
      </section>

      {/* ========== TIÊU ĐỀ & MÔ TẢ CHI TIẾT ========== */}
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
              type="text"
              className="pct-input"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ví dụ: Phòng trọ 30m², gần trường, đầy đủ nội thất..."
            />
            <div className="pct-help-text">
              {form.title.length}/70 kí tự
            </div>
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
              placeholder="Nên có: loại phòng trọ, vị trí, diện tích, tiện ích, nội thất, v.v."
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

      {/* ========== ACTION BUTTON ========== */}
      <div className="pct-actions-row">
        <button
          type="button"
          className="pct-btn pct-btn-primary"
          onClick={handleSubmit}
          disabled={busy}
        >
          {busy ? "Đang đăng..." : "Đăng tin"}
        </button>
      </div>

      {/* Modal */}
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
