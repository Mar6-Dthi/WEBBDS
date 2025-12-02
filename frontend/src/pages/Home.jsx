// src/pages/Home.jsx
import React, { useState } from "react";
import {
  Menu, Heart, MessageCircle, Bell, ChevronDown, Search,
  Linkedin, Youtube, Facebook, Mail
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import "../styles/Home.css";
import LocationSelect from "../components/LocationSelect";



const cats = [
  { name: "Bất động sản", img: "/Img/iconNhatot.png" },
  { name: "Xe cộ",        img: "/Img/iconChototxe.webp" },
  { name: "Thú cưng",     img: "/Img/iconThucung.webp" },
  { name: "Đồ gia dụng",  img: "/Img/iconDogiadung.webp" },
  { name: "Giải trí",     img: "/Img/iconGiaitri.webp" },
  { name: "Mẹ & bé",      img: "/Img/iconMevabe.webp" },
  { name: "Du lịch",      img: "/Img/iconDichvu.webp" },
  { name: "Cho tặng",     img: "/Img/iconChotang.webp" },
  { name: "Việc làm",     img: "/Img/iconVieclam.webp" },
  { name: "Điện tử",      img: "/Img/iconDodientu.webp" },
  { name: "Điện lạnh",    img: "/Img/iconThucung.webp" },
  { name: "Văn phòng",    img: "/Img/iconDodungvanphong.webp" },
  { name: "Thời trang",   img: "/Img/iconThoitrang.webp" },
  { name: "Đồ ăn, thực phẩm", img: "/Img/iconDodungvanphong.webp" },
  { name: "Dịch vụ chăm sóc nhà cửa", img: "/Img/iconDodungvanphong.webp" },
  { name: "Tất cả danh mục", img: "/Img/iconTatcadanhmuc.webp" }
];

export default function Home() {
  const [location, setLocation] = useState("Tp Hồ Chí Minh");
  const [aboutOpen, setAboutOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <div className="mk-page chotot">{/* <-- thêm 'chotot' để scope CSS theo trang */}
      {/* ===== Header ===== */}
      <header className="mk-header">
        <div className="mk-container mk-header-row">
          <div className="mk-left mk-left-edge">
            <button className="mk-icon-btn mk-menu-btn" aria-label="Menu">
              <Menu />
            </button>

            <div className="mk-logo">
              chợ<span> TỐT</span>
            </div>

            <div className="mk-seller">
              Dành cho người bán <ChevronDown size={16} />
            </div>

            <nav className="mk-nav">
              <a href="#">Chợ Tốt</a>
              <a href="#">Xe cộ</a>
              <a href="#">Bất động sản</a>
              <a href="#">Việc làm</a>
            </nav>
          </div>

          <div className="mk-right mk-right-edge">
            <button className="mk-icon-pill" aria-label="Yêu thích"><Heart /></button>
            <button className="mk-icon-pill" aria-label="Tin nhắn"><MessageCircle /></button>
            <button className="mk-icon-pill" aria-label="Thông báo"><Bell /></button>
            <button className="mk-chip">Quản lý tin</button>
            <button className="mk-chip mk-post">Đăng tin</button>
            <div className="mk-avatar">T</div>
          </div>
        </div>
      </header>

      {/* ===== Hero + Search ===== */}
      <section className="mk-hero">
        <div className="mk-container">
          <h1 className="mk-hero-title mk-hero-dark">“Nhà” mới toanh. Khám phá nhanh!</h1>

          <div className="mk-search-wrap">
            <div className="mk-search-grid">
              <button className="mk-select mk-select-cat" type="button" aria-haspopup="listbox">
                <span>Danh mục</span>
                <ChevronDown size={18} />
              </button>

              <div className="mk-input">
                <Search size={18} />
                <input placeholder="Tìm sản phẩm..." aria-label="Tìm sản phẩm" />
              </div>

              <div className="mk-select-wrap">
                <LocationSelect value={location} onChange={setLocation} />
              </div>

              <button className="mk-btn-search" type="button">Tìm kiếm</button>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Categories ===== */}
      <section className="mk-cats">
        <div className="mk-container">
          <div className="mk-cats-card">
            {cats.map((c, i) => (
              <a
                key={i}
                className="mk-cat"
                href={c.name === "Bất động sản" ? "/nhatot" : "#"}
                onClick={(e) => {
                  if (c.name === "Bất động sản") {
                    e.preventDefault();
                    navigate("/nhatot");
                  }
                }}
              >
                <img className="mk-cat-img" src={c.img} alt={c.name} loading="lazy" />
                <div className="mk-cat-name">{c.name}</div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* ===== About ===== */}
      <section className="mk-about">
        <div className="mk-container">
          <div className="mk-about-card">
            <h2 className="mk-about-title">
              Chợ Tốt – Chợ Mua Bán, Rao Vặt Trực Tuyến Hàng Đầu Của Người Việt
            </h2>

            <div
              id="aboutContent"
              className={`mk-about-content ${aboutOpen ? "is-open" : ""}`}
            >
              <p>
                Chợ Tốt chính thức gia nhập thị trường Việt Nam vào đầu năm 2012, với mục đích tạo ra cho bạn một
                kênh rao vặt trung gian, kết nối người mua với người bán lại với nhau bằng những giao dịch cực kỳ đơn
                giản, tiện lợi, nhanh chóng, an toàn, mang đến hiệu quả bất ngờ.
              </p>
              <p>
                Đến nay, Chợ Tốt tự hào là Website rao vặt được ưa chuộng hàng đầu Việt Nam. Hàng ngàn món hàng từ{" "}
                <a href="#">Bất động sản</a>, <a href="#">Nhà cửa</a>, <a href="#">Xe cộ</a>, <a href="#">Đồ điện tử</a>,
                Thú cưng, Vật dụng cá nhân… đến <a href="#">tìm việc làm</a>, thông tin tuyển dụng, các dịch vụ – du lịch
                được đăng tin, rao bán trên Chợ Tốt.
              </p>
              <p>
                Với Chợ Tốt, bạn có thể dễ dàng mua bán, trao đổi bất cứ mặt hàng nào, dù đó là đồ cũ hay đồ mới với
                nhiều lĩnh vực:
              </p>
              <p>
                <strong>Bất động sản</strong>: Cho thuê, Mua bán <a href="#">nhà đất</a>, <a href="#">căn hộ chung cư</a>,
                <a href="#"> văn phòng mặt bằng kinh doanh</a>, phòng trọ đa dạng về diện tích, vị trí.
              </p>
              <p>
                <strong>Phương tiện đi lại</strong>: <a href="#">Mua bán ô tô</a>, <a href="#">xe máy</a> cũ có giá hợp
                lý, giấy tờ đầy đủ. <strong>Đồ điện tử</strong>: điện thoại, laptop, máy tính bảng, phụ kiện… chính hãng,
                đa dạng mẫu mã.
              </p>
              <p>
                <strong>Việc làm</strong>: Hàng chục nghìn <a href="#">tin tuyển dụng</a> ở nhiều ngành nghề.{" "}
                <strong>Dịch vụ</strong>: vệ sinh, sửa chữa, vận chuyển, chăm sóc nhà cửa… với mức giá cạnh tranh và được
                đánh giá minh bạch.
              </p>
            </div>

            <button
              className="mk-expand-btn"
              type="button"
              aria-expanded={aboutOpen}
              aria-controls="aboutContent"
              onClick={() => setAboutOpen(v => !v)}
            >
              {aboutOpen ? "Thu gọn" : "Mở rộng"}
            </button>
          </div>
        </div>
      </section>

      {/* ===== Promo ===== */}
      <section className="mk-promo">
        <div className="mk-promo-inner">
          <div className="mk-promo-left">
            <h2 className="mk-promo-title">Mua thì hời, bán thì lời</h2>
            <p className="mk-promo-sub">Tải app ngay!</p>

            <div className="mk-store-row">
              <a href="#" className="mk-store-badge">
                <img src="/Img/badge-appstore.svg" alt="App Store" />
              </a>
              <a href="#" className="mk-store-badge">
                <img src="/Img/badge-googleplay.svg" alt="Google Play" />
              </a>
            </div>
          </div>

          <div className="mk-promo-right">
            <img src="/Img/promo-duck.png" alt="Chợ Tốt App" className="mk-promo-art" />
          </div>
        </div>
      </section>

      {/* ===== Footer ===== */}
      <footer className="mk-footer">
        <div className="mk-footer-inner">
          <div className="mk-ft-col">
            <h3 className="mk-ft-title">Tải ứng dụng Chợ Tốt</h3>
            <div className="mk-qr-row">
              <img className="mk-qr" src="/Img/qr-chotot.png" alt="QR tải app" />
              <div className="mk-badges">
                <a href="#" className="mk-store-badge">
                  <img src="/Img/badge-appstore.svg" alt="App Store" />
                </a>
                <a href="#" className="mk-store-badge">
                  <img src="/Img/badge-googleplay.svg" alt="Google Play" />
                </a>
              </div>
            </div>
          </div>

          <div className="mk-ft-col">
            <h3 className="mk-ft-title">Hỗ trợ khách hàng</h3>
            <ul className="mk-ft-links">
              <li><a href="#">Trung tâm trợ giúp</a></li>
              <li><a href="#">An toàn mua bán</a></li>
              <li><a href="#">Liên hệ hỗ trợ</a></li>
            </ul>
          </div>

          <div className="mk-ft-col">
            <h3 className="mk-ft-title">Về Chợ Tốt</h3>
            <ul className="mk-ft-links">
              <li><a href="#">Giới thiệu</a></li>
              <li><a href="#">Quy chế hoạt động sàn</a></li>
              <li><a href="#">Chính sách bảo mật</a></li>
              <li><a href="#">Giải quyết tranh chấp</a></li>
              <li><a href="#">Tuyển dụng</a></li>
              <li><a href="#">Truyền thông</a></li>
              <li><a href="#">Blog</a></li>
            </ul>
          </div>

          <div className="mk-ft-col">
            <h3 className="mk-ft-title">Liên kết</h3>
            <div className="mk-socials">
              <a href="#" className="mk-social-btn" aria-label="LinkedIn"><Linkedin size={18} /></a>
              <a href="#" className="mk-social-btn" aria-label="YouTube"><Youtube size={18} /></a>
              <a href="#" className="mk-social-btn" aria-label="Facebook"><Facebook size={18} /></a>
            </div>

            <div className="mk-contact">
              <p><Mail size={16} />&nbsp; Email: trogiup@chotot.vn</p>
              <p>CSKH: 19003003 (1.000đ/phút)</p>
              <p>Địa chỉ: Tầng 18, Tòa nhà UOA, Số 6 đường Tân Trào, Phường Tân Phú,
                Thành phố Hồ Chí Minh, Việt Nam</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
