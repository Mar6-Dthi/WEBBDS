// src/components/ChatModal.jsx
import React, { useEffect, useState, useRef } from "react";
import { X, Send } from "lucide-react";
import "../styles/ChatModal.css";
import { sendChatMessageMock } from "../services/mockChatService";

// key lưu hội thoại theo bài đăng
const CHAT_KEY_PREFIX = "chat_conv_";

function getPostKey(post) {
  if (!post) return null;
  // ưu tiên id, nếu không có thì fallback theo title
  return post.id != null ? String(post.id) : `title_${post.title || ""}`;
}

export default function ChatModal({ open, onClose, post }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const bodyRef = useRef(null);

  const otherName = post?.ownerName || post?.sellerName || "Người bán";

  // 🔁 Mỗi khi đổi sang bài khác → load hội thoại từ localStorage, hoặc tạo mới
  useEffect(() => {
    if (!post) return;
    const key = getPostKey(post);
    if (!key) return;

    const storageKey = CHAT_KEY_PREFIX + key;

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        // đã từng chat → load lại
        const saved = JSON.parse(raw);
        setMessages(saved);
        setInput("");
        return;
      }
    } catch {
      // ignore parse error
    }

    // chưa có đoạn chat nào → tạo hội thoại mẫu rồi lưu
    const initial = [
      {
        id: 1,
        from: "other",
        text: `Xin chào, mình là ${otherName}. Bạn quan tâm tin "${post.title}" phải không?`,
      },
      {
        id: 2,
        from: "me",
        text: "Dạ em quan tâm, tin còn không ạ?",
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

  // 🌟 Auto scroll xuống cuối khi messages thay đổi
  useEffect(() => {
    if (!bodyRef.current) return;
    bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages]);

  // ❗ Hook luôn ở trên, sau đó mới được return
  if (!open || !post) return null;

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const key = getPostKey(post);
    if (!key) return;
    const storageKey = CHAT_KEY_PREFIX + key;

    // 1) Gửi tin nhắn cho CHỦ BÀI (mock BE)
    const res = sendChatMessageMock({
      postId: post.id,
      postTitle: post.title,
      receiverName: otherName, // chủ bài
      text,
    });

    if (res?.error === "NOT_LOGIN") {
      alert("Vui lòng đăng nhập để gửi tin nhắn.");
      return;
    }

    // 2) Lưu vào hội thoại local của người đang xem
    setMessages((prev) => {
      const next = [...prev, { id: Date.now(), from: "me", text }];
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        // ignore
      }
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

        {/* Ô GỬI TIN NHẮN */}
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
