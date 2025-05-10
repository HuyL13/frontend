import React from "react";
import { NavLink } from "react-router-dom";
import { FaCog } from "react-icons/fa";
import { useLayout } from '../../context/LayoutContext';
const NavbarResident = ({ username, handleLogout }) => {
  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-primary">
      <div className="container">
        <NavLink to="/resident" className="navbar-brand">Cư dân</NavLink>
        <div className="navbar-nav ms-auto">
          <span className="nav-link">Xin chào, {username}!</span>
          <NavLink to="/account" className="nav-link">Tài khoản</NavLink>
 
          <NavLink to="/resident" className="nav-link">Cư dân</NavLink>
          <button className="btn btn-light ms-3" onClick={handleLogout}>Đăng xuất</button>
          <NavLink to="/settings" className="nav-link-default">
                      <FaCog className="settings-icon" />
                      
                    </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default NavbarResident;
