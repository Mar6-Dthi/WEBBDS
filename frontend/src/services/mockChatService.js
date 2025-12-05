// src/services/mockChatService.js
import { getCurrentUserName } from "./mockFavoriteService";

const CHAT_STORAGE_KEY = "mock_chats";

/* ========= helpers đọc/ghi localStorage ========= */
function loadChats() {
  try {
    return JSON.parse(localStorage.getItem(CHAT_STORAGE_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveChats(list) {
  localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(list));
  // bắn event cho FE biết có thay đổi tin nhắn
  window.dispatchEvent(new Event("mock-chats-changed"));
}

/**
 * Gửi 1 tin nhắn tới chủ bài (receiverName)
 * – dùng ở ChatModal khi chị bấm Gửi
 */
export function sendChatMessageMock({
  postId,
  postTitle,
  receiverName,
  text,
}) {
  const senderName = getCurrentUserName();
  if (!senderName) return { error: "NOT_LOGIN" };

  const content = (text || "").trim();
  if (!content) return { error: "EMPTY_MESSAGE" };

  // không gửi tin cho chính mình
  if (!receiverName || receiverName === senderName) {
    return { ok: true, skipped: true };
  }

  const chats = loadChats();
  const now = Date.now();

  chats.unshift({
    id: now,
    postId,
    postTitle: postTitle || "",
    senderName, // người nhắn (CHỊ)
    receiverName, // chủ bài
    text: content,
    createdAt: now,
    isRead: false, // phía người nhận chưa đọc
  });

  saveChats(chats);
  return { ok: true };
}

/**
 * Lấy danh sách TIN NHẮN có liên quan tới user hiện tại
 *  - chị là NGƯỜI NHẬN  hoặc
 *  - chị là NGƯỜI GỬI
 */
export function getMyChatsMock() {
  const me = getCurrentUserName();
  if (!me) return [];

  const chats = loadChats();

  return chats
    .filter((c) => c.receiverName === me || c.senderName === me)
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
}

/**
 * Đếm số tin NHẬN CHƯA ĐỌC (badge trên icon Message)
 * – chỉ tính khi mình là receiver
 */
export function getMyUnreadChatsCountMock() {
  const me = getCurrentUserName();
  if (!me) return 0;
  const chats = loadChats();

  return chats.filter(
    (c) => c.receiverName === me && c.isRead === false
  ).length;
}

/**
 * Đánh dấu tất cả tin NHẬN là đã đọc
 */
export function markChatsAsReadMock() {
  const me = getCurrentUserName();
  if (!me) return;

  const chats = loadChats();
  let changed = false;

  const updated = chats.map((c) => {
    if (c.receiverName === me && c.isRead === false) {
      changed = true;
      return { ...c, isRead: true };
    }
    return c;
  });

  if (changed) {
    saveChats(updated);
  }
}

/**
 * 🌟 SEED MOCK: tạo sẵn vài đoạn chat mà CHỊ LÀ NGƯỜI GỬI
 * Mỗi user mới login sẽ được seed riêng, không ảnh hưởng dữ liệu user khác.
 */
export function seedSampleChatsForCurrentUser() {
  const me = getCurrentUserName();
  if (!me) return;

  const current = loadChats();

  // ✅ Chỉ bỏ qua nếu user hiện tại đã có ít nhất 1 đoạn chat
  const hasChatForMe = current.some(
    (c) => c.senderName === me || c.receiverName === me
  );
  if (hasChatForMe) return;

  const now = Date.now();

  const samples = [
    {
      id: now + 1,
      postId: 101,
      postTitle: "Đất nền 100m² Bình Chánh",
      senderName: me, // chị là người nhắn
      receiverName: "Anh Minh", // chủ bài 1 (mock)
      text:
        "Chào anh Minh, em thấy tin đất nền 100m² Bình Chánh, còn đất không ạ?",
      createdAt: now - 1000 * 60 * 45, // 45 phút trước
      isRead: false,
    },
    {
      id: now + 2,
      postId: 102,
      postTitle: "Phòng trọ 25m² Quận 12",
      senderName: me,
      receiverName: "Chị Khánh Vy",
      text: "Chị ơi, phòng trọ 25m² Q12 còn phòng trống không ạ?",
      createdAt: now - 1000 * 60 * 90, // 1.5 giờ trước
      isRead: false,
    },
    {
      id: now + 3,
      postId: 103,
      postTitle: "Văn phòng 40m² ngay Q.Tân Bình",
      senderName: me,
      receiverName: "Anh Thanh Hà",
      text:
        "Em quan tâm văn phòng 40m² Q.Tân Bình, giá còn thương lượng được không anh?",
      createdAt: now - 1000 * 60 * 150, // 2.5 giờ trước
      isRead: true,
    },
  ];

  const merged = [...samples, ...current];
  saveChats(merged);
}
