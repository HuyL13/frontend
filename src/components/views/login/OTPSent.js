import { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button, Input, Space, Typography, Row, Col, message, Card, Divider } from "antd";
import { ArrowLeftOutlined, LockOutlined, MailOutlined } from "@ant-design/icons";
import chungCu from "./Chung_cu4.jpeg";

const { Title, Text } = Typography;

const OTPSent = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const otpInputs = useRef(Array(6).fill(null));
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

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
    setErrorMsg("");

    // Tự động focus ô tiếp theo
    if (value && index < 5) otpInputs.current[index + 1].focus();
  };

  const handleVerifyOtp = async () => {
    if (otp.some(d => !d)) {
      setErrorMsg("Vui lòng nhập đầy đủ mã OTP");
      message.error("Vui lòng nhập đầy đủ mã OTP");
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

      message.success("Xác thực OTP thành công");
      
      // Chuyển hướng đến trang đặt lại mật khẩu
      navigate("/reset", { 
        state: { 
          email: email,
          otp: otp.join("")
        } 
      });

    } catch (err) {
      setErrorMsg(err.message.replace(/^Error: /, ""));
      message.error(err.message.replace(/^Error: /, ""));
    } finally {
      setIsProcessing(false);
    }
  };

  const resendOtp = () => {
    message.info("Đã gửi lại mã OTP mới đến email của bạn");
  };

  return (
    <div style={{ 
      display: "flex", 
      height: "100vh",
      width: "100%",
      overflow: "hidden" 
    }}>
      {/* Left panel with image */}
      <div style={{ flex: "1", display: { xs: "none", md: "block" } }}>
        <div style={{ 
          width: "100%", 
          height: "100%", 
          backgroundImage: `url(${chungCu})`,
          backgroundSize: "cover",
          backgroundPosition: "center"
        }} />
      </div>

      {/* Right panel with form */}
      <div style={{ 
        flex: "1", 
        display: "flex", 
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        padding: "2rem"
      }}>
        <Card 
          style={{ 
            width: "100%", 
            maxWidth: "450px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)"
          }}
        >
          <div style={{ textAlign: "center" }}>
            <LockOutlined style={{ fontSize: "3rem", color: "#1890ff", margin: "1rem 0" }} />
            <Title level={3}>Xác thực OTP</Title>
            <Text type="secondary">
              Nhập mã OTP 6 số đã gửi đến <Text strong>{email}</Text>
            </Text>
          </div>

          <Divider />

          <Space direction="vertical" size="large" style={{ width: "100%" }}>
            {errorMsg && (
              <div style={{ color: "#ff4d4f", textAlign: "center", marginBottom: "1rem" }}>
                {errorMsg}
              </div>
            )}

            <Row gutter={8} justify="center">
              {otp.map((digit, index) => (
                <Col key={index}>
                  <Input
                    ref={el => otpInputs.current[index] = el}
                    className="otp-input"
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={e => handleOtpChange(index, e.target.value)}
                    onKeyDown={e => {
                      if (e.key === "Backspace" && !digit && index > 0) {
                        otpInputs.current[index - 1].focus();
                      }
                    }}
                    disabled={isProcessing}
                    style={{
                      width: "50px",
                      height: "50px",
                      fontSize: "1.5rem",
                      textAlign: "center",
                      margin: "0 4px",
                      borderRadius: "8px",
                      boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)"
                    }}
                  />
                </Col>
              ))}
            </Row>

            <Button
              type="primary"
              block
              size="large"
              onClick={handleVerifyOtp}
              loading={isProcessing}
              disabled={otp.some(d => !d)}
            >
              Xác nhận
            </Button>

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <Button 
                type="link" 
                icon={<ArrowLeftOutlined />}
                onClick={() => navigate("/login")}
              >
                Quay lại đăng nhập
              </Button>
              
              <Button 
                type="link" 
                onClick={resendOtp}
                disabled={isProcessing}
              >
                Gửi lại mã OTP
              </Button>
            </div>
          </Space>
        </Card>
      </div>
    </div>
  );
};

export default OTPSent;