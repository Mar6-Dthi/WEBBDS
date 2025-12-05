// src/services/mockMyPosts.js

export function seedMockMyPosts(userId) {
  if (!userId) return;

  let allPosts = JSON.parse(localStorage.getItem("posts") || "[]");

  // Nếu user đã có tin rồi thì không tạo thêm:
  const hasPosts = allPosts.some((p) => p.ownerId === userId);
  if (hasPosts) return;

  const now = Date.now();

  // ===== MOCK 20 TIN =====
  const mockPosts = Array.from({ length: 20 }).map((_, i) => {
    const id = i + 1;

    const categories = [
      "Căn hộ/Chung cư",
      "Nhà ở",
      "Đất",
      "Văn phòng, Mặt bằng kinh doanh",
      "Phòng trọ",
      "Nhà xưởng/Kho bãi",
    ];

    const estateTypeList = ["Cần bán", "Cho thuê"];

    return {
      id: `mock-user-post-${id}`,
      ownerId: userId,
      ownerType: id % 2 === 0 ? "Môi giới" : "Cá nhân",
      title: `Tin mock số ${id} – bài test hệ thống`,
      category: categories[id % categories.length],
      estateType: estateTypeList[id % 2],
      price: (id + 1) * 1000000000,
      area: 40 + id,
      address: `Địa chỉ thử nghiệm số ${id}, TP.HCM`,
      createdAt: new Date(now - id * 3600 * 1000).toISOString(),
      images: ["/Img/demo/house-1.jpg"],
    };
  });

  allPosts = [...allPosts, ...mockPosts];
  localStorage.setItem("posts", JSON.stringify(allPosts));
}
