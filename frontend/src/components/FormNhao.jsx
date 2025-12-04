// src/components/FormNhao.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function FormNhao({ estateType }) {
  const navigate = useNavigate();

  const [ownerType, setOwnerType] = useState("Cá nhân");
  const isRent = estateType === "Cho thuê";

  // ==== STATE GOM DỮ LIỆU CHÍNH ====
  const [projectName, setProjectName] = useState("");
  const [address, setAddress] = useState("");
  const [maCan, setMaCan] = useState("");
  const [phanKhu, setPhanKhu] = useState("");

  const [loaiNha, setLoaiNha] = useState("");
  const [phongNgu, setPhongNgu] = useState("");
  const [phongVs, setPhongVs] = useState("");
  const [huong, setHuong] = useState("");
  const [soTang, setSoTang] = useState("");

  const [phapLy, setPhapLy] = useState("");
  const [noiThat, setNoiThat] = useState("");

  const [dienTichDat, setDienTichDat] = useState("");
  const [dienTichSd, setDienTichSd] = useState("");
  const [chieuNgang, setChieuNgang] = useState("");
  const [chieuDai, setChieuDai] = useState("");
  const [gia, setGia] = useState("");

  const [tieuDe, setTieuDe] = useState("");
  const [moTa, setMoTa] = useState("");

  // ==== SUBMIT: LƯU TIN + CHUYỂN SANG CHI TIẾT ====
  const handleSubmit = () => {
    // validate cơ bản
    if (!address || !dienTichDat || !gia || !tieuDe || !moTa) {
      alert(
        "Vui lòng nhập đầy đủ Địa chỉ, Diện tích đất, Giá, Tiêu đề, Mô tả."
      );
      return;
    }

    const id = Date.now().toString();
    const ownerId = localStorage.getItem("accessToken") || "guest";

    // 👉 xác định môi giới / cá nhân
    const isBroker = ownerType === "Môi giới";

    // 👉 đọc gói hội viên (nếu có)
    // VD ở trang đăng ký hội viên:
    // localStorage.setItem(`membershipPlan_${ownerId}`, "p20");
    const membershipPlanId =
      localStorage.getItem(`membershipPlan_${ownerId}`) || null;

    // 🔴 LẤY MEDIA TỪ POSTCREATE (ảnh/video user đã chọn)
    const draftMedia = JSON.parse(
      localStorage.getItem("postDraftMedia") || "[]"
    );

    // chuyển về mảng src để PostDetail dùng làm gallery
    const images = Array.isArray(draftMedia)
      ? draftMedia.filter((m) => !!m.src).map((m) => m.src)
      : [];

    const newPost = {
      id,
      ownerId, // 👈 để lọc trong trang Quản lý tin
      category: "Nhà ở", // khớp với pureCategory trong PostCreate
      estateType, // "Cần bán" | "Cho thuê"

      title: tieuDe,
      description: moTa,
      address,
      projectName,
      maCan,
      phanKhu,
      ownerType, // "Cá nhân" | "Môi giới"

      // thông tin chi tiết
      houseType: loaiNha || "Nhà ở",
      bed: phongNgu,
      bath: phongVs,
      direction: huong,
      floors: soTang,
      legal: phapLy,
      interior: noiThat,

      // diện tích & giá
      landArea: Number(dienTichDat) || null,
      usableArea: Number(dienTichSd) || null,
      width: Number(chieuNgang) || null,
      length: Number(chieuDai) || null,
      price: Number(gia) || null,

      // ưu tiên hiển thị
      isBroker,          // 👈 chọn Môi giới → card gắn badge + ưu tiên môi giới
      membershipPlanId,  // 👈 dùng để ưu tiên hội viên gói cao

      createdAt: new Date().toISOString(),

      // 🔴 ẢNH THẬT TỪ NGƯỜI DÙNG (PostDetail sẽ dùng post.images)
      images,

      // fallback người bán (PostDetail có default nhưng để sẵn)
      sellerName: "Người bán",
      sellerPhone: "0900000000",
    };

    const old = JSON.parse(localStorage.getItem("posts") || "[]");
    localStorage.setItem("posts", JSON.stringify([...old, newPost]));

    // 🔴 XOÁ MEDIA DRAFT ĐỂ TIN SAU KHÔNG DÍNH LẠI
    localStorage.removeItem("postDraftMedia");

    // chuyển sang trang chi tiết tin
    navigate(`/post/${id}`);
  };

  return (
    <div className="pct-card pct-form-card">
      {/* Địa chỉ BĐS và Hình ảnh */}
      <section className="pct-section">
        <h3 className="pct-section-title">Địa chỉ BĐS và Hình ảnh</h3>

        <div className="pct-field-col">
          <div className="pct-field">
            <label className="pct-label">Tên khu dân cư/dự án</label>
            <input
              className="pct-input"
              type="text"
              placeholder="Nhập tên khu dân cư hoặc dự án"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
            />
          </div>

          <div className="pct-field">
            <label className="pct-label">
              Địa chỉ <span className="pct-required">*</span>
            </label>
            <input
              className="pct-input"
              type="text"
              placeholder="Số nhà, đường, phường/xã, quận/huyện"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
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
              placeholder="VD: N-12"
              value={maCan}
              onChange={(e) => setMaCan(e.target.value)}
            />
          </div>

          <div className="pct-field">
            <label className="pct-label">Tên phân khu/lô</label>
            <input
              className="pct-input"
              type="text"
              placeholder="VD: Khu A, lô 12"
              value={phanKhu}
              onChange={(e) => setPhanKhu(e.target.value)}
            />
          </div>
        </div>

        <label className="pct-checkbox">
          <input type="checkbox" />
          <span>Hiển thị mã căn rao tin</span>
        </label>
      </section>

      {/* Thông tin chi tiết */}
      <section className="pct-section">
        <h3 className="pct-section-title">Thông tin chi tiết</h3>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">
              Loại hình nhà ở <span className="pct-required">*</span>
            </label>
            <select
              className="pct-input"
              value={loaiNha}
              onChange={(e) => setLoaiNha(e.target.value)}
            >
              <option value="">Chọn loại hình</option>
              <option>Nhà mặt tiền</option>
              <option>Nhà hẻm</option>
              <option>Biệt thự</option>
              <option>Nhà vườn</option>
            </select>
          </div>
        </div>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">
              Số phòng ngủ <span className="pct-required">*</span>
            </label>
            <select
              className="pct-input"
              value={phongNgu}
              onChange={(e) => setPhongNgu(e.target.value)}
            >
              <option value="">Chọn</option>
              <option>1</option>
              <option>2</option>
              <option>3</option>
              <option>4+</option>
            </select>
          </div>

          <div className="pct-field">
            <label className="pct-label">
              Số phòng vệ sinh <span className="pct-required">*</span>
            </label>
            <select
              className="pct-input"
              value={phongVs}
              onChange={(e) => setPhongVs(e.target.value)}
            >
              <option value="">Chọn</option>
              <option>1</option>
              <option>2</option>
              <option>3+</option>
            </select>
          </div>
        </div>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">Hướng cửa chính</label>
            <select
              className="pct-input"
              value={huong}
              onChange={(e) => setHuong(e.target.value)}
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
            <label className="pct-label">Tổng số tầng</label>
            <input
              className="pct-input"
              type="number"
              min="0"
              placeholder="VD: 3"
              value={soTang}
              onChange={(e) => setSoTang(e.target.value)}
            />
          </div>
        </div>
      </section>

      {/* Thông tin khác + Đặc điểm nhà/đất */}
      <section className="pct-section">
        <h3 className="pct-section-title">Thông tin khác</h3>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">
              Giấy tờ pháp lý <span className="pct-required">*</span>
            </label>
            <select
              className="pct-input"
              value={phapLy}
              onChange={(e) => setPhapLy(e.target.value)}
            >
              <option value="">Chọn</option>
              <option>Sổ hồng</option>
              <option>Sổ đỏ</option>
              <option>Giấy tờ khác</option>
            </select>
          </div>

          <div className="pct-field">
            <label className="pct-label">Tình trạng nội thất</label>
            <select
              className="pct-input"
              value={noiThat}
              onChange={(e) => setNoiThat(e.target.value)}
            >
              <option value="">Chọn</option>
              <option>Hoàn thiện cơ bản</option>
              <option>Đầy đủ nội thất</option>
              <option>Chưa có nội thất</option>
            </select>
          </div>
        </div>

        {/* Đặc điểm nhà/đất */}
        <div className="pct-feature-wrap">
          <div className="pct-feature-label">Đặc điểm nhà/đất</div>
          <div className="pct-feature-grid">
            <div className="pct-feature-col">
              <label className="pct-feature-item">
                <input type="checkbox" />
                <span>Hẻm xe hơi</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" />
                <span>Nhà tóp hậu</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" />
                <span>Nhà chưa hoàn công</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" />
                <span>Đất chưa chuyển thổ</span>
              </label>
            </div>

            <div className="pct-feature-col">
              <label className="pct-feature-item">
                <input type="checkbox" />
                <span>Nhà nở hậu</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" />
                <span>Nhà dính quy hoạch / lộ giới</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" />
                <span>Nhà nát</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" />
                <span>Hiện trạng khác</span>
              </label>
            </div>
          </div>
        </div>
      </section>

      {/* Diện tích & giá */}
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
              placeholder="m²"
              value={dienTichDat}
              onChange={(e) => setDienTichDat(e.target.value)}
            />
          </div>

          <div className="pct-field">
            <label className="pct-label">Diện tích sử dụng</label>
            <input
              className="pct-input"
              type="number"
              min="0"
              placeholder="m²"
              value={dienTichSd}
              onChange={(e) => setDienTichSd(e.target.value)}
            />
          </div>
        </div>

        <div className="pct-field-row">
          <div className="pct-field">
            <label className="pct-label">Chiều ngang</label>
            <input
              className="pct-input"
              type="number"
              min="0"
              placeholder="m"
              value={chieuNgang}
              onChange={(e) => setChieuNgang(e.target.value)}
            />
          </div>

          <div className="pct-field">
            <label className="pct-label">Chiều dài</label>
            <input
              className="pct-input"
              type="number"
              min="0"
              placeholder="m"
              value={chieuDai}
              onChange={(e) => setChieuDai(e.target.value)}
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
              placeholder="VND"
              value={gia}
              onChange={(e) => setGia(e.target.value)}
            />
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
              placeholder="Ví dụ: Bán nhà hẻm xe hơi, 2 tầng, 60m², gần trung tâm..."
              value={tieuDe}
              onChange={(e) => setTieuDe(e.target.value)}
            />
            <div className="pct-help-text">
              {tieuDe.length}/70 kí tự
            </div>
          </div>

          <div className="pct-field">
            <label className="pct-label">
              Mô tả chi tiết <span className="pct-required">*</span>
            </label>
            <textarea
              className="pct-textarea"
              rows={5}
              placeholder="Nên có: loại nhà, vị trí, diện tích, tiện ích xung quanh, pháp lý, nội thất..."
              value={moTa}
              onChange={(e) => setMoTa(e.target.value)}
            />
            <div className="pct-help-text">
              {moTa.length}/1500 kí tự
            </div>
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
