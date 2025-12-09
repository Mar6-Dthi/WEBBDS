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

/**
 * mode:
 *  - "favoriteOwner": chủ tin nhắn cho người đã like tin (tự tạo câu chào)
 *  - "buyerToSeller": người xem tin nhắn cho người bán (không auto câu chào)
 */
export default function ChatModal({ open, onClose, post, mode = "favoriteOwner" }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bodyRef = useRef(null);

  // Tên hiển thị người còn lại
  const otherName = post?.ownerName || post?.sellerName || "Người dùng";

  // KHÓA DUY NHẤT CHO HỘI THOẠI THEO BÀI
  const postKey = getPostKey(post);

  // Load / tạo đoạn hội thoại ban đầu
  useEffect(() => {
    if (!post || !postKey) return;
    const storageKey = CHAT_KEY_PREFIX + postKey;

    // 1. Thử load từ localStorage
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

    // 2. Chưa có đoạn chat nào
    let initial = [];
    const currentOtherName =
      post.ownerName || post.sellerName || "Người dùng";

    if (mode === "favoriteOwner") {
      const meName = getCurrentUserName() || "mình";
      initial = [
        {
          id: 1,
          from: "me",
          text: `Chào ${currentOtherName}, mình là ${meName}. Mình thấy bạn đã thêm tin "${post.title}" vào mục yêu thích, bạn cần thêm thông tin gì không?`,
        },
      ];
    } else if (mode === "buyerToSeller") {
      // người mua nhắn cho người bán -> không auto câu chào
      initial = [];
    }

    setMessages(initial);
    setInput("");

    try {
      if (initial.length > 0) {
        localStorage.setItem(storageKey, JSON.stringify(initial));
      }
    } catch {
      // ignore
    }
  }, [postKey, mode]); // ❗ CHỈ phụ thuộc postKey, không phụ thuộc object post

  // Auto scroll khi messages đổi
  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  if (!open || !post) return null;

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;
    if (!postKey) return;

    const storageKey = CHAT_KEY_PREFIX + postKey;

    // Gửi tin cho người kia (đồng thời mock lưu vào trang Message)
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

    // Cập nhật lịch sử hội thoại local
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
