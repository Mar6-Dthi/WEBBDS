// src/services/mockFollowService.js

const FOLLOW_KEY = "agentFollowing";

/* ========= LẤY CURRENT USER ========= */
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

/* ========= LOAD / SAVE AGENTS ĐỂ CẬP NHẬT followers ========= */

function loadAgents() {
  let agents = [];
  let keyUsed = null;

  try {
    const rawAgents =
      localStorage.getItem("agents") ||
      localStorage.getItem("mockAgents") ||
      "[]";

    const parsed = JSON.parse(rawAgents);
    if (Array.isArray(parsed)) {
      agents = parsed;
      // đoán key đang được dùng
      keyUsed = localStorage.getItem("agents") ? "agents" : "mockAgents";
    }
  } catch {
    agents = [];
  }

  if (!keyUsed) {
    // nếu chưa có key, mặc định dùng "agents"
    keyUsed = "agents";
  }

  return { agents, keyUsed };
}

function saveAgents(key, agents) {
  localStorage.setItem(key, JSON.stringify(agents));
}

/**
 * Cộng / trừ số follower cho 1 agent
 * @param {string|number} agentId
 * @param {number} delta +1 khi follow, -1 khi bỏ follow
 */
function updateAgentFollowers(agentId, delta) {
  const { agents, keyUsed } = loadAgents();
  if (!Array.isArray(agents) || !agents.length) return;

  let changed = false;
  const agentIdStr = String(agentId);

  const updated = agents.map((a) => {
    if (String(a.id) !== agentIdStr) return a;

    const current =
      typeof a.followers === "number"
        ? a.followers
        : typeof a.followerCount === "number"
        ? a.followerCount
        : 0;

    const next = Math.max(0, current + delta);

    changed = true;
    return {
      ...a,
      followers: next,
      followerCount: next,
    };
  });

  if (changed) {
    saveAgents(keyUsed, updated);
    try {
      window.dispatchEvent(new Event("agents-changed"));
    } catch {
      // ignore
    }
  }
}

/* ========= FOLLOW DATA (userId -> [agentId]) ========= */

/**
 * Lấy danh sách id môi giới mà user hiện tại đang theo dõi
 * @returns {string[]} mảng agentId (string)
 */
export function getMyFollowingAgents() {
  const userId = getCurrentUserId();
  if (!userId) return [];

  try {
    const raw = localStorage.getItem(FOLLOW_KEY) || "{}";
    const data = JSON.parse(raw);
    const list = data[userId];
    if (!Array.isArray(list)) return [];
    // Chuẩn hóa thành string để dễ so sánh
    return list.map((x) => String(x));
  } catch {
    return [];
  }
}

/**
 * Check user hiện tại đã theo dõi agentId chưa
 * @param {string|number} agentId
 */
export function isFollowingAgent(agentId) {
  const list = getMyFollowingAgents();
  const target = String(agentId);
  return list.some((x) => String(x) === target);
}

/**
 * Toggle theo dõi / bỏ theo dõi
 * @param {string|number} agentId
 * @returns {{ ok: boolean, reason?: string, isFollowing: boolean, followingCount: number }}
 */
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

  const agentIdStr = String(agentId);

  let data;
  try {
    data = JSON.parse(localStorage.getItem(FOLLOW_KEY) || "{}");
  } catch {
    data = {};
  }

  let list = Array.isArray(data[userId]) ? data[userId].map(String) : [];

  const wasFollowing = list.some((x) => x === agentIdStr);
  let isFollowingNow = wasFollowing;
  let delta = 0;

  if (wasFollowing) {
    // đang theo dõi -> bỏ theo dõi
    list = list.filter((x) => x !== agentIdStr);
    isFollowingNow = false;
    delta = -1;
  } else {
    // chưa theo dõi -> theo dõi
    list = [...list, agentIdStr];
    isFollowingNow = true;
    delta = 1;
  }

  data[userId] = list;
  localStorage.setItem(FOLLOW_KEY, JSON.stringify(data));

  // cập nhật followers cho agent trong localStorage.agents / mockAgents
  if (delta !== 0) {
    updateAgentFollowers(agentIdStr, delta);
  }

  // bắn event để ProfilePage & nơi khác reload
  try {
    window.dispatchEvent(new Event("follow-changed"));
  } catch {
    // ignore
  }

  return {
    ok: true,
    isFollowing: isFollowingNow,
    followingCount: list.length,
  };
}
