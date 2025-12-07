// src/components/FormPhongtro.jsx
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

    active.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latest = active[0];

    let priorityLevel = 1;
    const durationMs =
      typeof latest.durationMs === "number" && latest.durationMs > 0
        ? latest.durationMs
        : ONE_MONTH_MS;

    if (durationMs >= 3 * ONE_MONTH_MS) priorityLevel = 2;

    return { planId: latest.planId || null, priorityLevel, isMember: true };
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

export default function FormPhongtro() {
  const navigate = useNavigate();

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

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalOpts, setModalOpts] = useState({ title: "", message: "", primaryLabel: "Đóng", secondaryLabel: null, onPrimary: null, onSecondary: null });

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

    setBusy(true);
    try {
      const ownerId = getCurrentUserId() || localStorage.getItem("accessToken") || "guest";

      // check quota (try service -> fallback)
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

      const id = String(Date.now());
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
        estateStatus: "",

        deposit: form.deposit || null,

        createdAt: new Date().toISOString(),

        images,

        sellerName: "Người cho thuê",
        sellerPhone: "0900000000",

        // Thông tin hội viên dùng cho ưu tiên hiển thị
        membershipPlanId,
        membershipPriority,
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
      navigate(`/post/${id}`);
    } catch (err) {
      console.error("FormPhongtro submit error", err);
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
            {errors.address && <div className="pct-error">{errors.address}</div>}
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
        <h3 className="pct-section-title">Tiêu đề tin đăng và Mô tả chi tiết</h3>

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
              placeholder="Nên có: loại phòng trọ, vị trí, diện tích, tiện ích, nội thất, v.v."
            />
            <div className="pct-help-text">{form.description.length}/1500 kí tự</div>
            {errors.description && <div className="pct-error">{errors.description}</div>}
          </div>
        </div>
      </section>

      {/* ========== ACTION BUTTON ========== */}
      <div className="pct-actions-row">
        <button type="button" className="pct-btn pct-btn-primary" onClick={handleSubmit} disabled={busy}>
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
