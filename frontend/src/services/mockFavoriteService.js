// src/services/mockFavoriteService.js

function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ================== PHẦN YÊU THÍCH (FAVORITES) ==================
const FAVORITE_KEY = "favorites_mock";

/** Lấy danh sách ID tin đã được thả tim */
export function getFavoriteIds() {
  const raw = load(FAVORITE_KEY);
  if (!Array.isArray(raw)) return [];

  // Ép về string và loại trùng cho chắc
  const set = new Set(raw.map((id) => String(id)));
  return Array.from(set);
}

/**
 * Bật / tắt yêu thích cho một bài.
 * @param {string} postId
 * @returns {{ ids: string[], added: boolean }}
 *  - ids: danh sách ID mới
 *  - added: true nếu thao tác hiện tại là THÊM tim, false nếu là GỠ tim
 */
export function toggleFavorite(postId) {
  const ids = getFavoriteIds();
  const pid = String(postId);
  const exists = ids.includes(pid);

  let next;
  let added = false;

  if (exists) {
    next = ids.filter((id) => id !== pid); // gỡ tim
  } else {
    next = [...ids, pid]; // thêm tim
    added = true;
  }

  save(FAVORITE_KEY, next);
  return { ids: next, added };
}

// ================== PHẦN THÔNG BÁO (NOTIFICATIONS) ==================

// Lấy tên user đang login (ưu tiên currentUser.name, fallback accountName)
export function getCurrentUserName() {
  try {
    const cur = JSON.parse(localStorage.getItem("currentUser") || "{}");
    if (cur.name) return cur.name;
  } catch {
    // ignore
  }
  const accName = localStorage.getItem("accountName") || "";
  return accName.trim() || null;
}

/**
 * Khi bấm tim một bài (CHỈ khi chuyển từ "chưa tim" → "đã tim")
 * gọi hàm này để tạo thông báo cho CHỦ BÀI.
 *
 * Có thể truyền thêm các field khác nếu cần (price, location, thumbnail...)
 */
export function toggleFavoriteMock({
  postId,
  postTitle,
  ownerName,
  postPrice,
  postLocation,
  postThumbnail,
}) {
  const actorName = getCurrentUserName();
  if (!actorName) {
    return { error: "NOT_LOGIN" };
  }

  // không tự thông báo cho mình
  if (!ownerName || ownerName === actorName) {
    return { ok: true, skipped: true };
  }

  const notifications = load("notifications_mock");

  notifications.unshift({
    id: Date.now(),
    ownerName, // người nhận thông báo (chủ bài)
    actorName, // người bấm tim
    postId,
    postTitle,
    postPrice,
    postLocation,
    postThumbnail,
    content: `${actorName} đã thêm bài viết "${postTitle}" của bạn vào mục yêu thích`,
    createdAt: Date.now(),
    isRead: false, // thông báo mới luôn ở trạng thái CHƯA ĐỌC
  });

  save("notifications_mock", notifications);

  // 🔔 bắn event cho FE biết là có thay đổi (badge sẽ tăng lên)
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mock-notifications-changed"));
  }

  return { ok: true };
}

// Lấy danh sách thông báo của user hiện tại (tức chủ bài)
export function getMyNotificationsMock() {
  const me = getCurrentUserName();
  if (!me) return [];
  const notifications = load("notifications_mock");
  return notifications.filter((n) => n.ownerName === me);
}

/**
 * Đánh dấu 1 thông báo là ĐÃ ĐỌC (dùng khi click vào 1 item trong modal)
 */
export function markNotificationReadMock(id) {
  const notifications = load("notifications_mock");
  const updated = notifications.map((n) =>
    n.id === id ? { ...n, isRead: true } : n
  );
  save("notifications_mock", updated);
}

/**
 * Đánh dấu TẤT CẢ thông báo của user hiện tại là đã đọc.
 */
export function markNotificationsAsReadMock() {
  const me = getCurrentUserName();
  if (!me) return;

  const notifications = load("notifications_mock");
  const updated = notifications.map((n) =>
    n.ownerName === me ? { ...n, isRead: true } : n
  );

  save("notifications_mock", updated);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mock-notifications-changed"));
  }
}

/**
 * 🌟 SEED: tạo sẵn vài thông báo mẫu cho user hiện tại
 * Mỗi tài khoản mới login lần đầu sẽ có 1–2 thông báo demo.
 */
export function seedNotificationsForCurrentUser() {
  const me = getCurrentUserName();
  if (!me) return;

  const notifications = load("notifications_mock") || [];

  // Nếu user này đã có ít nhất 1 thông báo thì không seed nữa
  const hasForMe = notifications.some((n) => n.ownerName === me);
  if (hasForMe) return;

  const now = Date.now();

  const samples = [
    {
      id: now + 1,
      ownerName: me,
      actorName: "Hồng Anh",
      postId: 201,
      postTitle: "Vinhomes Central Park 2PN – View sông, full nội thất",
      postPrice: 4_500_000_000,
      postLocation: "Bình Thạnh, TP.HCM",
      postThumbnail: "/Img/demo/house-1.jpg",
      content: `Hồng Anh đã thêm bài viết "Vinhomes Central Park 2PN – View sông, full nội thất" của bạn vào mục yêu thích`,
      createdAt: now - 1000 * 60 * 10,
      isRead: false,
    },
    {
      id: now + 2,
      ownerName: me,
      actorName: "Minh Khang",
      postId: 202,
      postTitle: "Nhà phố 3 tầng Phú Nhuận",
      postPrice: 7_200_000_000,
      postLocation: "Phú Nhuận, TP.HCM",
      postThumbnail: "/Img/demo/house-2.jpg",
      content: `Minh Khang đã thêm bài viết "Nhà phố 3 tầng Phú Nhuận" của bạn vào mục yêu thích`,
      createdAt: now - 1000 * 60 * 30,
      isRead: false,
    },
  ];

  const merged = [...samples, ...notifications];
  save("notifications_mock", merged);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("mock-notifications-changed"));
  }
}
