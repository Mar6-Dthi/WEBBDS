// src/services/mockFollowService.js

const FOLLOW_KEY = "agentFollowing";

// Lấy id user đang đăng nhập từ localStorage
function getCurrentUserId() {
  try {
    const current = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (!current) return null;
    return (
      current.id ||
      current.userId ||
      current.phone ||
      current.email ||
      current.accountId ||
      null
    );
  } catch {
    return null;
  }
}

// Lấy danh sách id môi giới mà user hiện tại đang theo dõi
export function getMyFollowingAgents() {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const raw = localStorage.getItem(FOLLOW_KEY) || "{}";
    const data = JSON.parse(raw);
    const list = data[userId];
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

// Check user hiện tại đã theo dõi agentId chưa
export function isFollowingAgent(agentId) {
  const list = getMyFollowingAgents();
  return list.includes(agentId);
}

// Toggle theo dõi / bỏ theo dõi
export function toggleFollowAgent(agentId) {
  const userId = getCurrentUserId();
  if (!userId) {
    return {
      ok: false,
      reason: "NO_USER",
      isFollowing: false,
      followingCount: 0,
    };
  }

  let data;
  try {
    data = JSON.parse(localStorage.getItem(FOLLOW_KEY) || "{}");
  } catch {
    data = {};
  }

  let list = Array.isArray(data[userId]) ? data[userId] : [];

  if (list.includes(agentId)) {
    // đang theo dõi -> bỏ theo dõi
    list = list.filter((x) => x !== agentId);
  } else {
    // chưa theo dõi -> theo dõi
    list = [...list, agentId];
  }

  data[userId] = list;
  localStorage.setItem(FOLLOW_KEY, JSON.stringify(data));

  return {
    ok: true,
    isFollowing: list.includes(agentId),
    followingCount: list.length,
  };
}
