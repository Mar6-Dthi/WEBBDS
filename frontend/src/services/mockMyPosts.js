// src/services/mockMyPosts.js

const POSTS_KEY = "posts";

// Seed 20 bài mock cho một user (chỉ seed 1 lần duy nhất)
export function seedMockMyPosts(userId) {
  if (!userId) return;

  let allPosts = JSON.parse(localStorage.getItem(POSTS_KEY) || "[]");

  // Kiểm tra user đã có bài thật hoặc mock rồi thì không seed nữa
  const hasAnyPosts = allPosts.some(
    (p) => String(p.ownerId) === String(userId)
  );
  if (hasAnyPosts) return;

  const now = Date.now();
  const categories = [
    "Căn hộ/Chung cư",
    "Nhà ở",
    "Đất",
    "Văn phòng, Mặt bằng kinh doanh",
    "Phòng trọ",
  ];
  const estateTypeList = ["Cần bán", "Cho thuê"];

  const mockPosts = Array.from({ length: 20 }).map((_, i) => {
    const id = i + 1;

    const category = categories[i % categories.length];
    const estateType =
      category === "Phòng trọ"
        ? "Cho thuê"
        : estateTypeList[i % estateTypeList.length];

    return {
      id: `mock-user-post-${userId}-${id}`, // tránh trùng id giữa nhiều user
      ownerId: userId,
      ownerType: id % 2 === 0 ? "Môi giới" : "Cá nhân",

      title: `Tin mock số ${id} – bài test hệ thống`,
      category,
      estateType,
      price: (id + 1) * 1_000_000_000,
      area: 40 + id,
      address: `Địa chỉ thử nghiệm số ${id}, TP.HCM`,
      coverUrl: "/Img/demo/house-1.jpg",
      images: ["/Img/demo/house-1.jpg"],
      createdAt: new Date(now - id * 3600 * 1000).toISOString(),
    };
  });

  const next = [...allPosts, ...mockPosts];
  localStorage.setItem(POSTS_KEY, JSON.stringify(next));
}

/* ====== HÀM PHỤ TRỢ ====== */

export function getAllPosts() {
  try {
    const raw = localStorage.getItem(POSTS_KEY) || "[]";
    const list = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch {
    return [];
  }
}

export function getMyPosts(userId) {
  if (!userId) return [];
  return getAllPosts()
    .filter((p) => String(p.ownerId) === String(userId))
    .sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );
}

// Tạo bài mới và notify MyPosts
export function createMyPost(userId, data) {
  if (!userId) throw new Error("Missing userId");

  const all = getAllPosts();
  const nowIso = new Date().toISOString();

  const newPost = {
    id: "post-" + Date.now(),
    ownerId: userId,
    ownerType: data.ownerType || "Cá nhân",
    createdAt: nowIso,
    coverUrl:
      data.coverUrl || (data.images && data.images[0]) || "/Img/demo/house-1.jpg",
    images: Array.isArray(data.images) ? data.images : [],
    ...data,
  };

  const next = [newPost, ...all];
  localStorage.setItem(POSTS_KEY, JSON.stringify(next));

  // event cho MyPosts lắng nghe
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(
        new CustomEvent("post:created", {
          detail: { ownerId: userId, postId: newPost.id },
        })
      );
    } catch {}
  }

  return newPost;
}
