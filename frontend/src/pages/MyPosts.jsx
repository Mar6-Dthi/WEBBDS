// src/pages/MyPosts.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Header from "../components/header";
import Footer from "../components/footer";
import Post from "../components/Post";
import { seedMockMyPosts } from "../services/mockMyPosts";
import "../styles/MyPosts.css";

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
  const accessToken = localStorage.getItem("accessToken");

  // ====== STATE POSTS ======
  const [allPosts, setAllPosts] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("posts") || "[]");
    } catch {
      return [];
    }
  });

  // seed 20 bài mock cho user nếu chưa có
  useEffect(() => {
    if (!accessToken) return;
    seedMockMyPosts(accessToken);
    try {
      const next = JSON.parse(localStorage.getItem("posts") || "[]");
      setAllPosts(next);
    } catch {
      setAllPosts([]);
    }
  }, [accessToken]);

  // ====== STATE FILTER + SORT + PAGE ======
  // all | ca-nhan | moi-gioi
  const [ownerTypeFilter, setOwnerTypeFilter] = useState("all");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [timeSort, setTimeSort] = useState("newest"); // newest | oldest | none
  const [priceSort, setPriceSort] = useState("none"); // none | priceDesc | priceAsc
  const [currentPage, setCurrentPage] = useState(1);

  // ====== STATE MODAL XOÁ ======
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // reset page khi thay đổi filter/sort
  useEffect(() => {
    setCurrentPage(1);
  }, [ownerTypeFilter, categoryFilter, timeSort, priceSort]);

  // ====== BÀI CỦA user HIỆN TẠI ======
  const myPosts = useMemo(() => {
    if (!accessToken) return [];
    return allPosts.filter((p) => p.ownerId === accessToken);
  }, [accessToken, allPosts]);

  // ====== ÁP DỤNG FILTER + SORT ======
  const filteredAndSorted = useMemo(() => {
    let list = [...myPosts];

    // --- Lọc theo loại người đăng ---
    if (ownerTypeFilter !== "all") {
      list = list.filter((p) => {
        // bài nào không có ownerType (mock cũ) thì coi như "Cá nhân"
        const type = p.ownerType || "Cá nhân";
        if (ownerTypeFilter === "ca-nhan") return type === "Cá nhân";
        if (ownerTypeFilter === "moi-gioi") return type === "Môi giới";
        return true;
      });
    }

    // --- Lọc theo loại BĐS ---
    if (categoryFilter !== "all") {
      list = list.filter((p) => p.category === categoryFilter);
    }

    // --- Sắp xếp theo thời gian đăng ---
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

    // --- Sắp xếp theo giá (nếu chọn) ---
    if (priceSort === "priceDesc") {
      list.sort((a, b) => (b.price || 0) - (a.price || 0));
    } else if (priceSort === "priceAsc") {
      list.sort((a, b) => (a.price || 0) - (b.price || 0));
    }

    return list;
  }, [myPosts, ownerTypeFilter, categoryFilter, timeSort, priceSort]);

  // ====== PHÂN TRANG ======
  const totalPages = Math.max(
    1,
    Math.ceil(filteredAndSorted.length / PAGE_SIZE)
  );
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = (safePage - 1) * PAGE_SIZE;
  const pagePosts = filteredAndSorted.slice(
    startIndex,
    startIndex + PAGE_SIZE
  );

  const goToPage = (page) => {
    const p = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(p);
  };

  const handleView = (id) => {
    navigate(`/post/${id}`);
  };

  // mở/đóng modal xoá
  const handleAskDelete = (post) => {
    setDeleteTarget(post);
    setShowConfirm(true);
  };

  const handleCloseModal = () => {
    setShowConfirm(false);
    setDeleteTarget(null);
  };

  // xác nhận xoá
  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    const nextAll = allPosts.filter((p) => p.id !== deleteTarget.id);
    setAllPosts(nextAll);
    localStorage.setItem("posts", JSON.stringify(nextAll));
    handleCloseModal();
  };

  // ====== CHƯA LOGIN ======
  if (!accessToken) {
    return (
      <div className="nhatot">
        <div className="mk-page">
          <Header />
          <main className="myp-main">
            <div className="myp-inner">
              <h1 className="myp-title">Quản lý tin</h1>
              <p>Bạn cần đăng nhập để xem các tin đã đăng.</p>
            </div>
          </main>
          <Footer />
        </div>
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

            {/* BỘ LỌC */}
            <section className="myp-filter-card">
              <h3 className="myp-filter-heading">Bộ lọc tin đăng</h3>
              <div className="myp-filter-grid">
                {/* Lọc loại người đăng: Cá nhân / Môi giới */}
                <div className="myp-field">
                  <label className="myp-label">Loại người đăng</label>
                  <select
                    className="myp-select"
                    value={ownerTypeFilter}
                    onChange={(e) => setOwnerTypeFilter(e.target.value)}
                  >
                    <option value="all">Tất cả</option>
                    <option value="ca-nhan">Cá nhân</option>
                    <option value="moi-gioi">Môi giới</option>
                  </select>
                </div>

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
                <span className="myp-posts-sub">
                  Hiển thị theo bộ lọc bên trên. Có thể sắp xếp riêng theo thời
                  gian và theo giá.
                </span>
              </div>

              {pagePosts.length === 0 ? (
                <p>Bạn chưa đăng tin nào.</p>
              ) : (
                <>
                  <div className="mk-feed-grid myp-posts-grid">
                    {pagePosts.map((item) => (
                      <div key={item.id} className="myp-post-card-wrap">
                        <Post item={item} to={`/post/${item.id}`} />
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

                  {/* PHÂN TRANG */}
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

      {/* MODAL XÁC NHẬN XOÁ */}
      {showConfirm && (
        <div className="myp-modal-backdrop">
          <div className="myp-modal">
            <h3 className="myp-modal-title">Xóa tin đăng?</h3>
            <p className="myp-modal-text">
              {deleteTarget
                ? `Bạn có chắc chắn muốn xóa tin “${deleteTarget.title}”?`
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
