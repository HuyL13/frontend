import React from "react";
import { NavLink } from "react-router-dom";
import "../../styles/Lobby.css";

const Lobby = () => {
  return (
    <div className="lobby-container">
      

      <div className="lobby-buttons">
        <NavLink to="/login" className="btn btn-primary">Đăng nhập</NavLink>
        <NavLink to="/signup" className="btn btn-secondary">Đăng ký</NavLink>
      </div>

      
      <h2>Chào mừng bạn đến với Hệ thống Quản lý Chung cư</h2>
      <p>Đăng nhập hoặc đăng ký để sử dụng các dịch vụ.</p>
    </div>
  );
};

export default Lobby;
