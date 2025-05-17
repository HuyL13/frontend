import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";
import chungCu from "./Chung_cu4.jpeg";
const OTPSent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const otpInputs = useRef(Array(6).fill(null));
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // Lấy email từ location state
  useEffect(() => {
    if (location.state?.email) {
      setEmail(location.state.email);
    }
  }, [location]);

  const handleOtpChange = (index, value) => {
    if (!/^\d$/.test(value) && value !== "") return;
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    setError("");

    // Tự động focus ô tiếp theo
    if (value && index < 5) otpInputs.current[index + 1].focus();
  };

  const handleVerifyOtp = async () => {
    if (otp.some(d => !d)) {
      setError("Vui lòng nhập đầy đủ mã OTP");
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch(
        `https://backend-6w7s.onrender.com/demo/auth/verify-otp?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp.join(""))}`,
        { 
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );

      const result = await response.text();
      
      if (!response.ok) throw new Error(result || "Lỗi xác thực OTP");

      // Chuyển hướng đến trang đặt lại mật khẩu
      navigate("/reset", { 
        state: { 
          email: email,
          otp: otp.join("")
        } 
      });

    } catch (err) {
      setError(err.message.replace(/^Error: /, ""));
    } finally {
      setIsProcessing(false);
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
              objectFit: 'cover' // hoặc 'contain' nếu muốn toàn bộ ảnh hiển thị mà không bị cắt
            }}
            alt="Chung cư"
          />
        </div>
      </div>

      <div className="col-12 col-md-7 col-lg-6 auth-main-col text-center">
        <div className="d-flex flex-column align-content-end">
          <div className="auth-body mx-auto">
            <p className="otp-notice">
              Nhập mã OTP 6 số đã gửi đến {email}
            </p>

            {error && <div className="alert error">{error}</div>}
            {message && <div className="alert success">{message}</div>}

            <div className="otp-container">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  type="tel"
                  pattern="[0-9]*"
                  maxLength="1"
                  value={digit}
                  ref={el => otpInputs.current[index] = el}
                  onChange={(e) => handleOtpChange(index, e.target.value)}
                  onKeyDown={(e) => 
                    e.key === "Backspace" && 
                    !digit && 
                    index > 0 && 
                    otpInputs.current[index - 1].focus()
                  }
                  disabled={isProcessing}
                  className="otp-input"
                />
              ))}
            </div>

            <div className="modal-actions">
              <button
                onClick={handleVerifyOtp}
                disabled={isProcessing || otp.some(d => !d)}
                className="btn btn-primary w-100 theme-btn mx-auto"
              >
                {isProcessing ? (
                  <div className="spinner-border text-light" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : "Xác nhận"}
              </button>
              
              <button
                className="btn btn-secondary w-100 theme-btn mx-auto mt-2"
                onClick={() => navigate("/login")}
              >
                Quay lại đăng nhập
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OTPSent;