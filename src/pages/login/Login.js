import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Login.css";
import { NavLink } from "react-router-dom";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const otpInputs = useRef(Array(6).fill(null));

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [modalState, setModalState] = useState({
    show: false,
    step: 'email',
    email: "",
    message: "",
    otp: Array(6).fill(""),
    isProcessing: false,
    correctOtp: false,
    newPassword: "",
    confirmPassword: ""
  });

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
      const response = await fetch("https://backend-13-6qob.onrender.com/demo/auth/login", {
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
      console.log("login",roles);
  
      if (!token || roles.length === 0) {
        throw new Error("Thông tin xác thực không hợp lệ");
      }
  
      // Lưu token và toàn bộ roles vào localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("userRoles", JSON.stringify(roles));
  
      // Cập nhật modal hiển thị OTP để xác thực (nếu cần)
      setModalState((prev) => ({
        ...prev,
        show: true,
        step: "otp",
        message: "Nhập mã OTP để xác thực",
        otp: Array(6).fill(""),
      }));
  
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
  
  
  const handlePasswordReset = async () => {
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(modalState.email)) {
      setModalState(prev => ({ ...prev, message: "Email không hợp lệ" }));
      return;
    }

    setModalState(prev => ({ ...prev, isProcessing: true }));

    try {
      const response = await fetch(
        `https://backend-13-6qob.onrender.com/demo/auth/request-otp?email=${encodeURIComponent(modalState.email)}`,
        { method: "POST" }
      );

      const data = await response.text();
      
      if (!response.ok) throw new Error(data || "Không thể gửi OTP");

      setModalState(prev => ({
        ...prev,
        show: true,
        step: 'otp',
        message: data,
        otp: Array(6).fill("")
      }));

    } catch (err) {
      setModalState(prev => ({ ...prev, message: err.message.replace(/^Error: /, "") }));
    } finally {
      setModalState(prev => ({ ...prev, isProcessing: false }));
    }
  };

  const verifyOtp = async (otp) => {
    setModalState(prev => ({ ...prev, isProcessing: true, message: "" }));

    try {
      const response = await fetch(
        `https://backend-13-6qob.onrender.com/demo/auth/verify-otp?email=${encodeURIComponent(modalState.email)}&otp=${encodeURIComponent(otp)}`,
        { method: 'POST', headers: requestHeaders }
      );

      const result = await response.text();
      if (!response.ok) throw new Error(result || "Lỗi xác thực OTP");

      setModalState(prev => ({
        ...prev,
        message: result,
        step: 'new_password'
      }));
      
    } catch (err) {
      setModalState(prev => ({ ...prev, message: err.message, isProcessing: false }));
    }
  };
  const handlePasswordUpdate = async () => {
    if (modalState.newPassword !== modalState.confirmPassword) {
      setModalState(prev => ({ ...prev, message: "Mật khẩu xác nhận không khớp" }));
      return;
    }
  
    setModalState(prev => ({ ...prev, isProcessing: true }));
    const email= modalState.email;
    const otp= modalState.otp.join("");
    const newPassword= modalState.newPassword;
    const payload = {
      email: modalState.email,
      otp: modalState.otp.join(""),
      newPassword: modalState.newPassword
    };
  
    try {
      const response = await fetch(`https://backend-13-6qob.onrender.com/demo/auth/reset-password?email=${email}&otp=${otp}&newPassword=${newPassword}`, {
        method: "POST",
        
        body: JSON.stringify(payload)
      });
  
      const data = await response.text();
      
      if (data.includes("Password reset successful")) {
        console.log("Cập nhật mật khẩu thành công!");
      }
  
      setModalState(prev => ({
        ...prev,
        message: "Cập nhật mật khẩu thành công!",
        show: false
      }));
  
    } catch (err) {
      console.log("err");
      setModalState(prev => ({ ...prev, message: err.message }));
    } finally {
      setModalState(prev => ({ ...prev, isProcessing: false }));
    }
  };
  
  

  const handleOtpChange = (index, value) => {
    if (!/^\d$/.test(value) && value !== '') return;
    const otp = [...modalState.otp];
    otp[index] = value;
    setModalState(prev => ({ ...prev, otp }));

    if (value && index < 5) otpInputs.current[index + 1].focus();
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

      <div className="login-links">
        <NavLink to="/signup">Đăng ký tài khoản</NavLink>
        <button 
          className="forgot-password-btn"
          onClick={() => setModalState(prev => ({ ...prev, show: true, step: 'email' }))}
        >
          Quên mật khẩu?
        </button>
      </div>

      {modalState.show && (
        <div className="modal-overlay" onClick={() => setModalState(prev => ({ ...prev, show: false }))}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h3>Khôi phục mật khẩu</h3>

            {modalState.step === 'email' && (
              <>
                <div className="form-group">
                  <label>Email đăng ký:</label>
                  <input
                    type="email"
                    value={modalState.email}
                    onChange={(e) => setModalState(prev => ({ 
                      ...prev, 
                      email: e.target.value,
                      message: "" 
                    }))}
                    disabled={modalState.isProcessing}
                  />
                </div>

                {modalState.message && <div className="alert">{modalState.message}</div>}

                <div className="modal-action">
                  <button
                    onClick={handlePasswordReset}
                    disabled={modalState.isProcessing}
                  >
                    {modalState.isProcessing ? <div className="spinner" /> : "Gửi mã OTP"}
                  </button>
                  <button
                    className="secondary"
                    onClick={() => setModalState(prev => ({ ...prev, show: false }))}
                  >
                    Đóng
                  </button>
                </div>
              </>
            )}

            {modalState.step === 'otp' && (
              <>
                <p className="otp-notice">Nhập mã OTP 6 số đã gửi đến {modalState.email}</p>
                
                <div className="otp-container">
                  {modalState.otp.map((digit, index) => (
                    <input
                      key={index}
                      type="tel"
                      pattern="[0-9]*"
                      ref={el => otpInputs.current[index] = el}
                      maxLength="1"
                      value={digit}
                      onChange={(e) => handleOtpChange(index, e.target.value)}
                      onKeyDown={(e) => e.key === "Backspace" && !digit && index > 0 && otpInputs.current[index - 1].focus()}
                      disabled={modalState.isProcessing}
                    />
                  ))}
                </div>

                {modalState.message && (
                  <div className={`alert ${modalState.message.includes("thành công") ? "success" : "error"}`}>
                    {modalState.message}
                  </div>
                )}

                <div className="modal-actions">
                  <button
                    onClick={() => verifyOtp(modalState.otp.join(""))}
                    disabled={modalState.isProcessing || modalState.otp.some(d => !d)}
                  >
                    {modalState.isProcessing ? <div className="spinner" /> : "Xác nhận"}
                  </button>
                  <button
                    className="secondary"
                    onClick={() => setModalState(prev => ({ ...prev, show: false, step: 'email' }))}
                  >
                    Đóng
                  </button>
                </div>
              </>
            )}

            {modalState.step === 'new_password' && (
              <div className="password-reset-form">
                <div className="form-group">
                  <label>Mật khẩu mới:</label>
                  <input
                    type="password"
                    value={modalState.newPassword}
                    onChange={(e) => setModalState(prev => ({
                      ...prev,
                      newPassword: e.target.value,
                      message: ""
                    }))}
                  />
                </div>

                <div className="form-group">
                  <label>Xác nhận mật khẩu:</label>
                  <input
                    type="password"
                    value={modalState.confirmPassword}
                    onChange={(e) => setModalState(prev => ({
                      ...prev,
                      confirmPassword: e.target.value,
                      message: ""
                    }))}
                  />
                </div>

                {modalState.message && (
                  <div className={`alert ${modalState.message.includes("thành công") ? "success" : "error"}`}>
                    {modalState.message}
                  </div>
                )}

                <div className="modal-actions">
                  <button
  onClick={handlePasswordUpdate}
  
>
   "Đổi mật khẩu"
</button>
                  <button
                    className="secondary"
                    onClick={() => setModalState(prev => ({ ...prev, show: false }))}
                  >
                    Đóng
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Login;