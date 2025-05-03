import React from "react";
import { NavLink } from "react-router-dom";
import { FaCog } from "react-icons/fa";

const NavbarGuest = ({ username, handleLogout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-warning">
      <div className="container">
        <NavLink to="/guest" className="navbar-brand">Khách</NavLink>
        <div className="navbar-nav ms-auto">
          <span className="nav-link">Xin chào, {username}!</span>
          <NavLink to="/account" className="nav-link">Tài khoản</NavLink>
          
          <NavLink to="/register-resident" className="nav-link btn btn-success text-white ms-3">Trở thành cư dân ngay</NavLink>
          <button className="btn btn-light ms-3" onClick={handleLogout}>Đăng xuất</button>
          <NavLink to="/settings" className="nav-link-default">
                      <FaCog className="settings-icon" />
                      
                    </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default NavbarGuest;
