import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import chungCu from "./Chung_cu4.jpeg";

const Signup = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    firstName: "",
    lastName: "",
    dob: "",
    email: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await fetch("https://backend-6w7s.onrender.com/demo/users/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const data = await response.json();
        console.log(data.message);
        if(data.message == "Must be at least {min}"){
          throw new Error("Phải đủ 18 tuổi để đăng kí tài khoản");
        }
        else{
          throw new Error(data.message || "Đăng ký thất bại");
        }
        
      }

      navigate("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="row g-0 auth-wrapper">
      <div className="col-12 col-md-5 col-lg-6 h-100">
        <div className="auth-background-holder"></div>
        <div style={{ width: '100%', height: '100%' }}>
          <img
            src={chungCu}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
            }}
            alt="Chung cư"
          />
        </div>
      </div>

      <div className="col-12 col-md-7 col-lg-6 auth-main-col text-center">
        <div className="d-flex flex-column align-content-end">
          <div className="auth-body mx-auto">
            <p>Đăng ký tài khoản</p>
            <div className="auth-form-container text-start">
              <form className="auth-form" onSubmit={handleSignup}>
                {error && <div className="alert alert-danger">{error}</div>}

                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tên đăng nhập"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={loading}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '8px 12px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div className="mb-3">
                  <div className="password-field" style={{ position: 'relative' }}>
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control"
                      placeholder="Mật khẩu"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      disabled={loading}
                      style={{
                        width: '100%',
                        height: '40px',
                        padding: '8px 60px 8px 12px',
                        fontSize: '16px',
                        boxSizing: 'border-box',
                      }}
                    />
                    <span
                      className="toggle-password"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                      style={{
                        position: 'absolute',
                        right: '10px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        cursor: 'pointer',
                        color: '#007bff',
                        fontSize: '14px',
                        userSelect: 'none',
                      }}
                    >
                      {showPassword ? "Ẩn" : "Hiện"}
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Họ"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    disabled={loading}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '8px 12px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Tên"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    disabled={loading}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '8px 12px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="date"
                    className="form-control"
                    placeholder="Ngày sinh"
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    disabled={loading}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '8px 12px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div className="mb-3">
                  <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={loading}
                    style={{
                      width: '100%',
                      height: '40px',
                      padding: '8px 12px',
                      fontSize: '16px',
                      boxSizing: 'border-box',
                    }}
                  />
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
                      "Đăng ký"
                    )}
                  </button>
                </div>
              </form>

              <hr />
              <div className="auth-option text-center pt-2">
                Đã có tài khoản?{" "}
                <Link className="text-link" to="/login">
                  Đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Signup;