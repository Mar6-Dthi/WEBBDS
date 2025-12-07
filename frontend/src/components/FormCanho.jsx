// src/components/FormCanho.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  getCurrentUserId,
  getUserActiveMembership,
  checkDailyQuota,
} from "../services/quotaService";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/** Simple modal component used for quota / validation messages */
function SimpleModal({ open, title, message, primaryLabel, onPrimary, secondaryLabel, onSecondary }) {
  if (!open) return null;
  return (
    <div className="reg-modal-backdrop" style={backdropStyle}>
      <div className="reg-modal" style={modalStyle}>
        {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
        <p style={{ whiteSpace: "pre-wrap" }}>{message}</p>

        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 12 }}>
          {secondaryLabel && (
            <button type="button" onClick={onSecondary} style={secondaryBtnStyle}>
              {secondaryLabel}
            </button>
          )}
          {primaryLabel && (
            <button type="button" onClick={onPrimary} style={primaryBtnStyle}>
              {primaryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/* Inline styles so you can paste file without extra css */
const backdropStyle = {
  position: "fixed",
  inset: 0,
  background: "rgba(0,0,0,0.4)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};
const modalStyle = {
  width: "min(520px, 92vw)",
  background: "#fff",
  borderRadius: 12,
  padding: 20,
  boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
};
const primaryBtnStyle = {
  background: "#0f172a",
  color: "#fff",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer",
};
const secondaryBtnStyle = {
  background: "#f3f4f6",
  color: "#111827",
  border: "none",
  padding: "8px 14px",
  borderRadius: 8,
  cursor: "pointer",
};

export default function FormCanho({ estateType }) {
  const navigate = useNavigate();

  const [estateStatus, setEstateStatus] = useState("Chưa bàn giao");
  const isRent = estateType === "Cho thuê";

  // form state
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

  // modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");
  const [modalPrimaryLabel, setModalPrimaryLabel] = useState("Đóng");
  const [modalSecondaryLabel, setModalSecondaryLabel] = useState(null);
  const [onModalPrimary, setOnModalPrimary] = useState(() => () => setModalOpen(false));
  const [onModalSecondary, setOnModalSecondary] = useState(() => () => setModalOpen(false));

  // busy to prevent double submit
  const [busy, setBusy] = useState(false);

  function openModal(opts = {}) {
    setModalTitle(opts.title || "Thông báo");
    setModalMessage(opts.message || "");
    setModalPrimaryLabel(opts.primaryLabel || "Đóng");
    setModalSecondaryLabel(opts.secondaryLabel || null);
    setOnModalPrimary(() => opts.onPrimary || (() => setModalOpen(false)));
    setOnModalSecondary(() => opts.onSecondary || (() => setModalOpen(false)));
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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

  // helper: best-effort call to quotaService.decrementQuota if available
  async function tryDecrementQuota(userId, amount = 1) {
    try {
      // prefer window.quotaService injected global
      const globalSvc = typeof window !== "undefined" ? window.quotaService : null;
      let localSvc = null;
      try {
        // eslint-disable-next-line global-require, import/no-extraneous-dependencies
        localSvc = require("../services/quotaService");
      } catch (e) {
        localSvc = null;
      }
      const svc = globalSvc || localSvc;
      if (svc && typeof svc.decrementQuota === "function") {
        const maybe = svc.decrementQuota(userId, amount);
        if (maybe instanceof Promise) await maybe.catch(() => {});
      }
    } catch (e) {
      // ignore best-effort failures
      // console.debug("decrementQuota failed", e);
    }
  }

  // submit handler (async-safe)
  async function handleSubmit() {
    if (busy) return;
    if (!validate()) return;

    setBusy(true);

    try {
      // ownerId may be sync or promise-returning
      let ownerId = null;
      try {
        ownerId = getCurrentUserId();
        if (ownerId instanceof Promise) ownerId = await ownerId;
      } catch {
        ownerId = localStorage.getItem("accessToken") || "guest";
      }

      // check quota - support sync or promise
      let quotaCheck = null;
      try {
        const maybe = checkDailyQuota(ownerId);
        quotaCheck = maybe instanceof Promise ? await maybe : maybe;
      } catch (e) {
        // fallback conservative: allow if we can't check
        quotaCheck = { allowed: true };
      }

      if (!quotaCheck?.allowed) {
        if (quotaCheck?.reason === "non-member") {
          openModal({
            title: "Hết lượt đăng hôm nay",
            message: quotaCheck?.message || "Bạn đã hết lượt đăng hôm nay. Đăng ký hội viên để tăng hạn mức.",
            primaryLabel: "Đóng",
            onPrimary: () => closeModal(),
            secondaryLabel: "Đăng ký hội viên",
            onSecondary: () => {
              closeModal();
              navigate(quotaCheck?.membershipLink || "/membership");
            },
          });
          setBusy(false);
          return;
        }

        openModal({
          title: "Hết lượt đăng hôm nay",
          message: quotaCheck?.message || "Bạn đã dùng hết lượt đăng hôm nay.",
          primaryLabel: "Đóng",
          onPrimary: () => closeModal(),
        });
        setBusy(false);
        return;
      }

      // allowed -> create post
      const draftMedia = JSON.parse(localStorage.getItem("postDraftMedia") || "[]");
      const images = Array.isArray(draftMedia) ? draftMedia.filter((m) => !!m.src).map((m) => m.src) : [];

      // membership info
      let activeMembership = null;
      try {
        activeMembership = getUserActiveMembership(ownerId);
      } catch {
        activeMembership = null;
      }

      const membershipPlanId = activeMembership?.planId || null;
      let membershipPriority = 0;
      if (activeMembership) {
        const durationMs =
          typeof activeMembership.durationMs === "number" && activeMembership.durationMs > 0
            ? activeMembership.durationMs
            : ONE_MONTH_MS;
        membershipPriority = durationMs >= 3 * ONE_MONTH_MS ? 2 : 1;
      }

      const newPost = {
        id: String(Date.now()),
        ownerId,
        category: "Căn hộ/Chung cư",
        estateType,
        title: form.title,
        description: form.description,
        address: form.address,
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
        estateStatus,
        projectName: form.projectName,
        maCan: form.maCan,
        block: form.block,
        isCorner: form.isCorner,
        membershipPlanId,
        membershipPriority,
        createdAt: new Date().toISOString(),
        sellerName: "Người bán",
        sellerPhone: "0900000000",
        images,
      };

      // persist
      const old = JSON.parse(localStorage.getItem("posts") || "[]");
      localStorage.setItem("posts", JSON.stringify([...old, newPost]));
      localStorage.removeItem("postDraftMedia");

      // dispatch global event so PostCreate (and other listeners) can refresh quota/usedToday
      try {
        window.dispatchEvent(
          new CustomEvent("post:created", {
            detail: {
              id: newPost.id,
              category: newPost.category,
              ownerId: newPost.ownerId,        // <-- quan trọng: thêm ownerId
              createdAt: newPost.createdAt,    // tuỳ chọn: thêm createdAt giúp listener
            },
          })
        );
      } catch (e) {
        // ignore
      }


      // best-effort: decrement server/local quota
      await tryDecrementQuota(ownerId, 1);

      // navigate to newly created post
      navigate(`/post/${newPost.id}`);
    } catch (err) {
      console.error("Failed to create post", err);
      openModal({
        title: "Lỗi",
        message: "Có lỗi khi lưu tin. Vui lòng thử lại.",
        primaryLabel: "Đóng",
        onPrimary: () => closeModal(),
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
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
              {errors.address && <div className="pct-error">{errors.address}</div>}
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
                className={"pct-pill" + (estateStatus === "Chưa bàn giao" ? " pct-pill--active" : "")}
                onClick={() => setEstateStatus("Chưa bàn giao")}
              >
                Chưa bàn giao
              </button>
              <button
                type="button"
                className={"pct-pill" + (estateStatus === "Đã bàn giao" ? " pct-pill--active" : "")}
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
              <select className="pct-input" name="houseType" value={form.houseType} onChange={handleChange}>
                <option value="">Chọn loại hình</option>
                <option value="Căn hộ chung cư">Căn hộ chung cư</option>
                <option value="Căn hộ Studio">Căn hộ Studio</option>
                <option value="Duplex">Duplex</option>
                <option value="Penthouse">Penthouse</option>
              </select>
              {errors.houseType && <div className="pct-error">{errors.houseType}</div>}
            </div>
          </div>

          <div className="pct-field-row">
            <div className="pct-field">
              <label className="pct-label">
                Số phòng ngủ <span className="pct-required">*</span>
              </label>
              <select className="pct-input" name="bed" value={form.bed} onChange={handleChange}>
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
              <select className="pct-input" name="bath" value={form.bath} onChange={handleChange}>
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
              <select className="pct-input" name="balconyDirection" value={form.balconyDirection} onChange={handleChange}>
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
              <select className="pct-input" name="doorDirection" value={form.doorDirection} onChange={handleChange}>
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
              <select className="pct-input" name="legal" value={form.legal} onChange={handleChange}>
                <option value="">Chọn</option>
                <option>Sổ hồng</option>
                <option>Hợp đồng mua bán</option>
                <option>Giấy tờ khác</option>
              </select>
            </div>

            <div className="pct-field">
              <label className="pct-label">Tình trạng nội thất</label>
              <select className="pct-input" name="interior" value={form.interior} onChange={handleChange}>
                <option value="">Chọn</option>
                <option>Hoàn thiện cơ bản</option>
                <option>Đầy đủ nội thất</option>
                <option>Chưa có nội thất</option>
              </select>
            </div>
          </div>

          <label className="pct-checkbox">
            <input type="checkbox" name="isCorner" checked={form.isCorner} onChange={handleChange} />
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
              <input className="pct-input" type="number" min="0" name="area" value={form.area} onChange={handleChange} placeholder="m²" />
              {errors.area && <div className="pct-error">{errors.area}</div>}
            </div>

            <div className="pct-field">
              <label className="pct-label">
                {isRent ? "Giá thuê/tháng" : "Giá bán"} <span className="pct-required">*</span>
              </label>
              <input className="pct-input" type="number" min="0" name="price" value={form.price} onChange={handleChange} placeholder="VND" />
              {errors.price && <div className="pct-error">{errors.price}</div>}
            </div>
          </div>
        </section>

        {/* Tiêu đề & mô tả */}
        <section className="pct-section">
          <h3 className="pct-section-title">Tiêu đề tin đăng và Mô tả chi tiết</h3>

          <div className="pct-field-col">
            <div className="pct-field">
              <label className="pct-label">
                Tiêu đề tin đăng <span className="pct-required">*</span>
              </label>
              <input className="pct-input" type="text" name="title" value={form.title} onChange={handleChange} placeholder="Ví dụ: Bán căn hộ 2PN, 70m², view nội khu yên tĩnh..." />
              <div className="pct-help-text">{form.title.length}/70 kí tự</div>
              {errors.title && <div className="pct-error">{errors.title}</div>}
            </div>

            <div className="pct-field">
              <label className="pct-label">
                Mô tả chi tiết <span className="pct-required">*</span>
              </label>
              <textarea className="pct-textarea" rows={5} name="description" value={form.description} onChange={handleChange} placeholder="Nên có: loại căn hộ, vị trí, tiện ích, diện tích, số phòng, pháp lý, nội thất..." />
              <div className="pct-help-text">{form.description.length}/1500 kí tự</div>
              {errors.description && <div className="pct-error">{errors.description}</div>}
            </div>
          </div>
        </section>

        {/* Nút hành động – CHỈ CÒN ĐĂNG TIN */}
        <div className="pct-actions-row" style={{ marginTop: 12 }}>
          <button type="button" className="pct-btn pct-btn-primary" onClick={handleSubmit} disabled={busy}>
            {busy ? (isRent ? "Đang đăng..." : "Đang đăng...") : (isRent ? "Đăng tin cho thuê" : "Đăng tin")}
          </button>
        </div>
      </div>

      {/* Modal */}
      <SimpleModal
        open={modalOpen}
        title={modalTitle}
        message={modalMessage}
        primaryLabel={modalPrimaryLabel}
        onPrimary={onModalPrimary}
        secondaryLabel={modalSecondaryLabel}
        onSecondary={onModalSecondary}
      />
    </>
  );
}
