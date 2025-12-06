// src/App.js
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import HomeNhaTot from "./pages/HomeNhaTot";
import Login from "./pages/Login";
import RegisterNewAccount from "./pages/RegisterNewAccount";
import LoginPassword from "./pages/LoginPassword";
import ForgotPassword from "./pages/ForgotPassword";
import Favorite from "./pages/Favorite";
import PostCreate from "./pages/PostCreate";
import PostDetail from "./pages/PostDetail";
import MyPosts from "./pages/MyPosts";
import Messages from "./pages/Messages";
import ListingPage from "./pages/ListingPage";
import History from "./pages/History";
import AgentsPage from "./pages/AgentsPage";
import AgentDetail from "./pages/AgentDetail";
import AgentReview from "./pages/AgentReview";
import MembershipPage from "./pages/MembershipPage";
import AgentListings from "./pages/AgentListings";
import ProfilePage from "./pages/ProfilePage";
import ProfileEdit from "./pages/ProfileEdit";
import Payment from "./pages/Payment";
import TransactionHistoryPage from "./pages/TransactionHistoryPage";
import MyReviewsPage from "./pages/MyReviewsPage";
import MyAgentPage from "./pages/MyAgentPage";

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/nhatot" element={<HomeNhaTot />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register-new" element={<RegisterNewAccount />} />
        <Route path="/login-password" element={<LoginPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/yeu-thich" element={<Favorite />} />
        <Route path="/dang-tin" element={<PostCreate />} />
        <Route path="/post/:id" element={<PostDetail />} />
        <Route path="/quan-ly-tin" element={<MyPosts />} />
        <Route path="/tin-nhan" element={<Messages />} />
        <Route path="/listing" element={<ListingPage />} />
        <Route path="/lich-su-xem" element={<History />} />
        <Route path="/moi-gioi" element={<AgentsPage />} />
        <Route path="/moi-gioi/:id" element={<AgentDetail />} />
        <Route path="/moi-gioi/:id/danh-gia" element={<AgentReview />} />
        <Route path="/goi-hoi-vien" element={<MembershipPage />} />
        <Route path="/moi-gioi/:agentId/tin-dang" element={<AgentListings />} />
        <Route path="/trang-ca-nhan" element={<ProfilePage />} />
        <Route path="/chinh-sua-trang-ca-nhan" element={<ProfileEdit />} />
        <Route path="/thanh-toan-hoi-vien" element={<Payment />} />
        <Route path="/lich-su-giao-dich" element={<TransactionHistoryPage />} />
        <Route path="/danh-gia-cua-toi" element={<MyReviewsPage />} />
        <Route path="/trang-moi-gioi-cua-toi" element={<MyAgentPage />} />
      </Routes>
    </BrowserRouter>
  );
}
