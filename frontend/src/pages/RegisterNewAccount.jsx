// src/pages/RegisterNewAccount.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import "../styles/RegisterNewAccount.css";
import LoginFooter from "../components/LoginFooter";

const MOCK_USERS_KEY = "mockUsers";

// Regex SĐT: 10 số, bắt đầu bằng 0 (vd: 0987654321)
const PHONE_REGEX = /^0\d{9}$/;

function getMockUsers() {
  try {
    const raw = localStorage.getItem(MOCK_USERS_KEY) || "[]";
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveMockUsers(users) {
  localStorage.setItem(MOCK_USERS_KEY, JSON.stringify(users));
}

// Modal đơn giản để báo trạng thái
function RegModal({ open, message, onClose }) {
  if (!open) return null;
  return (
    <div className="reg-modal-backdrop">
      <div className="reg-modal">
        <h3>Thông báo</h3>
        <p>{message}</p>
        <button type="button" className="reg-modal-btn" onClick={onClose}>
          Đã hiểu
        </button>
      </div>
    </div>
  );
}

export default function RegisterNewAccount() {
  const navigate = useNavigate();
  const location = useLocation();

  // Nếu từ trang login truyền phone sang thì lấy làm giá trị mặc định
  const initialPhone = location.state?.phone || "";

  const [phone, setPhone] = useState(initialPhone);
  const [fullName, setFullName] = useState("");
  const [password, setPassword] = useState("");
  const [agree, setAgree] = useState(true);

  // lỗi hiển thị dưới input
  const [phoneError, setPhoneError] = useState("");
  const [nameError, setNameError] = useState("");
  const [passError, setPassError] = useState("");

  // modal
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMsg, setModalMsg] = useState("");

  // rule mật khẩu
  const lengthOk = password.length >= 8 && password.length <= 32;
  const upperOk = /[A-Z]/.test(password);
  const lowerOk = /[a-z]/.test(password);
  const digitOk = /\d/.test(password);
  const allRuleOk = lengthOk && upperOk && lowerOk && digitOk;

  const handleBack = () => {
    navigate(-1);
  };

  const validate = () => {
    let valid = true;

    // reset lỗi
    setPhoneError("");
    setNameError("");
    setPassError("");

    const trimmedPhone = phone.trim();

    // ===== VALIDATE SĐT =====
    if (!trimmedPhone) {
      setPhoneError("Vui lòng nhập Số điện thoại.");
      valid = false;
    } else if (!PHONE_REGEX.test(trimmedPhone)) {
      setPhoneError(
        "Số điện thoại không hợp lệ. Vui lòng nhập 10 số và bắt đầu bằng 0."
      );
      valid = false;
    }

    // ===== VALIDATE HỌ TÊN =====
    if (!fullName.trim()) {
      setNameError("Vui lòng nhập Họ và tên.");
      valid = false;
    }

    // ===== VALIDATE MẬT KHẨU =====
    if (!password) {
      setPassError("Vui lòng nhập mật khẩu.");
      valid = false;
    } else if (!allRuleOk) {
      setPassError("Mật khẩu chưa đáp ứng đủ các điều kiện.");
      valid = false;
    }

    // ===== CHECK ĐIỀU KHOẢN =====
    if (!agree) {
      setModalMsg("Bạn cần đồng ý Điều khoản sử dụng và Chính sách bảo mật.");
      setModalOpen(true);
      valid = false;
    }

    return valid;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const trimmedPhone = phone.trim();

    const users = getMockUsers();
    const existed = users.find((u) => u.phone === trimmedPhone);
    if (existed) {
      setModalMsg("Số điện thoại này đã được đăng ký (mock).");
      setModalOpen(true);
      return;
    }

    users.push({
      phone: trimmedPhone,
      name: fullName.trim(),
      password,
    });
    saveMockUsers(users);

    setModalMsg("Đăng ký thành công! Hãy đăng nhập bằng mật khẩu.");
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    const msg = modalMsg;
    setModalOpen(false);

    // nếu là thông báo thành công thì điều hướng sang màn nhập mật khẩu
    if (msg.startsWith("Đăng ký thành công")) {
      navigate("/login-password", {
        replace: true,
        state: { phone: phone.trim() },
      });
    }
  };

  return (
    <div className="nt-login-page">
      <img className="nt-bg-img" src="/Img/allbackground1.jpg" alt="" />

      <div className="nt-login-container reg-container">
        <div className="reg-main">
          {/* HEADER */}
          <div className="reg-header">
            <button
              type="button"
              className="reg-back-btn"
              onClick={handleBack}
            >
              ←
            </button>
            <h1 className="reg-title">Đăng ký tài khoản mới</h1>
          </div>

          <p className="reg-sub">
            Nhập thông tin để đăng ký{" "}
            {phone && <span className="reg-phone">{phone}</span>}
          </p>

          {/* FORM */}
          <div className="reg-form">
            {/* Số điện thoại */}
            <div className="reg-field">
              <div
                className={
                  "reg-input-row" + (phoneError ? " reg-input-error" : "")
                }
              >
                <input
                  type="tel"
                  placeholder="Số điện thoại *"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
              {phoneError && (
                <div className="reg-error-text">{phoneError}</div>
              )}
            </div>

            {/* Họ và tên */}
            <div className="reg-field">
              <div
                className={
                  "reg-input-row" + (nameError ? " reg-input-error" : "")
                }
              >
                <input
                  type="text"
                  placeholder="Họ và tên *"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              {nameError && <div className="reg-error-text">{nameError}</div>}
            </div>

            {/* Mật khẩu */}
            <div className="reg-field">
              <div
                className={
                  "reg-input-row" + (passError ? " reg-input-error" : "")
                }
              >
                <input
                  type="password"
                  placeholder="Mật khẩu *"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              {passError && <div className="reg-error-text">{passError}</div>}
            </div>

            {/* RULES 4 tiêu chí */}
            <div className="reg-rules-grid">
              <p className={`reg-rule ${lengthOk ? "ok" : ""}`}>
                Giới hạn từ 8–32 ký tự.
              </p>
              <p className={`reg-rule ${upperOk ? "ok" : ""}`}>
                Tối thiểu 01 ký tự IN HOA.
              </p>
              <p className={`reg-rule ${lowerOk ? "ok" : ""}`}>
                Tối thiểu 01 ký tự in thường.
              </p>
              <p className={`reg-rule ${digitOk ? "ok" : ""}`}>
                Tối thiểu 01 chữ số.
              </p>
            </div>

            {/* Check điều khoản */}
            <label className="reg-terms">
              <span className="reg-checkbox-wrap">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                />
                <span className="reg-checkbox-custom" />
              </span>
              <span className="reg-terms-text">
                Bằng việc Đăng Ký, bạn đã đọc và đồng ý với{" "}
                <a href="#">Điều khoản sử dụng</a> và{" "}
                <a href="#">Chính sách bảo mật</a> của Chợ Tốt
              </span>
            </label>

            {/* Nút tiếp tục */}
            <button
              type="button"
              className="reg-submit"
              onClick={handleSubmit}
            >
              Tiếp tục
            </button>
          </div>
        </div>

        <LoginFooter />
      </div>

      <RegModal
        open={modalOpen}
        message={modalMsg}
        onClose={handleCloseModal}
      />
    </div>
  );
}
