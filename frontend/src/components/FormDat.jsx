// src/components/FormDat.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const MEMBERSHIP_TX_KEY = "membershipTransactions";
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;
const POSTS_KEY = "posts";
const DRAFT_MEDIA_KEY = "postDraftMedia";

/* ===== LẤY USER HIỆN TẠI ===== */
function getCurrentUserId() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) return null;
    return currentUser.id || currentUser.phone || null;
  } catch {
    return null;
  }
}

/* ===== TÌM GÓI HỘI VIÊN ACTIVE MỚI NHẤT CỦA USER ===== */
function getUserActiveMembership(userId) {
  if (!userId) return null;

  try {
    const raw = localStorage.getItem(MEMBERSHIP_TX_KEY) || "[]";
    const list = JSON.parse(raw);
    const now = Date.now();

    const active = list.filter((tx) => {
      if (tx.status !== "SUCCESS") return false;

      const txUserId = tx.userId || tx.ownerId || null;
      if (txUserId !== userId) return false;

      const createdMs = new Date(tx.createdAt).getTime();
      if (!createdMs || Number.isNaN(createdMs)) return false;

      const durationMs =
        typeof tx.durationMs === "number" && tx.durationMs > 0
          ? tx.durationMs
          : ONE_MONTH_MS;

      return createdMs + durationMs > now;
    });

    if (!active.length) return null;

    active.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    const latest = active[0];

    let priorityLevel = 1;
    const durationMs =
      typeof latest.durationMs === "number" && latest.durationMs > 0
        ? latest.durationMs
        : ONE_MONTH_MS;

    if (durationMs >= 3 * ONE_MONTH_MS) {
      priorityLevel = 2;
    }

    return {
      planId: latest.planId || null,
      priorityLevel,
      durationMs,
      isMember: true,
    };
  } catch {
    return null;
  }
}

/* ===== đếm số post trong ngày của user (fallback) ===== */
function getTodayPostCountFallback(userId) {
  try {
    const raw = localStorage.getItem(POSTS_KEY) || "[]";
    const list = JSON.parse(raw);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = today.getTime();
    const end = start + 24 * 60 * 60 * 1000;
    return list.filter((p) => {
      const createdMs = p.createdAt ? new Date(p.createdAt).getTime() : NaN;
      if (!createdMs || Number.isNaN(createdMs)) return false;
      const ownerMatch = userId ? p.ownerId === userId : true;
      return ownerMatch && createdMs >= start && createdMs < end;
    }).length;
  } catch {
    return 0;
  }
}

/* ===== Simple modal for messages ===== */
function SimpleModal({ open, title, message, primaryLabel, onPrimary, secondaryLabel, onSecondary }) {
  if (!open) return null;
  return (
    <div style={{
      position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
      display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000
    }}>
      <div style={{ width: "min(520px,92vw)", background: "#fff", borderRadius: 10, padding: 18, boxShadow: "0 12px 40px rgba(0,0,0,0.12)" }}>
        {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
        <div style={{ whiteSpace: "pre-wrap", marginTop: 6 }}>{message}</div>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 12 }}>
          {secondaryLabel && <button type="button" onClick={onSecondary} style={{ background: "#f3f4f6", border: "none", padding: "8px 12px", borderRadius: 8 }}>{secondaryLabel}</button>}
          {primaryLabel && <button type="button" onClick={onPrimary} style={{ background: "#0f172a", color: "#fff", border: "none", padding: "8px 12px", borderRadius: 8 }}>{primaryLabel}</button>}
        </div>
      </div>
    </div>
  );
}

/* ===== best-effort gọi decrementQuota nếu tồn tại ===== */
async function tryDecrementQuota(userId, amount = 1) {
  try {
    const globalSvc = typeof window !== "undefined" ? window.quotaService : null;
    let localSvc = null;
    try {
      // eslint-disable-next-line global-require
      localSvc = require("../services/quotaService");
    } catch {}
    const svc = globalSvc || localSvc;
    if (svc && typeof svc.decrementQuota === "function") {
      const maybe = svc.decrementQuota(userId, amount);
      if (maybe instanceof Promise) await maybe.catch(() => {});
    }
  } catch (e) {
    // ignore
  }
}

/* ===== try checkDailyQuota if available (sync/async) ===== */
async function tryCheckDailyQuota(userId) {
  try {
    const globalSvc = typeof window !== "undefined" ? window.quotaService : null;
    let localSvc = null;
    try { localSvc = require("../services/quotaService"); } catch {}
    const svc = globalSvc || localSvc;
    if (svc && typeof svc.checkDailyQuota === "function") {
      const maybe = svc.checkDailyQuota(userId);
      const result = maybe instanceof Promise ? await maybe : maybe;
      return result;
    }
  } catch (e) {
    // ignore
  }
  // fallback: compute simple allowed logic: non-member -> 2/day, member ->5/day
  try {
    const membership = getUserActiveMembership(userId);
    const max = membership ? 5 : 2;
    const used = getTodayPostCountFallback(userId);
    const allowed = used < max;
    return {
      allowed,
      usedToday: used,
      maxPerDay: max,
      isMember: !!membership,
      reason: allowed ? null : (membership ? "member-exhausted" : "non-member"),
      message: allowed ? "Được phép đăng" : (membership ? "Bạn đã dùng hết lượt đăng hôm nay." : "Bạn đã dùng hết lượt đăng hôm nay. Hãy đăng ký hội viên để tăng hạn mức."),
      membershipLink: "/membership",
    };
  } catch {
    return { allowed: true };
  }
}

/* ===== Component ===== */
export default function FormDat({ estateType }) {
  const navigate = useNavigate();
  const isRent = estateType === "Cho thuê";

  // form state
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

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpts, setModalOpts] = useState({ title: "", message: "", primaryLabel: "Đóng", secondaryLabel: null, onPrimary: null, onSecondary: null });

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
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
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

  const handleSubmit = async () => {
    if (busy) return;
    if (!validate()) return;

    setBusy(true);
    try {
      let ownerId = getCurrentUserId() || localStorage.getItem("accessToken") || "guest";

      // check quota (try service first, fallback to local)
      const quota = await tryCheckDailyQuota(ownerId);
      if (!quota?.allowed) {
        if (quota?.reason === "non-member") {
          openModal({
            title: "Hết lượt đăng hôm nay",
            message: quota?.message || "Bạn đã dùng hết lượt đăng hôm nay. Đăng ký hội viên để tăng hạn mức.",
            primaryLabel: "Đóng",
            onPrimary: () => closeModal(),
            secondaryLabel: "Đăng ký hội viên",
            onSecondary: () => {
              closeModal();
              navigate(quota?.membershipLink || "/membership");
            },
          });
          setBusy(false);
          return;
        } else {
          openModal({
            title: "Hết lượt đăng hôm nay",
            message: quota?.message || "Bạn đã dùng hết lượt đăng hôm nay.",
            primaryLabel: "Đóng",
            onPrimary: () => closeModal(),
          });
          setBusy(false);
          return;
        }
      }

      // membership & priority
      const membership = getUserActiveMembership(ownerId);
      const membershipPlanId = membership?.planId || null;
      const membershipPriority = membership?.priorityLevel || 0;

      // draft media
      const draftMedia = JSON.parse(localStorage.getItem(DRAFT_MEDIA_KEY) || "[]");
      const images = Array.isArray(draftMedia) ? draftMedia.filter((m) => !!m.src).map((m) => m.src) : [];

      const newPost = {
        id: String(Date.now()),
        ownerId,
        category: "Đất",
        estateType,
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
        estateStatus: "",
        projectName: form.projectName,
        phanKhu: form.phanKhu,
        maLo: form.maLo,
        width: form.width ? Number(form.width) : null,
        length: form.length ? Number(form.length) : null,
        membershipPlanId,
        membershipPriority,
        createdAt: new Date().toISOString(),
        sellerName: "Người bán đất",
        sellerPhone: "0900000000",
        images,
      };

      // persist
      const old = JSON.parse(localStorage.getItem(POSTS_KEY) || "[]");
      localStorage.setItem(POSTS_KEY, JSON.stringify([...old, newPost]));

      // clear draft media
      localStorage.removeItem(DRAFT_MEDIA_KEY);

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

      // best-effort decrement quota (service)
      await tryDecrementQuota(ownerId, 1);

      // navigate to new post
      navigate(`/post/${newPost.id}`);
    } catch (err) {
      console.error("FormDat submit error", err);
      openModal({
        title: "Lỗi",
        message: "Có lỗi khi lưu tin. Vui lòng thử lại.",
        primaryLabel: "Đóng",
        onPrimary: () => closeModal(),
      });
    } finally {
      setBusy(false);
    }
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
            <button type="button" className="pct-link-inline">Yêu cầu thêm dự án</button>
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
              <label className="pct-feature-item"><input type="checkbox" /> <span>Mặt tiền</span></label>
              <label className="pct-feature-item"><input type="checkbox" /> <span>Nở hậu</span></label>
              <label className="pct-feature-item"><input type="checkbox" /> <span>Thổ cư 1 phần</span></label>
              <label className="pct-feature-item"><input type="checkbox" /> <span>Không có thổ cư</span></label>
            </div>

            <div className="pct-feature-col">
              <label className="pct-feature-item"><input type="checkbox" /> <span>Hẻm xe hơi</span></label>
              <label className="pct-feature-item"><input type="checkbox" /> <span>Chưa có thổ cư</span></label>
              <label className="pct-feature-item"><input type="checkbox" /> <span>Thổ cư toàn bộ</span></label>
              <label className="pct-feature-item"><input type="checkbox" /> <span>Hiện trạng khác</span></label>
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
              {isRent ? "Giá thuê/tháng" : "Giá bán"} <span className="pct-required">*</span>
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
        <h3 className="pct-section-title">Tiêu đề tin đăng và Mô tả chi tiết</h3>

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
              placeholder="Nên có: loại đất, vị trí, diện tích, thổ cư, pháp lý, hạ tầng xung quanh..."
            />
            <div className="pct-help-text">{form.description.length}/1500 kí tự</div>
            {errors.description && <div className="pct-error">{errors.description}</div>}
          </div>
        </div>
      </section>

      {/* ========== NÚT ĐĂNG TIN ========== */}
      <div className="pct-actions-row">
        <button
          type="button"
          className="pct-btn pct-btn-primary"
          onClick={handleSubmit}
          disabled={busy}
        >
          {busy ? (isRent ? "Đang đăng..." : "Đang đăng...") : (isRent ? "Đăng tin cho thuê" : "Đăng tin")}
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
