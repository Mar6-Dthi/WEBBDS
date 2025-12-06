// src/services/mockAgentReviewService.js

// Mỗi môi giới một mảng đánh giá riêng
// Dùng đúng id trong mockAgentService!

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

  // Thêm các agent khác tuỳ bạn
};

// Lấy review theo agentId
export function getAgentReviews(agentId) {
  return Promise.resolve(MOCK_AGENT_REVIEWS[agentId] || []);
}
