// src/components/FormCanho.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FormCanho({ estateType }) {
  const navigate = useNavigate();

  const [estateStatus, setEstateStatus] = useState("Chưa bàn giao");
  const [ownerType, setOwnerType] = useState("Cá nhân"); // "Cá nhân" | "Môi giới"

  const isRent = estateType === "Cho thuê";

  // ==== STATE FORM ====
  const [form, setForm] = useState({
    projectName: "",
    address: "",
    maCan: "",
    block: "",
    tang: "",
    houseType: "",
    bed: "",
    bath: "",
    balconyDirection: "",
    doorDirection: "",
    legal: "",
    interior: "",
    isCorner: false,
    area: "",
    price: "",
    title: "",
    description: "",
  });

  const [errors, setErrors] = useState({});

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  }

  function validate() {
    const next = {};
    if (!form.address.trim()) next.address = "Vui lòng nhập địa chỉ";
    if (!form.houseType) next.houseType = "Vui lòng chọn loại hình";
    if (!form.bed) next.bed = "Vui lòng chọn số phòng ngủ";
    if (!form.bath) next.bath = "Vui lòng chọn số phòng vệ sinh";
    if (!form.area) next.area = "Vui lòng nhập diện tích";
    if (!form.price) next.price = "Vui lòng nhập giá";
    if (!form.title.trim()) next.title = "Vui lòng nhập tiêu đề tin";
    if (!form.description.trim()) next.description = "Vui lòng nhập mô tả";

    setErrors(next);
    return Object.keys(next).length === 0;
  }

  function handleSubmit() {
    if (!validate()) return;

    // 🔑 Lấy ID user hiện tại (dùng để Quản lý tin)
    const ownerId = localStorage.getItem("accessToken") || "guest";

    // Lấy media đã upload bên PostCreate
    const draftMedia = JSON.parse(
      localStorage.getItem("postDraftMedia") || "[]"
    );

    // Chuyển thành mảng src (PostDetail đang đọc post.images)
    const images = Array.isArray(draftMedia)
      ? draftMedia
          .filter((m) => !!m.src) // có src
          .map((m) => m.src)
      : [];

    // 👇 Xác định môi giới / cá nhân
    const isBroker = ownerType === "Môi giới";

    // 👇 Đọc gói hội viên hiện tại của user (nếu có)
    // Ví dụ ở trang đăng ký hội viên:
    // localStorage.setItem(`membershipPlan_${ownerId}`, "p20");
    const membershipPlanId =
      localStorage.getItem(`membershipPlan_${ownerId}`) || null;

    const newPost = {
      id: String(Date.now()),
      ownerId, // ID chủ tin
      category: "Căn hộ/Chung cư",
      estateType, // "Cần bán" | "Cho thuê"

      title: form.title,
      description: form.description,
      address: form.address,

      // thông tin chính cho PostDetail
      price: Number(form.price),
      landArea: Number(form.area),
      usableArea: Number(form.area),
      bed: form.bed,
      bath: form.bath,
      direction: form.doorDirection || form.balconyDirection || "",
      floors: form.tang || "",
      houseType: form.houseType || "Căn hộ",
      legal: form.legal,
      interior: form.interior,
      ownerType, // "Cá nhân" | "Môi giới"
      estateStatus,

      // field phụ
      projectName: form.projectName,
      maCan: form.maCan,
      block: form.block,
      isCorner: form.isCorner,

      // trạng thái môi giới + hội viên (dùng cho ưu tiên hiển thị)
      isBroker,          // 👈 Form chọn "Môi giới" → gắn badge môi giới
      membershipPlanId,  // 👈 nếu user có gói hội viên → ưu tiên xếp hạng

      // thời gian tạo tin
      createdAt: new Date().toISOString(),

      // fallback thông tin người bán
      sellerName: "Người bán",
      sellerPhone: "0900000000",

      // ẢNH dùng để render ở PostDetail / MyPosts
      images,
    };

    const old = JSON.parse(localStorage.getItem("posts") || "[]");
    localStorage.setItem("posts", JSON.stringify([...old, newPost]));

    // Xoá media tạm để tin sau không dính lại
    localStorage.removeItem("postDraftMedia");

    navigate(`/post/${newPost.id}`);
  }

  return (
    <div className="pct-card pct-form-card">
      {/* Địa chỉ BĐS và Hình ảnh */}
      <section className="pct-section">
        <h3 className="pct-section-title">Địa chỉ BĐS và Hình ảnh</h3>

        <div className="pct-field-col">
          <div className="pct-field">
            <label className="pct-label">Tên toà nhà/khu dân cư/dự án</label>
            <input
              className="pct-input"
              type="text"
              name="projectName"
              value={form.projectName}
              onChange={handleChange}
              placeholder="Nhập tên toà nhà hoặc dự án"
            />
          </div>

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
              placeholder="Số nhà, đường, phường/xã, quận/huyện"
            />
            {errors.address && (
              <div className="pct-error">{errors.address}</div>
            )}
          </div>
        </div>
      </section>

      {/* Vị trí BĐS */}
      <section className="pct-section">
        <h3 className="pct-section-title">Vị trí BĐS</h3>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">Mã căn</label>
            <input
              className="pct-input"
              type="text"
              name="maCan"
              value={form.maCan}
              onChange={handleChange}
              placeholder="VD: A-12.09"
            />
          </div>

          <div className="pct-field">
            <label className="pct-label">Block/Tháp</label>
            <input
              className="pct-input"
              type="text"
              name="block"
              value={form.block}
              onChange={handleChange}
              placeholder="VD: Block A"
            />
          </div>
        </div>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">Tầng số</label>
            <input
              className="pct-input"
              type="number"
              min="0"
              name="tang"
              value={form.tang}
              onChange={handleChange}
              placeholder="VD: 12"
            />
          </div>
        </div>

        <label className="pct-checkbox">
          <input type="checkbox" />
          <span>Hiển thị mã căn hộ rao tin</span>
        </label>
      </section>

      {/* Thông tin chi tiết */}
      <section className="pct-section">
        <h3 className="pct-section-title">Thông tin chi tiết</h3>

        <div className="pct-field">
          <span className="pct-label">
            Tình trạng bất động sản <span className="pct-required">*</span>
          </span>
          <div className="pct-pill-group">
            <button
              type="button"
              className={
                "pct-pill" +
                (estateStatus === "Chưa bàn giao" ? " pct-pill--active" : "")
              }
              onClick={() => setEstateStatus("Chưa bàn giao")}
            >
              Chưa bàn giao
            </button>
            <button
              type="button"
              className={
                "pct-pill" +
                (estateStatus === "Đã bàn giao" ? " pct-pill--active" : "")
              }
              onClick={() => setEstateStatus("Đã bàn giao")}
            >
              Đã bàn giao
            </button>
          </div>
        </div>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">
              Loại hình căn hộ <span className="pct-required">*</span>
            </label>
            <select
              className="pct-input"
              name="houseType"
              value={form.houseType}
              onChange={handleChange}
            >
              <option value="">Chọn loại hình</option>
              <option value="Căn hộ chung cư">Căn hộ chung cư</option>
              <option value="Căn hộ Studio">Căn hộ Studio</option>
              <option value="Duplex">Duplex</option>
              <option value="Penthouse">Penthouse</option>
            </select>
            {errors.houseType && (
              <div className="pct-error">{errors.houseType}</div>
            )}
          </div>
        </div>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">
              Số phòng ngủ <span className="pct-required">*</span>
            </label>
            <select
              className="pct-input"
              name="bed"
              value={form.bed}
              onChange={handleChange}
            >
              <option value="">Chọn</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4+">4+</option>
            </select>
            {errors.bed && <div className="pct-error">{errors.bed}</div>}
          </div>

          <div className="pct-field">
            <label className="pct-label">
              Số phòng vệ sinh <span className="pct-required">*</span>
            </label>
            <select
              className="pct-input"
              name="bath"
              value={form.bath}
              onChange={handleChange}
            >
              <option value="">Chọn</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3+">3+</option>
            </select>
            {errors.bath && <div className="pct-error">{errors.bath}</div>}
          </div>
        </div>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">Hướng ban công</label>
            <select
              className="pct-input"
              name="balconyDirection"
              value={form.balconyDirection}
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

          <div className="pct-field">
            <label className="pct-label">Hướng cửa chính</label>
            <select
              className="pct-input"
              name="doorDirection"
              value={form.doorDirection}
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

      {/* Thông tin khác */}
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
              <option>Sổ hồng</option>
              <option>Hợp đồng mua bán</option>
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
              <option>Hoàn thiện cơ bản</option>
              <option>Đầy đủ nội thất</option>
              <option>Chưa có nội thất</option>
            </select>
          </div>
        </div>

        <label className="pct-checkbox">
          <input
            type="checkbox"
            name="isCorner"
            checked={form.isCorner}
            onChange={handleChange}
          />
          <span>Căn góc</span>
        </label>
      </section>

      {/* Diện tích & giá */}
      <section className="pct-section">
        <h3 className="pct-section-title">Diện tích &amp; giá</h3>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">
              Diện tích <span className="pct-required">*</span>
            </label>
            <input
              className="pct-input"
              type="number"
              min="0"
              name="area"
              value={form.area}
              onChange={handleChange}
              placeholder="m²"
            />
            {errors.area && <div className="pct-error">{errors.area}</div>}
          </div>

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

      {/* Tiêu đề & mô tả */}
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
              placeholder="Ví dụ: Bán căn hộ 2PN, 70m², view nội khu yên tĩnh..."
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
              placeholder="Nên có: loại căn hộ, vị trí, tiện ích, diện tích, số phòng, pháp lý, nội thất..."
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

      {/* Bạn là */}
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

      {/* Nút hành động */}
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
          {estateType === "Cho thuê" ? "Đăng tin cho thuê" : "Đăng tin"}
        </button>
      </div>
    </div>
  );
}
