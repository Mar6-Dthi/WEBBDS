// src/services/quotaService.js

// Key lưu lịch sử giao dịch hội viên
const MEMBERSHIP_TX_KEY = "membershipTransactions";

// Key prefix dùng chung với PostCreate.jsx để đếm số tin trong ngày
const DAILY_STATS_PREFIX = "postDailyStats_";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Lấy currentUser từ localStorage
 */
export function getCurrentUser() {
  try {
    return JSON.parse(localStorage.getItem("currentUser") || "null");
  } catch (e) {
    return null;
  }
}

/**
 * Lấy userId ưu tiên:
 * - currentUser.id
 * - currentUser.phone
 * - accessToken
 * - null nếu không có
 */
export function getCurrentUserId() {
  const cu = getCurrentUser();
  if (cu) return cu.id || cu.phone || null;

  return localStorage.getItem("accessToken") || null;
}

/**
 * Lấy gói hội viên đang còn hiệu lực của user (nếu có)
 * Trả về bản ghi giao dịch mới nhất còn hạn, hoặc null
 */
export function getUserActiveMembership(userId) {
  if (!userId) return null;

  try {
    const raw = localStorage.getItem(MEMBERSHIP_TX_KEY) || "[]";
    const list = JSON.parse(raw);
    const now = Date.now();

    const active = list.filter((tx) => {
      if (!tx || tx.status !== "SUCCESS") return false;

      // support cả userId và ownerId, ép về string cho chắc
      const txUserId = tx.userId || tx.ownerId || null;
      if (!txUserId) return false;
      if (String(txUserId) !== String(userId)) return false;

      const createdMs = new Date(tx.createdAt || 0).getTime();
      if (!createdMs || Number.isNaN(createdMs)) return false;

      const durationMs =
        typeof tx.durationMs === "number" && tx.durationMs > 0
          ? tx.durationMs
          : ONE_MONTH_MS;

      return createdMs + durationMs > now;
    });

    if (!active.length) return null;

    // Lấy giao dịch mới nhất
    active.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

    return active[0]; // các nơi khác chỉ cần truthy / falsy
  } catch (e) {
    return null;
  }
}

/**
 * Tính quota tối đa / ngày cho user
 * - Có hội viên: 5 tin / ngày
 * - Không hội viên: 2 tin / ngày
 */
export function getDailyQuotaForUser(userId) {
  const membership = getUserActiveMembership(userId);
  return membership ? 5 : 2;
}

/**
 * Lấy ngày hôm nay theo giờ local, dạng YYYY-MM-DD
 * (để tránh lệch múi giờ do toISOString dùng UTC)
 */
function getTodayDateStrLocal() {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/**
 * Đếm số bài đã đăng hôm nay theo bộ đếm local:
 * postDailyStats_<userId> = { date: "YYYY-MM-DD", count: number }
 * (ĐỒNG BỘ với PostCreate.jsx)
 */
export function getTodayPostCount(userId) {
  try {
    if (!userId) return 0;

    const raw = localStorage.getItem(DAILY_STATS_PREFIX + userId);
    if (!raw) return 0;

    const data = JSON.parse(raw);
    if (!data || data.date !== getTodayDateStrLocal()) return 0;

    return typeof data.count === "number" ? data.count : 0;
  } catch (e) {
    return 0;
  }
}

/**
 * checkDailyQuota: trả về cả legacy keys và các key mà PostCreate mong đợi
 */
export function checkDailyQuota(userId) {
  const quota = getDailyQuotaForUser(userId); // số tối đa / ngày (2 hoặc 5)
  const used = getTodayPostCount(userId);     // số đã dùng (theo postDailyStats_)
  const remaining = Math.max(0, quota - used);
  const activeMembership = getUserActiveMembership(userId);
  const isMember = !!activeMembership;

  const base = {
    // legacy names (không phá code cũ)
    quota,      // tổng số tin / ngày
    used,       // đã dùng
    remaining,  // còn lại

    // các field PostCreate.jsx đang dùng
    allowed: remaining > 0,
    remainingToday: remaining,
    usedToday: used,
    maxPerDay: quota,
    isMember,
    activeMembership,
    membershipLink: "/membership",
  };

  if (remaining > 0) {
    return base;
  }

  // Hết lượt
  if (!isMember) {
    return {
      ...base,
      allowed: false,
      reason: "non-member",
      message:
        "Bạn đã dùng hết số lượt đăng bài cho hôm nay, bạn cần đăng kí hội viên để có thể đăng thêm bài.",
    };
  }

  return {
    ...base,
    allowed: false,
    reason: "member",
    message: "Bạn đã dùng hết số lượt đăng bài cho hôm nay.",
  };
}
