// src/components/ChatModal.jsx
import React, { useEffect, useState, useRef } from "react";
import { X, Send } from "lucide-react";
import "../styles/ChatModal.css";
import { sendChatMessageMock } from "../services/mockChatService";
import { getCurrentUserName } from "../services/mockFavoriteService";

const CHAT_KEY_PREFIX = "chat_conv_";

function getPostKey(post) {
  if (!post) return null;
  return post.id != null ? String(post.id) : `title_${post.title || ""}`;
}

export default function ChatModal({ open, onClose, post }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bodyRef = useRef(null);

  // 👇 Tên người còn lại (người đã like bài của mình)
  const otherName = post?.ownerName || post?.sellerName || "Người dùng";

  // Load / tạo đoạn hội thoại ban đầu
  useEffect(() => {
    if (!post) return;
    const key = getPostKey(post);
    if (!key) return;
    const storageKey = CHAT_KEY_PREFIX + key;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const saved = JSON.parse(raw);
        setMessages(saved);
        setInput("");
        return;
      }
    } catch {
      // ignore
    }

    // ❗ Chưa có đoạn chat nào => CHÍNH MÌNH nhắn trước
    const meName = getCurrentUserName() || "mình";

    const initial = [
      {
        id: 1,
        from: "me", // => bubble bên phải, màu cam
        text: `Chào ${otherName}, mình là ${meName}. Mình thấy bạn đã thêm tin "${post.title}" vào mục yêu thích, bạn cần thêm thông tin gì không?`,
      },
    ];

    setMessages(initial);
    setInput("");
    try {
      localStorage.setItem(storageKey, JSON.stringify(initial));
    } catch {
      // ignore
    }
  }, [post, otherName]);

  // Auto scroll
  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  if (!open || !post) return null;

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const key = getPostKey(post);
    if (!key) return;
    const storageKey = CHAT_KEY_PREFIX + key;

    // Gửi tin cho người kia (người đã like bài)
    const res = sendChatMessageMock({
      postId: post.id,
      postTitle: post.title,
      receiverName: otherName,
      text,
    });

    if (res?.error === "NOT_LOGIN") {
      alert("Vui lòng đăng nhập để gửi tin nhắn.");
      return;
    }

    // Lưu local đoạn chat
    setMessages((prev) => {
      const next = [...prev, { id: Date.now(), from: "me", text }];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {}
      return next;
    });

    setInput("");
  };

  return (
    <div className="chat-modal-wrapper">
      <div className="chat-modal">
        {/* HEADER */}
        <div className="chat-header">
          <div className="chat-header-left">
            <div className="chat-avatar">
              {otherName.charAt(0).toUpperCase()}
            </div>
            <div>
              {/* 👇 Tên hiển thị là tên người đã like (người kia) */}
              <div className="chat-name">{otherName}</div>
              <div className="chat-sub">
                Đang trao đổi về:{" "}
                <span title={post.title}>{post.title}</span>
              </div>
            </div>
          </div>

          <button
            className="chat-close-btn"
            type="button"
            onClick={onClose}
          >
            <X size={18} />
          </button>
        </div>

        {/* NỘI DUNG CHAT */}
        <div className="chat-body" ref={bodyRef}>
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                "chat-bubble-row " +
                (m.from === "me" ? "is-me" : "is-other")
              }
            >
              <div className="chat-bubble">{m.text}</div>
            </div>
          ))}
        </div>

        {/* Ô NHẬP TIN NHẮN */}
        <form className="chat-input-row" onSubmit={handleSend}>
          <input
            className="chat-input"
            placeholder="Nhập tin nhắn..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <button className="chat-send-btn" type="submit">
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}
