import React from "react";
import { NavLink } from "react-router-dom";
import { FaCog } from "react-icons/fa"; // Import biểu tượng bánh răng

const NavbarDefault = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-secondary">
      <div className="container">
        <NavLink to="/" className="navbar-brand">Quản lý chung cư</NavLink>
        <div className="navbar-nav ms-auto">
          <NavLink to="/signup" className="nav-link">Đăng ký</NavLink>
          <NavLink to="/login" className="nav-link">Đăng nhập</NavLink>
          <NavLink to="/settings" className="nav-link-default">
            <FaCog className="settings-icon" />
            
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default NavbarDefault;
