// src/pages/ProfileEdit.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileEdit.css";
import NhatotHeader from "../components/header";
import LocationSelect from "../components/LocationSelect";

/* ============================================================
   MODAL THÔNG BÁO
============================================================ */
function NotifyModal({ open, message, onClose }) {
  if (!open) return null;

  return (
    <div className="pf-modal-backdrop">
      <div className="pf-modal">
        <h3 className="pf-modal-title">Thông báo</h3>
        <p className="pf-modal-message">{message}</p>

        <div className="pf-modal-actions">
          <button className="pf-btn-primary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}

/* ============================================================
   MODAL XÁC NHẬN XOÁ ĐỊA CHỈ
============================================================ */
function ConfirmDeleteModal({ open, onConfirm, onCancel }) {
  if (!open) return null;

  return (
    <div className="pf-modal-backdrop">
      <div className="pf-modal">
        <h3 className="pf-modal-title">Xoá địa chỉ?</h3>
        <p className="pf-modal-message">
          Bạn có chắc muốn xoá địa chỉ này không?
        </p>

        <div className="pf-modal-actions">
          <button className="pf-btn-ghost" onClick={onCancel}>
            Hủy
          </button>
          <button className="pf-btn-primary" onClick={onConfirm}>
            Xoá
          </button>
        </div>
      </div>
    </div>
  );
}

const MOCK_USERS_KEY = "mockUsers";

function loadMockUsers() {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY) || "[]";
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

function saveMockUsers(list) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(list));
}

/* ============================================================
   ĐỒNG BỘ USER -> BẢN GHI MÔI GIỚI
   (để trang môi giới của tôi lấy được avatar, bìa, giới thiệu, khu vực)
============================================================ */
function syncUserToAgents(user) {
  if (!user) return;

  let key = null;
  let list = [];

  try {
    if (localStorage.getItem("agents")) {
      key = "agents";
      list = JSON.parse(localStorage.getItem("agents") || "[]");
    } else if (localStorage.getItem("mockAgents")) {
      key = "mockAgents";
      list = JSON.parse(localStorage.getItem("mockAgents") || "[]");
    } else {
      return;
    }
  } catch {
    return;
  }

  if (!Array.isArray(list)) return;

  const idx = list.findIndex(
    (a) =>
      a.ownerId === user.id ||
      a.userId === user.id ||
      a.phone === user.phone
  );

  if (idx === -1) return;

  const agent = { ...list[idx] };

  // Tên & sđt
  if (user.name) agent.name = user.name;
  if (user.phone) agent.phone = user.phone;

  // Avatar & banner lấy từ trang cá nhân
  if (user.avatarUrl) agent.avatarUrl = user.avatarUrl;
  if (user.coverUrl) agent.bannerUrl = user.coverUrl;

  // Giới thiệu
  if (user.profileIntro) agent.desc = user.profileIntro;

  // Khu vực hoạt động từ danh sách tỉnh
  if (Array.isArray(user.profileProvinces) && user.profileProvinces.length) {
    agent.area = user.profileProvinces.join(", ");
  }

  list[idx] = agent;
  localStorage.setItem(key, JSON.stringify(list));
}

/* ============================================================
   PROFILE EDIT PAGE
============================================================ */
export default function ProfileEdit() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("accessToken");

  useEffect(() => {
    if (!isLoggedIn) navigate("/login");
  }, [isLoggedIn, navigate]);

  const [activeTab, setActiveTab] = useState("info");
  const [currentUser, setCurrentUser] = useState(null);
  const [loginMethod, setLoginMethod] = useState("password");

  // FORM INFO
  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    birthday: "",
    email: "",
    intro: "", // ⭐ Giới thiệu
  });

  // 5 ĐỊA CHỈ
  const [addressList, setAddressList] = useState(["", "", "", "", ""]);

  // Địa chỉ đang mở panel
  const [activeAddressIndex, setActiveAddressIndex] = useState(null);

  // Modal thông báo
  const [notify, setNotify] = useState({ open: false, message: "" });
  // Flag: sau khi đóng modal sẽ chuyển sang trang profile
  const [shouldNavigateProfile, setShouldNavigateProfile] = useState(false);

  // Modal xác nhận xoá
  const [deleteModal, setDeleteModal] = useState({ open: false, index: null });

  // PASSWORD FORM
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  /* ============================================================
     LOAD USER
  ============================================================ */
  useEffect(() => {
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      storedUser = null;
    }

    const accountName = localStorage.getItem("accountName") || "";
    const accountPhone = localStorage.getItem("accountPhone") || "";

    setForm({
      name: storedUser?.name || accountName || "",
      phone: storedUser?.phone || accountPhone || "",
      gender: storedUser?.gender || "",
      birthday: storedUser?.birthday || "",
      email: storedUser?.email || "",
      intro: storedUser?.profileIntro || "", // ⭐ load giới thiệu
    });

    setCurrentUser(storedUser);

    const saved = storedUser?.profileProvinces || [];
    const padded = Array.from({ length: 5 }, (_, i) => saved[i] || "");
    setAddressList(padded);

    const method =
      storedUser?.loginMethod ||
      (storedUser?.provider === "google" ? "google" : "password");
    setLoginMethod(method || "password");
  }, []);

  /* ============================================================
     CHANGE FORM FIELD
  ============================================================ */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /* ============================================================
     CHANGE ADDRESS — CHỐNG TRÙNG
  ============================================================ */
  const handleAddressChange = (index, provinceLabel) => {
    const value = provinceLabel === "Tất cả" ? "" : provinceLabel;

    setAddressList((prev) => {
      if (value && prev.some((p, i) => i !== index && p === value)) {
        setNotify({
          open: true,
          message:
            "Địa chỉ này đã được chọn ở ô khác. Vui lòng chọn tỉnh/thành khác.",
        });
        return prev;
      }

      const next = [...prev];
      next[index] = value;

      if (!value) {
        for (let i = index + 1; i < 5; i++) next[i] = "";
      }
      return next;
    });
  };

  /* ============================================================
     XOÁ ĐỊA CHỈ
  ============================================================ */
  const handleRemoveAddress = (index) => {
    setAddressList((prev) => {
      const compact = prev.filter((_, i) => i !== index);
      const nonEmpty = compact.filter((p) => p);
      const padded = Array.from({ length: 5 }, (_, i) => nonEmpty[i] || "");
      return padded;
    });

    setActiveAddressIndex((prev) =>
      prev === index ? null : prev > index ? prev - 1 : prev
    );
  };

  const confirmRemove = () => {
    if (deleteModal.index != null) {
      handleRemoveAddress(deleteModal.index);
    }
    setDeleteModal({ open: false, index: null });
  };

  /* ============================================================
     SUBMIT PROFILE
  ============================================================ */
  const handleSubmitProfile = (e) => {
    e.preventDefault();

    const cleaned = addressList.filter((p) => p && p.trim());

    const updatedUser = {
      ...(currentUser || {}),
      name: form.name.trim(),
      phone: form.phone.trim(),
      gender: form.gender,
      birthday: form.birthday.trim(),
      email: form.email.trim(),
      profileProvinces: cleaned,
      profileIntro: form.intro.trim(), // ⭐ lưu giới thiệu
    };

    // Lưu localStorage
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    localStorage.setItem("accountName", updatedUser.name || "");
    localStorage.setItem("accountPhone", updatedUser.phone || "");

    setCurrentUser(updatedUser);

    // Đồng bộ qua bản ghi môi giới (để avatar, bìa, giới thiệu, khu vực sang trang môi giới)
    syncUserToAgents(updatedUser);

    // Bắn event để các trang khác cập nhật
    window.dispatchEvent(new Event("profile-changed"));
    window.dispatchEvent(new Event("agents-changed"));

    // Hiện modal thông báo, sau khi đóng sẽ sang trang profile
    setShouldNavigateProfile(true);
    setNotify({
      open: true,
      message: "Cập nhật thông tin cá nhân thành công!",
    });
  };

  /* ============================================================
     CHANGE PASSWORD
  ============================================================ */
  const handlePwChange = (e) => {
    const { name, value } = e.target;
    setPwForm((prev) => ({ ...prev, [name]: value }));
    setPwError("");
    setPwSuccess("");
  };

  const handleSubmitPassword = (e) => {
    e.preventDefault();
    setPwError("");
    setPwSuccess("");

    if (loginMethod === "google") {
      setPwError("Tài khoản Google không đổi mật khẩu.");
      return;
    }

    const users = loadMockUsers();
    const idx = users.findIndex((u) => u.phone === form.phone.trim());

    if (idx === -1) {
      setPwError("Không tìm thấy tài khoản.");
      return;
    }

    if ((users[idx].password || "") !== pwForm.currentPassword.trim()) {
      setPwError("Mật khẩu hiện tại không đúng.");
      return;
    }

    if (pwForm.newPassword.trim().length < 6) {
      setPwError("Mật khẩu mới phải ≥ 6 ký tự.");
      return;
    }

    if (pwForm.newPassword.trim() !== pwForm.confirmPassword.trim()) {
      setPwError("Xác nhận mật khẩu không khớp.");
      return;
    }

    users[idx].password = pwForm.newPassword.trim();
    saveMockUsers(users);

    setPwForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

    setPwSuccess("Đổi mật khẩu thành công!");
  };

  /* ============================================================
     HANDLER ĐÓNG MODAL THÔNG BÁO
  ============================================================ */
  const handleCloseNotify = () => {
    setNotify({ open: false, message: "" });
    if (shouldNavigateProfile) {
      navigate("/trang-ca-nhan");
    }
  };

  /* ============================================================
     UI
  ============================================================ */
  return (
    <div className="nhatot">
      <NhatotHeader />

      <main className="pf-page" style={{ paddingTop: 88 }}>
        <div className="pf-inner">
          {/* Breadcrumb */}
          <div className="pf-breadcrumb">
            <span>Chợ Tốt</span>
            <span className="pf-breadcrumb-sep">›</span>
            <span>Trang cá nhân</span>
            <span className="pf-breadcrumb-sep">›</span>
            <span>
              {activeTab === "info" ? "Thông tin cá nhân" : "Cài đặt tài khoản"}
            </span>
          </div>

          <h1 className="pf-title">
            {activeTab === "info" ? "Thông tin cá nhân" : "Cài đặt tài khoản"}
          </h1>

          <div className="pf-layout">
            {/* Sidebar */}
            <aside className="pf-sidebar">
              <button
                type="button"
                className={`pf-menu-item ${
                  activeTab === "info" ? "pf-menu-item--active" : ""
                }`}
                onClick={() => setActiveTab("info")}
              >
                Thông tin cá nhân
              </button>

              <button
                type="button"
                className={`pf-menu-item ${
                  activeTab === "account" ? "pf-menu-item--active" : ""
                }`}
                onClick={() => setActiveTab("account")}
              >
                Cài đặt tài khoản
              </button>
            </aside>

            {/* CONTENT */}
            <section className="pf-content">
              {/* =============== TAB INFO =============== */}
              {activeTab === "info" && (
                <form className="pf-card" onSubmit={handleSubmitProfile}>
                  <h2 className="pf-card-title">Hồ sơ cá nhân</h2>

                  {/* Họ tên */}
                  <div className="pf-field">
                    <label className="pf-label">
                      Họ và tên <span className="pf-required">*</span>
                    </label>
                    <input
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="pf-input"
                      required
                    />
                  </div>

                  {/* Phone + Gender */}
                  <div className="pf-field pf-field-inline">
                    <div>
                      <label className="pf-label">
                        Số điện thoại <span className="pf-required">*</span>
                      </label>
                      <input
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="pf-input"
                        required
                      />
                    </div>

                    <div>
                      <label className="pf-label">Giới tính</label>
                      <select
                        name="gender"
                        value={form.gender}
                        onChange={handleChange}
                        className="pf-input"
                      >
                        <option value="">-- Chọn giới tính --</option>
                        <option value="male">Nam</option>
                        <option value="female">Nữ</option>
                        <option value="other">Khác</option>
                      </select>
                    </div>
                  </div>

                  {/* Birthday + Email */}
                  <div className="pf-field pf-field-inline">
                    <div>
                      <label className="pf-label">Ngày sinh</label>
                      <input
                        name="birthday"
                        value={form.birthday}
                        onChange={handleChange}
                        className="pf-input"
                        placeholder="dd/mm/yyyy"
                      />
                    </div>

                    <div>
                      <label className="pf-label">Email</label>
                      <input
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="pf-input"
                      />
                    </div>
                  </div>

                  {/* ⭐ GIỚI THIỆU */}
                  <div className="pf-field">
                    <label className="pf-label">Giới thiệu</label>
                    <textarea
                      name="intro"
                      value={form.intro}
                      onChange={handleChange}
                      className="pf-input pf-textarea"
                      rows={3}
                      placeholder="Ví dụ: Chuyên môi giới nhà phố khu vực Bình Thạnh, Phú Nhuận..."
                    />
                    <p className="pf-hint">
                      Nội dung này sẽ hiển thị ở phần &quot;Giới thiệu&quot; trên
                      trang môi giới của bạn.
                    </p>
                  </div>

                  {/* =============== ĐỊA CHỈ =============== */}
                  <div className="pf-field">
                    <label className="pf-label">Địa chỉ (tối đa 5)</label>

                    {addressList.map((val, idx) => {
                      if (idx > 0 && !addressList[idx - 1]) return null;

                      const isActive = activeAddressIndex === idx;

                      return (
                        <div
                          key={idx}
                          className="pf-address-row"
                          style={{
                            position: "relative",
                            zIndex: isActive ? 999 : 100 - idx,
                          }}
                        >
                          <div className="pf-address-main">
                            <label className="pf-label">
                              Địa chỉ {idx + 1}
                            </label>
                            <LocationSelect
                              value={val || "Tất cả"}
                              onChange={(province) =>
                                handleAddressChange(idx, province)
                              }
                              onOpenChange={(isOpen) =>
                                setActiveAddressIndex(isOpen ? idx : null)
                              }
                            />
                          </div>

                          {val && (
                            <button
                              type="button"
                              className="pf-address-remove"
                              onClick={() =>
                                setDeleteModal({ open: true, index: idx })
                              }
                            >
                              Xóa
                            </button>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  <div className="pf-actions">
                    <button className="pf-btn-primary">Lưu thay đổi</button>
                  </div>
                </form>
              )}

              {/* =============== TAB ACCOUNT =============== */}
              {activeTab === "account" && (
                <div className="pf-card">
                  <h2 className="pf-card-title">Cài đặt tài khoản</h2>

                  {loginMethod === "google" ? (
                    <p className="pf-muted">
                      Tài khoản Google không cần đặt lại mật khẩu.
                    </p>
                  ) : (
                    <form onSubmit={handleSubmitPassword}>
                      <div className="pf-field">
                        <label className="pf-label">Mật khẩu hiện tại</label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={pwForm.currentPassword}
                          onChange={handlePwChange}
                          className="pf-input"
                          required
                        />
                      </div>

                      <div className="pf-field">
                        <label className="pf-label">Mật khẩu mới</label>
                        <input
                          type="password"
                          name="newPassword"
                          value={pwForm.newPassword}
                          onChange={handlePwChange}
                          className="pf-input"
                          required
                        />
                      </div>

                      <div className="pf-field">
                        <label className="pf-label">Xác nhận mật khẩu</label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={pwForm.confirmPassword}
                          onChange={handlePwChange}
                          className="pf-input"
                          required
                        />
                      </div>

                      {pwError && <p className="pf-error">{pwError}</p>}
                      {pwSuccess && <p className="pf-success">{pwSuccess}</p>}

                      <button
                        className="pf-btn-primary"
                        style={{ marginTop: 10 }}
                      >
                        Đổi mật khẩu
                      </button>
                    </form>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* =============== MODALS =============== */}
      <NotifyModal
        open={notify.open}
        message={notify.message}
        onClose={handleCloseNotify}
      />

      <ConfirmDeleteModal
        open={deleteModal.open}
        onCancel={() => setDeleteModal({ open: false, index: null })}
        onConfirm={confirmRemove}
      />
    </div>
);
}