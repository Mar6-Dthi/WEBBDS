// src/pages/ProfilePage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfilePage.css";
import NhatotHeader from "../components/header";

import { CalendarDays, ShieldCheck, MapPin, X, User } from "lucide-react";

const AVATAR_META_KEY = "profile_avatar_meta";
const COVER_META_KEY = "profile_cover_meta";
const JOIN_KEY = "profile_join_date";

/* ========= ĐỌC THÔNG TIN USER HIỆN TẠI ========= */
function getCurrentUserInfo() {
  let currentUser = null;
  try {
    currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch {
    currentUser = null;
  }
  const accountName = (localStorage.getItem("accountName") || "").trim();
  const displayName = (currentUser?.name || accountName || "").trim();
  return { displayName, currentUser };
}

/* ========= JOIN DATE ========= */
/* Ưu tiên dùng ngày tạo tài khoản (currentUser.createdAt) nếu có,
   nếu không thì dùng JOIN_KEY lưu lần đầu mở profile */
function getJoinDate() {
  try {
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (currentUser?.createdAt) {
      const created = new Date(currentUser.createdAt);
      if (!Number.isNaN(created.getTime())) {
        return created;
      }
    }
  } catch {
    // ignore
  }

  let join = localStorage.getItem(JOIN_KEY);
  if (!join) {
    join = new Date().toISOString();
    localStorage.setItem(JOIN_KEY, join);
  }
  return new Date(join);
}

function formatJoinDuration(joinDate) {
  const now = new Date();
  const diffMs = now - joinDate;
  const diffDays = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60 * 24)));
  const months = Math.floor(diffDays / 30);
  const days = diffDays % 30;

  if (months === 0) return `${diffDays} ngày (≈ ${diffDays} ngày)`;
  return `${months} tháng ${days} ngày (≈ ${diffDays} ngày)`;
}

/* ========= LOAD / SAVE META ẢNH ========= */
function loadMeta(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return {
      url: parsed.url || "",
      zoom: parsed.zoom || 120,
      posX: parsed.posX ?? 50,
      posY: parsed.posY ?? 50,
    };
  } catch {
    return null;
  }
}

function saveMeta(key, meta) {
  localStorage.setItem(
    key,
    JSON.stringify({
      url: meta.url || "",
      zoom: meta.zoom || 120,
      posX: meta.posX ?? 50,
      posY: meta.posY ?? 50,
    })
  );
}

/* ========= MODAL CROP / ZOOM ẢNH ========= */
function ImageAdjustModal({
  open,
  src,
  aspect = 1,
  title,
  initialMeta,
  onCancel,
  onSave,
}) {
  const [zoom, setZoom] = useState(initialMeta?.zoom || 120);
  const [pos, setPos] = useState({
    x: initialMeta?.posX ?? 50,
    y: initialMeta?.posY ?? 50,
  });

  useEffect(() => {
    if (!open) return;
    setZoom(initialMeta?.zoom || 120);
    setPos({
      x: initialMeta?.posX ?? 50,
      y: initialMeta?.posY ?? 50,
    });
  }, [open, initialMeta]);

  if (!open || !src) return null;

  const handleMouseDown = (e) => {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const startPos = { ...pos };

    const handleMove = (ev) => {
      const dx = ev.clientX - startX;
      const dy = ev.clientY - startY;
      const factor = 0.2; // 1px ~ 0.2%
      let nextX = startPos.x + dx * factor;
      let nextY = startPos.y + dy * factor;
      nextX = Math.max(0, Math.min(100, nextX));
      nextY = Math.max(0, Math.min(100, nextY));
      setPos({ x: nextX, y: nextY });
    };

    const handleUp = () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
    };

    window.addEventListener("mousemove", handleMove);
    window.addEventListener("mouseup", handleUp);
  };

  const handleSave = () => {
    onSave?.({
      url: src,
      zoom,
      posX: pos.x,
      posY: pos.y,
    });
  };

  const frameStyle =
    aspect === 1
      ? { width: 280, height: 280 } // avatar 1:1
      : { width: 420, height: 210 }; // cover 2:1

  return (
    <div className="crop-backdrop" onClick={onCancel}>
      <div className="crop-modal" onClick={(e) => e.stopPropagation()}>
        <div className="crop-header">
          <h3>{title || "Chỉnh sửa ảnh"}</h3>
          <button className="crop-close" onClick={onCancel}>
            <X size={18} />
          </button>
        </div>

        <div className="crop-body">
          <div
            className="crop-frame"
            style={frameStyle}
            onMouseDown={handleMouseDown}
          >
            <div
              className="crop-image"
              style={{
                backgroundImage: `url(${src})`,
                backgroundSize: `${zoom}%`,
                backgroundPosition: `${pos.x}% ${pos.y}%`,
              }}
            />
          </div>

          <div className="crop-controls">
            <label>
              Zoom
              <input
                type="range"
                min="100"
                max="220"
                value={zoom}
                onChange={(e) => setZoom(Number(e.target.value))}
              />
            </label>
            <p className="crop-hint">Kéo ảnh trong khung để chọn vùng hiển thị.</p>
          </div>
        </div>

        <div className="crop-footer">
          <button className="crop-btn ghost" onClick={onCancel}>
            Hủy
          </button>
          <button className="crop-btn primary" onClick={handleSave}>
            Lưu
          </button>
        </div>
      </div>
    </div>
  );
}

/* ========= TRANG PROFILE ========= */
export default function ProfilePage() {
  const navigate = useNavigate();

  const [{ displayName, currentUser }, setUserInfo] = useState(() =>
    getCurrentUserInfo()
  );
  const [joinDate] = useState(() => getJoinDate());

  const [avatarMeta, setAvatarMeta] = useState(() => loadMeta(AVATAR_META_KEY));
  const [coverMeta, setCoverMeta] = useState(() => loadMeta(COVER_META_KEY));

  const initialChar = displayName ? displayName.charAt(0).toUpperCase() : "U";

  // refs cho input file
  const avatarInputRef = useRef(null);
  const coverInputRef = useRef(null);

  // trạng thái mở menu 3 nút
  const [avatarMenuOpen, setAvatarMenuOpen] = useState(false);
  const [coverMenuOpen, setCoverMenuOpen] = useState(false);

  // trạng thái modal crop
  const [cropState, setCropState] = useState({
    type: null, // "avatar" | "cover"
    src: "",
  });

  // reload nếu profile thay đổi ở nơi khác
  useEffect(() => {
    const handler = () => {
      const info = getCurrentUserInfo();
      setUserInfo(info);
      setAvatarMeta(loadMeta(AVATAR_META_KEY));
      setCoverMeta(loadMeta(COVER_META_KEY));
    };
    window.addEventListener("profile-changed", handler);
    return () => window.removeEventListener("profile-changed", handler);
  }, []);

  // Avatar meta: ưu tiên meta, nếu chưa có thì dùng avatarUrl của currentUser
  const effectiveAvatarMeta =
    avatarMeta ||
    (currentUser?.avatarUrl
      ? {
          url: currentUser.avatarUrl,
          zoom: 140,
          posX: 50,
          posY: 50,
        }
      : null);

  const metaForAvatar = effectiveAvatarMeta || {
    url: "",
    zoom: 120,
    posX: 50,
    posY: 50,
  };

  // Cover meta: tương tự, ưu tiên coverUrl nếu có
  const effectiveCoverMeta =
    coverMeta ||
    (currentUser?.coverUrl
      ? {
          url: currentUser.coverUrl,
          zoom: 130,
          posX: 50,
          posY: 50,
        }
      : null);

  const metaForCover = effectiveCoverMeta || {
    url: "",
    zoom: 120,
    posX: 50,
    posY: 50,
  };

  // ====== LABEL GIỚI TÍNH & NGÀY SINH ======
  const genderLabelMap = {
    male: "Nam",
    female: "Nữ",
    other: "Khác",
  };

  const genderLabel = currentUser?.gender
    ? genderLabelMap[currentUser.gender] || "Khác"
    : "Chưa cung cấp";

  const birthdayLabel = currentUser?.birthday || "Chưa cung cấp";

  /* ====== MỞ MODAL CROP VỚI FILE MỚI ====== */
  const openCropWithFile = (file, type) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result;
      setCropState({ type, src: dataUrl });
      if (type === "avatar") setAvatarMenuOpen(false);
      if (type === "cover") setCoverMenuOpen(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAvatarFileChange = (e) => {
    const file = e.target.files?.[0];
    openCropWithFile(file, "avatar");
    e.target.value = "";
  };

  const handleCoverFileChange = (e) => {
    const file = e.target.files?.[0];
    openCropWithFile(file, "cover");
    e.target.value = "";
  };

  /* ====== SAVE SAU KHI CROP ====== */
  const handleCropSave = (meta) => {
    if (cropState.type === "avatar") {
      setAvatarMeta(meta);
      saveMeta(AVATAR_META_KEY, meta);

      if (currentUser) {
        const updated = { ...currentUser, avatarUrl: meta.url };
        localStorage.setItem("currentUser", JSON.stringify(updated));
      }
    } else if (cropState.type === "cover") {
      setCoverMeta(meta);
      saveMeta(COVER_META_KEY, meta);

      if (currentUser) {
        const updated = { ...currentUser, coverUrl: meta.url };
        localStorage.setItem("currentUser", JSON.stringify(updated));
      }
    }

    window.dispatchEvent(new Event("profile-changed"));
    setCropState({ type: null, src: "" });
  };

  const handleCropCancel = () => {
    setCropState({ type: null, src: "" });
  };

  /* ====== MENU ACTIONS: AVATAR ====== */
  const triggerAvatarUpload = () => {
    avatarInputRef.current?.click();
  };

  const handleAvatarEdit = () => {
    if (!metaForAvatar.url) return;
    setCropState({
      type: "avatar",
      src: metaForAvatar.url,
    });
    setAvatarMenuOpen(false);
  };

  const handleAvatarDownload = () => {
    if (!metaForAvatar.url) return;
    const a = document.createElement("a");
    a.href = metaForAvatar.url;
    a.download = "avatar-profile.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setAvatarMenuOpen(false);
  };

  /* ====== MENU ACTIONS: COVER ====== */
  const triggerCoverUpload = () => {
    coverInputRef.current?.click();
  };

  const handleCoverEdit = () => {
    if (!metaForCover.url) return;
    setCropState({
      type: "cover",
      src: metaForCover.url,
    });
    setCoverMenuOpen(false);
  };

  const handleCoverDownload = () => {
    if (!metaForCover.url) return;
    const a = document.createElement("a");
    a.href = metaForCover.url;
    a.download = "cover-profile.png";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setCoverMenuOpen(false);
  };

  return (
    <div className="nhatot">
      <NhatotHeader />

      <main className="profile-main">
        <div className="profile-container">
          <section className="profile-card">
            {/* ===== COVER ===== */}
            <div className="profile-cover-wrap">
              <div
                className="profile-cover"
                onClick={() => setCoverMenuOpen((v) => !v)}
                style={
                  metaForCover.url
                    ? {
                        backgroundImage: `url(${metaForCover.url})`,
                        backgroundSize: `${metaForCover.zoom}%`,
                        backgroundPosition: `${metaForCover.posX}% ${metaForCover.posY}%`,
                      }
                    : undefined
                }
              />

              {/* input file ẩn cho cover */}
              <input
                type="file"
                accept="image/*"
                ref={coverInputRef}
                style={{ display: "none" }}
                onChange={handleCoverFileChange}
              />

              {/* icon camera -> upload ngay */}
              <button
                type="button"
                className="profile-cover-upload"
                onClick={(e) => {
                  e.stopPropagation();
                  triggerCoverUpload();
                }}
              >
                📷
              </button>

              {/* menu 3 lựa chọn cho ảnh bìa */}
              {coverMenuOpen && (
                <div className="profile-img-menu profile-img-menu-cover">
                  <button type="button" onClick={triggerCoverUpload}>
                    Tải ảnh lên
                  </button>
                  <button type="button" onClick={handleCoverEdit}>
                    Chỉnh sửa
                  </button>
                  <button type="button" onClick={handleCoverDownload}>
                    Tải xuống
                  </button>
                </div>
              )}

              {/* ===== AVATAR ===== */}
              <div
                className="profile-avatar-wrap"
                onClick={(e) => {
                  e.stopPropagation();
                  setAvatarMenuOpen((v) => !v);
                }}
              >
                {metaForAvatar.url ? (
                  <div
                    className="profile-avatar-img bg-mode"
                    style={{
                      backgroundImage: `url(${metaForAvatar.url})`,
                      backgroundSize: `${metaForAvatar.zoom}%`,
                      backgroundPosition: `${metaForAvatar.posX}% ${metaForAvatar.posY}%`,
                    }}
                  />
                ) : (
                  <div className="profile-avatar-fallback">
                    {initialChar}
                  </div>
                )}

                {/* input file ẩn cho avatar */}
                <input
                  type="file"
                  accept="image/*"
                  ref={avatarInputRef}
                  style={{ display: "none" }}
                  onChange={handleAvatarFileChange}
                />

                {/* icon camera -> upload ngay */}
                <button
                  type="button"
                  className="profile-avatar-upload"
                  onClick={(e) => {
                    e.stopPropagation();
                    triggerAvatarUpload();
                  }}
                >
                  📷
                </button>

                {/* menu 3 lựa chọn cho avatar */}
                {avatarMenuOpen && (
                  <div className="profile-img-menu profile-img-menu-avatar">
                    <button type="button" onClick={triggerAvatarUpload}>
                      Tải ảnh lên
                    </button>
                    <button type="button" onClick={handleAvatarEdit}>
                      Chỉnh sửa
                    </button>
                    <button type="button" onClick={handleAvatarDownload}>
                      Tải xuống
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* ===== BODY ===== */}
            <div className="profile-body">
              <h1 className="profile-name">{displayName || "Người dùng"}</h1>
              <p className="profile-rating">Chưa có đánh giá</p>

              <div className="profile-stats">
                <div>
                  <div className="profile-stat-number">0</div>
                  <div className="profile-stat-label">Người theo dõi</div>
                </div>
                <div>
                  <div className="profile-stat-number">0</div>
                  <div className="profile-stat-label">Đang theo dõi</div>
                </div>
              </div>

              <hr className="profile-divider" />

              {/* Giới tính */}
              <div className="profile-row">
                <User size={16} />
                <span>
                  Giới tính:{" "}
                  <strong className="profile-emphasis">{genderLabel}</strong>
                </span>
              </div>

              {/* Ngày sinh */}
              <div className="profile-row">
                <CalendarDays size={16} />
                <span>
                  Ngày sinh:{" "}
                  <strong className="profile-emphasis">
                    {birthdayLabel}
                  </strong>
                </span>
              </div>

              {/* Đã tham gia */}
              <div className="profile-row">
                <CalendarDays size={16} />
                <span>
                  Đã tham gia:{" "}
                  <strong className="profile-emphasis">
                    {formatJoinDuration(joinDate)}
                  </strong>
                </span>
              </div>

              <div className="profile-row">
                <ShieldCheck size={16} />
                <span>
                  Đã xác thực:
                  <span className="profile-badge">SDT</span>
                  <span className="profile-badge">Email</span>
                  <span className="profile-badge profile-badge-google">
                    Google
                  </span>
                </span>
              </div>

              <div className="profile-row">
                <MapPin size={16} />
                <span>
                  Địa chỉ:{" "}
                  <strong className="profile-emphasis">Chưa cung cấp</strong>
                </span>
              </div>

              {/* Nút chuyển sang trang chỉnh sửa thông tin cá nhân */}
              <button
                className="profile-edit-btn"
                type="button"
                onClick={() => navigate("/chinh-sua-trang-ca-nhan")}
              >
                Chỉnh sửa trang cá nhân
              </button>
            </div>
          </section>
        </div>
      </main>

      {/* MODAL CROP (chung cho avatar & cover) */}
      <ImageAdjustModal
        open={!!cropState.type}
        src={cropState.src}
        aspect={cropState.type === "cover" ? 2 : 1}
        title={
          cropState.type === "cover" ? "Chỉnh ảnh bìa" : "Chỉnh ảnh đại diện"
        }
        initialMeta={cropState.type === "cover" ? metaForCover : metaForAvatar}
        onCancel={handleCropCancel}
        onSave={handleCropSave}
      />
    </div>
  );
}
