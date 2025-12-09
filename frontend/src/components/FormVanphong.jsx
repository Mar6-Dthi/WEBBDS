// src/components/FormVanphong.jsx
import React, { useState } from "react";

/* ===== Simple modal for messages ===== */
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

export default function FormVanphong({ estateType, onSubmit }) {
  const isRent = estateType === "Cho thuê";

  // ===== STATE FORM =====
  const [form, setForm] = useState({
    projectName: "",
    address: "",
    maCan: "",
    block: "",
    tang: "",
    officeType: "",
    direction: "",
    legal: "",
    interior: "",
    area: "",
    price: "",
    title: "",
    description: "",
  });

  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);

  // modal (phòng khi thiếu onSubmit hoặc lỗi chung)
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const next = {};
    if (!form.address.trim()) next.address = "Vui lòng nhập địa chỉ";
    if (!form.officeType) next.officeType = "Vui lòng chọn loại hình";
    if (!form.area) next.area = "Vui lòng nhập diện tích";
    if (!form.price) next.price = "Vui lòng nhập giá";
    if (!form.title.trim()) next.title = "Vui lòng nhập tiêu đề tin";
    if (!form.description.trim()) next.description = "Vui lòng nhập mô tả";

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleSubmit = async () => {
    if (busy) return;
    if (!validate()) return;

    if (typeof onSubmit !== "function") {
      openModal({
        title: "Lỗi cấu hình",
        message: "FormVanphong chưa được truyền hàm onSubmit.",
      });
      return;
    }

    setBusy(true);
    try {
      const areaNum = form.area ? Number(form.area) : 0;
      const priceNum = form.price ? Number(form.price) : 0;

      const payload = {
        // các field chung mà PostCreate / MyPosts dùng
        title: form.title.trim(),
        description: form.description.trim(),
        address: form.address.trim(),

        price: priceNum,
        area: areaNum,
        landArea: areaNum,
        usableArea: areaNum,

        bed: "",
        bath: "",
        direction: form.direction,
        floors: form.tang || "",
        houseType: form.officeType || "Văn phòng / Mặt bằng",
        legal: form.legal,
        interior: form.interior,

        projectName: form.projectName,
        maCan: form.maCan,
        block: form.block,

        estateType, // "Cần bán" | "Cho thuê"
      };

      const result = onSubmit(payload);
      if (result instanceof Promise) await result;
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="pct-card pct-form-card">
      {/* ========== ĐỊA CHỈ BĐS VÀ HÌNH ẢNH ========== */}
      <section className="pct-section">
        <h3 className="pct-section-title">Tên toà nhà/khu dân cư/dự án</h3>

        <div className="pct-field-col">
          <div className="pct-field">
            <input
              type="text"
              className="pct-input"
              name="projectName"
              value={form.projectName}
              onChange={handleChange}
              placeholder="Nhập tên toà nhà, khu dân cư hoặc dự án"
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

      {/* ========== VỊ TRÍ BĐS ========== */}
      <section className="pct-section">
        <h3 className="pct-section-title">Vị trí BĐS</h3>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">Mã căn</label>
            <input
              type="text"
              className="pct-input"
              name="maCan"
              value={form.maCan}
              onChange={handleChange}
              placeholder="VD: VP-12A"
            />
          </div>
        </div>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">Block/Tháp</label>
            <input
              type="text"
              className="pct-input"
              name="block"
              value={form.block}
              onChange={handleChange}
              placeholder="VD: Tháp A"
            />
          </div>
        </div>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">Tầng số</label>
            <input
              type="number"
              className="pct-input"
              min="0"
              name="tang"
              value={form.tang}
              onChange={handleChange}
              placeholder="VD: 5"
            />
          </div>
        </div>

        <label className="pct-checkbox">
          <input type="checkbox" />
          <span>Hiển thị mã căn hộ rao tin</span>
        </label>
      </section>

      {/* ========== THÔNG TIN CHI TIẾT ========== */}
      <section className="pct-section">
        <h3 className="pct-section-title">Thông tin chi tiết</h3>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">
              Loại hình văn phòng <span className="pct-required">*</span>
            </label>
            <select
              className="pct-input"
              name="officeType"
              value={form.officeType}
              onChange={handleChange}
            >
              <option value="">Chọn loại hình</option>
              <option>Văn phòng</option>
              <option>Mặt bằng kinh doanh</option>
              <option>Shophouse</option>
              <option>Ki-ốt</option>
              <option>Loại khác</option>
            </select>
            {errors.officeType && (
              <div className="pct-error">{errors.officeType}</div>
            )}
          </div>
        </div>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">Hướng cửa chính</label>
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

      {/* ========== THÔNG TIN KHÁC ========== */}
      <section className="pct-section">
        <h3 className="pct-section-title">Thông tin khác</h3>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">
              Giấy tờ pháp lý <span className="pct-required">*</span>
            </label>
            <select
              className="pct-input"
              name="legal"
              value={form.legal}
              onChange={handleChange}
            >
              <option value="">Chọn</option>
              <option>Sổ đỏ</option>
              <option>Sổ hồng</option>
              <option>Hợp đồng thuê</option>
              <option>Giấy tờ khác</option>
            </select>
          </div>

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
              className="pct-input"
              min="0"
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
              {isRent ? "Giá thuê/tháng" : "Giá bán"}{" "}
              <span className="pct-required">*</span>
            </label>
            <input
              type="number"
              className="pct-input"
              min="0"
              name="price"
              value={form.price}
              onChange={handleChange}
              placeholder="VND"
            />
            {errors.price && <div className="pct-error">{errors.price}</div>}
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
              placeholder="Ví dụ: Cho thuê mặt bằng kinh doanh 200m², mặt tiền đường lớn..."
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
              placeholder="Nên có: loại văn phòng/mặt bằng, vị trí, tiện ích, diện tích, pháp lý, nội thất, v.v."
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
          {busy
            ? isRent
              ? "Đang đăng..."
              : "Đang đăng..."
            : isRent
            ? "Đăng tin cho thuê"
            : "Đăng tin"}
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
