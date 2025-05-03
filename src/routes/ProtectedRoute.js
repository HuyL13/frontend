import React, { useContext } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const ProtectedRoute = ({ allowedRoles }) => {
  const { isAuthenticated, role } = useContext(AuthContext);

  // Nếu chưa đăng nhập → Chuyển hướng đến login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Nếu có danh sách vai trò cho phép & role hiện tại không hợp lệ → 404
  if (allowedRoles && !allowedRoles.includes(role)) {
    return <Navigate to="/404" replace />;
  }

  return <Outlet />;
};

export default ProtectedRoute;
