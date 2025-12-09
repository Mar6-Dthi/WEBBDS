// src/services/mockAgentReviewService.js

// ==============================================
//  MOCK DỮ LIỆU ĐÁNH GIÁ BAN ĐẦU
// ==============================================

const MOCK_AGENT_REVIEWS = {
  ng_hang_nha_tho_cu: [
    {
      id: 1,
      name: "Nghi Phương",
      rating: 5,
      timeAgo: "hôm qua",
      tags: ["Đúng hẹn", "Chất lượng sản phẩm tốt", "+4"],
      content:
        "Nhà đúng mô tả, anh hỗ trợ giấy tờ, sang tên nhanh. Rất hài lòng.",
    },
    {
      id: 2,
      name: "Samsung&GE Máy siêu âm",
      rating: 5,
      timeAgo: "hôm qua",
      tags: ["Nhiệt tình", "Có tâm", "Tư vấn kỹ"],
      content:
        "Anh Quân tư vấn kỹ lưỡng, hỗ trợ thương lượng giá tốt. Sẽ giới thiệu thêm bạn bè.",
    },
  ],

  hau_binh_thanh: [
    {
      id: 3,
      name: "Khánh",
      rating: 5,
      timeAgo: "2 ngày trước",
      tags: ["Rành khu vực", "Nhiệt tình"],
      content: "Anh Hậu dẫn xem nhà nhanh, tư vấn rõ ràng.",
    },
  ],

  lan_phongtro_quan9: [
    {
      id: 4,
      name: "Ngọc My",
      rating: 4,
      timeAgo: "3 ngày trước",
      tags: ["Tư vấn tốt"],
      content: "Cô Lan hỗ trợ tìm phòng trọ rất nhanh, hình đúng thực tế.",
    },
  ],

  kien_dat_nen_binhduong: [],

  anh_tuan_cantho: [
    {
      id: 5,
      name: "Minh Trí",
      rating: 5,
      timeAgo: "1 tuần trước",
      tags: ["Uy tín", "Hỗ trợ pháp lý tốt"],
      content: "Anh Tuấn hỗ trợ sang tên cực nhanh. Hài lòng.",
    },
  ],

  // ⭐ REVIEW CHO TRANG MÔI GIỚI CỦA BẠN
  "khiem.dev@gmail.com": [
    {
      id: 90001,
      name: "Khách A",
      rating: 5,
      timeAgo: "hôm nay",
      tags: ["Phản hồi nhanh", "Tư vấn nhiệt tình"],
      content: "Rất hài lòng khi làm việc với môi giới này!",
    },
  ],
};

// ==============================================
//  LOCAL STORAGE
// ==============================================

const LS_REVIEW_KEY = "agentReviews";        // object: { [agentId]: Review[] }
const LS_REPLY_KEY = "agentReviewReplies";   // object: { [agentId]: { [reviewId]: Reply[] } }

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    return data && typeof data === "object" ? data : fallback;
  } catch {
    return fallback;
  }
}

function saveJson(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// ==============================================
//  LẤY REVIEW THEO AGENT (KÈM REPLY)
// ==============================================

export function getAgentReviews(agentId) {
  const storedReviews = loadJson(LS_REVIEW_KEY, {});
  const storedReplies = loadJson(LS_REPLY_KEY, {});

  const systemReviews = MOCK_AGENT_REVIEWS[agentId] || [];
  const userReviews = storedReviews[agentId] || [];

  // Review do người dùng tạo sẽ đứng trước
  const merged = [...userReviews, ...systemReviews];

  const agentRepliesMap = storedReplies[agentId] || {};

  const withReplies = merged.map((r) => ({
    ...r,
    replies: agentRepliesMap[r.id] || [],
  }));

  return Promise.resolve(withReplies);
}

// ==============================================
//  THÊM REVIEW MỚI TỪ FORM
// ==============================================

export function addAgentReview({
  agentId,
  reviewerId,
  reviewerName,
  rating,
  content,
}) {
  const stored = loadJson(LS_REVIEW_KEY, {});

  if (!stored[agentId]) stored[agentId] = [];

  const newReview = {
    id: Date.now(),
    reviewerId,
    name: reviewerName,
    rating,
    content,
    createdAt: new Date().toISOString(),
    timeAgo: "vừa xong",
    tags: [],
  };

  stored[agentId].unshift(newReview);
  saveJson(LS_REVIEW_KEY, stored);

  // Khi mới tạo thì chưa có reply
  return { ...newReview, replies: [] };
}

// ==============================================
//  THÊM REPLY CỦA MÔI GIỚI VÀO 1 REVIEW
// ==============================================

export function addAgentReply({
  agentId,
  reviewId,
  replierId,
  replierName,
  content,
}) {
  const repliesStore = loadJson(LS_REPLY_KEY, {});

  if (!repliesStore[agentId]) repliesStore[agentId] = {};
  if (!repliesStore[agentId][reviewId]) repliesStore[agentId][reviewId] = [];

  const newReply = {
    id: Date.now(),
    replierId,
    name: replierName,
    content,
    createdAt: new Date().toISOString(),
  };

  repliesStore[agentId][reviewId].push(newReply);
  saveJson(LS_REPLY_KEY, repliesStore);

  return newReply;
}

// ==============================================
//  MOCK THÊM REVIEW (TUỲ CHỌN)
// ==============================================

export function mockAddReview(agentId, name, rating, content) {
  const stored = loadJson(LS_REVIEW_KEY, {});
  if (!stored[agentId]) stored[agentId] = [];

  const item = {
    id: Date.now(),
    reviewerId: "console-test",
    name: name || "Khách ẩn danh",
    rating: Number(rating) || 5,
    content: content || "",
    createdAt: new Date().toISOString(),
    timeAgo: "vừa xong",
    tags: [],
  };

  stored[agentId].unshift(item);
  saveJson(LS_REVIEW_KEY, stored);

  console.log("✔ Review đã được thêm vào agent:", agentId);
  console.log(item);

  return { ...item, replies: [] };
}

// Gắn ra window (nếu thích test nhanh)
if (typeof window !== "undefined") {
  window.mockAddReview = mockAddReview;
}
