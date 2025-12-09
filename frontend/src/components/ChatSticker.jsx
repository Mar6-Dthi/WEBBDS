import React, { useState, useEffect } from "react";
import { X, Send } from "lucide-react";
import "../styles/ChatSticker.css";

const CHAT_KEY = "chatStickerMessages";

export default function ChatSticker() {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);

  /* ==== Load lịch sử chat khi component render ==== */
  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(CHAT_KEY) || "[]");
      if (Array.isArray(saved) && saved.length > 0) {
        setMessages(saved);
      } else {
        // Nếu chưa có lịch sử → tạo tin nhắn mặc định
        setMessages([
          {
            id: 1,
            from: "bot",
            text: "Chào bạn 👋 Bạn cần tư vấn về mua bán, cho thuê hay gói hội viên?",
            time: "Vừa xong",
          },
        ]);
      }
    } catch {
      console.log("Không đọc được lịch sử chat");
    }
  }, []);

  /* ==== Lưu lại tin nhắn mỗi khi messages thay đổi ==== */
  useEffect(() => {
    localStorage.setItem(CHAT_KEY, JSON.stringify(messages));
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text) return;

    const newMsg = {
      id: Date.now(),
      from: "user",
      text,
      time: "Bạn",
    };

    setMessages((prev) => [...prev, newMsg]);
    setInput("");

    // Bot trả lời demo
    setTimeout(() => {
      const botMsg = {
        id: Date.now() + 1,
        from: "bot",
        text: "Cảm ơn bạn, đội ngũ sẽ liên hệ sớm nhất có thể nhé! 😊",
        time: "Hệ thống",
      };
      setMessages((prev) => [...prev, botMsg]);
    }, 600);
  };

  return (
    <>
      {/* Sticker — chỉ hiện khi chưa mở modal */}
      {!open && (
        <img
          src="/img/Chatboxicon.png"
          alt="Tư vấn"
          className="chat-sticker"
          onClick={() => setOpen(true)}
        />
      )}

      {/* Modal chat */}
      {open && (
        <div className="chat-sticker-modal-fixed">
          <div className="chat-sticker-modal">
            <div className="chat-sticker-header">
              <div>
                <div className="chat-sticker-title">Chat tư vấn</div>
                <div className="chat-sticker-subtitle">
                  Hỗ trợ từ 8:00 - 22:00
                </div>
              </div>
              <button
                className="chat-sticker-close"
                onClick={() => setOpen(false)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="chat-sticker-body">
              {messages.map((m) => (
                <div
                  key={m.id}
                  className={
                    "chat-sticker-msg " +
                    (m.from === "user"
                      ? "chat-sticker-msg-user"
                      : "chat-sticker-msg-bot")
                  }
                >
                  <div className="chat-sticker-msg-text">{m.text}</div>
                  <div className="chat-sticker-msg-meta">{m.time}</div>
                </div>
              ))}
            </div>

            <form className="chat-sticker-input-row" onSubmit={handleSend}>
              <input
                className="chat-sticker-input"
                placeholder="Nhập câu hỏi..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
              />
              <button type="submit" className="chat-sticker-send-btn">
                <Send size={18} />
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
