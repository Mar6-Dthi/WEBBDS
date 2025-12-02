// src/components/FormDat.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FormDat({ estateType }) {
  const navigate = useNavigate();

  const [ownerType, setOwnerType] = useState("Cá nhân");
  const isRent = estateType === "Cho thuê";

  // ==== STATE FORM ====
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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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

  const handleSubmit = () => {
    if (!validate()) return;

    // 🔑 Lấy ownerId để Quản lý tin
    const ownerId = localStorage.getItem("accessToken") || "guest";

    // 🔴 LẤY MEDIA ĐÃ UPLOAD Ở POSTCREATE
    const draftMedia = JSON.parse(
      localStorage.getItem("postDraftMedia") || "[]"
    );

    // Đưa về mảng src cho PostDetail
    const images = Array.isArray(draftMedia)
      ? draftMedia.filter((m) => !!m.src).map((m) => m.src)
      : [];

    const newPost = {
      id: String(Date.now()),
      ownerId, // 👈 gắn chủ tin
      category: "Đất",
      estateType, // "Cần bán" | "Cho thuê"

      title: form.title,
      description: form.description,
      address: form.address,

      price: Number(form.price),
      landArea: Number(form.landArea),
      usableArea: Number(form.landArea),
      bed: "",
      bath: "",
      direction: form.direction,
      floors: "",
      houseType: form.landType || "Đất",
      legal: form.legal,
      interior: "",
      ownerType,
      estateStatus: "",

      projectName: form.projectName,
      phanKhu: form.phanKhu,
      maLo: form.maLo,
      width: Number(form.width) || null,
      length: Number(form.length) || null,

      createdAt: new Date().toISOString(),

      // fallback người bán
      sellerName: "Người bán đất",
      sellerPhone: "0900000000",

      // ẢNH ĐỂ RENDER Ở PostDetail / MyPosts
      images,
    };

    const old = JSON.parse(localStorage.getItem("posts") || "[]");
    localStorage.setItem("posts", JSON.stringify([...old, newPost]));

    // XOÁ MEDIA DRAFT
    localStorage.removeItem("postDraftMedia");

    navigate(`/post/${newPost.id}`);
  };

  return (
    <div className="pct-card pct-form-card">
      {/* ========== ĐỊA CHỈ BĐS VÀ HÌNH ẢNH ========== */}
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

      {/* ========== THÔNG TIN CHI TIẾT ========== */}
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
              <option>Giấy tờ khác</option>
            </select>
          </div>
        </div>

        <div className="pct-feature-wrap">
          <div className="pct-feature-label">Đặc điểm nhà/đất</div>

          <div className="pct-feature-grid">
            <div className="pct-feature-col">
              <label className="pct-feature-item">
                <input type="checkbox" />
                <span>Mặt tiền</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" />
                <span>Nở hậu</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" />
                <span>Thổ cư 1 phần</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" />
                <span>Không có thổ cư</span>
              </label>
            </div>

            <div className="pct-feature-col">
              <label className="pct-feature-item">
                <input type="checkbox" />
                <span>Hẻm xe hơi</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" />
                <span>Chưa có thổ cư</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" />
                <span>Thổ cư toàn bộ</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" />
                <span>Hiện trạng khác</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* ========== DIỆN TÍCH & GIÁ ========== */}
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
              min="0"
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
              min="0"
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
              min="0"
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
              className="pct-input"
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ví dụ: Bán đất 100m², thổ cư 50m², mặt tiền đường lớn..."
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
              placeholder="Nên có: loại đất, vị trí, diện tích, thổ cư, pháp lý, hạ tầng xung quanh..."
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
          {isRent ? "Đăng tin cho thuê" : "Đăng tin"}
        </button>
      </div>
    </div>
  );
}
