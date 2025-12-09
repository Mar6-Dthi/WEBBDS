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

// ✅ dùng để lưu bài mới
import { createMyPost } from "../services/mockMyPosts";

// try to use quotaService if available
let quotaService = null;
try {
  // eslint-disable-next-line import/no-unresolved
  quotaService = require("../services/quotaService");
} catch (e) {
  quotaService = null;
}

// constants
const CATEGORY_GROUP = [
  "Căn hộ/Chung cư",
  "Nhà ở",
  "Đất",
  "Văn phòng, Mặt bằng kinh doanh",
  "Phòng trọ",
];

const PREFIX = "Bất động sản - ";

const MEMBERSHIP_TX_KEY = "membershipTransactions";
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

// ✅ key lưu quota hàng ngày cho từng user
const DAILY_STATS_PREFIX = "postDailyStats_";

// ---------- helpers liên quan user ----------
function getCurrentUserIdFallback() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!currentUser) return null;
    return currentUser.id || currentUser.phone || null;
  } catch {
    return null;
  }
}

// Đồng bộ với MyPosts / createMyPost: ưu tiên accessToken
function resolveLocalUserId() {
  const token = localStorage.getItem("accessToken");
  if (token) return token;
  return getCurrentUserIdFallback();
}

// ---------- helpers: membership fallback ----------
function getUserActiveMembershipFallback(userId) {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(MEMBERSHIP_TX_KEY) || "[]";
    const list = JSON.parse(raw);
    const now = Date.now();

    const active = list.filter((tx) => {
      if (tx.status !== "SUCCESS") return false;
      const txUserId = tx.userId || tx.ownerId || null;
      if (String(txUserId) !== String(userId)) return false;
      const createdMs = new Date(tx.createdAt).getTime();
      if (!createdMs || Number.isNaN(createdMs)) return false;
      const durationMs =
        typeof tx.durationMs === "number" && tx.durationMs > 0
          ? tx.durationMs
          : ONE_MONTH_MS;
      return createdMs + durationMs > now;
    });

    if (!active.length) return null;
    active.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const latest = active[active.length - 1];

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

// ---------- helpers: quota mỗi ngày (KHÔNG quét posts) ----------
function getTodayDateStr() {
  // YYYY-MM-DD
  return new Date().toISOString().slice(0, 10);
}

function getTodayPostCountLocal(userId) {
  if (!userId) return 0;
  try {
    const raw = localStorage.getItem(DAILY_STATS_PREFIX + userId);
    if (!raw) return 0;
    const data = JSON.parse(raw);
    if (!data || data.date !== getTodayDateStr()) return 0;
    return typeof data.count === "number" ? data.count : 0;
  } catch {
    return 0;
  }
}

function increaseTodayPostCountLocal(userId) {
  if (!userId) return;
  try {
    const today = getTodayDateStr();
    const raw = localStorage.getItem(DAILY_STATS_PREFIX + userId) || "{}";
    const data = JSON.parse(raw);

    let nextCount = 1;
    if (data && data.date === today && typeof data.count === "number") {
      nextCount = data.count + 1;
    }

    const toSave = { date: today, count: nextCount };
    localStorage.setItem(DAILY_STATS_PREFIX + userId, JSON.stringify(toSave));
  } catch {
    // ignore
  }
}

// ---------- Simple modal ----------
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
    <div className="reg-modal-backdrop" style={backdropStyle}>
      <div className="reg-modal" style={modalStyle}>
        {title && <h3 style={{ marginTop: 0 }}>{title}</h3>}
        <p style={{ whiteSpace: "pre-wrap" }}>{message}</p>

        <div
          style={{
            display: "flex",
            gap: 10,
            justifyContent: "flex-end",
            marginTop: 12,
          }}
        >
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
  return fullLabel.startsWith(PREFIX)
    ? fullLabel.slice(PREFIX.length).trim()
    : fullLabel;
}

// 🔸 helper đọc file thành dataURL (base64) để lưu vào localStorage
function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

// ---------- Component ----------
export default function PostCreate() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalPayload, setModalPayload] = useState({});
  const [category, setCategory] = useState("");
  const [estateType, setEstateType] = useState("");

  // quota state
  const [hasMembershipFlag, setHasMembershipFlag] = useState(false);
  const [maxPerDay, setMaxPerDay] = useState(2);
  const [usedToday, setUsedToday] = useState(0);
  const [blocked, setBlocked] = useState(false);
  const [membershipLink, setMembershipLink] = useState("/goi-hoi-vien");

  // media
  const [media, setMedia] = useState([]);
  const fileInputRef = useRef(null);
  const MAX_FILES = 10;
  const MAX_SIZE_MB = 10;

  // ------ refreshQuota ------
  async function refreshQuota(userIdParam = null) {
    let userId = userIdParam;

    try {
      if (!userId) {
        if (quotaService && typeof quotaService.getCurrentUserId === "function") {
          userId = quotaService.getCurrentUserId();
          if (userId instanceof Promise) userId = await userId;
        } else if (
          quotaService &&
          typeof quotaService.getCurrentUser === "function"
        ) {
          const u = quotaService.getCurrentUser();
          const user = u instanceof Promise ? await u : u;
          userId = user?.id || user?.phone || null;
        } else {
          userId = resolveLocalUserId();
        }
      }
    } catch {
      userId = resolveLocalUserId();
    }

    // Nếu vẫn không có userId → coi như chưa login, không block, báo 0/2
    if (!userId) {
      setHasMembershipFlag(false);
      setUsedToday(0);
      setMaxPerDay(2);
      setBlocked(false);
      setMembershipLink("/goi-hoi-vien");
      return;
    }

    // Nếu có quotaService.checkDailyQuota thì ưu tiên dùng nó
    if (quotaService && typeof quotaService.checkDailyQuota === "function") {
      try {
        const maybe = quotaService.checkDailyQuota(userId);
        const q = maybe instanceof Promise ? await maybe : maybe;
        const allowed = !!q?.allowed;
        const used =
          typeof q?.usedToday === "number"
            ? q.usedToday
            : getTodayPostCountLocal(userId);
        const max =
          typeof q?.maxPerDay === "number"
            ? q.maxPerDay
            : q?.isMember
            ? 5
            : 2;

        setUsedToday(used);
        setMaxPerDay(max);
        setHasMembershipFlag(!!q?.isMember);
        setBlocked(!allowed);

        // 🔒 ÉP LUÔN LINK HỘI VIÊN
        setMembershipLink("/goi-hoi-vien");
        return;
      } catch {
        // fallback bên dưới
      }
    }

    // Fallback local logic (member=5, non-member=2) + dùng bộ đếm riêng
    const membership = getUserActiveMembershipFallback(userId);
    const hasMembership = !!membership;
    const max = hasMembership ? 5 : 2;
    const used = getTodayPostCountLocal(userId);

    setHasMembershipFlag(hasMembership);
    setMaxPerDay(max);
    setUsedToday(used);
    setBlocked(used >= max);
    setMembershipLink("/goi-hoi-vien");
  }

  // on mount, check quota và load draft media
  useEffect(() => {
    let isMounted = true;

    const loadDraftMedia = () => {
      try {
        const raw = localStorage.getItem("postDraftMedia") || "[]";
        const list = JSON.parse(raw);
        const valid = (list || []).filter((m) => m && (m.src || m.dataUrl));
        if (isMounted) setMedia(valid);
      } catch {
        // ignore
      }
    };

    loadDraftMedia();
    refreshQuota();

    const onPostCreated = async (ev) => {
      try {
        let currentUserId = null;
        try {
          if (
            quotaService &&
            typeof quotaService.getCurrentUserId === "function"
          ) {
            currentUserId = quotaService.getCurrentUserId();
            if (currentUserId instanceof Promise)
              currentUserId = await currentUserId;
          } else if (
            quotaService &&
            typeof quotaService.getCurrentUser === "function"
          ) {
            const u = quotaService.getCurrentUser();
            const user = u instanceof Promise ? await u : u;
            currentUserId = user?.id || user?.phone || null;
          } else {
            currentUserId = resolveLocalUserId();
          }
        } catch {
          currentUserId = resolveLocalUserId();
        }

        const ownerIdFromEvent = ev?.detail?.ownerId;
        if (
          ownerIdFromEvent &&
          currentUserId &&
          String(ownerIdFromEvent) === String(currentUserId)
        ) {
          refreshQuota(currentUserId);
        } else {
          refreshQuota();
        }
      } catch {
        try {
          refreshQuota();
        } catch {}
      }
    };
    window.addEventListener("post:created", onPostCreated);

    const onMembershipUpdated = async (ev) => {
      try {
        let currentUserId = null;
        try {
          if (
            quotaService &&
            typeof quotaService.getCurrentUserId === "function"
          ) {
            currentUserId = quotaService.getCurrentUserId();
            if (currentUserId instanceof Promise)
              currentUserId = await currentUserId;
          } else if (
            quotaService &&
            typeof quotaService.getCurrentUser === "function"
          ) {
            const u = quotaService.getCurrentUser();
            const user = u instanceof Promise ? await u : u;
            currentUserId = user?.id || user?.phone || null;
          } else {
            currentUserId = resolveLocalUserId();
          }
        } catch {
          currentUserId = resolveLocalUserId();
        }

        const ownerIdFromEvent = ev?.detail?.ownerId;
        if (
          ownerIdFromEvent &&
          currentUserId &&
          String(ownerIdFromEvent) === String(currentUserId)
        ) {
          refreshQuota(currentUserId);
        } else {
          refreshQuota();
        }
      } catch {
        try {
          refreshQuota();
        } catch {}
      }
    };
    window.addEventListener("membership:updated", onMembershipUpdated);

    return () => {
      isMounted = false;
      window.removeEventListener("post:created", onPostCreated);
      window.removeEventListener("membership:updated", onMembershipUpdated);

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

  // ====== FILE HANDLERS (dùng dataURL để lưu) ======
  const handleFilesChange = async (e) => {
    if (!canPostToday) {
      setModalPayload({
        title: "Hết lượt đăng hôm nay",
        message: hasMembershipFlag
          ? "Bạn đã dùng hết số lượt đăng bài cho hôm nay. Lượt đăng sẽ được đặt lại khi sang ngày mới."
          : "Bạn đã dùng hết số lượt đăng bài cho hôm nay. Lượt đăng sẽ được đặt lại khi sang ngày mới.\nBạn có thể đăng ký hội viên để tăng giới hạn đăng tin.",
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

    for (const file of selected) {
      if (file.size > MAX_SIZE_MB * 1024 * 1024) {
        skipped.push(file.name || file.type || "file");
        continue;
      }

      const objectUrl = URL.createObjectURL(file);
      let dataUrl = null;
      try {
        dataUrl = await readFileAsDataURL(file);
      } catch {
        // ignore, vẫn dùng được objectUrl trong phiên
      }

      newItems.push({
        id: Date.now() + Math.random(),
        type: file.type && file.type.startsWith("video") ? "video" : "image",
        src: objectUrl, // dùng cho preview trong phiên
        dataUrl,        // dùng để lưu localStorage (tồn tại sau F5)
      });
    }

    if (!newItems.length) {
      if (skipped.length) {
        setModalPayload({
          title: "Một số file quá lớn",
          message: `Không thể tải lên các file sau (vượt quá ${MAX_SIZE_MB} MB):\n- ${skipped.join(
            "\n- "
          )}`,
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
          ? "Bạn đã dùng hết số lượt đăng bài cho hôm nay. Lượt đăng sẽ được đặt lại khi sang ngày mới."
          : "Bạn đã dùng hết số lượt đăng bài cho hôm nay. Lượt đăng sẽ được đặt lại khi sang ngày mới.\nBạn có thể đăng ký hội viên để tăng giới hạn đăng tin.",
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
          ? "Bạn đã dùng hết số lượt đăng bài cho hôm nay. Lượt đăng sẽ được đặt lại khi sang ngày mới."
          : "Bạn đã dùng hết số lượt đăng bài cho hôm nay. Lượt đăng sẽ được đặt lại khi sang ngày mới.\nBạn có thể đăng ký hội viên để tăng giới hạn đăng tin.",
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
      setModalPayload({
        title: "Hết lượt đăng hôm nay",
        message: hasMembershipFlag
          ? "Bạn đã dùng hết số lượt đăng bài cho hôm nay. Lượt đăng sẽ được đặt lại khi sang ngày mới."
          : "Bạn đã dùng hết số lượt đăng bài cho hôm nay. Lượt đăng sẽ được đặt lại khi sang ngày mới.\nBạn có thể đăng ký hội viên để tăng giới hạn đăng tin.",
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

  // ✅ HÀM XỬ LÝ KHI FORM CON BẤM ĐĂNG TIN
  const handleSubmitFromChildForm = async (formValues) => {
    // 1) Nếu hết lượt đăng thì chặn
    if (!canPostToday) {
      setModalPayload({
        title: "Hết lượt đăng hôm nay",
        message: hasMembershipFlag
          ? "Bạn đã dùng hết số lượt đăng bài cho hôm nay. Lượt đăng sẽ được đặt lại khi sang ngày mới."
          : "Bạn đã dùng hết số lượt đăng bài cho hôm nay. Lượt đăng sẽ được đặt lại khi sang ngày mới.\nBạn có thể đăng ký hội viên để tăng giới hạn đăng tin.",
        primaryLabel: "Đóng",
        primaryFn: () => setIsModalOpen(false),
        secondaryLabel: hasMembershipFlag ? null : "Đăng ký hội viên",
        secondaryFn: () => (window.location.href = membershipLink),
      });
      setIsModalOpen(true);
      return;
    }

    // 2) lấy userId
    let userId = null;
    try {
      if (quotaService && typeof quotaService.getCurrentUserId === "function") {
        userId = quotaService.getCurrentUserId();
        if (userId instanceof Promise) userId = await userId;
      } else if (
        quotaService &&
        typeof quotaService.getCurrentUser === "function"
      ) {
        const u = quotaService.getCurrentUser();
        const user = u instanceof Promise ? await u : u;
        userId = user?.id || user?.phone || null;
      } else {
        userId = resolveLocalUserId();
      }
    } catch {
      userId = resolveLocalUserId();
    }

    if (!userId) {
      setModalPayload({
        title: "Cần đăng nhập",
        message: "Bạn cần đăng nhập để đăng tin.",
        primaryLabel: "Đóng",
        primaryFn: () => setIsModalOpen(false),
      });
      setIsModalOpen(true);
      return;
    }

    // 3) build dữ liệu post để lưu
    const cat = getPureCategory(category);

    const postData = {
      ...formValues,
      category: cat,
      estateType:
        estateType || (cat === "Phòng trọ" ? "Cho thuê" : formValues.estateType),

      // ƯU TIÊN dataUrl (tồn tại sau F5) – fallback blob – rồi ảnh demo
      coverUrl:
        media[0]?.dataUrl || media[0]?.src || "/Img/demo/house-1.jpg",

      // lưu toàn bộ ảnh (ưu tiên dataUrl)
      images: media.map((m) => m.dataUrl || m.src),
    };

    // 4) lưu vào localStorage (createMyPost sẽ bắn event post:created)
    createMyPost(userId, postData);

    // 5) cập nhật bộ đếm hôm nay
    increaseTodayPostCountLocal(userId);
    refreshQuota(userId);

    // 6) xoá draft media
    try {
      localStorage.removeItem("postDraftMedia");
    } catch {}
    setMedia([]);

    // 7) thông báo thành công
    setModalPayload({
      title: "Đăng tin thành công",
      message:
        "Tin của bạn đã được lưu. Bạn có thể xem và quản lý trong mục Quản lý tin.",
      primaryLabel: "Xem tin đã đăng",
      primaryFn: () => {
        setIsModalOpen(false);
        window.location.href = "/quan-ly-tin";
      },
      secondaryLabel: "Ở lại trang đăng tin",
      secondaryFn: () => {
        setIsModalOpen(false);
      },
    });
    setIsModalOpen(true);
  };

  const renderForm = () => {
    if (!canPostToday) return null;
    if (!hasCategory) return null;
    if (!isPhongTro && !hasEstateType) return null;

    const commonProps = { onSubmit: handleSubmitFromChildForm };

    switch (pureCategory) {
      case "Căn hộ/Chung cư":
        return <FormCanho estateType={estateType} {...commonProps} />;
      case "Nhà ở":
        return <FormNhao estateType={estateType} {...commonProps} />;
      case "Đất":
        return <FormDat estateType={estateType} {...commonProps} />;
      case "Văn phòng, Mặt bằng kinh doanh":
        return <FormVanphong estateType={estateType} {...commonProps} />;
      case "Phòng trọ":
        return <FormPhongtro {...commonProps} />;
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
                  <>
                    Bạn còn có thể đăng thêm{" "}
                    <strong>{remainingToday}</strong> tin.{" "}
                    <span>Lượt đăng sẽ được đặt lại khi sang ngày mới.</span>
                  </>
                ) : (
                  <>
                    Bạn đã dùng hết lượt đăng hôm nay.{" "}
                    <span>Lượt đăng sẽ được đặt lại khi sang ngày mới.</span>
                  </>
                )}
              </div>
            </div>

            {!canPostToday ? (
              <div className="pct-card pct-limit-card">
                <h2>Đã dùng hết lượt đăng hôm nay</h2>

                {hasMembershipFlag ? (
                  <p>
                    Bạn đã đăng đủ <strong>{maxPerDay}</strong> tin trong ngày hôm nay.
                    Lượt đăng sẽ được đặt lại khi sang <strong>ngày mới</strong>. Vui
                    lòng quay lại vào ngày mai để tiếp tục đăng tin.
                  </p>
                ) : (
                  <p>
                    Bạn đã đăng đủ <strong>{maxPerDay}</strong> tin trong ngày hôm nay.
                    Lượt đăng sẽ được đặt lại khi sang <strong>ngày mới</strong>. Bạn
                    có thể{" "}
                    <button
                      type="button"
                      className="pct-link"
                      onClick={() => (window.location.href = membershipLink)}
                    >
                      đăng ký gói hội viên
                    </button>{" "}
                    để tăng giới hạn đăng tin (5 tin/ngày).
                  </p>
                )}
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

                      <div
                        className="pct-upload-dropzone"
                        onClick={handleOpenFileDialog}
                      >
                        <div className="pct-upload-inner">
                          <div className="pct-upload-icon">
                            <div className="pct-upload-icon-circle" />
                            <span className="pct-upload-plus">+</span>
                          </div>
                          <p className="pct-upload-text">
                            Thêm hình ảnh hoặc video
                          </p>
                          <p className="pct-upload-hint">
                            Hình có kích thước tối thiểu 240x240 – Tối đa 10 file
                          </p>

                          {media.length > 0 && (
                            <>
                              <p className="pct-upload-counter">
                                Đã chọn {media.length}/10 file
                              </p>

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
                                      <img src={m.src || m.dataUrl} alt="" />
                                    ) : (
                                      <video src={m.src || m.dataUrl} controls />
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
                            Danh mục bất động sản{" "}
                            <span className="pct-required">*</span>
                          </label>
                          <div className="pct-pill-group">
                            <button
                              type="button"
                              className={
                                "pct-pill" +
                                (estateType === "Cần bán"
                                  ? " pct-pill--active"
                                  : "")
                              }
                              onClick={() => setEstateType("Cần bán")}
                            >
                              Cần bán
                            </button>
                            <button
                              type="button"
                              className={
                                "pct-pill" +
                                (estateType === "Cho thuê"
                                  ? " pct-pill--active"
                                  : "")
                              }
                              onClick={() => setEstateType("Cho thuê")}
                            >
                              Cho thuê
                            </button>
                          </div>
                        </div>
                      )}

                      <div className="pct-illu-wrap">
                        <div className="pct-illu-image-box">
                          <img
                            src="/Img/empty-category.svg"
                            alt="Lựa chọn loại bất động sản"
                            className="pct-illu-image"
                          />
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
            <div
              className="pct-modal"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="pct-modal-header">
                <button
                  type="button"
                  className="pct-modal-back-btn"
                  onClick={closeCategoryModal}
                >
                  ←
                </button>
                <span className="pct-modal-title">
                  Chọn danh mục bất động sản
                </span>
              </div>

              <div className="pct-modal-body">
                <div className="pct-modal-section-title">CHỌN DANH MỤC</div>

                <div className="pct-modal-list">
                  {CATEGORY_GROUP.map((item) => (
                    <button
                      type="button"
                      key={item}
                      className="pct-modal-item"
                      onClick={() => handleSelectCategory(item)}
                    >
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
            if (typeof modalPayload.primaryFn === "function")
              modalPayload.primaryFn();
          }}
          secondaryLabel={modalPayload.secondaryLabel}
          onSecondary={() => {
            if (typeof modalPayload.secondaryFn === "function")
              modalPayload.secondaryFn();
          }}
        />
      </div>
    </div>
  );
}
