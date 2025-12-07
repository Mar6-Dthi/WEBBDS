// src/components/FormNhao.jsx
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

export default function FormNhao({ estateType }) {
  const navigate = useNavigate();
  const isRent = estateType === "Cho thuê";

  // ==== STATE GOM DỮ LIỆU CHÍNH ==== (giữ giống structure bạn có)
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

  // busy + modal
  const [busy, setBusy] = useState(false);
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

  // basic validation
  const validate = () => {
    if (!address?.toString().trim() || !dienTichDat?.toString().trim() || !gia?.toString().trim() || !tieuDe?.toString().trim() || !moTa?.toString().trim()) {
      openModal({ title: "Thiếu thông tin", message: "Vui lòng nhập Địa chỉ, Diện tích đất, Giá, Tiêu đề và Mô tả." });
      return false;
    }
    return true;
  };

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

      // membership info
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
        category: "Nhà ở",
        estateType,
        title: tieuDe,
        description: moTa,
        address,
        projectName,
        maCan,
        phanKhu,
        houseType: loaiNha || "Nhà ở",
        bed: phongNgu,
        bath: phongVs,
        direction: huong,
        floors: soTang,
        legal: phapLy,
        interior: noiThat,
        landArea: dienTichDat ? Number(dienTichDat) : null,
        usableArea: dienTichSd ? Number(dienTichSd) : null,
        width: chieuNgang ? Number(chieuNgang) : null,
        length: chieuDai ? Number(chieuDai) : null,
        price: gia ? Number(gia) : null,
        membershipPlanId,
        membershipPriority,
        createdAt: new Date().toISOString(),
        images,
        sellerName: "Người bán",
        sellerPhone: "0900000000",
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


      // best-effort: decrement remote/local quota
      await tryDecrementQuota(ownerId, 1);

      // navigate to post detail
      navigate(`/post/${id}`);
    } catch (err) {
      console.error("FormNhao submit error", err);
      openModal({ title: "Lỗi", message: "Có lỗi khi lưu tin. Vui lòng thử lại.", primaryLabel: "Đóng", onPrimary: () => closeModal() });
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

        {/* Đặc điểm nhà/đất (UI-only checkboxes) */}
        <div className="pct-feature-wrap">
          <div className="pct-feature-label">Đặc điểm nhà/đất</div>
          <div className="pct-feature-grid">
            <div className="pct-feature-col">
              <label className="pct-feature-item"><input type="checkbox" /> <span>Hẻm xe hơi</span></label>
              <label className="pct-feature-item"><input type="checkbox" /> <span>Nhà tóp hậu</span></label>
              <label className="pct-feature-item"><input type="checkbox" /> <span>Nhà chưa hoàn công</span></label>
              <label className="pct-feature-item"><input type="checkbox" /> <span>Đất chưa chuyển thổ</span></label>
            </div>

            <div className="pct-feature-col">
              <label className="pct-feature-item"><input type="checkbox" /> <span>Nhà nở hậu</span></label>
              <label className="pct-feature-item"><input type="checkbox" /> <span>Nhà dính quy hoạch / lộ giới</span></label>
              <label className="pct-feature-item"><input type="checkbox" /> <span>Nhà nát</span></label>
              <label className="pct-feature-item"><input type="checkbox" /> <span>Hiện trạng khác</span></label>
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

      {/* Nút hành động – chỉ còn 1 nút Đăng tin */}
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
