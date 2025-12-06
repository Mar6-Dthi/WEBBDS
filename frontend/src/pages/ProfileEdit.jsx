// src/pages/ProfileEdit.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/ProfileEdit.css";
import NhatotHeader from "../components/header";

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

export default function ProfileEdit() {
  const navigate = useNavigate();
  const isLoggedIn = !!localStorage.getItem("accessToken");

  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
    }
  }, [isLoggedIn, navigate]);

  const [activeTab, setActiveTab] = useState("info"); // "info" | "account"
  const [currentUser, setCurrentUser] = useState(null);
  const [loginMethod, setLoginMethod] = useState("password"); // hoặc "google"

  // ===== FORM THÔNG TIN CÁ NHÂN =====
  const [form, setForm] = useState({
    name: "",
    phone: "",
    gender: "",
    birthday: "",
    email: "",
  });

  // ===== FORM ĐỔI MẬT KHẨU =====
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [pwError, setPwError] = useState("");
  const [pwSuccess, setPwSuccess] = useState("");

  // Load dữ liệu ban đầu từ localStorage
  useEffect(() => {
    let storedUser = null;
    try {
      storedUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    } catch {
      storedUser = null;
    }

    const accountName = localStorage.getItem("accountName") || "";
    const accountPhone = localStorage.getItem("accountPhone") || "";

    const initial = {
      name: storedUser?.name || accountName || "",
      phone: storedUser?.phone || accountPhone || "",
      gender: storedUser?.gender || "",
      birthday: storedUser?.birthday || "",
      email: storedUser?.email || "",
    };

    setCurrentUser(storedUser);
    setForm(initial);

    // Xác định cách đăng nhập
    const methodFromUser =
      storedUser?.loginMethod ||
      (storedUser?.provider === "google" ? "google" : "password");
    setLoginMethod(methodFromUser || "password");
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmitProfile = (e) => {
    e.preventDefault();

    const updatedUser = {
      ...(currentUser || {}),
      name: form.name.trim(),
      phone: form.phone.trim(),
      gender: form.gender,
      birthday: form.birthday.trim(), // lưu string dd/mm/yyyy
      email: form.email.trim(),
    };

    // Lưu lại vào localStorage
    localStorage.setItem("currentUser", JSON.stringify(updatedUser));
    localStorage.setItem("accountName", updatedUser.name || "");
    localStorage.setItem("accountPhone", updatedUser.phone || "");

    setCurrentUser(updatedUser);

    // bắn event cho header / panel nếu cần lắng nghe để cập nhật UI
    window.dispatchEvent(new Event("profile-changed"));

    alert("Cập nhật thông tin cá nhân thành công!");
  };

  // ====== XỬ LÝ ĐỔI MẬT KHẨU ======
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
      setPwError("Tài khoản đăng nhập bằng Google, không đặt lại mật khẩu.");
      return;
    }

    const { currentPassword, newPassword, confirmPassword } = pwForm;
    const trimmedCurrent = currentPassword.trim();
    const trimmedNew = newPassword.trim();
    const trimmedConfirm = confirmPassword.trim();

    if (!trimmedCurrent || !trimmedNew || !trimmedConfirm) {
      setPwError("Vui lòng điền đầy đủ tất cả các trường.");
      return;
    }

    if (trimmedNew.length < 6) {
      setPwError("Mật khẩu mới phải có ít nhất 6 ký tự.");
      return;
    }

    if (trimmedNew !== trimmedConfirm) {
      setPwError("Xác nhận mật khẩu mới không khớp.");
      return;
    }

    const phone = form.phone.trim();
    if (!phone) {
      setPwError("Không tìm thấy số điện thoại tài khoản.");
      return;
    }

    const users = loadMockUsers();
    const idx = users.findIndex((u) => u.phone === phone);

    if (idx === -1) {
      setPwError("Không tìm thấy tài khoản trong hệ thống (mock).");
      return;
    }

    const user = users[idx];

    if ((user.password || "") !== trimmedCurrent) {
      setPwError("Mật khẩu hiện tại không đúng.");
      return;
    }

    const updatedUser = { ...user, password: trimmedNew };
    const nextUsers = [...users];
    nextUsers[idx] = updatedUser;
    saveMockUsers(nextUsers);

    if (currentUser) {
      const updatedCurrent = { ...currentUser, password: trimmedNew };
      setCurrentUser(updatedCurrent);
      localStorage.setItem("currentUser", JSON.stringify(updatedCurrent));
    }

    setPwForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setPwSuccess(
      "Đổi mật khẩu thành công. Lần đăng nhập sau hãy dùng mật khẩu mới."
    );
  };

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
            {/* ==== MENU BÊN TRÁI ==== */}
            <aside className="pf-sidebar">
              <button
                type="button"
                className={
                  "pf-menu-item" +
                  (activeTab === "info" ? " pf-menu-item--active" : "")
                }
                onClick={() => setActiveTab("info")}
              >
                Thông tin cá nhân
              </button>

              <button
                type="button"
                className={
                  "pf-menu-item" +
                  (activeTab === "account" ? " pf-menu-item--active" : "")
                }
                onClick={() => setActiveTab("account")}
              >
                Cài đặt tài khoản
              </button>
            </aside>

            {/* ==== NỘI DUNG BÊN PHẢI ==== */}
            <section className="pf-content">
              {activeTab === "info" && (
                <form className="pf-card" onSubmit={handleSubmitProfile}>
                  <h2 className="pf-card-title">Hồ sơ cá nhân</h2>

                  {/* Họ và tên */}
                  <div className="pf-field">
                    <label className="pf-label">
                      Họ và tên <span className="pf-required">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      className="pf-input"
                      placeholder="Nhập họ và tên"
                      required
                    />
                  </div>

                  {/* Số điện thoại + Giới tính */}
                  <div className="pf-field pf-field-inline">
                    <div>
                      <label className="pf-label">
                        Số điện thoại <span className="pf-required">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="pf-input"
                        placeholder="Nhập số điện thoại"
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

                  {/* Ngày sinh + Email */}
                  <div className="pf-field pf-field-inline">
                    <div>
                      <label className="pf-label">Ngày sinh</label>
                      <input
                        type="text"
                        name="birthday"
                        value={form.birthday}
                        onChange={handleChange}
                        className="pf-input"
                        placeholder="dd/mm/yyyy"
                        pattern="\d{2}/\d{2}/\d{4}"
                        title="Định dạng ngày sinh dd/mm/yyyy"
                      />
                    </div>

                    <div>
                      <label className="pf-label">Email</label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        className="pf-input"
                        placeholder="you@example.com"
                      />
                    </div>
                  </div>

                  <div className="pf-actions">
                    <button type="submit" className="pf-btn-primary">
                      Lưu thay đổi
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "account" && (
                <div className="pf-card">
                  <h2 className="pf-card-title">Cài đặt tài khoản</h2>

                  {loginMethod === "google" ? (
                    <p className="pf-muted">
                      Tài khoản của bạn đang đăng nhập bằng Google nên không
                      cần đặt lại mật khẩu. Nếu muốn dùng mật khẩu riêng, chị
                      có thể tạo một tài khoản bằng số điện thoại.
                    </p>
                  ) : (
                    <form onSubmit={handleSubmitPassword}>
                      <div className="pf-field">
                        <label className="pf-label">
                          Mật khẩu hiện tại{" "}
                          <span className="pf-required">*</span>
                        </label>
                        <input
                          type="password"
                          name="currentPassword"
                          value={pwForm.currentPassword}
                          onChange={handlePwChange}
                          className="pf-input"
                          placeholder="Nhập mật khẩu hiện tại"
                          required
                        />
                      </div>

                      <div className="pf-field">
                        <label className="pf-label">
                          Mật khẩu mới <span className="pf-required">*</span>
                        </label>
                        <input
                          type="password"
                          name="newPassword"
                          value={pwForm.newPassword}
                          onChange={handlePwChange}
                          className="pf-input"
                          placeholder="Nhập mật khẩu mới (≥ 6 ký tự)"
                          required
                        />
                      </div>

                      <div className="pf-field">
                        <label className="pf-label">
                          Xác nhận mật khẩu mới{" "}
                          <span className="pf-required">*</span>
                        </label>
                        <input
                          type="password"
                          name="confirmPassword"
                          value={pwForm.confirmPassword}
                          onChange={handlePwChange}
                          className="pf-input"
                          placeholder="Nhập lại mật khẩu mới"
                          required
                        />
                      </div>

                      {pwError && <p className="pf-error">{pwError}</p>}
                      {pwSuccess && <p className="pf-success">{pwSuccess}</p>}

                      <div className="pf-actions">
                        <button type="submit" className="pf-btn-primary">
                          Đổi mật khẩu
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>
    </div>
  );
}
