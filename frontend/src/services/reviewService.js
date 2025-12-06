// src/services/reviewService.js

const AGENT_REVIEWS_KEY = "agentReviews"; // tất cả review theo môi giới
const MY_REVIEWS_KEY = "myReviews";       // lịch sử review theo người dùng

function safeParse(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "[]");
  } catch {
    return [];
  }
}

function save(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ===== THÊM ĐÁNH GIÁ =====
export function addAgentReview({
  agentId,
  reviewerId,
  reviewerName,
  rating,
  content,
}) {
  const nowIso = new Date().toISOString();

  const review = {
    id: "rv_" + Date.now(),
    agentId,
    reviewerId: reviewerId || null,
    reviewerName,
    rating,
    content,
    createdAt: nowIso,
    likes: 0,
  };

  // 1) Lưu vào danh sách review của tất cả môi giới
  const allAgentReviews = safeParse(AGENT_REVIEWS_KEY);
  save(AGENT_REVIEWS_KEY, [...allAgentReviews, review]);

  // 2) Lưu vào lịch sử “Đánh giá của tôi”
  if (reviewerId) {
    const allMyReviews = safeParse(MY_REVIEWS_KEY);
    save(MY_REVIEWS_KEY, [...allMyReviews, review]);
  }

  return review;
}

// ===== LẤY REVIEW THEO MÔI GIỚI =====
export function getAgentReviews(agentId) {
  const all = safeParse(AGENT_REVIEWS_KEY);
  return all
    .filter((r) => r.agentId === agentId)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}

// ===== SEED REVIEW MOCK CHO 1 MÔI GIỚI (chỉ gọi 1 lần nếu chưa có) =====
export function seedAgentReviews(agentId, initialReviews = []) {
  const all = safeParse(AGENT_REVIEWS_KEY);
  const has = all.some((r) => r.agentId === agentId);
  if (has) return;

  const mapped = initialReviews.map((r) => ({
    id: "seed_" + r.id,
    agentId,
    reviewerId: null,
    reviewerName: r.userName,
    rating: r.rating,
    content: r.content,
    createdAt: r.createdAt, // đã là ISO sẵn trong mock
    likes: r.likes || 0,
  }));

  save(AGENT_REVIEWS_KEY, [...all, ...mapped]);
}

// ===== LỊCH SỬ ĐÁNH GIÁ CỦA 1 USER =====
export function getMyReviews(reviewerId) {
  const all = safeParse(MY_REVIEWS_KEY);
  return all
    .filter((r) => r.reviewerId === reviewerId)
    .sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
}
