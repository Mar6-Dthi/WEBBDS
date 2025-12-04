// src/components/FormPhongtro.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FormPhongtro() {
  const navigate = useNavigate();
  const [ownerType, setOwnerType] = useState("Cá nhân");

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

  function handleSubmit() {
    if (!validate()) return;

    const id = String(Date.now());
    const ownerId = localStorage.getItem("accessToken") || "guest";

    // 👉 gắn môi giới
    const isBroker = ownerType === "Môi giới";

    // 👉 đọc gói hội viên (nếu có)
    const membershipPlanId =
      localStorage.getItem(`membershipPlan_${ownerId}`) || null;

    // LẤY MEDIA đã upload từ PostCreate
    const draftMedia = JSON.parse(
      localStorage.getItem("postDraftMedia") || "[]"
    );

    // Chuyển về mảng src để PostDetail dùng
    const images = Array.isArray(draftMedia)
      ? draftMedia.filter((m) => !!m.src).map((m) => m.src)
      : [];

    const newPost = {
      id,
      ownerId,
      category: "Phòng trọ",
      estateType, // cho thuê

      title: form.title,
      description: form.description,
      address: form.address,

      price: Number(form.price),
      landArea: Number(form.area),
      usableArea: Number(form.area),
      bed: "",
      bath: "",
      direction: "",
      floors: "",
      houseType: "Phòng trọ",
      legal: "",
      interior: form.interior,
      ownerType,
      estateStatus: "",

      deposit: form.deposit,

      createdAt: new Date().toISOString(),

      images,

      sellerName: "Người cho thuê",
      sellerPhone: "0900000000",

      // ⭐ Thêm quyền ưu tiên hiển thị
      isBroker,          // gắn badge môi giới
      membershipPlanId,  // ưu tiên theo gói hội viên
    };

    const old = JSON.parse(localStorage.getItem("posts") || "[]");
    localStorage.setItem("posts", JSON.stringify([...old, newPost]));

    // xoá media cho lần sau
    localStorage.removeItem("postDraftMedia");

    navigate(`/post/${id}`);
  }

  return (
    <div className="pct-card pct-form-card">
      {/* ========== ĐỊA CHỈ BĐS VÀ HÌNH ẢNH ========== */}
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

      {/* ========== BẠN LÀ ========== */}
      <section className="pct-section">
        <h3 className="pct-section-title">Bạn là</h3>

        <div className="pct-field">
          <span className="pct-label">Cá nhân/Môi giới *</span>
          <div className="pct-pill-group">
            <button
              type="button"
              className={
                "pct-pill" +
                (ownerType === "Cá nhân" ? " pct-pill--active" : "")
              }
              onClick={() => setOwnerType("Cá nhân")}
            >
              Cá nhân
            </button>
            <button
              type="button"
              className={
                "pct-pill" +
                (ownerType === "Môi giới" ? " pct-pill--active" : "")
              }
              onClick={() => setOwnerType("Môi giới")}
            >
              Môi giới
            </button>
          </div>
        </div>
      </section>

      {/* ========== ACTION BUTTONS ========== */}
      <div className="pct-actions-row">
        <button type="button" className="pct-btn pct-btn-outline">
          Xem trước
        </button>
        <button type="button" className="pct-btn pct-btn-outline">
          Lưu nháp
        </button>
        <button
          type="button"
          className="pct-btn pct-btn-primary"
          onClick={handleSubmit}
        >
          Đăng tin
        </button>
      </div>
    </div>
  );
}
