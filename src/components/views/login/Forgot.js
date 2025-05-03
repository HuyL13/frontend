import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import Form from "../../../utilities/Forms";

const Forgot = () => {
  const [email, setEmail] = useState("");
  const [validate, setValidate] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // Hàm validation form
  const validateForgotPassword = () => {
    const validator = Form.validator({
      email: {
        value: email,
        isRequired: true,
        isEmail: true,
      },
    });

    if (validator) {
      setValidate({ validate: validator.errors });
      return false;
    }
    return true;
  };

  // Hàm xử lý gửi OTP
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");
    
    if (!validateForgotPassword()) return;

    try {
      setLoading(true);
      const response = await fetch(
        `http://localhost:22986/demo/auth/request-otp?email=${encodeURIComponent(email)}`,
        { method: "POST" }
      );

      const data = await response.text();
      
      if (!response.ok) throw new Error(data || "Không thể gửi OTP");

      // Chuyển hướng sang trang OTP và truyền email qua state
      navigate("/otp", { state: { email } });

    } catch (err) {
      setError(err.message.replace(/^Error: /, ""));
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
            <p>Quên mật khẩu</p>
            <div className="auth-form-container text-start">
              <form onSubmit={handleSendOtp} autoComplete="off">
                <div className="email mb-3">
                  <input
                    type="email"
                    className={`form-control ${
                      validate.validate?.email ? "is-invalid" : ""
                    }`}
                    value={email}
                    placeholder="Email đăng ký"
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  <div
                    className={`invalid-feedback ${
                      validate.validate?.email ? "d-block" : "d-none"
                    }`}
                  >
                    {validate.validate?.email?.[0]}
                  </div>
                </div>

                {error && <div className="alert error mb-3">{error}</div>}

                <div className="text-center">
                  <button
                    type="submit"
                    className="btn btn-primary w-100 theme-btn mx-auto"
                    disabled={loading}
                  >
                    {loading ? "Đang gửi..." : "Gửi mã OTP"}
                  </button>
                </div>
              </form>

              <hr />
              <div className="auth-option text-center pt-2">
                <Link className="text-link" to="/login">
                  Quay lại đăng nhập
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Forgot;