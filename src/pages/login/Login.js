import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Login.css";
import { NavLink } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const requestHeaders = {
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.username || !formData.password) {
      setError("Vui lòng nhập đầy đủ tên đăng nhập và mật khẩu");
      return;
    }

    try {
      setLoading(true);
      const response = await fetch("http://localhost:22986/demo/auth/login", {
        method: "POST",
        headers: requestHeaders,
        body: JSON.stringify({
          username: formData.username,
          password: formData.password,
        }),
      });

      const data = await response.json();
      console.log(data);

      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      // Lấy token và roles từ API
      const token = data?.result?.token;
      const roles = data?.result?.roles || [];
      console.log("login", roles);

      if (!token || roles.length === 0) {
        throw new Error("Thông tin xác thực không hợp lệ");
      }

      // Lưu token và toàn bộ roles vào localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRoles", JSON.stringify(roles));

      // Gọi hàm login và chuyển hướng
      login(roles);
      navigate("/dashboard");
    } catch (err) {
      console.log("sai rồi");
      setError(err.message);
      localStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <h2>Đăng nhập hệ thống</h2>

      {error && <div className="alert error">{error}</div>}

      <form onSubmit={handleLogin}>
        <div className="form-group">
          <input
            type="text"
            placeholder="Tên đăng nhập"
            value={formData.username}
            onChange={(e) => setFormData({ ...formData, username: e.target.value })}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <input
            type="password"
            placeholder="Mật khẩu"
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            disabled={loading}
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? <div className="spinner" /> : "Đăng nhập"}
        </button>
      </form>

      <NavLink to="/signup">Đăng ký tài khoản</NavLink>

      {/* Đây là NavLink đúng cho Quên mật khẩu */}
      <NavLink to="/forgot">Quên mật khẩu?</NavLink>
    </div>
  );
};

export default Login;
