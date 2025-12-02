// src/pages/Messages.jsx
import React, { useEffect, useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import "../styles/header.css";
import "../styles/Messages.css";

import NhatotHeader from "../components/header";
import {
  getMyChatsMock,
  markChatsAsReadMock,
  sendChatMessageMock,
} from "../services/mockChatService";

// tạo key hội thoại: dựa trên postId + 2 bên tham gia (bất kể chiều gửi)
function getConversationKey(msg) {
  const postKey = msg.postId != null ? String(msg.postId) : "no-post";
  const a = (msg.senderName || "").trim();
  const b = (msg.receiverName || "").trim();
  const participants = [a, b].sort().join("::");
  return `${postKey}__${participants}`;
}

export default function Messages() {
  const navigate = useNavigate();

  const [rawMessages, setRawMessages] = useState([]);   // toàn bộ message
  const [selectedConvId, setSelectedConvId] = useState(null); // hội thoại đang chọn
  const [reply, setReply] = useState("");               // input trả lời

  const isLoggedIn = !!localStorage.getItem("accessToken");
  const currentName = (localStorage.getItem("accountName") || "").trim();

  // ===== HELPER: tên người còn lại trong 1 message =====
  function getPartnerName(msg) {
    const sender = (msg.senderName || "").trim();
    const receiver = (msg.receiverName || "").trim();

    if (!currentName) return sender || receiver || "Người dùng";
    if (sender === currentName) return receiver || "Người dùng";
    if (receiver === currentName) return sender || "Người dùng";

    return sender || receiver || "Người dùng";
  }

  // ===== LOAD DATA LẦN ĐẦU =====
  useEffect(() => {
    if (!isLoggedIn) {
      navigate("/login");
      return;
    }

    const data = getMyChatsMock() || [];
    setRawMessages(data);

    // chọn hội thoại mới nhất
    if (data.length > 0) {
      const firstConv = getConversationKey(data[0]);
      setSelectedConvId(firstConv);
    }

    // mở trang tin nhắn ⇒ đánh dấu đã đọc tất cả tin nhận
    markChatsAsReadMock();
  }, [isLoggedIn, navigate]);

  // ===== TỪ LIST MESSAGES → LIST HỘI THOẠI BÊN TRÁI =====
  const conversations = React.useMemo(() => {
    const map = new Map();

    rawMessages.forEach((m) => {
      const key = getConversationKey(m);
      const partnerName = getPartnerName(m);
      const time = m.createdAt || 0;

      const existing = map.get(key);
      if (!existing || time > existing.lastTime) {
        map.set(key, {
          id: key,
          postId: m.postId,
          postTitle: m.postTitle || "Bài đăng bất động sản",
          partnerName,
          lastText: m.text || "",
          lastTime: time,
          // chưa đọc nếu mình là người nhận & isRead = false
          isUnread: !m.isRead && (m.receiverName || "").trim() === currentName,
        });
      }
    });

    return Array.from(map.values()).sort(
      (a, b) => (b.lastTime || 0) - (a.lastTime || 0)
    );
  }, [rawMessages, currentName]);

  // hội thoại đang chọn
  const selectedConversation =
    conversations.find((c) => c.id === selectedConvId) || null;

  // message thuộc hội thoại đang chọn (dùng cho khung chat bên phải)
  const selectedMessages = React.useMemo(() => {
    if (!selectedConvId) return [];
    return rawMessages
      .filter((m) => getConversationKey(m) === selectedConvId)
      .sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0)); // cũ → mới
  }, [rawMessages, selectedConvId]);

  const handleSelectConversation = (convId) => {
    setSelectedConvId(convId);
    setReply("");
  };

  // ===== GỬI TRẢ LỜI NGAY TRONG HỘP THƯ =====
  const handleReplySubmit = (e) => {
    e.preventDefault();
    const text = reply.trim();
    if (!text || !selectedConversation) return;

    // gửi tin nhắn mock
    sendChatMessageMock({
      postId: selectedConversation.postId,
      postTitle: selectedConversation.postTitle,
      receiverName: selectedConversation.partnerName,
      text,
    });

    // load lại toàn bộ messages để hội thoại được cập nhật
    const data = getMyChatsMock() || [];
    setRawMessages(data);

    setReply("");
  };

  return (
    <div className="nhatot">
      {/* HEADER NHÀ TỐT */}
      <NhatotHeader />

      {/* NỘI DUNG TRANG TIN NHẮN */}
      <div className="msg-page">
        <main className="msg-main" style={{ paddingTop: 88 }}>
          <div className="msg-inner">
            <div className="msg-header-row">
              <div>
                <div className="msg-breadcrumb">
                  <span>Chợ Tốt</span>
                  <span className="msg-breadcrumb-sep">»</span>
                  <span>Tin nhắn</span>
                </div>
                <h1 className="msg-title">Hộp thư tin nhắn</h1>
              </div>
            </div>

            {/* Không có hội thoại */}
            {conversations.length === 0 && (
              <div className="msg-empty">
                <p>Hiện tại chị chưa có tin nhắn nào.</p>
                <p>
                  Khi chị đăng tin và khách bấm <strong>Chat</strong>, tin nhắn
                  sẽ hiển thị ở đây.
                </p>
              </div>
            )}

            {conversations.length > 0 && (
              <div className="msg-layout">
                {/* ===== CỘT TRÁI: DANH SÁCH HỘI THOẠI (CÓ THANH CUỘN) ===== */}
                <div className="msg-list">
                  {conversations.map((conv) => (
                    <button
                      key={conv.id}
                      type="button"
                      onClick={() => handleSelectConversation(conv.id)}
                      className={
                        "msg-item" +
                        (selectedConvId === conv.id
                          ? " msg-item--active"
                          : "") +
                        (conv.isUnread ? " msg-item--unread" : "")
                      }
                    >
                      <div className="msg-item-top">
                        <span className="msg-sender">
                          {conv.partnerName || "Người dùng"}
                        </span>
                        <span className="msg-time">
                          {conv.lastTime
                            ? new Date(conv.lastTime).toLocaleString("vi-VN")
                            : ""}
                        </span>
                      </div>

                      <div
                        className="msg-item-title"
                        title={conv.postTitle}
                      >
                        {conv.postTitle}
                      </div>

                      <div className="msg-item-text" title={conv.lastText}>
                        {conv.lastText}
                      </div>
                    </button>
                  ))}
                </div>

                {/* ===== CỘT PHẢI: HỘI THOẠI DẠNG CHAT ===== */}
                <div className="msg-detail">
                  {!selectedConversation && (
                    <div className="msg-detail-empty">
                      Chọn một hội thoại để xem chi tiết.
                    </div>
                  )}

                  {selectedConversation && (
                    <>
                      <div className="msg-detail-head">
                        <div>
                          <div className="msg-detail-label">
                            Người liên hệ
                          </div>
                          <div className="msg-detail-sender">
                            {selectedConversation.partnerName}
                          </div>
                        </div>
                        {selectedConversation.lastTime && (
                          <div className="msg-detail-time">
                            {new Date(
                              selectedConversation.lastTime
                            ).toLocaleString("vi-VN")}
                          </div>
                        )}
                      </div>

                      <div className="msg-detail-block">
                        <div className="msg-detail-label">Bài đăng</div>
                        {selectedConversation.postId ? (
                          <NavLink
                            to={`/post/${selectedConversation.postId}`}
                            className="msg-detail-post-link"
                          >
                            {selectedConversation.postTitle || "Xem bài đăng"}
                          </NavLink>
                        ) : (
                          <div className="msg-detail-post-text">
                            {selectedConversation.postTitle ||
                              "Bài đăng bất động sản"}
                          </div>
                        )}
                      </div>

                      {/* KHUNG CHAT GIỮA – BUBBLE TRÁI / PHẢI */}
                      <div className="msg-detail-block">
                        <div className="msg-detail-label">
                          Nội dung hội thoại
                        </div>
                        <div className="msg-detail-conversation">
                          {selectedMessages.length === 0 && (
                            <div className="msg-detail-empty">
                              Chưa có tin nhắn nào trong hội thoại này.
                            </div>
                          )}

                          {selectedMessages.map((m) => {
                            const isMe =
                              (m.senderName || "").trim() === currentName;
                            return (
                              <div
                                key={m.id}
                                className={
                                  "msg-chat-row " +
                                  (isMe ? "msg-chat-row--me" : "msg-chat-row--other")
                                }
                              >
                                <div className="msg-chat-bubble">
                                  {m.text}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Ô TRẢ LỜI GIỐNG MESSENGER */}
                      <form
                        className="msg-reply-row"
                        onSubmit={handleReplySubmit}
                      >
                        <input
                          className="msg-reply-input"
                          placeholder="Nhập tin nhắn trả lời..."
                          value={reply}
                          onChange={(e) => setReply(e.target.value)}
                        />
                        <button
                          className="msg-reply-btn"
                          type="submit"
                          disabled={!reply.trim()}
                        >
                          Gửi
                        </button>
                      </form>

                      <div className="msg-detail-note">
                        Đây là bản mock hộp thư tin nhắn phục vụ demo giao diện.
                        Hội thoại 2 chiều realtime sẽ kết nối backend sau.
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
