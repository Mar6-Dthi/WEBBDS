// src/services/mockListingService.js

// ============ MOCK DATA LỚN ============

export const MOCK_LISTINGS = [
  /* ====== MUA BÁN – TP.HCM ====== */
  {
    id: "mb-hcm-01",
    dealType: "mua-ban",
    province: "Tp Hồ Chí Minh",
    category: "Căn hộ/Chung cư",
    title: "Vinhomes Central Park 2PN – View sông, full nội thất",
    beds: 2,
    baths: 2,
    typeLabel: "Chung cư",
    price: "5,2 tỷ",
    priceValue: 5200000000,
    pricePerM2: "95 tr/m²",
    area: 55,
    address: "Bình Thạnh, TP.HCM",
    timeAgo: "1 giờ trước",
    coverUrl: "/Img/demo/house-1.jpg",
    ownerName: "Loan Nguyễn",
    ownerPosts: 15,
  },
  {
    id: "mb-hcm-02",
    dealType: "mua-ban",
    province: "Tp Hồ Chí Minh",
    category: "Căn hộ/Chung cư",
    title: "Masteri Thảo Điền 3PN – Tầng cao, view thoáng",
    beds: 3,
    baths: 2,
    typeLabel: "Chung cư",
    price: "7,1 tỷ",
    priceValue: 7100000000,
    pricePerM2: "105 tr/m²",
    area: 68,
    address: "Thủ Đức, TP.HCM",
    timeAgo: "2 giờ trước",
    coverUrl: "/Img/demo/house-2.jpg",
    ownerName: "Anh Huy",
    ownerPosts: 7,
  },
  {
    id: "mb-hcm-03",
    dealType: "mua-ban",
    province: "Tp Hồ Chí Minh",
    category: "Nhà ở",
    title: "Nhà phố Quận 7 – 4x16m, 3 tầng, hẻm xe hơi",
    beds: 4,
    baths: 3,
    typeLabel: "Nhà phố",
    price: "8,3 tỷ",
    priceValue: 8300000000,
    pricePerM2: "130 tr/m²",
    area: 64,
    address: "Đường Lâm Văn Bền, Quận 7",
    timeAgo: "3 giờ trước",
    coverUrl: "/Img/demo/house-3.jpg",
    ownerName: "Nguyễn Long",
    ownerPosts: 9,
  },
  {
    id: "mb-hcm-04",
    dealType: "mua-ban",
    province: "Tp Hồ Chí Minh",
    category: "Nhà ở",
    title: "Nhà hẻm xe hơi Gò Vấp – 5PN, sân thượng",
    beds: 5,
    baths: 4,
    typeLabel: "Nhà hẻm",
    price: "6,9 tỷ",
    priceValue: 6900000000,
    pricePerM2: "115 tr/m²",
    area: 60,
    address: "Phan Huy Ích, Gò Vấp",
    timeAgo: "5 giờ trước",
    coverUrl: "/Img/demo/house-4.jpg",
    ownerName: "Chị Hằng",
    ownerPosts: 12,
  },
  {
    id: "mb-hcm-05",
    dealType: "mua-ban",
    province: "Tp Hồ Chí Minh",
    category: "Đất",
    title: "Đất thổ cư 80m² – Sổ riêng – KDC hiện hữu",
    beds: null,
    baths: null,
    typeLabel: "Đất thổ cư",
    price: "3,2 tỷ",
    priceValue: 3200000000,
    pricePerM2: "40 tr/m²",
    area: 80,
    address: "Hóc Môn, TP.HCM",
    timeAgo: "30 phút trước",
    coverUrl: "/Img/demo/land-1.jpg",
    ownerName: "Anh Trí",
    ownerPosts: 3,
  },
  {
    id: "mb-hcm-06",
    dealType: "mua-ban",
    province: "Tp Hồ Chí Minh",
    category: "Văn phòng",
    title: "Shophouse Saigon South – mặt tiền nội khu sầm uất",
    beds: null,
    baths: 2,
    typeLabel: "Shophouse",
    price: "14,5 tỷ",
    priceValue: 14500000000,
    pricePerM2: "160 tr/m²",
    area: 90,
    address: "Phú Mỹ Hưng, Quận 7",
    timeAgo: "6 giờ trước",
    coverUrl: "/Img/demo/house-2.jpg",
    ownerName: "Cường Real",
    ownerPosts: 18,
  },

  /* ====== CHO THUÊ – TP.HCM ====== */
  {
    id: "ct-hcm-01",
    dealType: "cho-thue",
    province: "Tp Hồ Chí Minh",
    category: "Căn hộ/Chung cư",
    title: "Căn hộ 1PN dịch vụ full nội thất Q.1 – gần chợ Bến Thành",
    beds: 1,
    baths: 1,
    typeLabel: "Căn hộ dịch vụ",
    price: "12 triệu/tháng",
    priceValue: 12000000,
    pricePerM2: "300k/m²",
    area: 40,
    address: "Quận 1, TP.HCM",
    timeAgo: "20 phút trước",
    coverUrl: "/Img/demo/rent-1.jpg",
    ownerName: "Chị B",
    ownerPosts: 10,
  },
  {
    id: "ct-hcm-02",
    dealType: "cho-thue",
    province: "Tp Hồ Chí Minh",
    category: "Phòng trọ",
    title: "Phòng trọ mới 100% gần ĐH CNTT – có máy lạnh",
    beds: 1,
    baths: 1,
    typeLabel: "Phòng trọ",
    price: "3,5 triệu/tháng",
    priceValue: 3500000,
    pricePerM2: "180k/m²",
    area: 18,
    address: "TP Thủ Đức",
    timeAgo: "10 phút trước",
    coverUrl: "/Img/demo/rent-2.jpg",
    ownerName: "Chị Thi",
    ownerPosts: 8,
  },
  {
    id: "ct-hcm-03",
    dealType: "cho-thue",
    province: "Tp Hồ Chí Minh",
    category: "Nhà ở",
    title: "Nhà nguyên căn 1 trệt 1 lầu – hẻm xe hơi Gò Vấp",
    beds: 2,
    baths: 2,
    typeLabel: "Nhà nguyên căn",
    price: "15 triệu/tháng",
    priceValue: 15000000,
    pricePerM2: "220k/m²",
    area: 68,
    address: "Gò Vấp, TP.HCM",
    timeAgo: "45 phút trước",
    coverUrl: "/Img/demo/rent-3.jpg",
    ownerName: "Anh Hoài",
    ownerPosts: 6,
  },
  {
    id: "ct-hcm-04",
    dealType: "cho-thue",
    province: "Tp Hồ Chí Minh",
    category: "Văn phòng",
    title: "Văn phòng 50m² – setup sẵn, vào làm ngay",
    beds: null,
    baths: 1,
    typeLabel: "Văn phòng",
    price: "18 triệu/tháng",
    priceValue: 18000000,
    pricePerM2: "360k/m²",
    area: 50,
    address: "Quận 3, TP.HCM",
    timeAgo: "1 giờ trước",
    coverUrl: "/Img/demo/rent-5.jpg",
    ownerName: "Anh Dũng",
    ownerPosts: 4,
  },
  {
    id: "ct-hcm-05",
    dealType: "cho-thue",
    province: "Tp Hồ Chí Minh",
    category: "Nhà xưởng/Kho bãi",
    title: "Kho 300m² – đường container, vào hoạt động ngay",
    beds: null,
    baths: 1,
    typeLabel: "Kho xưởng",
    price: "60 triệu/tháng",
    priceValue: 60000000,
    pricePerM2: "200k/m²",
    area: 300,
    address: "Bình Tân, TP.HCM",
    timeAgo: "3 giờ trước",
    coverUrl: "/Img/demo/land-1.jpg",
    ownerName: "Kho Logistics Nam",
    ownerPosts: 5,
  },

  /* ====== MUA BÁN – HÀ NỘI ====== */
  {
    id: "mb-hn-01",
    dealType: "mua-ban",
    province: "Hà Nội",
    category: "Căn hộ/Chung cư",
    title: "Times City 2PN – full đồ, ban công Đông Nam",
    beds: 2,
    baths: 2,
    typeLabel: "Chung cư",
    price: "3,9 tỷ",
    priceValue: 3900000000,
    pricePerM2: "55 tr/m²",
    area: 71,
    address: "Hai Bà Trưng, Hà Nội",
    timeAgo: "2 giờ trước",
    coverUrl: "/Img/demo/house-1.jpg",
    ownerName: "Hoàng Thanh",
    ownerPosts: 9,
  },
  {
    id: "mb-hn-02",
    dealType: "mua-ban",
    province: "Hà Nội",
    category: "Nhà ở",
    title: "Nhà mặt ngõ Hoàng Quốc Việt – ô tô tránh, 5 tầng",
    beds: 4,
    baths: 4,
    typeLabel: "Nhà phân lô",
    price: "9,5 tỷ",
    priceValue: 9500000000,
    pricePerM2: "190 tr/m²",
    area: 50,
    address: "Cầu Giấy, Hà Nội",
    timeAgo: "5 giờ trước",
    coverUrl: "/Img/demo/house-2.jpg",
    ownerName: "Anh Dũng",
    ownerPosts: 10,
  },
  {
    id: "mb-hn-03",
    dealType: "mua-ban",
    province: "Hà Nội",
    category: "Đất",
    title: "Đất 60m² gần đường Vành Đai 3.5 – sổ đỏ chính chủ",
    beds: null,
    baths: null,
    typeLabel: "Đất thổ cư",
    price: "2,4 tỷ",
    priceValue: 2400000000,
    pricePerM2: "40 tr/m²",
    area: 60,
    address: "Hoài Đức, Hà Nội",
    timeAgo: "1 ngày trước",
    coverUrl: "/Img/demo/land-1.jpg",
    ownerName: "Cô Lan",
    ownerPosts: 2,
  },

  /* ====== CHO THUÊ – HÀ NỘI ====== */
  {
    id: "ct-hn-01",
    dealType: "cho-thue",
    province: "Hà Nội",
    category: "Nhà ở",
    title: "Nhà 3 tầng gần Hồ Tây – đủ đồ, sân để xe",
    beds: 3,
    baths: 3,
    typeLabel: "Nhà ở",
    price: "18 triệu/tháng",
    priceValue: 18000000,
    pricePerM2: "300k/m²",
    area: 60,
    address: "Tây Hồ, Hà Nội",
    timeAgo: "30 phút trước",
    coverUrl: "/Img/demo/rent-1.jpg",
    ownerName: "Mr. Bình",
    ownerPosts: 11,
  },
  {
    id: "ct-hn-02",
    dealType: "cho-thue",
    province: "Hà Nội",
    category: "Căn hộ/Chung cư",
    title: "Studio cao cấp cạnh Keangnam – full nội thất",
    beds: 1,
    baths: 1,
    typeLabel: "Studio",
    price: "9 triệu/tháng",
    priceValue: 9000000,
    pricePerM2: "280k/m²",
    area: 32,
    address: "Nam Từ Liêm, Hà Nội",
    timeAgo: "1 giờ trước",
    coverUrl: "/Img/demo/rent-4.jpg",
    ownerName: "Anh Hùng",
    ownerPosts: 4,
  },

  /* ====== MUA BÁN – ĐÀ NẴNG ====== */
  {
    id: "mb-dn-01",
    dealType: "mua-ban",
    province: "Đà Nẵng",
    category: "Nhà ở",
    title: "Nhà 2 tầng gần biển Mỹ Khê – nội thất gỗ",
    beds: 3,
    baths: 3,
    typeLabel: "Nhà ở",
    price: "5,1 tỷ",
    priceValue: 5100000000,
    pricePerM2: "60 tr/m²",
    area: 85,
    address: "Sơn Trà, Đà Nẵng",
    timeAgo: "2 giờ trước",
    coverUrl: "/Img/demo/house-2.jpg",
    ownerName: "Ngọc Linh",
    ownerPosts: 6,
  },
  {
    id: "mb-dn-02",
    dealType: "mua-ban",
    province: "Đà Nẵng",
    category: "Căn hộ/Chung cư",
    title: "Căn hộ ven sông Hàn – 2PN, tầng cao",
    beds: 2,
    baths: 2,
    typeLabel: "Chung cư",
    price: "3,3 tỷ",
    priceValue: 3300000000,
    pricePerM2: "55 tr/m²",
    area: 60,
    address: "Hải Châu, Đà Nẵng",
    timeAgo: "4 giờ trước",
    coverUrl: "/Img/demo/house-3.jpg",
    ownerName: "Quốc Thái",
    ownerPosts: 5,
  },

  /* ====== CHO THUÊ – ĐÀ NẴNG ====== */
  {
    id: "ct-dn-01",
    dealType: "cho-thue",
    province: "Đà Nẵng",
    category: "Căn hộ/Chung cư",
    title: "Căn hộ studio gần biển – nội thất cao cấp",
    beds: 1,
    baths: 1,
    typeLabel: "Studio",
    price: "7 triệu/tháng",
    priceValue: 7000000,
    pricePerM2: "200k/m²",
    area: 30,
    address: "Ngũ Hành Sơn, Đà Nẵng",
    timeAgo: "30 phút trước",
    coverUrl: "/Img/demo/rent-1.jpg",
    ownerName: "Lan Anh",
    ownerPosts: 3,
  },
  {
    id: "ct-dn-02",
    dealType: "cho-thue",
    province: "Đà Nẵng",
    category: "Phòng trọ",
    title: "Phòng trọ giá rẻ cho sinh viên – gần ĐH Kinh tế",
    beds: 1,
    baths: 1,
    typeLabel: "Phòng trọ",
    price: "2,2 triệu/tháng",
    priceValue: 2200000,
    pricePerM2: "150k/m²",
    area: 15,
    address: "Liên Chiểu, Đà Nẵng",
    timeAgo: "1 giờ trước",
    coverUrl: "/Img/demo/rent-2.jpg",
    ownerName: "Cô Hoa",
    ownerPosts: 6,
  },

  /* ====== CÁC TỈNH KHÁC – MUA BÁN ====== */
  {
    id: "mb-bd-01",
    dealType: "mua-ban",
    province: "Bình Dương",
    category: "Nhà ở",
    title: "Nhà phố 1 trệt 1 lầu KDC Mỹ Phước 3",
    beds: 3,
    baths: 2,
    typeLabel: "Nhà phố",
    price: "3,1 tỷ",
    priceValue: 3100000000,
    pricePerM2: "42 tr/m²",
    area: 74,
    address: "Bến Cát, Bình Dương",
    timeAgo: "Hôm nay",
    coverUrl: "/Img/demo/house-4.jpg",
    ownerName: "Nhật Minh",
    ownerPosts: 4,
  },
  {
    id: "mb-dnai-01",
    dealType: "mua-ban",
    province: "Đồng Nai",
    category: "Đất",
    title: "Đất gần KCN Long Thành – 100m², sổ riêng",
    beds: null,
    baths: null,
    typeLabel: "Đất nền",
    price: "1,6 tỷ",
    priceValue: 1600000000,
    pricePerM2: "16 tr/m²",
    area: 100,
    address: "Long Thành, Đồng Nai",
    timeAgo: "Hôm qua",
    coverUrl: "/Img/demo/land-1.jpg",
    ownerName: "Anh Phát",
    ownerPosts: 2,
  },
  {
    id: "mb-ct-01",
    dealType: "mua-ban",
    province: "Cần Thơ",
    category: "Nhà ở",
    title: "Nhà 1 trệt 2 lầu – trung tâm Ninh Kiều",
    beds: 4,
    baths: 3,
    typeLabel: "Nhà phố",
    price: "4,2 tỷ",
    priceValue: 4200000000,
    pricePerM2: "70 tr/m²",
    area: 60,
    address: "Ninh Kiều, Cần Thơ",
    timeAgo: "2 ngày trước",
    coverUrl: "/Img/demo/house-2.jpg",
    ownerName: "Chị Mai",
    ownerPosts: 5,
  },
  {
    id: "mb-hp-01",
    dealType: "mua-ban",
    province: "Hải Phòng",
    category: "Căn hộ/Chung cư",
    title: "Chung cư Vinhomes Marina – 2PN, view hồ",
    beds: 2,
    baths: 2,
    typeLabel: "Chung cư",
    price: "2,9 tỷ",
    priceValue: 2900000000,
    pricePerM2: "48 tr/m²",
    area: 60,
    address: "Lê Chân, Hải Phòng",
    timeAgo: "3 ngày trước",
    coverUrl: "/Img/demo/house-1.jpg",
    ownerName: "Anh Dương",
    ownerPosts: 3,
  },

  /* ====== CÁC TỈNH KHÁC – CHO THUÊ ====== */
  {
    id: "ct-bd-01",
    dealType: "cho-thue",
    province: "Bình Dương",
    category: "Nhà xưởng/Kho bãi",
    title: "Kho 1000m² trong KCN VSIP 2 – có PCCC",
    beds: null,
    baths: 2,
    typeLabel: "Kho xưởng",
    price: "120 triệu/tháng",
    priceValue: 120000000,
    pricePerM2: "120k/m²",
    area: 1000,
    address: "Thuận An, Bình Dương",
    timeAgo: "5 ngày trước",
    coverUrl: "/Img/demo/land-1.jpg",
    ownerName: "Cty Kho Miền Nam",
    ownerPosts: 10,
  },
  {
    id: "ct-ct-01",
    dealType: "cho-thue",
    province: "Cần Thơ",
    category: "Phòng trọ",
    title: "Phòng trọ sinh viên gần ĐH Cần Thơ – có gác",
    beds: 1,
    baths: 1,
    typeLabel: "Phòng trọ",
    price: "1,8 triệu/tháng",
    priceValue: 1800000,
    pricePerM2: "120k/m²",
    area: 15,
    address: "Ninh Kiều, Cần Thơ",
    timeAgo: "2 ngày trước",
    coverUrl: "/Img/demo/rent-2.jpg",
    ownerName: "Chú Tư",
    ownerPosts: 6,
  },
  {
    id: "ct-hp-01",
    dealType: "cho-thue",
    province: "Hải Phòng",
    category: "Văn phòng",
    title: "Văn phòng 80m² – trung tâm Hải Phòng, có hầm xe",
    beds: null,
    baths: 2,
    typeLabel: "Văn phòng",
    price: "25 triệu/tháng",
    priceValue: 25000000,
    pricePerM2: "310k/m²",
    area: 80,
    address: "Ngô Quyền, Hải Phòng",
    timeAgo: "1 tuần trước",
    coverUrl: "/Img/demo/rent-5.jpg",
    ownerName: "Anh An",
    ownerPosts: 4,
  },
];

// ============ SERVICE MOCK ============

// hàm bỏ dấu + lowercase để so sánh
const strip = (s = "") =>
  s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Lấy toàn bộ mock listings (giống GET /api/posts) */
export function getMockListings() {
  return MOCK_LISTINGS;
}

/* ===== Helper đọc giá & diện tích ===== */

// trả về giá VND (number) hoặc null
function getPriceNumberVND(item) {
  // ưu tiên dùng field số có sẵn
  if (typeof item.priceValue === "number") return item.priceValue;

  const raw = (item.price || "").toString().toLowerCase().trim();
  if (!raw) return null;

  const clean = raw
    .replace(/\/m2|\/m²|đ|,/g, "")
    .replace(/\s+/g, " ")
    .trim();

  const num = parseFloat(clean.replace(",", "."));
  if (!Number.isFinite(num)) return null;

  if (clean.includes("tỷ")) return num * 1_000_000_000;
  if (clean.includes("tr") || clean.includes("triệu")) return num * 1_000_000;

  return num; // fallback
}

// trả về diện tích m² (number) hoặc null
function getAreaNumber(item) {
  if (typeof item.area === "number") return item.area;

  const raw = (item.area || "").toString().toLowerCase().trim();
  if (!raw) return null;

  const num = parseFloat(raw.replace(",", "."));
  return Number.isFinite(num) ? num : null;
}

/**
 * Lọc mock theo bộ filter – FE tạm dùng, sau này thay bằng call API
 *
 * options:
 *  - dealType
 *  - province
 *  - category
 *  - q
 *  - minPrice, maxPrice: VND
 *  - minArea,  maxArea : m²
 *  - bedsFilter       : array (vd [1,2,"gt5"])
 */
export function filterMockListings(options = {}) {
  const {
    dealType,
    province,
    category,
    q,
    minPrice,
    maxPrice,
    minArea,
    maxArea,
    bedsFilter,
  } = options;

  const keyword = strip(q || "");
  const provinceKey = strip(province || "");
  const categoryKey = strip(category || "");

  const hasBedsFilter = Array.isArray(bedsFilter) && bedsFilter.length > 0;

  return MOCK_LISTINGS.filter((item) => {
    // --- dealType ---
    if (dealType && item.dealType !== dealType) return false;

    // --- tỉnh/thành ---
    if (province && strip(item.province) !== provinceKey) return false;

    // --- category ---
    if (category && strip(item.category) !== categoryKey) return false;

    // --- keyword search ---
    if (keyword) {
      const text =
        strip(item.title || "") +
        " " +
        strip(item.address || "") +
        " " +
        strip(item.typeLabel || "");
      if (!text.includes(keyword)) return false;
    }

    // --- GIÁ ---
    const priceVND = getPriceNumberVND(item);
    if (minPrice != null && (priceVND == null || priceVND < minPrice)) {
      return false;
    }
    if (maxPrice != null && (priceVND == null || priceVND > maxPrice)) {
      return false;
    }

    // --- DIỆN TÍCH ---
    const area = getAreaNumber(item);
    if (minArea != null && (area == null || area < minArea)) return false;
    if (maxArea != null && (area == null || area > maxArea)) return false;

    // --- SỐ PHÒNG NGỦ ---
    if (hasBedsFilter) {
      const beds = typeof item.beds === "number" ? item.beds : null;

      let matchBeds = false;
      for (const cond of bedsFilter) {
        if (cond === "gt5") {
          // nhiều hơn 5 PN
          if (beds != null && beds > 5) {
            matchBeds = true;
            break;
          }
        } else if (typeof cond === "number") {
          if (beds === cond) {
            matchBeds = true;
            break;
          }
        }
      }

      // nếu có filter số PN mà tin không match thì loại
      if (!matchBeds) return false;
    }

    return true;
  });
}
