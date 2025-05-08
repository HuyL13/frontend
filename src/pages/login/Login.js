import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "../../styles/Login.css";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const otpInputs = useRef(Array(6).fill(null));

  const [formData, setFormData] = useState({ username: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const savedUsername = localStorage.getItem("rememberedUsername");
    if (savedUsername) {
      setFormData((prev) => ({ ...prev, username: savedUsername }));
      setRememberMe(true);
    }
  }, []);

  const requestHeaders = {
    "Content-Type": "application/json",
    Accept: "application/json",
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
      if (!response.ok) {
        throw new Error(data.message || "Đăng nhập thất bại");
      }

      const token = data?.result?.token;
      const roles = data?.result?.roles || [];

      if (!token || roles.length === 0) {
        throw new Error("Thông tin xác thực không hợp lệ");
      }

      localStorage.setItem("authToken", token);
      localStorage.setItem("userRoles", JSON.stringify(roles));

      if (rememberMe) {
        localStorage.setItem("rememberedUsername", formData.username);
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      login(roles);
      navigate("/dashboard");
    } catch (err) {
      setError(err.message);
      localStorage.removeItem("authToken");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row g-0 auth-wrapper">
      <div className="col-12 col-md-5 col-lg-6 h-100 auth-background-col">
        <div className="auth-background-holder"></div>
        <div className="auth-background-mask"></div>
      </div>

      <div className="col-12 col-md-7 col-lg-6 auth-main-col text-center">
        <div className="d-flex flex-column align-content-end">
          <div className="auth-body mx-auto">
            <p>Đăng nhập hệ thống</p>
            <div className="auth-form-container text-start">
              <form
                className="auth-form"
                method="POST"
                onSubmit={handleLogin}
                autoComplete={"off"}
              >
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="username mb-3">
                  <input
                    type="text"
                    className="form-control"
                    id="username"
                    name="username"
                    value={formData.username}
                    placeholder="Tên đăng nhập"
                    onChange={(e) =>
                      setFormData({ ...formData, username: e.target.value })
                    }
                    disabled={loading}
                  />
                </div>

                <div className="password mb-3">
                  <div className="password-field">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      name="password"
                      id="password"
                      value={formData.password}
                      placeholder="Mật khẩu"
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      disabled={loading}
                    />
                    <span
                      className="toggle-password"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                    >
                      {showPassword ? "Ẩn" : "Hiện"}
                    </span>
                  </div>

                  <div className="extra mt-3 row justify-content-between align-items-center">
                    <div className="col-6">
                      <label className="form-check custom-checkbox" style={{ display: "flex", alignItems: "center", cursor: "pointer", fontSize: "0.95rem" }}>
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          disabled={loading}
                          style={{ position: "absolute", opacity: 0, cursor: "pointer", height: 0, width: 0 }}
                        />
                        <span
                          style={{
                            height: "18px",
                            width: "18px",
                            backgroundColor: "#fff",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            marginRight: "8px",
                            display: "inline-block",
                            position: "relative",
                            transition: "all 0.2s ease",
                          }}
                        >
                          {rememberMe && (
                            <span
                              style={{
                                content: '""',
                                position: "absolute",
                                left: "5px",
                                top: "2px",
                                width: "4px",
                                height: "9px",
                                border: "solid #000",
                                borderWidth: "0 2px 2px 0",
                                transform: "rotate(45deg)",
                                display: "block",
                              }}
                            ></span>
                          )}
                        </span>
                        Ghi nhớ
                      </label>
                    </div>

                    <div className="col-6 text-end">
                      <div className="forgot-password">
                        {/* Thay thế phần Quên mật khẩu bằng NavLink */}
                        <Link to="/forgot">Quên mật khẩu?</Link>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary w-100 theme-btn mx-auto"
                    disabled={loading}
                  >
                    {loading ? (
                      <span
                        className="spinner-border spinner-border-sm"
                        role="status"
                        aria-hidden="true"
                      ></span>
                    ) : (
                      "Đăng nhập"
                    )}
                  </button>
                </div>
              </form>

              <hr />
              <div className="auth-option text-center pt-2">
                Chưa có tài khoản?{" "}
                <Link className="text-link" to="/signup">
                  Đăng ký
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;