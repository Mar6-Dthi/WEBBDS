// src/pages/PostCreate.jsx
import React, { useState, useRef, useEffect } from "react";
import "../styles/PostCreate.css";

import Header from "../components/header";
import Footer from "../components/footer";

// 5 form component
import FormCanho from "../components/FormCanho";
import FormNhao from "../components/FormNhao";
import FormDat from "../components/FormDat";
import FormVanphong from "../components/FormVanphong";
import FormPhongtro from "../components/FormPhongtro";

// try to use quotaService if available (you said you already have it)
let quotaService = null;
try {
  // eslint-disable-next-line import/no-unresolved
  quotaService = require("../services/quotaService");
} catch (e) {
  quotaService = null;
}

// constants (fallback logic if quotaService not used)
const CATEGORY_GROUP = [
  "Căn hộ/Chung cư",
  "Nhà ở",
  "Đất",
  "Văn phòng, Mặt bằng kinh doanh",
  "Phòng trọ",
];

const PREFIX = "Bất động sản - ";

const POSTS_KEY = "posts";
const MEMBERSHIP_TX_KEY = "membershipTransactions";
const ONE_DAY_MS = 24 * 60 * 60 * 1000;
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

// ---------- fallback helpers (only used if quotaService isn't provided) ----------
function getCurrentUserIdFallback() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) return null;
    return currentUser.id || currentUser.phone || null;
  } catch {
    return null;
  }
}

function getUserActiveMembershipFallback(userId) {
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
    active.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
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

function getTodayPostCountFallback(userId) {
  try {
    const raw = localStorage.getItem(POSTS_KEY) || "[]";
    const list = JSON.parse(raw);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = today.getTime();
    const end = start + ONE_DAY_MS;
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

// ---------- Simple modal (inline) ----------
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
          <button type="button" onClick={onPrimary} style={primaryBtnStyle}>
            {primaryLabel || "Đóng"}
          </button>
        </div>
      </div>
    </div>
  );
}
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
  width: "min(560px, 92vw)",
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

// ---------- helper ----------
function getPureCategory(fullLabel) {
  if (!fullLabel) return "";
  return fullLabel.startsWith(PREFIX) ? fullLabel.slice(PREFIX.length).trim() : fullLabel;
}

// ---------- Component ----------
export default function PostCreate() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPayload, setModalPayload] = useState({}); // { title, message, primaryLabel, primaryFn, secondaryLabel, secondaryFn }
  const [category, setCategory] = useState("");
  const [estateType, setEstateType] = useState("");

  // quota state
  const [hasMembershipFlag, setHasMembershipFlag] = useState(false);
  const [maxPerDay, setMaxPerDay] = useState(2);
  const [usedToday, setUsedToday] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [membershipLink, setMembershipLink] = useState("/membership");

  // media
  const [media, setMedia] = useState([]);
  const fileInputRef = useRef(null);
  const MAX_FILES = 10;
  const MAX_SIZE_MB = 10;

  // ------ refreshQuota: dùng khi mount + khi có event post:created / membership:updated ------
  async function refreshQuota(userIdParam = null) {
    let userId = userIdParam;
    try {
      if (!userId) {
        if (quotaService && typeof quotaService.getCurrentUserId === "function") {
          userId = quotaService.getCurrentUserId();
          if (userId instanceof Promise) userId = await userId;
        } else if (quotaService && typeof quotaService.getCurrentUser === "function") {
          const u = quotaService.getCurrentUser();
          const user = u instanceof Promise ? await u : u;
          userId = user?.id || user?.phone || null;
        } else {
          userId = getCurrentUserIdFallback();
        }
      }
    } catch {
      userId = getCurrentUserIdFallback();
    }

    // try using service checkDailyQuota first
    if (quotaService && typeof quotaService.checkDailyQuota === "function") {
      try {
        const maybe = quotaService.checkDailyQuota(userId);
        const q = maybe instanceof Promise ? await maybe : maybe;
        const allowed = !!q?.allowed;
        const used = typeof q?.usedToday === "number" ? q.usedToday : 0;
        const max = typeof q?.maxPerDay === "number" ? q.maxPerDay : q?.isMember ? 5 : 2;

        setUsedToday(used);
        setMaxPerDay(max);
        setHasMembershipFlag(!!q?.isMember);
        setBlocked(!allowed);
        setMembershipLink(q?.membershipLink || "/membership");

        if (!allowed) {
          const msg =
            q?.reason === "non-member"
              ? "Bạn đã dùng hết số lượt đăng bài cho hôm nay. Bạn cần đăng ký hội viên để có thể đăng thêm bài."
              : "Bạn đã dùng hết số lượt đăng bài cho hôm nay.";
          setModalPayload({
            title: "Hết lượt đăng hôm nay",
            message: msg,
            primaryLabel: "Đóng",
            primaryFn: () => setIsModalOpen(false),
            secondaryLabel: "Đăng ký hội viên",
            secondaryFn: () => (window.location.href = q?.membershipLink || "/membership"),
          });
          setIsModalOpen(true);
        }
        return;
      } catch (e) {
        // fallback below
        // console.error("quotaService.checkDailyQuota error", e);
      }
    }

    // fallback local logic (member=5, non-member=2)
    const membership = getUserActiveMembershipFallback(userId);
    const hasMembership = !!membership;
    const max = hasMembership ? 5 : 2;
    const used = getTodayPostCountFallback(userId);

    setHasMembershipFlag(hasMembership);
    setMaxPerDay(max);
    setUsedToday(used);
    setBlocked(used >= max);
    setMembershipLink("/membership");

    if (used >= max) {
      const msg = hasMembership
        ? "Bạn đã dùng hết số lượt đăng bài cho hôm nay."
        : "Bạn đã dùng hết số lượt đăng bài cho hôm nay. Bạn cần đăng ký hội viên để có thể đăng thêm bài.";
      setModalPayload({
        title: "Hết lượt đăng hôm nay",
        message: msg,
        primaryLabel: "Đóng",
        primaryFn: () => setIsModalOpen(false),
        secondaryLabel: hasMembership ? null : "Đăng ký hội viên",
        secondaryFn: () => (window.location.href = "/membership"),
      });
      setIsModalOpen(true);
    }
  }

  // on mount, check quota (prefer quotaService if available) and load draft media
  useEffect(() => {
    let isMounted = true;

    const loadDraftMedia = () => {
      try {
        const raw = localStorage.getItem("postDraftMedia") || "[]";
        const list = JSON.parse(raw);
        // ensure item shape
        const valid = (list || []).filter((m) => m && (m.src || m.type));
        if (isMounted) setMedia(valid);
      } catch (e) {
        // ignore
      }
    };

    loadDraftMedia();
    refreshQuota();

    // listen for global event when a post is created so UI can update immediately
    const onPostCreated = async (ev) => {
      try {
        // resolve current user id (prefer quotaService)
        let currentUserId = null;
        try {
          if (quotaService && typeof quotaService.getCurrentUserId === "function") {
            currentUserId = quotaService.getCurrentUserId();
            if (currentUserId instanceof Promise) currentUserId = await currentUserId;
          } else if (quotaService && typeof quotaService.getCurrentUser === "function") {
            const u = quotaService.getCurrentUser();
            const user = u instanceof Promise ? await u : u;
            currentUserId = user?.id || user?.phone || null;
          } else {
            currentUserId = getCurrentUserIdFallback();
          }
        } catch {
          currentUserId = getCurrentUserIdFallback();
        }

        const ownerIdFromEvent = ev?.detail?.ownerId;
        // only refresh when the post was created by the current user
        if (ownerIdFromEvent && currentUserId && String(ownerIdFromEvent) === String(currentUserId)) {
          refreshQuota(currentUserId);
        }
      } catch (err) {
        // fallback: still call refreshQuota to be safe
        try { refreshQuota(); } catch {}
      }
    };
    window.addEventListener("post:created", onPostCreated);

    // listen for membership updates (payment completed) so quota refreshes immediately
    const onMembershipUpdated = async (ev) => {
      try {
        // resolve current user id (prefer quotaService)
        let currentUserId = null;
        try {
          if (quotaService && typeof quotaService.getCurrentUserId === "function") {
            currentUserId = quotaService.getCurrentUserId();
            if (currentUserId instanceof Promise) currentUserId = await currentUserId;
          } else if (quotaService && typeof quotaService.getCurrentUser === "function") {
            const u = quotaService.getCurrentUser();
            const user = u instanceof Promise ? await u : u;
            currentUserId = user?.id || user?.phone || null;
          } else {
            currentUserId = getCurrentUserIdFallback();
          }
        } catch {
          currentUserId = getCurrentUserIdFallback();
        }

        const ownerIdFromEvent = ev?.detail?.ownerId;
        // If event has ownerId and it matches current user, refresh quota for that user.
        if (ownerIdFromEvent && currentUserId && String(ownerIdFromEvent) === String(currentUserId)) {
          refreshQuota(currentUserId);
        } else {
          // if no ownerId or not match, still refresh for safety (in case app uses a global membership)
          refreshQuota();
        }
      } catch (err) {
        try { refreshQuota(); } catch {}
      }
    };
    window.addEventListener("membership:updated", onMembershipUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("post:created", onPostCreated);
      window.removeEventListener("membership:updated", onMembershipUpdated);
      // revoke any blob urls to avoid memory leaks
      try {
        const raw = localStorage.getItem("postDraftMedia") || "[]";
        const list = JSON.parse(raw);
        (list || []).forEach((m) => {
          if (m && m.src && String(m.src).startsWith("blob:")) {
            try {
              URL.revokeObjectURL(m.src);
            } catch {}
          }
        });
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const remainingToday = Math.max(maxPerDay - usedToday, 0);
  const canPostToday = !blocked && remainingToday > 0;

  // file handlers use modal instead of alert
  const handleFilesChange = (e) => {
    if (!canPostToday) {
      setModalPayload({
        title: "Hết lượt đăng hôm nay",
        message: hasMembershipFlag
          ? "Bạn đã dùng hết số lượt đăng bài cho hôm nay."
          : "Bạn đã dùng hết số lượt đăng bài cho hôm nay. Bạn cần đăng ký hội viên để có thể đăng thêm bài.",
        primaryLabel: "Đóng",
        primaryFn: () => setIsModalOpen(false),
        secondaryLabel: hasMembershipFlag ? null : "Đăng ký hội viên",
        secondaryFn: () => (window.location.href = membershipLink),
      });
      setIsModalOpen(true);
      e.target.value = "";
      return;
    }

    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    let slot = MAX_FILES - media.length;
    if (slot <= 0) {
      setModalPayload({
        title: "Giới hạn file",
        message: `Chỉ được tải tối đa ${MAX_FILES} ảnh/video.`,
        primaryLabel: "Đóng",
        primaryFn: () => setIsModalOpen(false),
      });
      setIsModalOpen(true);
      e.target.value = "";
      return;
    }

    const selected = files.slice(0, slot);
    const newItems = [];
    const skipped = [];

    selected.forEach((file) => {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        skipped.push(file.name || file.type || "file");
        return;
      }
      const url = URL.createObjectURL(file);
      newItems.push({
        id: Date.now() + Math.random(),
        type: file.type && file.type.startsWith("video") ? "video" : "image",
        src: url,
      });
    });

    if (!newItems.length) {
      if (skipped.length) {
        setModalPayload({
          title: "Một số file quá lớn",
          message: `Không thể tải lên các file sau (vượt quá ${MAX_SIZE_MB} MB):\n- ${skipped.join("\n- ")}`,
          primaryLabel: "Đóng",
          primaryFn: () => setIsModalOpen(false),
        });
        setIsModalOpen(true);
      }
      e.target.value = "";
      return;
    }

    setMedia((prev) => {
      const next = [...prev, ...newItems];
      try {
        localStorage.setItem("postDraftMedia", JSON.stringify(next));
      } catch {}
      return next;
    });

    if (skipped.length) {
      setModalPayload({
        title: "Một số file bị bỏ qua",
        message: `Một vài file không được thêm vì vượt giới hạn kích thước (${MAX_SIZE_MB} MB).`,
        primaryLabel: "Đóng",
        primaryFn: () => setIsModalOpen(false),
      });
      setIsModalOpen(true);
    }

    e.target.value = "";
  };

  const handleOpenFileDialog = () => {
    if (!canPostToday) {
      setModalPayload({
        title: "Hết lượt đăng hôm nay",
        message: hasMembershipFlag
          ? "Bạn đã dùng hết số lượt đăng bài cho hôm nay."
          : "Bạn đã dùng hết số lượt đăng bài cho hôm nay. Bạn cần đăng ký hội viên để có thể đăng thêm bài.",
        primaryLabel: "Đóng",
        primaryFn: () => setIsModalOpen(false),
        secondaryLabel: hasMembershipFlag ? null : "Đăng ký hội viên",
        secondaryFn: () => (window.location.href = membershipLink),
      });
      setIsModalOpen(true);
      return;
    }
    fileInputRef.current?.click();
  };

  const handleRemoveMedia = (id) => {
    setMedia((prev) => {
      const found = prev.find((m) => m.id === id);
      if (found && found.src && found.src.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(found.src);
        } catch {}
      }

      const next = prev.filter((m) => m.id !== id);
      try {
        localStorage.setItem("postDraftMedia", JSON.stringify(next));
      } catch {}
      return next;
    });
  };

  // modal open/close helpers for category modal etc
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);

  const openCategoryModal = () => {
    if (!canPostToday) {
      setModalPayload({
        title: "Hết lượt đăng hôm nay",
        message: hasMembershipFlag
          ? "Bạn đã dùng hết số lượt đăng bài cho hôm nay."
          : "Bạn đã dùng hết số lượt đăng bài cho hôm nay. Bạn cần đăng ký hội viên để có thể đăng thêm bài.",
        primaryLabel: "Đóng",
        primaryFn: () => setIsModalOpen(false),
        secondaryLabel: hasMembershipFlag ? null : "Đăng ký hội viên",
        secondaryFn: () => (window.location.href = membershipLink),
      });
      setIsModalOpen(true);
      return;
    }
    setIsCategoryModalOpen(true);
  };

  const closeCategoryModal = () => setIsCategoryModalOpen(false);

  const handleSelectCategory = (name) => {
    if (!canPostToday) {
      // show block modal
      setModalPayload({
        title: "Hết lượt đăng hôm nay",
        message: hasMembershipFlag
          ? "Bạn đã dùng hết số lượt đăng bài cho hôm nay."
          : "Bạn đã dùng hết số lượt đăng bài cho hôm nay. Bạn cần đăng ký hội viên để có thể đăng thêm bài.",
        primaryLabel: "Đóng",
        primaryFn: () => setIsModalOpen(false),
        secondaryLabel: hasMembershipFlag ? null : "Đăng ký hội viên",
        secondaryFn: () => (window.location.href = membershipLink),
      });
      setIsModalOpen(true);
      return;
    }
    setCategory(PREFIX + name);
    setEstateType("");
    closeCategoryModal();
  };

  const pureCategory = getPureCategory(category);
  const hasCategory = Boolean(category);
  const hasEstateType = Boolean(estateType);
  const isPhongTro = pureCategory === "Phòng trọ";

  const renderForm = () => {
    if (!canPostToday) return null;
    if (!hasCategory) return null;
    if (!isPhongTro && !hasEstateType) return null;
    switch (pureCategory) {
      case "Căn hộ/Chung cư":
        return <FormCanho estateType={estateType} />;
      case "Nhà ở":
        return <FormNhao estateType={estateType} />;
      case "Đất":
        return <FormDat estateType={estateType} />;
      case "Văn phòng, Mặt bằng kinh doanh":
        return <FormVanphong estateType={estateType} />;
      case "Phòng trọ":
        return <FormPhongtro />;
      default:
        return null;
    }
  };

  // small illustration text
  let illuTitle = "ĐĂNG NHANH - BÁN GỌN";
  let illuDesc = 'Chọn "danh mục tin đăng" để đăng tin';
  if (hasCategory && !isPhongTro) {
    illuTitle = "Chọn Cần bán hoặc Cho thuê";
    illuDesc = "để tiếp tục";
  } else if (hasCategory && isPhongTro) {
    illuTitle = "Đăng phòng trọ";
    illuDesc = "Điền các thông tin bên dưới để tiếp tục";
  }
  const showEstateType = hasCategory && !isPhongTro;

  return (
    <div className="nhatot">
      <div className="mk-page">
        <Header />

        <main className="pct-page">
          <div className="pct-container">
            <div className="pct-limit-banner">
              <div className="pct-limit-main">
                {hasMembershipFlag ? (
                  <span>
                    Bạn đang là <strong>hội viên</strong>, mỗi ngày được đăng tối đa{" "}
                    <strong>5 tin</strong>.
                  </span>
                ) : (
                  <span>
                    Bạn <strong>chưa đăng ký gói hội viên</strong>, mỗi ngày chỉ
                    được đăng tối đa <strong>2 tin</strong>.
                  </span>
                )}
              </div>
              <div className="pct-limit-sub">
                Hôm nay bạn đã đăng <strong>{usedToday}</strong> /{" "}
                <strong>{maxPerDay}</strong> tin.{" "}
                {canPostToday ? (
                  <>Bạn còn có thể đăng thêm <strong>{remainingToday}</strong> tin.</>
                ) : (
                  <>Bạn đã dùng hết lượt đăng hôm nay.</>
                )}
              </div>
            </div>

            {!canPostToday ? (
              <div className="pct-card pct-limit-card">
                <h2>Đã dùng hết lượt đăng hôm nay</h2>
                <p>
                  Bạn đã đăng đủ <strong>{maxPerDay}</strong> tin trong ngày hôm nay.
                  Vui lòng quay lại vào ngày mai để tiếp tục đăng tin, hoặc{" "}
                  <button
                    type="button"
                    className="pct-link"
                    onClick={() => (window.location.href = membershipLink)}
                  >
                    đăng ký gói hội viên
                  </button>{" "}
                  để tăng giới hạn đăng tin (5 tin/ngày).
                </p>
              </div>
            ) : (
              <>
                <div className="pct-card">
                  <div className="pct-header-row">
                    <div className="pct-title-wrap">
                      <h2 className="pct-title">Hình ảnh và Video sản phẩm</h2>
                      <p className="pct-subtitle">
                        Xem thêm về{" "}
                        <button type="button" className="pct-link">
                          Quy định đăng tin của Chợ Tốt
                        </button>
                      </p>
                    </div>

                    <div className="pct-category-wrap">
                      <label className="pct-label">
                        Danh Mục Tin Đăng <span className="pct-required">*</span>
                      </label>
                      <button
                        type="button"
                        className="pct-select"
                        onClick={openCategoryModal}
                      >
                        <span>{category || "Chọn danh mục tin đăng"}</span>
                        <span className="pct-chevron-down">▾</span>
                      </button>
                    </div>
                  </div>

                  <div className="pct-body-row">
                    <div className="pct-upload-card">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*,video/*"
                        multiple
                        hidden
                        onChange={handleFilesChange}
                      />

                      <div className="pct-upload-dropzone" onClick={handleOpenFileDialog}>
                        <div className="pct-upload-inner">
                          <div className="pct-upload-icon">
                            <div className="pct-upload-icon-circle" />
                            <span className="pct-upload-plus">+</span>
                          </div>
                          <p className="pct-upload-text">Thêm hình ảnh hoặc video</p>
                          <p className="pct-upload-hint">Hình có kích thước tối thiểu 240x240 – Tối đa 10 file</p>

                          {media.length > 0 && (
                            <>
                              <p className="pct-upload-counter">Đã chọn {media.length}/10 file</p>

                              <div className="pct-upload-preview-grid">
                                {media.map((m) => (
                                  <div key={m.id} className="pct-upload-thumb">
                                    <button
                                      type="button"
                                      className="pct-upload-thumb-remove"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveMedia(m.id);
                                      }}
                                    >
                                      ×
                                    </button>

                                    {m.type === "image" ? (
                                      <img src={m.src} alt="" />
                                    ) : (
                                      <video src={m.src} controls />
                                    )}
                                  </div>
                                ))}
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pct-right-col">
                      {showEstateType && (
                        <div className="pct-estate-type">
                          <label className="pct-label">
                            Danh mục bất động sản <span className="pct-required">*</span>
                          </label>
                          <div className="pct-pill-group">
                            <button
                              type="button"
                              className={"pct-pill" + (estateType === "Cần bán" ? " pct-pill--active" : "")}
                              onClick={() => setEstateType("Cần bán")}
                            >
                              Cần bán
                            </button>
                            <button
                              type="button"
                              className={"pct-pill" + (estateType === "Cho thuê" ? " pct-pill--active" : "")}
                              onClick={() => setEstateType("Cho thuê")}
                            >
                              Cho thuê
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="pct-illu-wrap">
                        <div className="pct-illu-image-box">
                          <img src="/Img/empty-category.svg" alt="Lựa chọn loại bất động sản" className="pct-illu-image" />
                        </div>

                        <div className="pct-illu-text">
                          <h3>{illuTitle}</h3>
                          <p>{illuDesc}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="pct-card pct-form-card">{renderForm()}</div>
              </>
            )}
          </div>
        </main>

        <Footer />

        {/* category modal */}
        {isCategoryModalOpen && canPostToday && (
          <div className="pct-modal-backdrop" onClick={closeCategoryModal}>
            <div className="pct-modal" onClick={(e) => e.stopPropagation()}>
              <div className="pct-modal-header">
                <button type="button" className="pct-modal-back-btn" onClick={closeCategoryModal}>
                  ←
                </button>
                <span className="pct-modal-title">Chọn danh mục bất động sản</span>
              </div>

              <div className="pct-modal-body">
                <div className="pct-modal-section-title">CHỌN DANH MỤC</div>

                <div className="pct-modal-list">
                  {CATEGORY_GROUP.map((item) => (
                    <button type="button" key={item} className="pct-modal-item" onClick={() => handleSelectCategory(item)}>
                      <span>{item}</span>
                      <span className="pct-modal-item-arrow">›</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* inline notification modal */}
        <SimpleModal
          open={isModalOpen}
          title={modalPayload.title}
          message={modalPayload.message}
          primaryLabel={modalPayload.primaryLabel}
          onPrimary={() => {
            setIsModalOpen(false);
            if (typeof modalPayload.primaryFn === "function") modalPayload.primaryFn();
          }}
          secondaryLabel={modalPayload.secondaryLabel}
          onSecondary={() => {
            if (typeof modalPayload.secondaryFn === "function") modalPayload.secondaryFn();
          }}
        />
      </div>
    </div>
  );
}
