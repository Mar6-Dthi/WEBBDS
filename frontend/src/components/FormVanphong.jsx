// src/components/FormVanphong.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FormVanphong({ estateType }) {
  const navigate = useNavigate();
  const [ownerType, setOwnerType] = useState("Cá nhân");
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

  const handleSubmit = () => {
    if (!validate()) return;

    const id = String(Date.now());
    // 🔴 LẤY ID USER TỪ LOCALSTORAGE (giống FormPhongtro)
    const ownerId = localStorage.getItem("accessToken") || "guest";

    // 🔴 LẤY MEDIA ĐÃ CHỌN Ở PostCreate
    const draftMedia = JSON.parse(
      localStorage.getItem("postDraftMedia") || "[]"
    );

    // Chuyển thành mảng src để PostDetail dùng
    const images = Array.isArray(draftMedia)
      ? draftMedia.filter((m) => !!m.src).map((m) => m.src)
      : [];

    const newPost = {
      id,
      ownerId, // ➕ thêm field này để Quản lý tin lọc theo user
      category: "Văn phòng, Mặt bằng kinh doanh",
      estateType, // "Cần bán" | "Cho thuê"

      title: form.title,
      description: form.description,
      address: form.address,

      price: Number(form.price),
      landArea: Number(form.area),
      usableArea: Number(form.area),
      bed: "",
      bath: "",
      direction: form.direction,
      floors: form.tang || "",
      houseType: form.officeType || "Văn phòng / Mặt bằng",
      legal: form.legal,
      interior: form.interior,
      ownerType,
      estateStatus: "",

      projectName: form.projectName,
      maCan: form.maCan,
      block: form.block,

      createdAt: new Date().toISOString(),

      // 🔴 ẢNH THẬT TỪ USER
      images,

      // fallback người bán
      sellerName: "Chủ văn phòng",
      sellerPhone: "0900000000",
    };

    const old = JSON.parse(localStorage.getItem("posts") || "[]");
    localStorage.setItem("posts", JSON.stringify([...old, newPost]));

    // xoá media tạm cho lần đăng sau
    localStorage.removeItem("postDraftMedia");

    navigate(`/post/${id}`);
  };

  return (
    <div className="pct-card pct-form-card">
      {/* ========== ĐỊA CHỈ BĐS VÀ HÌNH ẢNH ========== */}
      <section className="pct-section">
        <h3 className="pct-section-title">Địa chỉ BĐS và Hình ảnh</h3>

        <div className="pct-field-col">
          <div className="pct-field">
            <label className="pct-label">
              Tên toà nhà/khu dân cư/dự án
            </label>
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
