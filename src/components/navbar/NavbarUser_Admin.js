import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { FaCog } from "react-icons/fa";
import "../../styles/NavbarUser_Admin.css";

const NavbarUser_Admin = ({ handleLogout }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const modalRef = useRef(null);
  const hideTimerRef = useRef(null);
  const [showAdminModal, setShowAdminModal] = useState(false);

  // Các route và chế độ
  const adminDefaultRoute = "/admin/rooms";
  const userDefaultRoute = "/resident";
  const adminRoutes = [
    "/admin/rooms",
    "/admin/users",
    "/admin/fees",
    "/admin/guests",
    "/admin/reports",
    "/dashboard"
  ];

  const getInitialMode = () => {
    return adminRoutes.some(route => location.pathname.startsWith(route))
      ? "admin"
      : "user";
  };

  const [mode, setMode] = useState(getInitialMode());

  useEffect(() => {
    const newMode = adminRoutes.some(route => location.pathname.startsWith(route))
      ? "admin"
      : "user";
    if (newMode !== mode) {
      setMode(newMode);
    }
  }, [location.pathname, mode]);

  // Đóng modal khi click bên ngoài hoặc nhấn Escape
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setShowAdminModal(false);
      }
    };

    const handleEscape = (event) => {
      if (event.key === "Escape") {
        setShowAdminModal(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
    };
  }, []);

  const toggleMode = () => {
    if (mode === "user") {
      setMode("admin");
      navigate(adminDefaultRoute, { replace: true });
    } else {
      setMode("user");
      navigate(userDefaultRoute, { replace: true });
    }
  };

  // Xử lý khi hover: hủy timer nếu có và hiển thị modal
  const handleMouseEnter = () => {
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
    }
    setShowAdminModal(true);
  };

  // Khi di chuột ra, đặt thời gian trễ 500ms trước khi ẩn modal
  const handleMouseLeave = () => {
    hideTimerRef.current = setTimeout(() => {
      setShowAdminModal(false);
    }, 500);
  };

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-secondary">
      <div className="container">
        <NavLink to="/" className="navbar-brand">
          User &amp; Admin
        </NavLink>

        <div className="navbar-nav ms-auto align-items-center">
          {/* Công tắc chuyển đổi chế độ */}
          <div className="form-check form-switch me-3">
            <input
              className="form-check-input"
              type="checkbox"
              id="modeSwitch"
              checked={mode === "admin"}
              onChange={toggleMode}
            />
            <label className="form-check-label" htmlFor="modeSwitch">
              {mode === "admin" ? "Admin" : "User"}
            </label>
          </div>

          <NavLink to="/account" className="nav-link">
            Tài khoản
          </NavLink>

          {mode === "user" ? (
            <NavLink to="/resident" className="nav-link">
              Cư dân
            </NavLink>
          ) : (
            <>
              {/* Modal mở khi hover: sử dụng onMouseEnter và onMouseLeave */}
              <div
                className="nav-item"
                onMouseEnter={handleMouseEnter}
                onMouseLeave={handleMouseLeave}
                style={{ position: "relative" }}
              >
                <button
                  className="nav-link dropdown-toggle btn-modal-trigger"
                  aria-label="Mở menu quản trị"
                >
                  Quản trị
                </button>

                {showAdminModal && (
                  <div className="admin-modal-overlay">
                    <div ref={modalRef} className="admin-modal-content">
                      <div className="admin-modal-header">
                        <h5>Menu Quản trị</h5>
                        <button
                          className="close-btn"
                          onClick={() => setShowAdminModal(false)}
                          aria-label="Đóng menu"
                        >
                          &times;
                        </button>
                      </div>
                      <div className="admin-modal-body">
                        <NavLink 
                          to="/admin/rooms" 
                          className="modal-item"
                          onClick={() => setShowAdminModal(false)}
                        >
                          Quản lý Phòng
                        </NavLink>
                        <NavLink
                          to="/admin/users"
                          className="modal-item"
                          onClick={() => setShowAdminModal(false)}
                        >
                          Quản lý Người dùng
                        </NavLink>
                        <NavLink
                          to="/admin/fees"
                          className="modal-item"
                          onClick={() => setShowAdminModal(false)}
                        >
                          Quản lí phí
                        </NavLink>
                        <NavLink
                          to="/admin/guests"
                          className="modal-item"
                          onClick={() => setShowAdminModal(false)}
                        >
                          Phê duyệt
                        </NavLink>
                        <NavLink
                          to="/admin/reports"
                          className="modal-item"
                          onClick={() => setShowAdminModal(false)}
                        >
                          Báo cáo
                        </NavLink>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <NavLink to="/dashboard" className="nav-link">
                Thống kê
              </NavLink>
            </>
          )}

          <button className="btn btn-light ms-3" onClick={handleLogout}>
            Đăng xuất
          </button>
          <NavLink to="/settings" className="nav-link">
            <FaCog className="settings-icon" />
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default NavbarUser_Admin;
