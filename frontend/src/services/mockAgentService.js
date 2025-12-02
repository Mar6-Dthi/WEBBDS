// src/services/mockAgentService.js

// ====== MOCK DATA MÔI GIỚI ======

export const MOCK_AGENTS = [
  {
    id: "ng_hang_nha_tho_cu",
    name: "NG.HANG NHÀ THỔ CƯ",
    bannerUrl: "/Img/agents/banner-1.jpg",
    avatarUrl: "/Img/agents/avatar-1.jpg",
    rating: 5.0,
    ratingCount: 11,
    badge: "CHỨNG CHỈ MÔI GIỚI",
    desc: "Chuyên đào tạo thực chiến MG BĐS nhà phố thổ cư. Tuyển dụng nhân sự khu vực Q.4, Q.7, Q.2, Q.9...",
    area: "Quận 7, Quận 10, Quận Tân Bình (TP Hồ Chí Minh)",
    provinces: ["TP Hồ Chí Minh"],
    agentType: "buy", // mua bán
    estateTypes: ["nhao", "dat"],
    postsCount: 706,
    yearsActive: 9,
    transactionsCount: 13,
    responseRate: 0.87,
    phone: "0908 123 456",
     
  },
  {
    id: "hau_binh_thanh",
    name: "Hậu chuyên nhà Bình Thạnh",
    bannerUrl: "/Img/agents/banner-2.jpg",
    avatarUrl: "/Img/agents/avatar-2.jpg",
    rating: 5.0,
    ratingCount: 1,
    badge: "",
    desc: "Chuyên nhà Bình Thạnh, Phú Nhuận, Gò Vấp. Hỗ trợ vay ngân hàng.",
    area: "Quận Bình Thạnh, Quận Gò Vấp, Quận Phú Nhuận (TP Hồ Chí Minh)",
    provinces: ["TP Hồ Chí Minh"],
    agentType: "buy",
    estateTypes: ["nhao"],
    postsCount: 610,
    yearsActive: 5,
    transactionsCount: 30,
    responseRate: 0.9,
    phone: "0909 222 333",
  },
  {
    id: "lan_phongtro_quan9",
    name: "Lan – Chuyên phòng trọ Quận 9",
    bannerUrl: "/Img/agents/banner-3.jpg",
    avatarUrl: "/Img/agents/avatar-3.jpg",
    rating: 4.8,
    ratingCount: 24,
    badge: "TOP CHO THUÊ",
    desc: "Chuyên ký gửi & cho thuê phòng trọ, chung cư mini khu Q.9 – Thủ Đức.",
    area: "Thành phố Thủ Đức (TP Hồ Chí Minh)",
    provinces: ["TP Hồ Chí Minh"],
    agentType: "rent",
    estateTypes: ["canho", "nhao"],
    postsCount: 145,
    yearsActive: 4,
    transactionsCount: 80,
    responseRate: 0.93,
    phone: "0938 555 668",
  },
  {
    id: "kien_dat_nen_binhduong",
    name: "Kiên – Đất nền Bình Dương",
    bannerUrl: "/Img/agents/banner-4.jpg",
    avatarUrl: "/Img/agents/avatar-4.jpg",
    rating: 4.7,
    ratingCount: 37,
    badge: "",
    desc: "Tập trung đất nền khu VSIP, Thuận An, Dĩ An – pháp lý rõ ràng.",
    area: "TP Thuận An, TP Dĩ An (Bình Dương)",
    provinces: ["Bình Dương", "TP Hồ Chí Minh"],
    agentType: "buy",
    estateTypes: ["canho", "vpmb"],
    postsCount: 210,
    yearsActive: 6,
    transactionsCount: 55,
    responseRate: 0.82,
    phone: "0912 777 999",
  },
  {
    id: "anh_tuan_cantho",
    name: "Anh Tuấn Cần Thơ",
    bannerUrl: "/Img/agents/banner-5.jpg",
    avatarUrl: "/Img/agents/avatar-5.jpg",
    rating: 4.9,
    ratingCount: 19,
    badge: "CHUYÊN GIA TAY NAM BỘ",
    desc: "Mua bán nhà phố, đất nền trung tâm Ninh Kiều – Cần Thơ.",
    area: "Quận Ninh Kiều, Quận Cái Răng (Cần Thơ)",
    provinces: ["Cần Thơ"],
    agentType: "buy",
    estateTypes: ["dat"],
    postsCount: 132,
    yearsActive: 7,
    transactionsCount: 48,
    responseRate: 0.88,
    phone: "0901 222 444",
  },
  {
    id: "mai_chothue_danang",
    name: "Mai – Cho thuê Đà Nẵng",
    bannerUrl: "/Img/agents/banner-6.jpg",
    avatarUrl: "/Img/agents/avatar-6.jpg",
    rating: 4.6,
    ratingCount: 15,
    badge: "",
    desc: "Căn hộ, nhà nguyên căn, shophouse cho thuê khu Sơn Trà, Ngũ Hành Sơn.",
    area: "Sơn Trà, Ngũ Hành Sơn (Đà Nẵng)",
    provinces: ["Đà Nẵng"],
    agentType: "rent",
    estateTypes: ["canho", "vpmb"],
    postsCount: 89,
    yearsActive: 3,
    transactionsCount: 60,
    responseRate: 0.9,
    phone: "0973 888 222",
  },
  {
    id: "dat_biendoi_nhatrang",
    name: "Đạt – Biển Đời Nha Trang",
    bannerUrl: "/Img/agents/banner-7.jpg",
    avatarUrl: "/Img/agents/avatar-7.jpg",
    rating: 4.8,
    ratingCount: 28,
    badge: "RESORT & VIEW BIỂN",
    desc: "Chuyên condotel, biệt thự nghỉ dưỡng ven biển Nha Trang.",
    area: "TP Nha Trang (Khánh Hòa)",
    provinces: ["Khánh Hòa"],
    agentType: "buy",
    estateTypes: ["canho", "vpmb"],
    postsCount: 75,
    yearsActive: 5,
    transactionsCount: 32,
    responseRate: 0.86,
    phone: "0905 666 333",
  },
  {
    id: "thu_trang_chungcu_hanoi",
    name: "Thu Trang – Chung cư Hà Nội",
    bannerUrl: "/Img/agents/banner-8.jpg",
    avatarUrl: "/Img/agents/avatar-8.jpg",
    rating: 4.9,
    ratingCount: 41,
    badge: "TOP CHUNG CƯ",
    desc: "Mua bán, cho thuê chung cư khu vực Thanh Xuân, Cầu Giấy, Nam Từ Liêm.",
    area: "Thanh Xuân, Cầu Giấy, Nam Từ Liêm (Hà Nội)",
    provinces: ["Hà Nội"],
    agentType: "both", // vừa mua bán vừa cho thuê
    estateTypes: ["nhao", "dat"],
    postsCount: 320,
    yearsActive: 8,
    transactionsCount: 120,
    responseRate: 0.92,
    phone: "0988 123 789",
  },
  {
    id: "son_datnen_longan",
    name: "Sơn – Đất nền Long An",
    bannerUrl: "/Img/agents/banner-9.jpg",
    avatarUrl: "/Img/agents/avatar-9.jpg",
    rating: 4.5,
    ratingCount: 17,
    badge: "",
    desc: "Đất thổ cư Đức Hòa, Bến Lức, phù hợp đầu tư ven TP.HCM.",
    area: "Đức Hòa, Bến Lức (Long An)",
    provinces: ["Long An", "TP Hồ Chí Minh"],
    agentType: "buy",
    estateTypes: ["nhao", "dat"],
    postsCount: 98,
    yearsActive: 4,
    transactionsCount: 40,
    responseRate: 0.8,
    phone: "0933 111 555",
  },
  {
    id: "phuong_phongtro_thuduc",
    name: "Phương – Phòng trọ Thủ Đức",
    bannerUrl: "/Img/agents/banner-10.jpg",
    avatarUrl: "/Img/agents/avatar-10.jpg",
    rating: 4.7,
    ratingCount: 22,
    badge: "",
    desc: "Phòng trọ, ký túc xá mini giá rẻ cho sinh viên khu Làng Đại Học.",
    area: "TP Thủ Đức (TP Hồ Chí Minh)",
    provinces: ["TP Hồ Chí Minh"],
    agentType: "rent",
    estateTypes: ["canho", "nhao"],
    postsCount: 160,
    yearsActive: 3,
    transactionsCount: 95,
    responseRate: 0.95,
    phone: "0962 444 777",
  },
  {
    id: "linh_office_hanoi",
    name: "Linh – Văn phòng Hà Nội",
    bannerUrl: "/Img/agents/banner-11.jpg",
    avatarUrl: "/Img/agents/avatar-11.jpg",
    rating: 4.6,
    ratingCount: 13,
    badge: "",
    desc: "Cho thuê văn phòng, mặt bằng kinh doanh khu trung tâm Quận Hoàn Kiếm, Hai Bà Trưng.",
    area: "Hoàn Kiếm, Hai Bà Trưng (Hà Nội)",
    provinces: ["Hà Nội"],
    agentType: "rent",
    estateTypes: ["canho", "nhao"],
    postsCount: 54,
    yearsActive: 4,
    transactionsCount: 38,
    responseRate: 0.89,
    phone: "0916 555 444",
  },
  {
    id: "hung_bietthu_saigon",
    name: "Hùng – Biệt thự Sài Gòn",
    bannerUrl: "/Img/agents/banner-12.jpg",
    avatarUrl: "/Img/agents/avatar-12.jpg",
    rating: 5.0,
    ratingCount: 9,
    badge: "VIP LUXURY",
    desc: "Biệt thự, nhà phố cao cấp khu Phú Mỹ Hưng, Thảo Điền.",
    area: "Quận 7, TP Thủ Đức (TP Hồ Chí Minh)",
    provinces: ["TP Hồ Chí Minh"],
    agentType: "buy",
    estateTypes: ["canho"],
    postsCount: 43,
    yearsActive: 6,
    transactionsCount: 20,
    responseRate: 0.91,
    phone: "0903 999 000",
  },
];

// ====== HÀM MOCK SERVICE ======

// Lấy toàn bộ môi giới (có thể mô phỏng async)
export function getAllAgents() {
  return Promise.resolve(MOCK_AGENTS);
}

// Lấy chi tiết 1 môi giới theo id
export function getAgentById(id) {
  const agent = MOCK_AGENTS.find((a) => a.id === id);
  return Promise.resolve(agent || null);
}

// Lọc môi giới theo điều kiện đơn giản
export function filterAgents({ province, agentType } = {}) {
  let result = [...MOCK_AGENTS];

  if (province && province !== "Tất cả") {
    const key = province.toLowerCase();
    result = result.filter((a) =>
      (a.provinces || [])
        .map((p) => p.toLowerCase())
        .includes(key)
    );
  }

  if (agentType && agentType !== "all") {
    if (agentType === "buy") {
      result = result.filter(
        (a) => a.agentType === "buy" || a.agentType === "both"
      );
    } else if (agentType === "rent") {
      result = result.filter(
        (a) => a.agentType === "rent" || a.agentType === "both"
      );
    }
  }

  return Promise.resolve(result);
}
