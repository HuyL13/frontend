import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/Signup.css";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    email: "",
    dob: ""
  });
  const [message, setMessage] = useState({ type: "", content: "" });
  const [loading, setLoading] = useState(false);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateForm = () => {
    const { username, password, email, dob } = formData;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$/;

    if (!username || !password || !email || !dob) {
      setMessage({ type: "error", content: "Vui lòng điền đầy đủ thông tin" });
      return false;
    }

    if (!emailRegex.test(email)) {
      setMessage({ type: "error", content: "Email không hợp lệ" });
      return false;
    }

    if (!passwordRegex.test(password)) {
      setMessage({
        type: "error",
        content: "Mật khẩu cần ít nhất 8 ký tự, bao gồm chữ số và ký tự đặc biệt"
      });
      return false;
    }

    return true;
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    try {
      const response = await fetch("http://localhost:22986/demo/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          ...formData,
          dob: new Date(formData.dob).toISOString().split("T")[0]
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Đăng ký thất bại");
      }

      setMessage({
        type: "success",
        content: "Đăng ký thành công! Đang chuyển hướng..."
      });

      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      setMessage({
        type: "error",
        content: error.message || "Có lỗi xảy ra khi đăng ký"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <h2 className ="signup-header">Đăng ký tài khoản</h2>

      {message.content && (
        <div className={`alert ${message.type}`}>
          {message.content}
        </div>
      )}

      <form className="signup-form" onSubmit={handleSignup}>
        <div className="form-group">
          <label>Tên đăng nhập:</label>
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Mật khẩu:</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="name-group">
          <div className="form-group">
            <label>Họ:</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Tên:</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
        </div>

        <div className="form-group">
          <label>Ngày sinh:</label>
          <input
            type="date"
            name="dob"
            value={formData.dob}
            onChange={handleInputChange}
            required
          />
        </div>

        <button 
          type="submit" 
          className="submit-btn"
          disabled={loading}
        >
          {loading ? "Đang xử lý..." : "Đăng ký"}
        </button>
      </form>
    </div>
  );
};

export default Signup;
