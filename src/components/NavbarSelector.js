import React, { useEffect } from "react";
import { useNavbar } from "../context/NavbarContext";
import { useAuth } from "../context/AuthContext";
import { useLocation, useNavigate } from "react-router-dom";
import NavbarGuest from "./navbar/NavbarGuest";
import NavbarAdmin from "./navbar/NavbarAdmin";
import NavbarResident from "./navbar/NavbarResident";
import NavbarUser_Admin from "./navbar/NavbarUser_Admin";
import NavbarDefault from "./navbar/NavbarDefault";

const NavbarSelector = () => {
  const { navbarType, setNavbarType } = useNavbar();
  const { logout, isAuthenticated, roles } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Xác định loại navbar dựa trên roles đã chuẩn hóa
  const determineNavbarType = () => {
    console.log("dede",roles);
    if (!Array.isArray(roles) || roles.length === 0) return "default";
    
    // Nếu có cả ADMIN và USER, trả về "user_admin"
    if (roles.includes("ADMIN") && roles.includes("USER")) return "user_admin";
    if (roles.includes("ADMIN")) return "admin";
    if (roles.includes("USER")) return "user";
    if (roles.includes("GUEST")) return "guest";
    return "default";
  };

  useEffect(() => {
    if (!isAuthenticated) {
      setNavbarType("default");
      return;
    }
    const newNavbarType = determineNavbarType();
    console.log("Navbar Type Set:", newNavbarType);
    setNavbarType(newNavbarType);
  }, [roles, isAuthenticated, setNavbarType]);

  const handleLogout = () => {
    logout();
    setNavbarType("default");
    navigate("/login");
  };

  // Ẩn navbar trên trang chủ nếu cần
  if (["/"].includes(location.pathname)) return null;

  const navbarComponents = {
    admin: <NavbarAdmin handleLogout={handleLogout} />,
    user: <NavbarResident handleLogout={handleLogout} />,
    user_admin: <NavbarAdmin handleLogout={handleLogout} />,
    guest: <NavbarGuest handleLogout={handleLogout} />,
    default: <NavbarDefault />
  };

  return isAuthenticated ? navbarComponents[navbarType] : navbarComponents.default;
};

export default NavbarSelector;
