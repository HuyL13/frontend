import React from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext"; // Import hook xác thực

const NotFoundPage = () => {
  const { isAuthenticated, role } = useAuth(); // Lấy thông tin user
  
  // Định nghĩa route chính cho từng role
  const roleHomeRoutes = {
    admin: "/admin",
    resident: "/resident",
    guest: "/guest",
    default: "/"
  };

  // Xác định route đích
  const getHomePath = () => {
    if (!isAuthenticated) return roleHomeRoutes.default;
    return roleHomeRoutes[role] || roleHomeRoutes.default;
  };

  return (
    <div className="container text-center mt-5">
      <h1>404 - Trang không tồn tại</h1>
      <p>Trang bạn đang tìm không có hoặc bạn không có quyền truy cập.</p>
      <Link to={getHomePath()} className="btn btn-primary">
        {isAuthenticated ? "Về trang chính" : "Về trang chủ"}
      </Link>
    </div>
  );
};

export default NotFoundPage;