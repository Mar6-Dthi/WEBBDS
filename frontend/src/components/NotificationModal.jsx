// src/components/NotificationModal.jsx
import React, { useEffect, useState } from "react";
import {
  getMyNotificationsMock,
  markNotificationReadMock,
} from "../services/mockFavoriteService";
import { X, MessageCircle } from "lucide-react";
import "../styles/NotificationModal.css";
import ChatModal from "./ChatModal"; // 👈 dùng chung ChatModal

export default function NotificationModal({ open, onClose }) {
  const [list, setList] = useState([]);
  const [selected, setSelected] = useState(null);

  // trạng thái mở ChatModal từ thông báo
  const [chatPost, setChatPost] = useState(null);
  const [isChatOpen, setIsChatOpen] = useState(false);

  // load thông báo mỗi lần mở modal
  useEffect(() => {
    if (!open) return;
    const data = getMyNotificationsMock();
    setList(data);
    setSelected(null); // mở modal thì cho user tự chọn
  }, [open]);

  // ❗ Chỉ unmount hoàn toàn khi KHÔNG mở modal & KHÔNG mở chat
  if (!open && !isChatOpen) return null;

  const handleSelect = (n) => {
    setSelected(n);

    // nếu thông báo này chưa đọc thì mark read
    if (!n.isRead) {
      markNotificationReadMock(n.id); // cập nhật storage

      // cập nhật ngay trên UI
      setList((prev) =>
        prev.map((item) =>
          item.id === n.id ? { ...item, isRead: true } : item
        )
      );
    }
  };

  // 👉 Bấm "Chat ngay"
  const handleChatNow = () => {
    if (!selected) return;

    const otherName = selected.actorName || "Người dùng";

    const postData = {
      id: selected.postId,
      title: selected.postTitle,
      sellerName: otherName,
    };

    setChatPost(postData);
    setIsChatOpen(true);

    // ✅ TẮT MODAL THÔNG BÁO, nhưng vẫn giữ ChatModal
    if (typeof onClose === "function") {
      onClose(); // parent set open = false
    }
  };

  return (
    <>
      {/* ===== MODAL THÔNG BÁO – chỉ render khi open = true ===== */}
      {open && (
        <div className="notif-modal-backdrop">
          <div className="notif-modal">
            {/* ===== HEADER ===== */}
            <div className="notif-header">
              <h3>Thông báo</h3>
              <button className="notif-close" onClick={onClose}>
                <X size={20} />
              </button>
            </div>

            <div className="notif-body">
              {/* ===== DANH SÁCH ===== */}
              <div className="notif-list">
                {list.length === 0 && (
                  <div className="notif-empty">Chưa có thông báo.</div>
                )}

                {list.map((n) => (
                  <div
                    key={n.id}
                    className={
                      "notif-item " +
                      (selected?.id === n.id ? "active " : "") +
                      (n.isRead ? "read" : "unread")
                    }
                    onClick={() => handleSelect(n)}
                  >
                    <div className="notif-item-text">{n.content}</div>
                    <div className="notif-item-time">
                      {new Date(n.createdAt).toLocaleString("vi-VN")}
                    </div>
                  </div>
                ))}
              </div>

              {/* ===== CHI TIẾT ===== */}
              <div className="notif-detail">
                {!selected && <p>Chọn thông báo để xem chi tiết</p>}

                {selected && (
                  <>
                    <h4 className="notif-detail-title">
                      {selected.actorName} đã thích bài viết của bạn
                    </h4>

                    <div className="notif-detail-meta">
                      <p>
                        <strong>Bài: </strong> {selected.postTitle}
                      </p>
                      <p>
                        <strong>Thời gian: </strong>
                        {new Date(selected.createdAt).toLocaleString("vi-VN")}
                      </p>
                    </div>

                    <div className="notif-detail-actions">
                      <button className="btn-chat" onClick={handleChatNow}>
                        <MessageCircle size={18} />
                        Chat ngay
                      </button>

                      <a
                        className="btn-view"
                        href={`/post/${selected.postId}`}
                      >
                        Xem bài đăng
                      </a>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 👇 ChatModal luôn render, chỉ phụ thuộc isChatOpen */}
      <ChatModal
        open={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        post={chatPost}
      />
    </>
  );
}
