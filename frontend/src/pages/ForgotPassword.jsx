// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/Login.css";
import "../styles/ForgotPassword.css";
import LoginFooter from "../components/LoginFooter";

const MOCK_USERS_KEY = "mockUsers";

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

// Modal báo đã gửi OTP
function OtpSentModal({ open, phone, otp, onClose }) {
  if (!open) return null;
  return (
    <div className="fp-modal-backdrop">
      <div className="fp-modal">
        <h3>Đã gửi mã xác thực</h3>
        <p>
          Một mã OTP gồm <strong>6 số</strong> đã được gửi tới số điện thoại{" "}
          <strong>{phone}</strong>. Mã có hiệu lực trong{" "}
          <strong>5 phút</strong>.
        </p>
        {/* Dòng demo – sau này có thể xoá */}
        <p className="fp-modal-demo">
          (Demo: mã OTP hiện tại là <strong>{otp}</strong>)
        </p>

        <button type="button" className="fp-modal-btn" onClick={onClose}>
          Đã hiểu
        </button>
      </div>
    </div>
  );
}

// Modal dùng chung cho lỗi / thông báo (OTP, mật khẩu...)
function StatusModal({ open, title, message, onClose }) {
  if (!open) return null;
  return (
    <div className="fp-modal-backdrop">
      <div className="fp-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <button type="button" className="fp-modal-btn" onClick={onClose}>
          Đã hiểu
        </button>
      </div>
    </div>
  );
}

export default function ForgotPassword() {
  const navigate = useNavigate();
  const location = useLocation();

  const phoneFromState = location.state?.phone || "";
  const [step, setStep] = useState(1); // 1: SĐT, 2: OTP, 3: MK mới
  const [phone, setPhone] = useState(phoneFromState);
  const [otpInput, setOtpInput] = useState("");
  const [newPass, setNewPass] = useState("");

  // OTP
  const [otpCode, setOtpCode] = useState("");
  const [otpExpireAt, setOtpExpireAt] = useState(null);

  // Modal "đã gửi OTP"
  const [showOtpModal, setShowOtpModal] = useState(false);

  // Modal trạng thái chung
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusTitle, setStatusTitle] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusNext, setStatusNext] = useState(null); // 'gotoStep3' | 'backToStep1' | 'backToLogin' | null

  const openStatusModal = (title, message, next = null) => {
    setStatusTitle(title);
    setStatusMessage(message);
    setStatusNext(next);
    setStatusOpen(true);
  };

  const handleCloseStatus = () => {
    setStatusOpen(false);
    if (statusNext === "gotoStep3") {
      setStep(3);
      setOtpInput("");
    } else if (statusNext === "backToStep1") {
      setStep(1);
      setOtpInput("");
    } else if (statusNext === "backToLogin") {
      navigate("/login-password", { replace: true, state: { phone } });
    }
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
    else navigate(-1);
  };

  const generateOtp = () =>
    String(Math.floor(100000 + Math.random() * 900000)); // 6 số

  /* ============ BƯỚC 1: GỬI OTP ============ */
  const handlePhoneSubmit = () => {
    if (!phone.trim()) {
      openStatusModal("Lỗi", "Vui lòng nhập số điện thoại.");
      return;
    }

    const users = getMockUsers();
    const user = users.find((u) => u.phone === phone);
    if (!user) {
      openStatusModal("Lỗi", "Số điện thoại này chưa được đăng ký (mock).");
      return;
    }

    const otp = generateOtp();
    const expire = Date.now() + 5 * 60 * 1000; // 5 phút

    setOtpCode(otp);
    setOtpExpireAt(expire);

    // sang bước nhập OTP + mở modal báo đã gửi
    setStep(2);
    setShowOtpModal(true);
  };

  /* ============ BƯỚC 2: NHẬP OTP ============ */
  const handleOtpSubmit = () => {
    if (!otpInput.trim()) {
      openStatusModal("Lỗi mã OTP", "Vui lòng nhập mã OTP.");
      return;
    }

    if (!/^\d{6}$/.test(otpInput)) {
      openStatusModal(
        "Lỗi mã OTP",
        "Mã OTP phải gồm chính xác 6 chữ số."
      );
      return;
    }

    if (!otpExpireAt || Date.now() > otpExpireAt) {
      openStatusModal(
        "Mã OTP hết hạn",
        "Mã OTP đã hết hạn. Vui lòng gửi lại mã mới.",
        "backToStep1"
      );
      return;
    }

    if (otpInput !== otpCode) {
      openStatusModal(
        "Lỗi mã OTP",
        "Mã OTP không chính xác. Vui lòng kiểm tra lại."
      );
      return;
    }

    // thành công
    openStatusModal(
      "Xác thực thành công",
      "Mã OTP chính xác. Vui lòng đặt mật khẩu mới.",
      "gotoStep3"
    );
  };

  /* ============ BƯỚC 3: ĐẶT MẬT KHẨU MỚI ============ */

  // Các điều kiện mật khẩu
  const pwd = newPass || "";
  const lengthOk = pwd.length >= 8 && pwd.length <= 32;
  const upperOk = /[A-Z]/.test(pwd);
  const lowerOk = /[a-z]/.test(pwd);
  const digitOk = /\d/.test(pwd);
  const allOk = lengthOk && upperOk && lowerOk && digitOk;

  const handleNewPassSubmit = () => {
    if (!allOk) {
      openStatusModal(
        "Mật khẩu chưa hợp lệ",
        "Vui lòng đảm bảo mật khẩu đáp ứng đầy đủ tất cả yêu cầu bên dưới."
      );
      return;
    }

    const users = getMockUsers();
    const idx = users.findIndex((u) => u.phone === phone);
    if (idx === -1) {
      openStatusModal(
        "Lỗi",
        "Không tìm thấy tài khoản để đổi mật khẩu (mock).",
        "backToStep1"
      );
      return;
    }

    users[idx].password = pwd;
    saveMockUsers(users);

    // Thành công -> báo qua modal, đóng modal xong quay về đăng nhập
    openStatusModal(
      "Đổi mật khẩu thành công",
      "Bạn có thể đăng nhập bằng mật khẩu mới.",
      "backToLogin"
    );
  };

  /* ============ RENDER THEO STEP ============ */
  let contentTitle = "Đặt lại mật khẩu";
  let contentDesc = "Nhập số điện thoại để đặt lại mật khẩu của bạn.";
  let contentBody = null;
  let submitHandler = handlePhoneSubmit;

  if (step === 1) {
    // Số điện thoại
    contentBody = (
      <div className="fp-input-row">
        <input
          type="tel"
          placeholder="Nhập số điện thoại *"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        {!!phone && (
          <button
            type="button"
            className="fp-clear-btn"
            onClick={() => setPhone("")}
          >
            ✕
          </button>
        )}
      </div>
    );
    submitHandler = handlePhoneSubmit;
  } else if (step === 2) {
    // OTP
    contentDesc = `Nhập mã OTP gồm 6 số đã gửi tới số điện thoại ${phone}.`;
    contentBody = (
      <div className="fp-input-row">
        <input
          type="text"
          placeholder="Nhập mã OTP *"
          value={otpInput}
          onChange={(e) => setOtpInput(e.target.value)}
        />
        {!!otpInput && (
          <button
            type="button"
            className="fp-clear-btn"
            onClick={() => setOtpInput("")}
          >
            ✕
          </button>
        )}
      </div>
    );
    submitHandler = handleOtpSubmit;
  } else {
    // Mật khẩu mới – giao diện giống trang đặt mật khẩu
    contentDesc = `Đặt mật khẩu mới cho tài khoản ${phone}.`;
    contentBody = (
      <>
        <div className="fp-input-row">
          <input
            type="password"
            placeholder="Mật khẩu mới *"
            value={newPass}
            onChange={(e) => setNewPass(e.target.value)}
          />
          {!!newPass && (
            <button
              type="button"
              className="fp-clear-btn"
              onClick={() => setNewPass("")}
            >
              ✕
            </button>
          )}
        </div>

        {/* Danh sách yêu cầu mật khẩu */}
        <ul className="pw-rules">
          <li className={`pw-rule ${lengthOk ? "ok" : ""}`}>
            Giới hạn từ 8–32 ký tự.
          </li>
          <li className={`pw-rule ${upperOk ? "ok" : ""}`}>
            Tối thiểu 01 ký tự IN HOA.
          </li>
          <li className={`pw-rule ${lowerOk ? "ok" : ""}`}>
            Tối thiểu 01 ký tự in thường.
          </li>
          <li className={`pw-rule ${digitOk ? "ok" : ""}`}>
            Tối thiểu 01 chữ số.
          </li>
        </ul>
      </>
    );
    submitHandler = handleNewPassSubmit;
  }

  return (
    <div className="nt-login-page">
      <img className="nt-bg-img" src="/Img/allbackground1.jpg" alt="" />

      <div className="nt-login-container fp-container">
        <div className="fp-main">
          <div className="fp-header">
            <button
              type="button"
              className="fp-back-btn"
              onClick={handleBack}
            >
              ←
            </button>
            <h1 className="fp-title">{contentTitle}</h1>
          </div>

          <p className="fp-sub">{contentDesc}</p>

          <div className="fp-form">
            {contentBody}
            <button
              type="button"
              className="fp-submit"
              onClick={submitHandler}
            >
              Tiếp tục
            </button>
          </div>
        </div>

        <LoginFooter />
      </div>

      {/* Modal đã gửi OTP */}
      <OtpSentModal
        open={showOtpModal}
        phone={phone}
        otp={otpCode}
        onClose={() => setShowOtpModal(false)}
      />

      {/* Modal trạng thái (OTP sai/đúng, mật khẩu chưa đúng, đổi thành công, ...) */}
      <StatusModal
        open={statusOpen}
        title={statusTitle}
        message={statusMessage}
        onClose={handleCloseStatus}
      />
    </div>
  );
}
