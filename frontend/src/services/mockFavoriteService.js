// src/services/mockFavoriteService.js

// ========== HELPERS LOCALSTORAGE ==========

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

// Lưu danh sách ID bài đã tim
const FAVORITE_KEY = "favorites_mock";

// Lưu danh sách FULL THÔNG TIN bài đã tim (dùng cho trang Yêu thích)
const FAVORITE_POSTS_KEY = "favorite_posts";

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
 * @param {string|number} postId
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

/** Lấy danh sách BÀI YÊU THÍCH (dùng cho trang Favorite.jsx) */
export function getFavoritePosts() {
  const list = load(FAVORITE_POSTS_KEY);
  return Array.isArray(list) ? list : [];
}

// ================== PHẦN THÔNG TIN USER ==================

/**
 * Lấy tên user đang login (ưu tiên currentUser.name, fallback accountName)
 */
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

// ================== FAVORITE POSTS + NOTIFICATIONS ==================

/**
 * Hàm dùng chung khi bấm tim:
 *  - Quản lý danh sách bài yêu thích (FAVORITE_POSTS_KEY)
 *  - Gửi thông báo cho chủ bài (notifications_mock) KHI THÊM TIM
 *
 * @param {object} postData
 * @param {boolean} [added] - true: vừa thêm tim, false: vừa gỡ tim.
 *    Nếu không truyền (undefined) thì mặc định coi như THÊM (giữ tương thích cũ).
 *
 * postData nên có các field:
 *  - postId
 *  - postTitle
 *  - ownerName
 *  - postPrice
 *  - postLocation
 *  - postThumbnail
 */
export function toggleFavoriteMock(postData, added) {
  if (!postData || typeof postData !== "object") {
    return { error: "INVALID_DATA" };
  }

  const {
    postId,
    postTitle,
    ownerName,
    postPrice,
    postLocation,
    postThumbnail,
    ...rest
  } = postData;

  const idStr = postId != null ? String(postId) : null;

  // ===== 1. CẬP NHẬT DANH SÁCH BÀI YÊU THÍCH (favorite_posts) =====
  if (idStr) {
    let favPosts = getFavoritePosts();

    // Nếu added === undefined → mặc định là thêm (giữ tương thích phiên bản cũ)
    const isAdded = added === undefined ? true : !!added;

    if (isAdded) {
      const existed = favPosts.some((p) => String(p.postId) === idStr);
      if (!existed) {
        favPosts.unshift({
          postId,
          postTitle,
          ownerName,
          postPrice,
          postLocation,
          postThumbnail,
          ...rest,
        });
      }
    } else {
      // Bỏ tim → xoá khỏi danh sách
      favPosts = favPosts.filter((p) => String(p.postId) !== idStr);
    }

    save(FAVORITE_POSTS_KEY, favPosts);
  }

  // ===== 2. THÔNG BÁO CHO CHỦ BÀI (CHỈ KHI THÊM TIM) =====
  const actorName = getCurrentUserName();

  // Không có user đăng nhập thì bỏ qua phần thông báo nhưng vẫn cho lưu YÊU THÍCH
  if (!actorName) {
    return { ok: true, noNotification: true };
  }

  // Không tự thông báo cho mình
  if (!ownerName || ownerName === actorName) {
    return { ok: true, skipped: true };
  }

  // Nếu là thao tác GỠ TIM thì không tạo notification
  if (added === false) {
    return { ok: true, removed: true };
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

// ================== PHẦN THÔNG BÁO (NOTIFICATIONS) ==================

/** Lấy danh sách thông báo của user hiện tại (tức chủ bài) */
export function getMyNotificationsMock() {
  const me = getCurrentUserName();
  if (!me) return [];
  const notifications = load("notifications_mock");
  return notifications.filter((n) => n.ownerName === me);
}

/** Đánh dấu 1 thông báo là ĐÃ ĐỌC (dùng khi click vào 1 item trong modal) */
export function markNotificationReadMock(id) {
  const notifications = load("notifications_mock");
  const updated = notifications.map((n) =>
    n.id === id ? { ...n, isRead: true } : n
  );
  save("notifications_mock", updated);
}

/** Đánh dấu TẤT CẢ thông báo của user hiện tại là đã đọc. */
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
