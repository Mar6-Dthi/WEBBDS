// src/components/FormNhao.jsx
import React, { useState } from "react";

/* ===== Simple modal để dùng khi cần thông báo (tuỳ chọn) ===== */
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
    FORM NHÀ Ở - FE SẠCH
    KHÔNG LƯU STORAGE, KHÔNG QUOTA, KHÔNG NAVIGATE
    CHỈ GỌI onSubmit(payload)
===============================================================*/

export default function FormNhao({ estateType, onSubmit }) {
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

  const [busy, setBusy] = useState(false);

  // errors inline
  const [errors, setErrors] = useState({});

  // modal (chỉ dùng cho lỗi cấu hình / lỗi khác)
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

  // ==== VALIDATE CƠ BẢN ==== 
  const validate = () => {
    const next = {};

    if (!address?.toString().trim()) {
      next.address = "Vui lòng nhập địa chỉ";
    }
    if (!dienTichDat?.toString().trim()) {
      next.landArea = "Vui lòng nhập diện tích đất";
    }
    if (!gia?.toString().trim()) {
      next.price = "Vui lòng nhập giá";
    }
    if (!tieuDe?.toString().trim()) {
      next.title = "Vui lòng nhập tiêu đề tin";
    }
    if (!moTa?.toString().trim()) {
      next.description = "Vui lòng nhập mô tả";
    }

    setErrors(next);
    return Object.keys(next).length === 0;
  };

  // ==== SUBMIT ==== 
  const handleSubmit = async () => {
    if (busy) return;
    if (!validate()) return;

    if (typeof onSubmit !== "function") {
      openModal({
        title: "Lỗi cấu hình",
        message: "FormNhao chưa được truyền hàm onSubmit.",
      });
      return;
    }

    setBusy(true);
    try {
      const payload = {
        // các field chung mà PostCreate / MyPosts dùng
        title: tieuDe.trim(),
        description: moTa.trim(),
        address: address.trim(),

        price: gia ? Number(gia) : 0,
        landArea: dienTichDat ? Number(dienTichDat) : 0,
        usableArea: dienTichSd ? Number(dienTichSd) : null,

        bed: phongNgu,
        bath: phongVs,
        direction: huong,
        floors: soTang,

        houseType: loaiNha || "Nhà ở",
        legal: phapLy,
        interior: noiThat,
        estateStatus: "",

        projectName,
        maCan,
        phanKhu,

        width: chieuNgang ? Number(chieuNgang) : null,
        length: chieuDai ? Number(chieuDai) : null,

        estateType, // cho PostCreate fallback nếu cần
      };

      const result = onSubmit(payload);
      if (result instanceof Promise) await result;
    } finally {
      setBusy(false);
    }
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

      {/* Thông tin khác */}
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

        {/* Đặc điểm nhà/đất – chỉ UI, chưa gom vào payload */}
        <div className="pct-feature-wrap">
          <div className="pct-feature-label">Đặc điểm nhà/đất</div>
          <div className="pct-feature-grid">
            <div className="pct-feature-col">
              <label className="pct-feature-item">
                <input type="checkbox" /> <span>Hẻm xe hơi</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" /> <span>Nhà tóp hậu</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" /> <span>Nhà chưa hoàn công</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" /> <span>Đất chưa chuyển thổ</span>
              </label>
            </div>

            <div className="pct-feature-col">
              <label className="pct-feature-item">
                <input type="checkbox" /> <span>Nhà nở hậu</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" />{" "}
                <span>Nhà dính quy hoạch / lộ giới</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" /> <span>Nhà nát</span>
              </label>
              <label className="pct-feature-item">
                <input type="checkbox" /> <span>Hiện trạng khác</span>
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
            {errors.landArea && (
              <div className="pct-error">{errors.landArea}</div>
            )}
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
            {errors.price && (
              <div className="pct-error">{errors.price}</div>
            )}
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
            <div className="pct-help-text">{tieuDe.length}/70 kí tự</div>
            {errors.title && (
              <div className="pct-error">{errors.title}</div>
            )}
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
            <div className="pct-help-text">{moTa.length}/1500 kí tự</div>
            {errors.description && (
              <div className="pct-error">{errors.description}</div>
            )}
          </div>
        </div>
      </section>

      {/* Nút hành động – chỉ còn 1 nút Đăng tin */}
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
