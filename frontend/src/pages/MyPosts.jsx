// src/pages/MyPosts.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import Post from "../components/Post";
import { seedMockMyPosts } from "../services/mockMyPosts";
import "../styles/MyPosts.css";

import {
  getFavoriteIds,
  toggleFavorite,
  toggleFavoriteMock,
} from "../services/mockFavoriteService";

const PAGE_SIZE = 12;

const CATEGORY_OPTIONS = [
  { value: "all", label: "Tất cả BĐS" },
  { value: "Căn hộ/Chung cư", label: "Căn hộ/Chung cư" },
  { value: "Nhà ở", label: "Nhà ở" },
  { value: "Đất", label: "Đất" },
  {
    value: "Văn phòng, Mặt bằng kinh doanh",
    label: "Văn phòng, Mặt bằng kinh doanh",
  },
  { value: "Phòng trọ", label: "Phòng trọ" },
];

export default function MyPosts() {
  const navigate = useNavigate();

  // ======================================================
  // ✔ CHUẨN HOÁ LẤY ownerId (PHẢI GIỐNG PostCreate)
  //  - PostCreate đang lưu ownerId = currentUser.id (email) với login google
  //  - Nên ở đây cũng ưu tiên currentUser.id / phone, cuối cùng mới fallback accessToken
  // ======================================================
  function resolveLocalUserId() {
    try {
      const u = JSON.parse(localStorage.getItem("currentUser") || "null");
      if (u?.id) return u.id;       // vd: 'loan@gmail.com'
      if (u?.phone) return u.phone; // trường hợp đăng nhập bằng số điện thoại
    } catch {
      // ignore
    }

    // fallback cuối cùng
    const accessToken = localStorage.getItem("accessToken");
    if (accessToken) return accessToken;

    return null;
  }

  const ownerId = resolveLocalUserId();

  // ====== STATE POSTS ======
  const [allPosts, setAllPosts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("posts") || "[]");
    } catch {
      return [];
    }
  });

  function loadPosts() {
    try {
      const next = JSON.parse(localStorage.getItem("posts") || "[]");
      setAllPosts(Array.isArray(next) ? next : []);
    } catch {
      setAllPosts([]);
    }
  }

  // seed mock once
  useEffect(() => {
    if (!ownerId) return;
    seedMockMyPosts(ownerId);
    loadPosts();
  }, [ownerId]);

  // ====== FILTER + SORT ======
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timeSort, setTimeSort] = useState("newest");
  const [priceSort, setPriceSort] = useState("none");
  const [currentPage, setCurrentPage] = useState(1);

  // ====== DELETE ======
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // ====== FAVORITE ======
  const [favoriteIds, setFavoriteIds] = useState(
    () => new Set(getFavoriteIds() || [])
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [categoryFilter, timeSort, priceSort]);

  // ======================================================
  // ✔ LỌC ĐÚNG BÀI CỦA USER (ownerId giống PostCreate)
  // ======================================================
  const myPosts = useMemo(() => {
    if (!ownerId) return [];
    return allPosts.filter((p) => String(p.ownerId) === String(ownerId));
  }, [ownerId, allPosts]);

  const filteredAndSorted = useMemo(() => {
    let list = [...myPosts];

    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category === categoryFilter);
    }

    if (timeSort === "newest") {
      list.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    } else if (timeSort === "oldest") {
      list.sort(
        (a, b) =>
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
      );
    }

    if (priceSort === "priceDesc") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (priceSort === "priceAsc") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    return list;
  }, [myPosts, categoryFilter, timeSort, priceSort]);

  // ====== PAGINATION ======
  const totalPages = Math.max(1, Math.ceil(filteredAndSorted.length / PAGE_SIZE));
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pagePosts = filteredAndSorted.slice(startIndex, startIndex + PAGE_SIZE);

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
  };

  // ====== ACTIONS ======
  const handleView = (id) => navigate(`/post/${id}`);

  const handleAskDelete = (post) => {
    setDeleteTarget(post);
    setShowConfirm(true);
  };

  const handleCloseModal = () => {
    setShowConfirm(false);
    setDeleteTarget(null);
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const nextAll = allPosts.filter((p) => p.id !== deleteTarget.id);
    setAllPosts(nextAll);
    localStorage.setItem("posts", JSON.stringify(nextAll));
    handleCloseModal();
  };

  // ====== UPDATE UI WHEN NEW POST CREATED ======
  useEffect(() => {
    const onPostCreated = (ev) => {
      const detail = ev?.detail || {};
      if (!detail.ownerId) return;
      if (String(detail.ownerId) === String(ownerId)) {
        loadPosts();
      }
    };

    const onStorage = (ev) => {
      if (ev.key === "posts") loadPosts();
    };

    window.addEventListener("post:created", onPostCreated);
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("post:created", onPostCreated);
      window.removeEventListener("storage", onStorage);
    };
  }, [ownerId]);

  // ====== FAVORITE ======
  const handleToggleFavorite = (e, item) => {
    e?.stopPropagation?.();
    e?.preventDefault?.();

    const { ids, added } = toggleFavorite(item.id);
    setFavoriteIds(new Set(ids));

    toggleFavoriteMock(
      {
        postId: item.id,
        postTitle: item.title,
        ownerName: item.ownerName,
        postPrice: item.price,
        postLocation: item.address,
        postThumbnail: item.coverUrl,
      },
      added
    );
  };

  // ====== NOT LOGGED IN ======
  if (!ownerId) {
    return (
      <div className="nhatot">
        <Header />
        <main className="myp-main">
          <p>Bạn cần đăng nhập để xem tin đã đăng.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="nhatot">
      <div className="mk-page">
        <Header />

        <main className="myp-main">
          <div className="myp-inner">
            <h1 className="myp-title">Quản lý tin</h1>

            {/* FILTER */}
            <section className="myp-filter-card">
              <h3 className="myp-filter-heading">Bộ lọc tin đăng</h3>
              <div className="myp-filter-grid">
                <div className="myp-field">
                  <label className="myp-label">Loại BĐS</label>
                  <select
                    className="myp-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="myp-field">
                  <label className="myp-label">Thời gian</label>
                  <select
                    className="myp-select"
                    value={timeSort}
                    onChange={(e) => setTimeSort(e.target.value)}
                  >
                    <option value="newest">Mới → Cũ</option>
                    <option value="oldest">Cũ → Mới</option>
                    <option value="none">Không sắp xếp</option>
                  </select>
                </div>

                <div className="myp-field">
                  <label className="myp-label">Giá</label>
                  <select
                    className="myp-select"
                    value={priceSort}
                    onChange={(e) => setPriceSort(e.target.value)}
                  >
                    <option value="none">Không sắp xếp</option>
                    <option value="priceDesc">Cao → Thấp</option>
                    <option value="priceAsc">Thấp → Cao</option>
                  </select>
                </div>
              </div>
            </section>

            {/* DANH SÁCH TIN */}
            <section className="myp-posts-section">
              <div className="myp-posts-head">
                <h3>Tin đăng của bạn ({filteredAndSorted.length})</h3>
                <span className="myp-posts-sub">Hiển thị theo bộ lọc bên trên.</span>
              </div>

              {pagePosts.length === 0 ? (
                <p>Bạn chưa đăng tin nào.</p>
              ) : (
                <>
                  <div className="mk-feed-grid myp-posts-grid">
                    {pagePosts.map((item) => (
                      <div key={item.id} className="myp-post-card-wrap">
                        <Post
                          item={item}
                          to={`/post/${item.id}`}
                          isLiked={favoriteIds.has(String(item.id))}
                          onToggleFavorite={(e) => handleToggleFavorite(e, item)}
                        />

                        <div className="myp-post-actions">
                          <button
                            type="button"
                            className="myp-action-btn"
                            onClick={() => handleView(item.id)}
                          >
                            Xem tin
                          </button>

                          <button
                            type="button"
                            className="myp-action-btn myp-action-btn-danger"
                            onClick={() => handleAskDelete(item)}
                          >
                            Xoá
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {totalPages > 1 && (
                    <div className="myp-pagination">
                      <button
                        type="button"
                        className="myp-page-btn"
                        onClick={() => goToPage(safePage - 1)}
                        disabled={safePage === 1}
                      >
                        &lt;
                      </button>

                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                        (page) => (
                          <button
                            key={page}
                            type="button"
                            className={
                              "myp-page-btn" +
                              (page === safePage ? " myp-page-btn--active" : "")
                            }
                            onClick={() => goToPage(page)}
                          >
                            {page}
                          </button>
                        )
                      )}

                      <button
                        type="button"
                        className="myp-page-btn"
                        onClick={() => goToPage(safePage + 1)}
                        disabled={safePage === totalPages}
                      >
                        &gt;
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>
          </div>
        </main>

        <Footer />
      </div>

      {/* MODAL XOÁ */}
      {showConfirm && (
        <div className="myp-modal-backdrop">
          <div className="myp-modal">
            <h3 className="myp-modal-title">Xóa tin đăng?</h3>
            <p className="myp-modal-text">
              {deleteTarget
                ? `Bạn có chắc muốn xóa tin “${deleteTarget.title}”?`
                : "Bạn có chắc chắn muốn xóa tin này?"}
            </p>

            <div className="myp-modal-actions">
              <button
                type="button"
                className="myp-modal-btn"
                onClick={handleCloseModal}
              >
                Hủy
              </button>

              <button
                type="button"
                className="myp-modal-btn myp-modal-btn-danger"
                onClick={handleConfirmDelete}
              >
                Xóa
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
