// src/services/viewHistoryService.js

const KEY = "viewHistory";

// Lấy danh sách lịch sử xem
export function getViewHistory() {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(KEY) || "[]";
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

// Thêm 1 bài vào lịch sử xem
export function addToViewHistory(post) {
  if (!post || !post.id || typeof window === "undefined") return;

  const current = getViewHistory();

  // bỏ bản trùng id nếu có
  const filtered = current.filter((p) => p.id !== post.id);

  // thêm mới lên đầu
  filtered.unshift({
    ...post,
    viewedAt: Date.now(),
  });

  // giới hạn 50 bài gần nhất
  const limited = filtered.slice(0, 50);

  localStorage.setItem(KEY, JSON.stringify(limited));
}

// Xoá toàn bộ lịch sử
export function clearViewHistory() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(KEY);
}
