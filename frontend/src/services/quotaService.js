// src/services/quotaService.js
const MEMBERSHIP_TX_KEY = "membershipTransactions";
const POSTS_KEY = "posts";
const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

/**
 * Lấy userId ưu tiên:
 * - currentUser.id
 * - currentUser.phone
 * - accessToken
 * - null nếu không có
 */
export function getCurrentUserId() {
  try {
    const cu = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (cu) return cu.id || cu.phone || null;
  } catch (e) {
    // ignore
  }
  return localStorage.getItem("accessToken") || null;
}

export function getUserActiveMembership(userId) {
  if (!userId) return null;
  try {
    const raw = localStorage.getItem(MEMBERSHIP_TX_KEY) || "[]";
    const list = JSON.parse(raw);
    const now = Date.now();

    const active = list.filter((tx) => {
      if (!tx || tx.status !== "SUCCESS") return false;
      // support both userId and ownerId keys
      const txUserId = tx.userId || tx.ownerId || null;
      if (txUserId !== userId) return false;

      const createdMs = new Date(tx.createdAt || 0).getTime();
      if (!createdMs || Number.isNaN(createdMs)) return false;

      const durationMs =
        typeof tx.durationMs === "number" && tx.durationMs > 0
          ? tx.durationMs
          : ONE_MONTH_MS;

      return createdMs + durationMs > now;
    });

    if (!active.length) return null;

    active.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    const latest = active[0];

    // return full tx (other code expects either object or null)
    return latest;
  } catch (e) {
    return null;
  }
}

export function getDailyQuotaForUser(userId) {
  const membership = getUserActiveMembership(userId);
  if (membership) return 5;
  return 2;
}

export function getTodayPostCount(userId) {
  try {
    if (!userId) return 0;
    const all = JSON.parse(localStorage.getItem(POSTS_KEY) || "[]");
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
    const endOfDay = startOfDay + 24 * 60 * 60 * 1000;

    return all.filter((p) => {
      if (!p) return false;
      const owner = p.ownerId || p.owner || null;
      if (owner !== userId) return false;
      if (!p.createdAt) return false;
      const t = new Date(p.createdAt).getTime();
      return t >= startOfDay && t < endOfDay;
    }).length;
  } catch (e) {
    return 0;
  }
}

/**
 * checkDailyQuota: trả về cả legacy keys và keys mà PostCreate mong đợi
 */
export function checkDailyQuota(userId) {
  const quota = getDailyQuotaForUser(userId); // số tối đa / ngày (2 hoặc 5)
  const used = getTodayPostCount(userId); // số đã dùng
  const remaining = Math.max(0, quota - used);
  const activeMembership = getUserActiveMembership(userId);
  const isMember = !!activeMembership;

  // build canonical response
  const base = {
    // legacy names (không phá code cũ)
    quota,      // legacy: total per day
    used,       // legacy
    remaining,

    // expected by PostCreate
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

  // not allowed -> attach reason + message
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
