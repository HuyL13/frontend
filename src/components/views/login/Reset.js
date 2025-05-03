import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Link } from "react-router-dom";

const Reset = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState({ type: "", content: "" });
  const [isProcessing, setIsProcessing] = useState(false);

  // Lấy thông tin từ location state
  const { email, otp } = location.state || {};

  const handlePasswordUpdate = async () => {
    if (!email || !otp) {
      setMessage({ type: "error", content: "Thiếu thông tin xác thực" });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ type: "error", content: "Mật khẩu xác nhận không khớp!" });
      return;
    }

    setIsProcessing(true);
    setMessage({ type: "", content: "" });

    try {
      const response = await fetch(
        `http://localhost:22986/demo/auth/reset-password?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}&newPassword=${encodeURIComponent(newPassword)}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          }
        }
      );

      const data = await response.text();
      
      if (!response.ok) {
        throw new Error(data || "Đặt lại mật khẩu thất bại");
      }

      setMessage({
        type: "success",
        content: "Cập nhật mật khẩu thành công! Đang chuyển hướng..."
      });

      // Tự động chuyển hướng sau 2 giây
      setTimeout(() => navigate("/login"), 2000);

    } catch (err) {
      setMessage({
        type: "error",
        content: err.message.replace(/^Error: /, "")
      });
    } finally {
      setIsProcessing(false);
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
            <p className="reset-password-title">Đặt lại mật khẩu</p>

            <div className="password-reset-form">
              <div className="form-group">
                <label>Mật khẩu mới:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="form-control"
                  placeholder="Nhập mật khẩu mới"
                  disabled={isProcessing}
                />
              </div>

              <div className="form-group">
                <label>Xác nhận mật khẩu:</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="form-control"
                  placeholder="Nhập lại mật khẩu"
                  disabled={isProcessing}
                />
              </div>

              {message.content && (
                <div className={`alert ${message.type}`}>
                  {message.content}
                </div>
              )}

              <div className="modal-actions">
                <button
                  onClick={handlePasswordUpdate}
                  disabled={isProcessing || !newPassword || !confirmPassword}
                  className="btn btn-primary w-100 theme-btn mx-auto"
                >
                  {isProcessing ? (
                    <div className="spinner-border text-light" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  ) : "Đổi mật khẩu"}
                </button>
                <button
                  className="btn btn-secondary w-100 theme-btn mx-auto mt-2"
                  onClick={() => navigate("/login")}
                >
                  Hủy bỏ
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reset;