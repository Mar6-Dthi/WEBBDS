// src/pages/MyPosts.jsx
import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/MyPosts.css"; // nếu muốn style riêng

export default function MyPosts() {
  const navigate = useNavigate();

  const accessToken = localStorage.getItem("accessToken");
  const allPosts = JSON.parse(localStorage.getItem("posts") || "[]");

  const myPosts = useMemo(() => {
    if (!accessToken) return [];
    return allPosts.filter((p) => p.ownerId === accessToken);
  }, [accessToken, allPosts]);

  const handleView = (id) => {
    navigate(`/post/${id}`);
  };

  const handleDelete = (id) => {
    if (!window.confirm("Xoá tin này?")) return;
    const next = allPosts.filter((p) => p.id !== id);
    localStorage.setItem("posts", JSON.stringify(next));
    window.location.reload(); // đơn giản: reload lại danh sách
  };

  if (!accessToken) {
    return (
      <div className="myp-page">
        <div className="myp-container">
          <h2>Quản lý tin</h2>
          <p>Bạn cần đăng nhập để xem các tin đã đăng.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="myp-page">
      <div className="myp-container">
        <h2>Quản lý tin</h2>

        {myPosts.length === 0 ? (
          <p>Bạn chưa đăng tin nào.</p>
        ) : (
          <div className="myp-list">
            {myPosts.map((p) => (
              <div key={p.id} className="myp-item">
                <div className="myp-thumb">
                  {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} alt={p.title} />
                  ) : (
                    <div className="myp-thumb-placeholder">No image</div>
                  )}
                </div>

                <div className="myp-body">
                  <h3 className="myp-title">{p.title}</h3>
                  <p className="myp-meta">
                    {p.category} • {p.estateType || "—"}
                  </p>
                  <p className="myp-address">{p.address}</p>
                </div>

                <div className="myp-actions">
                  <button
                    type="button"
                    className="myp-btn"
                    onClick={() => handleView(p.id)}
                  >
                    Xem tin
                  </button>
                  <button
                    type="button"
                    className="myp-btn myp-btn-danger"
                    onClick={() => handleDelete(p.id)}
                  >
                    Xoá
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
